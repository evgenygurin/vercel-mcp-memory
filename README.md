# Vercel MCP Memory

[![CI](https://github.com/evgenygurin/vercel-mcp-memory/actions/workflows/ci.yml/badge.svg)](https://github.com/evgenygurin/vercel-mcp-memory/actions/workflows/ci.yml)
[![CodeQL](https://github.com/evgenygurin/vercel-mcp-memory/actions/workflows/codeql.yml/badge.svg)](https://github.com/evgenygurin/vercel-mcp-memory/actions/workflows/codeql.yml)
[![Claude Code](https://img.shields.io/badge/Claude_Code-Enabled-7C3AED?logo=anthropic)](https://docs.claude.com/en/docs/claude-code)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub issues](https://img.shields.io/github/issues/evgenygurin/vercel-mcp-memory)](https://github.com/evgenygurin/vercel-mcp-memory/issues)
[![GitHub stars](https://img.shields.io/github/stars/evgenygurin/vercel-mcp-memory)](https://github.com/evgenygurin/vercel-mcp-memory/stargazers)

Custom Model Context Protocol (MCP) memory server deployed on Vercel with semantic search powered by OpenAI embeddings and PostgreSQL pgvector.

## ✨ Features

- 🧠 **Semantic Search** - Find memories by meaning, not just keywords
- 🔐 **Secure API** - Optional API key authentication for production
- ☁️ **Cloud-Hosted** - Deployed on Vercel Edge Functions (zero-infrastructure)
- 🔄 **Cross-Device Sync** - Access your memory from any device with Claude
- 🚀 **OpenAI Embeddings** - Using text-embedding-3-small model
- 🗄️ **PostgreSQL + pgvector** - Efficient vector similarity search
- ✅ **Input Validation** - Zod schemas for robust data validation
- 📝 **Structured Logging** - Production-ready error tracking
- 🌍 **Multi-language** - Supports Russian, English and more
- 🤖 **Claude Code Integration** - Automated PR reviews and AI assistant via GitHub Actions

## 🏗️ Architecture

```text
Claude Desktop → HTTPS/JSON-RPC → Vercel Edge Function → Postgres (pgvector)
                                         ↓
                                   OpenAI Embeddings API
```

## 📋 Prerequisites

- Node.js 20.x
- Vercel account (free tier works)
- OpenAI API key (for embeddings, ~$0.10/1M tokens)
- PostgreSQL database with pgvector extension (Vercel Postgres or Neon)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd vercel-mcp-memory
npm install
```

### 2. Set Up Vercel Postgres

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Create Postgres database (via Vercel Dashboard)
# 1. Go to https://vercel.com/dashboard
# 2. Navigate to Storage → Create Database → Postgres
# 3. Name: mcp-memory-db
# 4. Region: Select closest to you
```

### 3. Configure Environment Variables

Create `.env.local` file:

```bash
# Required: OpenAI API key for embeddings
OPENAI_API_KEY=sk-...

# Required: PostgreSQL connection (auto-configured by Vercel)
POSTGRES_URL=postgresql://...

# Optional: API keys for authentication (comma-separated)
# Leave empty for development without auth
MCP_API_KEYS=your-secret-key-1,your-secret-key-2
```

Generate secure API keys:

```bash
# Generate a secure API key
openssl rand -base64 32
```

### 4. Run Database Migration

Apply the SQL schema with pgvector extension:

```bash
# Option 1: Via Vercel Dashboard
# 1. Go to Storage → mcp-memory-db → SQL Editor
# 2. Copy contents of migrations/001_init.sql
# 3. Execute

# Option 2: Via psql (if you have local connection)
psql $POSTGRES_URL < migrations/001_init.sql
```

### 5. Deploy to Vercel

```bash
vercel --prod
```

Your MCP server will be available at: `https://your-project.vercel.app`

### 6. Configure Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `~/.config/claude-desktop/claude_desktop_config.json` (Linux):

**With authentication (recommended for production):**

```json
{
  "mcpServers": {
    "vercel-memory": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://your-project.vercel.app/api/mcp/sse"
      ],
      "env": {
        "MCP_API_KEY": "your-secret-key-here"
      }
    }
  }
}
```

**Without authentication (development only):**

```json
{
  "mcpServers": {
    "vercel-memory": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://your-project.vercel.app/api/mcp/sse"
      ]
    }
  }
}
```

Restart Claude Desktop.

## 🧪 Testing

### Health Check

```bash
curl https://your-project.vercel.app/api/health
```

Should return:

```json
{
  "status": "healthy",
  "service": "vercel-mcp-memory",
  "database": {
    "connected": true
  }
}
```

### Test MCP Endpoint with Authentication

```bash
curl -X POST https://your-project.vercel.app/api/mcp/sse \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-key" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'
```

### Test in Claude

```bash
User: Remember: I prefer Python for backend development
Claude: [Uses add_memory tool]

User: What programming languages do I prefer?
Claude: [Uses search_memory tool and finds "Python"]
```

## 📊 MCP Tools

### `add_memory`

Store new memory with semantic embeddings.

```typescript
{
  content: string,      // Required (1-10000 chars)
  category?: string,    // Optional (max 100 chars)
  metadata?: object     // Optional custom key-value pairs
}
```

### `search_memory`

Semantic search across memories.

```typescript
{
  query: string,        // Required: natural language query (1-1000 chars)
  category?: string,    // Filter by category
  limit?: number,       // Max results (default: 10, max: 50)
  threshold?: number    // Min similarity 0-1 (default: 0.5)
}
```

### `list_memories`

List all memories chronologically.

```typescript
{
  category?: string,    // Filter by category
  limit?: number,       // Max results (default: 50, max: 100)
  offset?: number       // Pagination offset (default: 0)
}
```

### `delete_memory`

Delete specific memory by UUID.

```typescript
{
  id: string           // UUID of memory (validated)
}
```

### `memory_stats`

Get statistics about stored memories.

```typescript
{}  // No parameters
```

## 📁 Project Structure

```text
vercel-mcp-memory/
├── app/
│   ├── api/
│   │   ├── health/route.ts          # Health check endpoint
│   │   └── mcp/sse/route.ts         # MCP JSON-RPC endpoint
│   ├── layout.tsx                   # Next.js layout
│   └── page.tsx                     # Landing page
├── lib/
│   ├── auth.ts                      # API authentication
│   ├── db.ts                        # Postgres + pgvector queries
│   ├── embeddings.ts                # OpenAI embeddings client
│   ├── logger.ts                    # Structured logging
│   ├── mcp-handlers.ts              # Centralized tool handlers
│   ├── mcp-server.ts                # MCP SDK integration
│   ├── types.ts                     # TypeScript definitions
│   └── validation.ts                # Zod input validation
├── migrations/
│   └── 001_init.sql                 # Database schema
├── scripts/
│   ├── insert-test-data.ts          # Test data seeding
│   └── migrate-old-data.ts          # Legacy data migration
├── .env.example                     # Environment variables template
├── .eslintrc.json                   # ESLint configuration
├── .gitignore                       # Git ignore rules
├── SECURITY.md                      # Security guidelines
├── next.config.js                   # Next.js configuration
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript configuration
└── vercel.json                      # Vercel deployment config
```

## 🔧 Development

```bash
# Run locally
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Migrate old data
npm run migrate
```

## 🔐 Security

See [SECURITY.md](./SECURITY.md) for security best practices.

**Important:**

- Never commit `.env.local` or `.env.production` files
- Rotate API keys regularly
- Enable `MCP_API_KEYS` authentication in production
- Monitor API usage to prevent quota exhaustion
- Review [SECURITY.md](./SECURITY.md) before deploying

## 💰 Cost Estimation

**Vercel Free Tier (sufficient for personal use):**

- ✅ Functions: 100 GB-hours/month
- ✅ Postgres: 256 MB storage
- ✅ Bandwidth: 100 GB

**After free tier:**

- Postgres: ~$0.20/GB/month
- OpenAI Embeddings: ~$0.10/1M tokens (~$0.02/month for typical usage)
- Functions: ~$40/100 GB-hours

**Expected cost**: $0-5/month for moderate personal use.

## 🐛 Troubleshooting

### Claude can't connect

1. Check health endpoint: `curl https://your-project.vercel.app/api/health`
2. Verify API key matches in both Vercel env and Claude config
3. Check Vercel deployment: `vercel ls`
4. Verify Claude config path is correct
5. Restart Claude Desktop

### Authentication errors

1. Verify `MCP_API_KEYS` is set in Vercel environment variables
2. Check API key format (no extra spaces or newlines)
3. Ensure Claude config includes `MCP_API_KEY` in env section
4. Try without authentication first (remove `MCP_API_KEYS` from Vercel env)

### Database errors

1. Verify pgvector extension is enabled:

   ```sql
   SELECT * FROM pg_extension WHERE extname = 'vector';
   ```

2. Check table exists:

   ```sql
   \dt memories
   ```

3. View connection logs in Vercel Dashboard → Functions → Logs

### Embedding errors

1. Verify OpenAI API key is set: `vercel env ls`
2. Check API key has sufficient credits
3. Monitor usage: <https://platform.openai.com/usage>

## 📖 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MCP Specification](https://modelcontextprotocol.io)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
- [pgvector](https://github.com/pgvector/pgvector)

## 🤖 Claude Code Integration

This repository uses Claude Code via GitHub Actions for automated code reviews and AI assistance.

### Automated PR Reviews

Every pull request automatically receives a comprehensive code review from Claude, focusing on:
- Code quality and best practices
- Potential bugs and security issues
- Performance considerations
- Test coverage

### Interactive AI Assistant

Mention `@claude` in any issue or PR comment to get help:

```bash
@claude Please review the security implications of these auth changes.
@claude Help me fix the TypeScript errors in lib/db.ts.
@claude Update CLAUDE.md to reflect the new architecture.
```

For detailed setup and troubleshooting, see [.github/CLAUDE_CODE_SETUP.md](.github/CLAUDE_CODE_SETUP.md).

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](.github/CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) first.

Quick steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

For questions or support, see [SUPPORT.md](SUPPORT.md).

## 🙏 Acknowledgments

Built with:

- [Vercel](https://vercel.com) - Hosting and Postgres
- [Next.js](https://nextjs.org) - React framework
- [OpenAI](https://openai.com) - Embeddings API
- [MCP SDK](https://github.com/modelcontextprotocol/sdk) - Protocol implementation
- [pgvector](https://github.com/pgvector/pgvector) - Vector similarity search

---

Made with ❤️ using Vercel, Next.js, and Claude Code
