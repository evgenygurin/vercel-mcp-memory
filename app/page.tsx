import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ fontFamily: 'system-ui', maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>🧠 Vercel MCP Memory Server</h1>
      <p>
        Custom Model Context Protocol (MCP) memory server with semantic search, deployed on Vercel
        Edge Functions.
      </p>

      <h2>✨ Features</h2>
      <ul>
        <li>Semantic search powered by Vercel AI SDK</li>
        <li>PostgreSQL + pgvector for efficient vector storage</li>
        <li>Cloud-hosted with zero infrastructure management</li>
        <li>Cross-device memory synchronization</li>
        <li>Multi-language support (English, Russian)</li>
      </ul>

      <h2>🔗 Endpoints</h2>
      <ul>
        <li>
          <Link href="/api/health">
            <code>/api/health</code>
          </Link>{' '}
          - Health check
        </li>
        <li>
          <code>/api/mcp/sse</code> - MCP JSON-RPC endpoint (for Claude Desktop)
        </li>
      </ul>

      <h2>📖 Documentation</h2>
      <p>
        See <a href="https://github.com/evgenygurin/vercel-mcp-memory">README.md</a> for setup
        instructions and API documentation.
      </p>

      <h2>🚀 Quick Test</h2>
      <p>
        Check server health:{' '}
        <Link href="/api/health" style={{ color: '#0070f3' }}>
          /api/health
        </Link>
      </p>

      <hr style={{ margin: '2rem 0' }} />

      <p style={{ color: '#666', fontSize: '0.9rem' }}>
        Built with ❤️ using Vercel, Next.js, and Claude Code
      </p>
    </div>
  );
}
