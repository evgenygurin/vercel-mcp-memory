import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { addMemory, searchMemories, listMemories, deleteMemory, getMemoryStats } from './db';

// Define MCP Tools for memory management
const tools: Tool[] = [
  {
    name: 'add_memory',
    description:
      'Add a new memory to long-term storage with semantic search capabilities. Supports categorization and custom metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'The content/information to remember',
        },
        category: {
          type: 'string',
          description:
            'Optional category (e.g., "projects", "people", "preferences", "tech-stack")',
        },
        metadata: {
          type: 'object',
          description: 'Optional metadata as key-value pairs for additional context',
        },
      },
      required: ['content'],
    },
  },
  {
    name: 'search_memory',
    description: 'Search memories using semantic similarity. Finds relevant memories even if exact keywords do not match.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query (supports natural language)',
        },
        category: {
          type: 'string',
          description: 'Optional: filter results by category',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 10, max: 50)',
          minimum: 1,
          maximum: 50,
        },
        threshold: {
          type: 'number',
          description: 'Minimum similarity threshold 0-1 (default: 0.5). Higher = more strict matching.',
          minimum: 0,
          maximum: 1,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'list_memories',
    description: 'List all memories with optional filters. Returns memories in chronological order.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Optional: filter by category',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default: 50)',
          minimum: 1,
          maximum: 100,
        },
        offset: {
          type: 'number',
          description: 'Number of records to skip for pagination (default: 0)',
          minimum: 0,
        },
      },
    },
  },
  {
    name: 'delete_memory',
    description: 'Delete a specific memory by its UUID',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          description: 'The UUID of the memory to delete',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'memory_stats',
    description: 'Get statistics about stored memories (total count, categories, date ranges)',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

/**
 * Create and configure MCP Server for memory management
 */
export function createMCPServer() {
  const server = new Server(
    {
      name: 'vercel-mcp-memory',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Handler: List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
  });

  // Handler: Execute tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    try {
      switch (name) {
        case 'add_memory': {
          const result = await addMemory(args.content as string, {
            category: args.category as string | undefined,
            metadata: args.metadata as Record<string, any> | undefined,
          });

          return {
            content: [
              {
                type: 'text',
                text: `✓ Memory added successfully!\n\nID: ${result.id}\nCategory: ${result.category || 'none'}\nCreated: ${result.createdAt.toISOString()}`,
              },
            ],
          };
        }

        case 'search_memory': {
          const results = await searchMemories(args.query as string, {
            category: args.category as string | undefined,
            limit: args.limit as number | undefined,
            threshold: args.threshold as number | undefined,
          });

          if (results.length === 0) {
            return {
              content: [
                {
                  type: 'text',
                  text: `No memories found matching "${args.query}"`,
                },
              ],
            };
          }

          const formatted = results
            .map(
              (m, i) =>
                `${i + 1}. [${(m.similarity * 100).toFixed(1)}% match] ${m.content}\n   Category: ${m.category || 'none'} | Created: ${m.createdAt.toLocaleDateString()}`
            )
            .join('\n\n');

          return {
            content: [
              {
                type: 'text',
                text: `Found ${results.length} matching memories:\n\n${formatted}`,
              },
            ],
          };
        }

        case 'list_memories': {
          const results = await listMemories({
            category: args.category as string | undefined,
            limit: args.limit as number | undefined,
            offset: args.offset as number | undefined,
          });

          if (results.length === 0) {
            return {
              content: [
                {
                  type: 'text',
                  text: 'No memories found.',
                },
              ],
            };
          }

          const formatted = results
            .map(
              (m, i) =>
                `${i + 1}. ${m.content}\n   Category: ${m.category || 'none'} | Created: ${m.createdAt.toLocaleDateString()}`
            )
            .join('\n\n');

          return {
            content: [
              {
                type: 'text',
                text: `${results.length} memories:\n\n${formatted}`,
              },
            ],
          };
        }

        case 'delete_memory': {
          const success = await deleteMemory(args.id as string);

          return {
            content: [
              {
                type: 'text',
                text: success
                  ? `✓ Memory ${args.id} deleted successfully`
                  : `✗ Memory ${args.id} not found`,
              },
            ],
          };
        }

        case 'memory_stats': {
          const stats = await getMemoryStats();

          return {
            content: [
              {
                type: 'text',
                text: `Memory Statistics:\n\n` +
                  `• Total memories: ${stats.totalMemories}\n` +
                  `• Categories: ${stats.totalCategories}\n` +
                  `• Users: ${stats.totalUsers}\n` +
                  `• Oldest: ${stats.oldestMemory?.toLocaleDateString() || 'N/A'}\n` +
                  `• Newest: ${stats.newestMemory?.toLocaleDateString() || 'N/A'}`,
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${(error as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}
