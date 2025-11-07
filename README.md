# Vercel MCP Memory

Custom Model Context Protocol (MCP) memory server deployed on Vercel with semantic search powered by Vercel AI SDK and PostgreSQL pgvector.

## ✨ Features

- 🧠 **Semantic Search** - Find memories by meaning, not just keywords
- ☁️ **Cloud-Hosted** - Deployed on Vercel Edge Functions (zero-infrastructure)
- 🔄 **Cross-Device Sync** - Access your memory from any device with Claude
- 🚀 **Vercel AI SDK** - Embeddings via OpenAI's text-embedding-3-small
- 🗄️ **PostgreSQL + pgvector** - Efficient vector similarity search
- 🇷🇺 **Multi-language** - Supports Russian and English

## 🏗️ Architecture

```text
Claude Desktop → HTTPS/JSON-RPC → Vercel Edge Function → Postgres (pgvector)
                                         ↓
                                   Vercel AI SDK (Embeddings)
```

## 📋 Prerequisites

- Node.js 18+
- Vercel account (free tier works)
- OpenAI API key (for embeddings, ~$0.10/1M tokens)

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

```bash
# Pull environment variables from Vercel
vercel env pull .env.local

# Add OpenAI API key (optional, for embeddings)
echo "OPENAI_API_KEY=sk-..." >> .env.local
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

Edit `~/.config/claude-desktop/claude_desktop_config.json` (macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`):

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
  content: string,      // Required
  category?: string,    // e.g., "projects", "people", "preferences"
  metadata?: object     // Custom key-value pairs
}
```

### `search_memory`

Semantic search across memories.

```typescript
{
  query: string,        // Required: natural language query
  category?: string,    // Filter by category
  limit?: number,       // Max results (default: 10)
  threshold?: number    // Min similarity 0-1 (default: 0.5)
}
```

### `list_memories`

List all memories chronologically.

```typescript
{
  category?: string,    // Filter by category
  limit?: number,       // Max results (default: 50)
  offset?: number       // Pagination offset (default: 0)
}
```

### `delete_memory`

Delete specific memory by UUID.

```typescript
{
  id: string           // UUID of memory
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
│   └── api/
│       ├── health/route.ts          # Health check endpoint
│       └── mcp/sse/route.ts         # MCP JSON-RPC endpoint
├── lib/
│   ├── db.ts                        # Postgres + pgvector queries
│   ├── embeddings.ts                # Vercel AI SDK embeddings
│   ├── mcp-server.ts                # MCP protocol handlers
│   └── types.ts                     # TypeScript definitions
├── migrations/
│   └── 001_init.sql                 # Database schema
├── scripts/
│   └── migrate-old-data.ts          # Data migration script
├── vercel.json                      # Vercel configuration
└── package.json
```

## 🔧 Development

```bash
# Run locally
npm run dev

# Build
npm run build

# Migrate old data
npm run migrate
```

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
2. Verify Vercel deployment: `vercel ls`
3. Check Claude config path is correct
4. Restart Claude Desktop

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
3. Monitor usage: https://platform.openai.com/usage

## 📖 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MCP Specification](https://modelcontextprotocol.io)
- [Vercel AI SDK](https://sdk.vercel.ai)
- [pgvector](https://github.com/pgvector/pgvector)

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

---

Built with ❤️ using Vercel, Next.js, and Claude Code
