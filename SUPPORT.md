# Support

Thank you for using Vercel MCP Memory! We're here to help you get the most out of this project.

## Getting Help

### Documentation

Before reaching out, please check our comprehensive documentation:

- **[README.md](README.md)** - Complete setup guide, API reference, and troubleshooting
- **[CLAUDE.md](CLAUDE.md)** - Technical architecture and development guide
- **[SECURITY.md](SECURITY.md)** - Security best practices and reporting vulnerabilities

### Troubleshooting

Common issues and solutions are documented in the [Troubleshooting](README.md#-troubleshooting) section of the README. Check there first!

Common topics include:
- Connection issues with Claude Desktop
- Authentication errors
- Database setup problems
- Embedding generation issues
- Deployment configuration

## Community Support

### GitHub Discussions

For questions, ideas, and community discussions:

**[Start a Discussion](https://github.com/evgenygurin/vercel-mcp-memory/discussions)**

Use discussions for:
- ❓ **Q&A** - Ask questions about usage, configuration, or implementation
- 💡 **Ideas** - Propose new features or improvements
- 🙌 **Show and Tell** - Share your projects built with this tool
- 📢 **Announcements** - Stay updated on releases and changes

### GitHub Issues

For bug reports and feature requests:

**[Create an Issue](https://github.com/evgenygurin/vercel-mcp-memory/issues/new/choose)**

Please use the appropriate template:
- 🐛 **Bug Report** - Report unexpected behavior or errors
- ✨ **Feature Request** - Suggest new features or enhancements

**Before creating an issue:**
1. Search existing issues to avoid duplicates
2. Check the troubleshooting guide
3. Gather relevant information (error messages, logs, versions)
4. Use the issue template and fill it out completely

## Response Times

This is an open-source project maintained by volunteers. Response times vary:

- **Critical bugs** (security, data loss): Within 48 hours
- **Regular bugs**: Within 1 week
- **Feature requests**: Reviewed monthly
- **Questions**: Usually within 3-5 days

## Self-Help Resources

### Health Check

Test your deployment:

```bash
# Check service health
curl https://your-project.vercel.app/api/health

# Test MCP endpoint
curl -X POST https://your-project.vercel.app/api/mcp/sse \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

### Logs

Check logs for debugging:

1. **Vercel Dashboard**: Functions → Logs
2. **Claude Desktop**: Open developer console
3. **Local Development**: Check terminal output

### Environment Validation

Verify your configuration:

```bash
# Check Vercel environment variables
vercel env ls

# Pull environment variables locally
vercel env pull .env.local

# Test database connection
psql $POSTGRES_URL -c "SELECT 1"

# Check OpenAI API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

## Contributing

Want to help improve the project? Check out:

- **[CONTRIBUTING.md](.github/CONTRIBUTING.md)** - Contribution guidelines
- **[Good First Issues](https://github.com/evgenygurin/vercel-mcp-memory/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)** - Beginner-friendly tasks

## Commercial Support

For commercial support, custom development, or consulting:

- Open an issue with the `type: question` label describing your needs
- We can discuss support options on a case-by-case basis

## Security Issues

**Do not report security vulnerabilities through public GitHub issues.**

Please report security issues privately:

1. Go to **[Security Advisories](https://github.com/evgenygurin/vercel-mcp-memory/security/advisories/new)**
2. Click "Report a vulnerability"
3. Provide detailed information about the issue

See [SECURITY.md](SECURITY.md) for more information.

## Social Media & Links

- **GitHub**: [@evgenygurin](https://github.com/evgenygurin)
- **Project**: [vercel-mcp-memory](https://github.com/evgenygurin/vercel-mcp-memory)
- **Demo**: [https://vercel-mcp-memory.vercel.app](https://vercel-mcp-memory.vercel.app)

## Feedback

We appreciate all feedback! Let us know:

- What's working well
- What's confusing or difficult
- What features you'd like to see
- How you're using the project

Use [GitHub Discussions](https://github.com/evgenygurin/vercel-mcp-memory/discussions) to share your thoughts.

---

**Thank you for being part of our community!** 🙏
