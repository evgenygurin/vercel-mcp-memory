import { NextRequest } from 'next/server';

/**
 * Authentication middleware for MCP API endpoints
 */

/**
 * Get valid API keys from environment
 * Format: comma-separated list in MCP_API_KEYS env variable
 */
function getValidApiKeys(): string[] {
  const keys = process.env.MCP_API_KEYS;
  if (!keys) {
    return [];
  }
  return keys.split(',').map((k) => k.trim()).filter(Boolean);
}

/**
 * Verify API key from request headers
 */
export function verifyApiKey(request: NextRequest): {
  valid: boolean;
  error?: string;
} {
  // Check if authentication is enabled
  const validKeys = getValidApiKeys();

  // If no keys configured, allow all requests (development mode)
  if (validKeys.length === 0) {
    return { valid: true };
  }

  // Extract API key from headers
  const apiKey =
    request.headers.get('x-api-key') ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!apiKey) {
    return {
      valid: false,
      error: 'Missing API key. Provide X-API-Key header or Authorization Bearer token',
    };
  }

  // Verify API key
  if (!validKeys.includes(apiKey)) {
    return {
      valid: false,
      error: 'Invalid API key',
    };
  }

  return { valid: true };
}

/**
 * Create authentication error response
 */
export function createAuthErrorResponse(error: string, id?: string | null) {
  return Response.json(
    {
      jsonrpc: '2.0',
      error: {
        code: -32001,
        message: error,
      },
      id: id || null,
    },
    { status: 401 }
  );
}

/**
 * Generate secure API key
 * Use this to create new API keys:
 * - Node.js: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 * - CLI: openssl rand -base64 32
 */
export function generateApiKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    // Use Web Crypto API (available in Edge Runtime)
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Buffer.from(array).toString('base64');
  }
  throw new Error('Crypto API not available');
}
