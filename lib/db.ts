import { sql } from '@vercel/postgres';
import { generateEmbedding } from './embeddings';
import type {
  Memory,
  MemorySearchResult,
  AddMemoryOptions,
  SearchMemoryOptions,
  ListMemoriesOptions,
} from './types';

/**
 * Add a new memory to the database with semantic embedding
 */
export async function addMemory(
  content: string,
  options: AddMemoryOptions = {}
): Promise<Memory> {
  try {
    // Generate embedding for the content
    const embedding = await generateEmbedding(content);

    // Insert into Postgres with pgvector
    const result = await sql`
      INSERT INTO memories (content, embedding, user_id, category, metadata)
      VALUES (
        ${content},
        ${JSON.stringify(embedding)}::vector,
        ${options.userId || 'default'},
        ${options.category || null},
        ${JSON.stringify(options.metadata || {})}::jsonb
      )
      RETURNING
        id,
        content,
        embedding::text as embedding,
        metadata,
        category,
        user_id as "userId",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const row = result.rows[0] as any;

    return {
      id: row.id,
      content: row.content,
      embedding: JSON.parse(row.embedding),
      metadata: row.metadata,
      category: row.category,
      userId: row.userId,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    } as Memory;
  } catch (error) {
    console.error('Error adding memory:', error);
    throw new Error(`Failed to add memory: ${(error as Error).message}`);
  }
}

/**
 * Search memories using semantic similarity (pgvector cosine distance)
 */
export async function searchMemories(
  query: string,
  options: SearchMemoryOptions = {}
): Promise<MemorySearchResult[]> {
  try {
    const { userId, category, limit = 10, threshold = 0.5 } = options;

    // Generate embedding for search query
    const queryEmbedding = await generateEmbedding(query);
    const embeddingStr = `[${queryEmbedding.join(',')}]`;

    // Build query dynamically
    let queryText = `
      SELECT
        id,
        content,
        embedding::text as embedding,
        metadata,
        category,
        user_id as "userId",
        created_at as "createdAt",
        updated_at as "updatedAt",
        1 - (embedding <=> $1::vector) as similarity
      FROM memories
      WHERE 1 - (embedding <=> $1::vector) > $2
    `;

    const params: any[] = [embeddingStr, threshold];
    let paramIndex = 3;

    if (userId) {
      queryText += ` AND user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (category) {
      queryText += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    queryText += ` ORDER BY similarity DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await sql.query(queryText, params);

    return result.rows.map((row: any) => ({
      id: row.id,
      content: row.content,
      embedding: JSON.parse(row.embedding),
      metadata: row.metadata,
      category: row.category,
      userId: row.userId,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      similarity: parseFloat(row.similarity),
    }));
  } catch (error) {
    console.error('Error searching memories:', error);
    throw new Error(`Failed to search memories: ${(error as Error).message}`);
  }
}

/**
 * List all memories with optional filtering and pagination
 */
export async function listMemories(
  options: ListMemoriesOptions = {}
): Promise<Memory[]> {
  try {
    const { userId, category, limit = 50, offset = 0 } = options;

    // Build query dynamically
    let queryText = `
      SELECT
        id,
        content,
        embedding::text as embedding,
        metadata,
        category,
        user_id as "userId",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM memories
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (userId) {
      queryText += ` AND user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (category) {
      queryText += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await sql.query(queryText, params);

    return result.rows.map((row: any) => ({
      id: row.id,
      content: row.content,
      embedding: JSON.parse(row.embedding),
      metadata: row.metadata,
      category: row.category,
      userId: row.userId,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    }));
  } catch (error) {
    console.error('Error listing memories:', error);
    throw new Error(`Failed to list memories: ${(error as Error).message}`);
  }
}

/**
 * Delete a memory by ID
 */
export async function deleteMemory(id: string): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM memories WHERE id = ${id}
    `;

    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Error deleting memory:', error);
    throw new Error(`Failed to delete memory: ${(error as Error).message}`);
  }
}

/**
 * Get memory statistics
 */
export async function getMemoryStats(): Promise<{
  totalMemories: number;
  totalCategories: number;
  totalUsers: number;
  oldestMemory: Date | null;
  newestMemory: Date | null;
}> {
  try {
    const result = await sql`
      SELECT * FROM memory_stats
    `;

    const stats = result.rows[0];

    return {
      totalMemories: parseInt(stats.total_memories),
      totalCategories: parseInt(stats.total_categories),
      totalUsers: parseInt(stats.total_users),
      oldestMemory: stats.oldest_memory ? new Date(stats.oldest_memory) : null,
      newestMemory: stats.newest_memory ? new Date(stats.newest_memory) : null,
    };
  } catch (error) {
    console.error('Error getting memory stats:', error);
    throw new Error(`Failed to get memory stats: ${(error as Error).message}`);
  }
}
