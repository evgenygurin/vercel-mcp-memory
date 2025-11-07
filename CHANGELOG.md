# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Community health files (CODE_OF_CONDUCT.md, SUPPORT.md, CONTRIBUTING.md)
- Issue templates (bug report, feature request)
- Pull request template
- GitHub Actions workflows (CI, CodeQL, stale bot)
- Comprehensive issue labels system
- Repository topics and metadata

## [1.0.0] - 2025-01-07

### Added
- Initial release
- MCP server implementation with 5 tools:
  - `add_memory` - Store memories with semantic embeddings
  - `search_memory` - Semantic search with cosine similarity
  - `list_memories` - List memories with pagination
  - `delete_memory` - Delete memory by UUID
  - `memory_stats` - Get memory statistics
- OpenAI text-embedding-3-small integration (1536 dimensions)
- PostgreSQL with pgvector extension for vector storage
- Vercel Edge Functions deployment
- API key authentication support
- Input validation with Zod schemas
- Structured logging for production
- Russian language support in full-text search
- Comprehensive documentation (README.md, SECURITY.md, CLAUDE.md)
- Database migration scripts
- MIT License

### Security
- Optional API key authentication
- Input validation and sanitization
- Secure environment variable handling
- Rate limiting recommendations

[Unreleased]: https://github.com/evgenygurin/vercel-mcp-memory/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/evgenygurin/vercel-mcp-memory/releases/tag/v1.0.0
