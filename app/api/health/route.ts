import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const runtime = 'edge';

/**
 * Health check endpoint
 * Tests database connectivity and returns service status
 */
export async function GET() {
  try {
    // Test database connection
    const result = await sql`SELECT NOW() as timestamp, version() as pg_version`;
    const row = result.rows[0];

    return NextResponse.json({
      status: 'healthy',
      service: 'vercel-mcp-memory',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        timestamp: row.timestamp,
        version: row.pg_version,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        service: 'vercel-mcp-memory',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        error: (error as Error).message,
        database: {
          connected: false,
        },
      },
      { status: 503 }
    );
  }
}
