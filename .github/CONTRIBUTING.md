# Contributing to Vercel MCP Memory

Thank you for considering contributing to Vercel MCP Memory! This document outlines the process and guidelines.

## Code of Conduct

Be respectful and constructive in all interactions.

## How to Contribute

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Use the bug report template
3. Include:
   - Clear description of the issue
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Node version, OS, etc.)
   - Relevant logs or error messages

### Suggesting Features

1. Check existing feature requests
2. Describe the use case and benefits
3. Consider implementation complexity
4. Be open to feedback and alternative solutions

### Pull Requests

1. **Fork and Clone**

   ```bash
   git clone https://github.com/yourusername/vercel-mcp-memory.git
   cd vercel-mcp-memory
   npm install
   ```

2. **Create a Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**

   - Follow existing code style
   - Add tests for new functionality
   - Update documentation as needed
   - Ensure all tests pass: `npm run lint`

4. **Commit**

   Use clear, descriptive commit messages:

   ```bash
   git commit -m "feat: add rate limiting middleware"
   ```

   Commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

5. **Push and Create PR**

   ```bash
   git push origin feature/your-feature-name
   ```

   Then create a pull request on GitHub with:
   - Clear title and description
   - Reference related issues
   - Screenshots/demos if applicable

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing formatting conventions
- Run `npm run lint` before committing
- Maximum line length: 88 characters
- Use async/await over callbacks

### Security

- Never commit secrets or credentials
- Validate all user inputs
- Use parameterized SQL queries
- Follow OWASP Top 10 guidelines
- Report security issues privately (see SECURITY.md)

### Testing

- Add tests for new features
- Ensure existing tests pass
- Test edge cases and error conditions
- Include integration tests for API endpoints

### Documentation

- Update README for user-facing changes
- Add JSDoc comments for public APIs
- Include examples in documentation
- Update CHANGELOG.md

## Questions?

Feel free to open an issue for discussion before starting work on major changes.

Thank you for contributing!
