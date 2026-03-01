# Security Policy

This policy covers [Siza](https://github.com/Forge-Space/siza), the full-stack AI workspace. For general Forge Space security policy, see the [organization-level policy](https://github.com/Forge-Space/.github/blob/main/SECURITY.md).

## Reporting a Vulnerability

### Preferred: GitHub Private Security Advisory

Open a [Private Security Advisory](https://github.com/Forge-Space/siza/security/advisories/new) directly on this repository.

### Alternative: Email

Send details to [security@forgespace.co](mailto:security@forgespace.co).

Include:

- Description of the vulnerability
- Steps to reproduce
- Affected version or deployment
- Potential impact assessment

## Response Timeline

| Stage | Target |
|-------|--------|
| Acknowledgment | < 48 hours |
| Triage and severity assessment | < 7 days |
| Fix for critical severity | < 7 days |
| Fix for high severity | < 30 days |
| Fix for medium/low severity | Next release cycle |

## Scope

### In Scope

- Authentication flows (Supabase Auth, OAuth providers, session management)
- Stripe billing integration (webhooks, checkout, customer portal)
- API routes and server-side data handling
- CORS and CSP configuration
- User data storage and access control (Supabase RLS policies)
- Input validation and sanitization
- BYOK (Bring Your Own Key) encryption and key storage
- File upload handling and storage bucket permissions

### Out of Scope

- Third-party service vulnerabilities (Supabase, Stripe, Cloudflare) -- report upstream
- Client-side UI rendering issues without security impact
- Rate limiting thresholds (by design, not a vulnerability)
- Issues only reproducible in development mode

## Supported Versions

Only the latest production deployment is supported. Siza uses continuous deployment to Cloudflare Workers -- there are no maintained older versions.

## Safe Harbor

We support safe harbor for security researchers acting in good faith. See the [organization-level policy](https://github.com/Forge-Space/.github/blob/main/SECURITY.md) for full safe harbor terms.

## Contact

- **Email**: [security@forgespace.co](mailto:security@forgespace.co)
- **GitHub**: [Open a Private Security Advisory](https://github.com/Forge-Space/siza/security/advisories/new)
