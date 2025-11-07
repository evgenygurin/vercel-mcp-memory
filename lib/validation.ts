import { z } from 'zod';

/**
 * Validation schemas for MCP tool inputs
 */

export const AddMemorySchema = z.object({
  content: z
    .string()
    .min(1, 'Content cannot be empty')
    .max(10000, 'Content too long (max 10000 characters)'),
  category: z
    .string()
    .max(100, 'Category too long (max 100 characters)')
    .optional(),
  metadata: z.record(z.any()).optional(),
});

export const SearchMemorySchema = z.object({
  query: z
    .string()
    .min(1, 'Query cannot be empty')
    .max(1000, 'Query too long (max 1000 characters)'),
  category: z.string().max(100).optional(),
  limit: z.number().int().min(1).max(50).optional().default(10),
  threshold: z.number().min(0).max(1).optional().default(0.5),
});

export const ListMemoriesSchema = z.object({
  category: z.string().max(100).optional(),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
});

export const DeleteMemorySchema = z.object({
  id: z.string().uuid('Invalid memory ID format'),
});

export const ApiKeySchema = z.object({
  apiKey: z.string().min(32, 'Invalid API key'),
});

/**
 * Validate and sanitize input data
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      return { success: false, error: messages.join(', ') };
    }
    return { success: false, error: 'Invalid input' };
  }
}

/**
 * Environment variable validation
 */
export const EnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  MCP_API_KEYS: z.string().optional(),
  POSTGRES_URL: z.string().url().optional(),
});

export function validateEnv() {
  const result = validateInput(EnvSchema, {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    MCP_API_KEYS: process.env.MCP_API_KEYS,
    POSTGRES_URL: process.env.POSTGRES_URL,
  });

  if (!result.success) {
    throw new Error(`Environment validation failed: ${result.error}`);
  }

  return result.data;
}
