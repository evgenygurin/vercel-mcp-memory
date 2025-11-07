# Claude Code GitHub Actions Setup

This repository is configured to use Claude Code via GitHub Actions.

## 🤖 Available Workflows

### 1. Claude Code (`claude.yml`)
**Trigger**: When someone mentions `@claude` in:
- Issue comments
- Pull request comments
- Pull request reviews
- Issue descriptions

**Purpose**: Interactive AI assistant for repository tasks.

**Example usage**:
```bash
@claude Please review the changes in this PR and suggest improvements.
@claude Can you help me fix the TypeScript errors in lib/db.ts?
@claude Update the README with information about the new feature.
```

**Permissions**:
- ✅ Read repository contents
- ✅ Write comments on issues and PRs
- ✅ Read CI/CD results
- ✅ OIDC token for authentication

### 2. Claude Code Review (`claude-code-review.yml`)
**Trigger**: Automatically on every PR (opened or updated)

**Purpose**: Automated code review focusing on:
- Code quality and best practices
- Potential bugs or issues
- Performance considerations
- Security concerns
- Test coverage

**Allowed operations**:
- View PRs and issues
- Search repository
- Comment on PRs

**Permissions**:
- ✅ Read repository contents
- ✅ Write comments on PRs
- ✅ Read issues and PRs

## 🔐 Required Secrets

The following secret must be configured in repository settings:

- `CLAUDE_CODE_OAUTH_TOKEN` - OAuth token for Claude Code authentication

**Status**: ✅ Configured (updated 2025-11-07)

To update the token:
```bash
gh secret set CLAUDE_CODE_OAUTH_TOKEN
```

## ⚙️ Configuration

### Repository Settings

Required settings in **Settings → Actions → General**:

1. **Workflow permissions**:
   - ✅ Read and write permissions (for commenting)
   - ✅ Allow GitHub Actions to create and approve pull requests

2. **Fork pull request workflows**:
   - ⚠️ Require approval for first-time contributors (recommended for security)

### Workflow Permissions

Both workflows use minimal required permissions:

| Permission | Access | Purpose |
|------------|--------|---------|
| `contents` | read | Access repository code |
| `pull-requests` | write | Comment on PRs |
| `issues` | write | Comment on issues |
| `id-token` | write | OIDC authentication |
| `actions` | read | Read CI results (claude.yml only) |

## 📝 Usage Examples

### Automated PR Review

Every PR automatically gets a Claude Code review:
1. Create a PR with your changes
2. Claude will automatically analyze the code
3. Review comments appear within a few minutes
4. Address the feedback and push updates

### Interactive Commands

In any issue or PR, mention `@claude` with your request:

**Code Review**:
```bash
@claude Please review the security implications of the authentication changes in this PR.
```

**Documentation**:
```sql
@claude Update CLAUDE.md to reflect the new database schema changes.
```

**Bug Investigation**:
```text
@claude The CI is failing on TypeScript compilation. Can you investigate and fix the errors?
```

**Testing**:
```bash
@claude Add unit tests for the new search_memory function.
```

## 🚨 Troubleshooting

### "Workflow validation failed" Warning

**Symptom**:
```text
Warning: Skipping action due to workflow validation:
Workflow validation failed. The workflow file must exist
and have identical content to the version on the
repository's default branch.
```

**Cause**: This appears when workflow files are first added via PR.

**Solution**:
- ✅ **This is normal and expected** on the first PR
- The warning disappears after the PR is merged to master
- Subsequent PRs will work correctly

### Claude Not Responding

**Check**:
1. Token is set: `gh secret list`
2. Workflow permissions are correct (Settings → Actions)
3. `@claude` is mentioned in the comment
4. Workflow run exists: `gh run list`

**Debug**:
```bash
# Check workflow runs
gh run list --workflow=claude.yml

# View specific run logs
gh run view <run-id> --log
```

### Permission Errors

If Claude can't comment:
1. Go to Settings → Actions → General
2. Enable "Read and write permissions"
3. Enable "Allow GitHub Actions to create and approve pull requests"
4. Re-run the workflow

## 🔄 Workflow Updates

After modifying workflow files:
```bash
# Commit changes
git add .github/workflows/
git commit -m "ci: update Claude Code workflows"
git push

# Verify workflows are valid
gh workflow list
gh workflow view claude.yml
```

## 📊 Monitoring

View workflow activity:
```bash
# List recent runs
gh run list --limit 10

# Check specific workflow
gh run list --workflow=claude-code-review.yml

# View run details
gh run view <run-id>

# Download logs
gh run download <run-id>
```

## 🔒 Security Considerations

1. **OIDC Authentication**: Workflows use OpenID Connect for secure, token-less authentication
2. **Minimal Permissions**: Each workflow has only the permissions it needs
3. **Fork Protection**: First-time contributors need approval to run workflows
4. **Secret Protection**: `CLAUDE_CODE_OAUTH_TOKEN` is never exposed in logs
5. **Code Review**: All workflow changes require review before merge

## 📚 References

- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Claude Code Action](https://github.com/anthropics/claude-code-action)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

## 🎯 Best Practices

1. **Be Specific**: Give Claude clear, detailed instructions
2. **Use Context**: Reference specific files, functions, or line numbers
3. **Iterate**: Claude can respond to follow-up questions in the same thread
4. **Review Changes**: Always review Claude's suggestions before merging
5. **Test Locally**: Run `npm run build` and `npm run lint` before pushing

---

**Last Updated**: 2025-11-07
**Workflows**: `claude.yml`, `claude-code-review.yml`
**Status**: ✅ Active
