// Type definitions for Vercel MCP Memory Server

export interface Memory {
  id: string;
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
  category?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemorySearchResult extends Memory {
  similarity: number;
}

export interface AddMemoryOptions {
  userId?: string;
  category?: string;
  metadata?: Record<string, any>;
}

export interface SearchMemoryOptions {
  userId?: string;
  category?: string;
  limit?: number;
  threshold?: number; // Minimum similarity score (0-1)
}

export interface ListMemoriesOptions {
  userId?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface MCPToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}
