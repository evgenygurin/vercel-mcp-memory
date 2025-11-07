# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please email <security@example.com> or create a private security advisory on GitHub.

**Do not** open public issues for security vulnerabilities.

## Security Best Practices

### Environment Variables

Never commit `.env.local`, `.env.production`, or any file containing:

- API keys
- Database credentials
- JWT tokens
- OAuth secrets

### API Authentication

All API endpoints require authentication via `X-API-Key` header:

```bash
curl -H "X-API-Key: your-secret-key" https://your-app.vercel.app/api/mcp/sse
```

Generate secure API keys:

```bash
openssl rand -base64 32
```

### Rate Limiting

Configure rate limiting in Vercel Dashboard or via middleware to prevent:

- DoS attacks
- API quota exhaustion
- Database overload

### OpenAI API Key Rotation

Rotate your OpenAI API key regularly:

1. Create new key at <https://platform.openai.com/api-keys>
2. Update `OPENAI_API_KEY` in Vercel environment variables
3. Revoke old key

### Database Security

- Use SSL connections (enabled by default)
- Rotate database passwords quarterly
- Monitor connection logs for suspicious activity
- Use connection pooling to prevent exhaustion

## Known Issues

See [GitHub Issues](https://github.com/evgenygurin/vercel-mcp-memory/issues) for known security issues.
