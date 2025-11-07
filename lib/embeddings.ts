import { embed, embedMany } from 'ai';

/**
 * Generate a single embedding vector for text using Vercel AI SDK
 * Uses OpenAI's text-embedding-3-small model (1536 dimensions)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const normalized = normalizeText(text);

    const result = await embed({
      model: 'openai/text-embedding-3-small',
      value: normalized,
    });

    return result.embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

/**
 * Generate multiple embeddings in a single batch call
 * More efficient than multiple individual calls
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const normalized = texts.map(normalizeText);

    const result = await embedMany({
      model: 'openai/text-embedding-3-small',
      values: normalized,
    });

    return result.embeddings;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error(`Failed to generate embeddings: ${error.message}`);
  }
}

/**
 * Normalize text before embedding generation
 * - Trims whitespace
 * - Converts multiple spaces to single space
 * - Lowercase for consistency
 */
export function normalizeText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/**
 * Calculate cosine similarity between two vectors
 * Returns a value between -1 and 1, where 1 means identical
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
