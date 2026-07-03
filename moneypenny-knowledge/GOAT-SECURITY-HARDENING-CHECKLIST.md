# GOAT Security Hardening Checklist

Priority 0 - stop accidental exposure:
- Close unused public PRs that discuss deployment or infrastructure.
- Rotate any credential that may have been committed, pasted, screenshotted, or stored in public PR comments.
- Remove real secrets from docs, HTML pages, shell scripts, and examples.
- Make sure `.env`, `.env.local`, `.env.production`, private keys, database dumps, and API vault exports are ignored by Git.

Priority 1 - GitHub repository controls:
- Enable branch protection on `main`.
- Require pull request review before merge.
- Dismiss stale approvals when new commits are pushed.
- Require status checks before merge.
- Restrict who can push to protected branches.
- Disable force pushes to protected branches.
- Add `CODEOWNERS` so sensitive files require owner review.
- Enable Dependabot alerts and security updates.
- Enable secret scanning and push protection where available.
- Review installed GitHub Apps, deploy keys, fine-grained tokens, and collaborators.

Priority 2 - app and deployment controls:
- Keep server-only secrets out of browser code.
- Remove any `service_role`, secret key, private key, or database URL from frontend code.
- Use hosting provider environment secrets for production.
- Use separate development/staging/production credentials.
- Add security headers to the deployed app.
- Turn off public debug/admin pages unless they are owner-authenticated.
- Keep AGENT-007, Money Penny, API vault, and owner routes private.

Priority 3 - Supabase controls:
- Enable Row Level Security on every table that can be reached from the browser.
- Create least-privilege RLS policies for each user role.
- Never expose service-role or secret keys to frontend code.
- Use Edge Functions or backend routes for admin operations.
- Turn on SSL enforcement and network restrictions where practical.
- Enforce MFA for Supabase owner/admin accounts.
- Keep multiple trusted owner accounts for recovery.

Priority 4 - evidence and audit trail:
- Keep a dated evidence log for PRs, commits, Drive imports, deploys, and security reviews.
- Hash important archives and exported vaults.
- Save redacted scan reports before cleanup.
- Track each rotated secret with date, provider, old exposure location, and new storage location.
