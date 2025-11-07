import { NextRequest } from 'next/server';
import { createMCPServer } from '@/lib/mcp-server';
import { addMemory, searchMemories, listMemories, deleteMemory, getMemoryStats } from '@/lib/db';

export const runtime = 'edge';
export const maxDuration = 300;

/**
 * MCP Server endpoint using Server-Sent Events (SSE)
 * This endpoint handles Model Context Protocol communication from Claude Desktop
 *
 * Note: Full MCP protocol implementation requires bidirectional communication.
 * For production, consider using JSON-RPC over HTTP POST or WebSocket alternative.
 */
export async function GET(request: NextRequest) {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable nginx buffering
  };

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial connection message
        const initMessage = {
          jsonrpc: '2.0',
          method: 'initialized',
          params: {
            protocolVersion: '2024-11-05',
            serverInfo: {
              name: 'vercel-mcp-memory',
              version: '1.0.0',
            },
            capabilities: {
              tools: {},
            },
          },
        };

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(initMessage)}\n\n`)
        );

        // Keep-alive ping every 30 seconds
        const keepAliveInterval = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(': ping\n\n'));
          } catch (e) {
            clearInterval(keepAliveInterval);
          }
        }, 30000);

        // Clean up on disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(keepAliveInterval);
          controller.close();
        });
      } catch (error) {
        console.error('SSE Error:', error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, { headers });
}

/**
 * Handle MCP JSON-RPC requests via POST
 * This is the recommended approach for Vercel Edge Functions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate JSON-RPC structure
    if (!body.jsonrpc || body.jsonrpc !== '2.0') {
      return Response.json(
        {
          jsonrpc: '2.0',
          error: {
            code: -32600,
            message: 'Invalid Request: jsonrpc must be "2.0"',
          },
          id: body.id || null,
        },
        { status: 400 }
      );
    }

    const server = createMCPServer();

    // Route to appropriate handler based on method
    const { method, params, id } = body;

    switch (method) {
      case 'initialize':
        return Response.json({
          jsonrpc: '2.0',
          result: {
            protocolVersion: '2024-11-05',
            serverInfo: {
              name: 'vercel-mcp-memory',
              version: '1.0.0',
            },
            capabilities: {
              tools: {},
            },
          },
          id,
        });

      case 'tools/list':
      case 'list_tools':
        // This would be handled by server.handleRequest()
        // For simplicity, manually return tools list
        return Response.json({
          jsonrpc: '2.0',
          result: {
            tools: [
              {
                name: 'add_memory',
                description: 'Add a new memory with semantic search',
                inputSchema: {
                  type: 'object',
                  properties: {
                    content: { type: 'string' },
                    category: { type: 'string' },
                    metadata: { type: 'object' },
                  },
                  required: ['content'],
                },
              },
              {
                name: 'search_memory',
                description: 'Search memories semantically',
                inputSchema: {
                  type: 'object',
                  properties: {
                    query: { type: 'string' },
                    category: { type: 'string' },
                    limit: { type: 'number' },
                    threshold: { type: 'number' },
                  },
                  required: ['query'],
                },
              },
              {
                name: 'list_memories',
                description: 'List all memories',
                inputSchema: {
                  type: 'object',
                  properties: {
                    category: { type: 'string' },
                    limit: { type: 'number' },
                  },
                },
              },
              {
                name: 'delete_memory',
                description: 'Delete a memory by ID',
                inputSchema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                  },
                  required: ['id'],
                },
              },
              {
                name: 'memory_stats',
                description: 'Get memory statistics',
                inputSchema: {
                  type: 'object',
                  properties: {},
                },
              },
            ],
          },
          id,
        });

      case 'tools/call':
      case 'call_tool':
        // Handle tool execution
        try {
          const { name, arguments: args = {} } = params;

          switch (name) {
            case 'add_memory': {
              const result = await addMemory(args.content as string, {
                category: args.category as string | undefined,
                metadata: args.metadata as Record<string, any> | undefined,
              });

              return Response.json({
                jsonrpc: '2.0',
                result: {
                  content: [
                    {
                      type: 'text',
                      text: `✓ Memory added successfully!\n\nID: ${result.id}\nCategory: ${result.category || 'none'}\nCreated: ${result.createdAt.toISOString()}`,
                    },
                  ],
                },
                id,
              });
            }

            case 'search_memory': {
              const results = await searchMemories(args.query as string, {
                category: args.category as string | undefined,
                limit: args.limit as number | undefined,
                threshold: args.threshold as number | undefined,
              });

              if (results.length === 0) {
                return Response.json({
                  jsonrpc: '2.0',
                  result: {
                    content: [
                      {
                        type: 'text',
                        text: `No memories found matching "${args.query}"`,
                      },
                    ],
                  },
                  id,
                });
              }

              const formatted = results
                .map(
                  (m, i) =>
                    `${i + 1}. [${(m.similarity * 100).toFixed(1)}% match] ${m.content}\n   Category: ${m.category || 'none'} | Created: ${m.createdAt.toLocaleDateString()}`
                )
                .join('\n\n');

              return Response.json({
                jsonrpc: '2.0',
                result: {
                  content: [
                    {
                      type: 'text',
                      text: `Found ${results.length} matching memories:\n\n${formatted}`,
                    },
                  ],
                },
                id,
              });
            }

            case 'list_memories': {
              const results = await listMemories({
                category: args.category as string | undefined,
                limit: args.limit as number | undefined,
                offset: args.offset as number | undefined,
              });

              if (results.length === 0) {
                return Response.json({
                  jsonrpc: '2.0',
                  result: {
                    content: [
                      {
                        type: 'text',
                        text: 'No memories found.',
                      },
                    ],
                  },
                  id,
                });
              }

              const formatted = results
                .map(
                  (m, i) =>
                    `${i + 1}. ${m.content}\n   Category: ${m.category || 'none'} | Created: ${m.createdAt.toLocaleDateString()}`
                )
                .join('\n\n');

              return Response.json({
                jsonrpc: '2.0',
                result: {
                  content: [
                    {
                      type: 'text',
                      text: `${results.length} memories:\n\n${formatted}`,
                    },
                  ],
                },
                id,
              });
            }

            case 'delete_memory': {
              const success = await deleteMemory(args.id as string);

              return Response.json({
                jsonrpc: '2.0',
                result: {
                  content: [
                    {
                      type: 'text',
                      text: success
                        ? `✓ Memory ${args.id} deleted successfully`
                        : `✗ Memory ${args.id} not found`,
                    },
                  ],
                },
                id,
              });
            }

            case 'memory_stats': {
              const stats = await getMemoryStats();

              return Response.json({
                jsonrpc: '2.0',
                result: {
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
                },
                id,
              });
            }

            default:
              return Response.json({
                jsonrpc: '2.0',
                error: {
                  code: -32601,
                  message: `Unknown tool: ${name}`,
                },
                id,
              });
          }
        } catch (toolError) {
          return Response.json({
            jsonrpc: '2.0',
            result: {
              content: [
                {
                  type: 'text',
                  text: `Error: ${(toolError as Error).message}`,
                },
              ],
              isError: true,
            },
            id,
          });
        }

      default:
        return Response.json(
          {
            jsonrpc: '2.0',
            error: {
              code: -32601,
              message: `Method not found: ${method}`,
            },
            id,
          },
          { status: 404 }
        );
    }
  } catch (error) {
    console.error('MCP Request Error:', error);
    return Response.json(
      {
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: `Internal error: ${(error as Error).message}`,
        },
        id: null,
      },
      { status: 500 }
    );
  }
}
