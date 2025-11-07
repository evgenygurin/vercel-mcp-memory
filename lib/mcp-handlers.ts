/**
 * Centralized MCP tool handlers
 * Eliminates code duplication between lib/mcp-server.ts and app/api/mcp/sse/route.ts
 */

import { addMemory, searchMemories, listMemories, deleteMemory, getMemoryStats } from './db';
import { validateInput, AddMemorySchema, SearchMemorySchema, ListMemoriesSchema, DeleteMemorySchema } from './validation';
import { logger } from './logger';

interface MCPToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

/**
 * Handle add_memory tool call
 */
export async function handleAddMemory(args: any): Promise<MCPToolResponse> {
  const validation = validateInput(AddMemorySchema, args);

  if (!validation.success) {
    return {
      content: [{ type: 'text', text: `Validation error: ${validation.error}` }],
      isError: true,
    };
  }

  const { content, category, metadata } = validation.data;
  const result = await addMemory(content, { category, metadata });

  return {
    content: [
      {
        type: 'text',
        text: `✓ Memory added successfully!\n\nID: ${result.id}\nCategory: ${result.category || 'none'}\nCreated: ${result.createdAt.toISOString()}`,
      },
    ],
  };
}

/**
 * Handle search_memory tool call
 */
export async function handleSearchMemory(args: any): Promise<MCPToolResponse> {
  const validation = validateInput(SearchMemorySchema, args);

  if (!validation.success) {
    return {
      content: [{ type: 'text', text: `Validation error: ${validation.error}` }],
      isError: true,
    };
  }

  const { query, category, limit, threshold } = validation.data;
  const results = await searchMemories(query, { category, limit, threshold });

  if (results.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: `No memories found matching "${query}"`,
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

/**
 * Handle list_memories tool call
 */
export async function handleListMemories(args: any): Promise<MCPToolResponse> {
  const validation = validateInput(ListMemoriesSchema, args);

  if (!validation.success) {
    return {
      content: [{ type: 'text', text: `Validation error: ${validation.error}` }],
      isError: true,
    };
  }

  const { category, limit, offset } = validation.data;
  const results = await listMemories({ category, limit, offset });

  if (results.length === 0) {
    return {
      content: [{ type: 'text', text: 'No memories found.' }],
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

/**
 * Handle delete_memory tool call
 */
export async function handleDeleteMemory(args: any): Promise<MCPToolResponse> {
  const validation = validateInput(DeleteMemorySchema, args);

  if (!validation.success) {
    return {
      content: [{ type: 'text', text: `Validation error: ${validation.error}` }],
      isError: true,
    };
  }

  const { id } = validation.data;
  const success = await deleteMemory(id);

  return {
    content: [
      {
        type: 'text',
        text: success
          ? `✓ Memory ${id} deleted successfully`
          : `✗ Memory ${id} not found`,
      },
    ],
  };
}

/**
 * Handle memory_stats tool call
 */
export async function handleMemoryStats(): Promise<MCPToolResponse> {
  const stats = await getMemoryStats();

  return {
    content: [
      {
        type: 'text',
        text:
          `Memory Statistics:\n\n` +
          `• Total memories: ${stats.totalMemories}\n` +
          `• Categories: ${stats.totalCategories}\n` +
          `• Users: ${stats.totalUsers}\n` +
          `• Oldest: ${stats.oldestMemory?.toLocaleDateString() || 'N/A'}\n` +
          `• Newest: ${stats.newestMemory?.toLocaleDateString() || 'N/A'}`,
      },
    ],
  };
}

/**
 * Route tool call to appropriate handler
 */
export async function handleToolCall(name: string, args: any = {}): Promise<MCPToolResponse> {
  try {
    switch (name) {
      case 'add_memory':
        return await handleAddMemory(args);
      case 'search_memory':
        return await handleSearchMemory(args);
      case 'list_memories':
        return await handleListMemories(args);
      case 'delete_memory':
        return await handleDeleteMemory(args);
      case 'memory_stats':
        return await handleMemoryStats();
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    logger.error('Tool execution error', error as Error, { tool: name });
    return {
      content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
      isError: true,
    };
  }
}
