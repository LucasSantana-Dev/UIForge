# Dependencies, Vulnerabilities & Security

**When to apply:** Managing dependencies, security audits, vulnerability scanning, and security best practices.

## Dependency Management

### Zero-Cost Mandate

**Critical constraint:** All dependencies MUST be free and open-source.

- ❌ No paid services or APIs
- ❌ No premium tiers or subscriptions
- ❌ No cloud services requiring payment
- ✅ Only free/open-source packages (MIT, ISC, Apache-2.0, BSD)
- ✅ Self-hosted solutions only
- ✅ Free tier APIs with reasonable limits (e.g., Figma: 2,000 req/hour)

### Dependency Audit

**Regular checks required:**

```bash
# Check for outdated dependencies
npm outdated

# Update dependencies (respecting semver)
npm update

# Check for major updates
npx npm-check-updates
npx ncu -u  # Update package.json to latest

# Install updated dependencies
npm install
```

### Dependency Update Strategy

**Update frequency:**
- **Security patches:** Immediately (within 24 hours)
- **Minor updates:** Weekly review
- **Major updates:** Monthly review, test thoroughly

**Before updating:**
1. Review changelog for breaking changes
2. Check GitHub issues for known problems
3. Test in development environment
4. Update one dependency at a time for major versions
5. Run full test suite after updates

### Package Selection Criteria

When adding new dependencies, verify:

- ✅ **Active maintenance:** Recent commits (< 6 months)
- ✅ **Community trust:** High download count, GitHub stars
- ✅ **License:** MIT, ISC, Apache-2.0, BSD (no GPL for libraries)
- ✅ **Bundle size:** Minimal impact (check bundlephobia.com)
- ✅ **Security:** No known vulnerabilities
- ✅ **TypeScript support:** Native types or @types/* available
- ✅ **Zero-cost:** No paid features required

**Avoid:**
- ❌ Abandoned packages (no updates > 2 years)
- ❌ Packages with many open security issues
- ❌ Packages requiring paid services
- ❌ Bloated packages (prefer focused, single-purpose libs)

## Security Auditing

### npm audit

**Run security audits regularly:**

```bash
# Full security audit
npm audit

# Audit with JSON output
npm audit --json > audit-report.json

# Audit only production dependencies
npm audit --omit=dev

# Set minimum severity level
npm audit --audit-level=moderate  # low|moderate|high|critical
```

### Automated Fixes

```bash
# Auto-fix compatible updates (safe)
npm audit fix

# Fix with package-lock only (no node_modules changes)
npm audit fix --package-lock-only

# Fix production dependencies only
npm audit fix --only=prod

# Force major version updates (CAUTION: may break)
npm audit fix --force
```

**⚠️ Warning:** `--force` can introduce breaking changes. Always test after using.

### Audit Severity Levels

- **Critical:** Immediate action required (< 24 hours)
- **High:** Fix within 1 week
- **Moderate:** Fix within 1 month
- **Low:** Fix in next release cycle

### CI/CD Security Checks

**GitHub Actions workflow:**

```yaml
# .github/workflows/ci.yml
dependency-check:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Check outdated dependencies
      run: npm outdated || echo "::warning::Some dependencies are outdated"
    
    - name: Security audit
      run: npm audit --audit-level=moderate
    
    - name: Generate audit summary
      if: always()
      run: |
        echo "## Dependency Audit" >> $GITHUB_STEP_SUMMARY
        npm outdated >> $GITHUB_STEP_SUMMARY || true
```

### Vulnerability Response Process

**When vulnerability detected:**

1. **Assess severity:** Review CVE details, CVSS score
2. **Check exploitability:** Is it exploitable in our context?
3. **Find fix:** Check for patched version or workaround
4. **Update dependency:** `npm update <package>` or `npm audit fix`
5. **Test thoroughly:** Run full test suite
6. **Document:** Add to CHANGELOG.md
7. **Deploy:** Push fix to production ASAP for critical/high

**If no fix available:**
- Check for alternative packages
- Implement workaround/mitigation
- Monitor for updates
- Consider forking and patching (last resort)

## Security Best Practices

### Secrets Management

**Never commit secrets:**

```bash
# .env (gitignored)
FIGMA_ACCESS_TOKEN=your_token_here
API_KEY=your_key_here
```

**Environment variables:**
- Load from `.env` file (development)
- Use environment variables (production)
- Document in `.env.example` (without values)
- Never log or expose in error messages

**Validation:**

```typescript
// config.ts
import { z } from 'zod';

const configSchema = z.object({
  figmaAccessToken: z.string().min(1).optional(),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

// Validate at startup
const config = configSchema.parse({
  figmaAccessToken: process.env.FIGMA_ACCESS_TOKEN,
  logLevel: process.env.LOG_LEVEL,
});
```

### Input Validation

**Validate all external inputs:**

```typescript
// Use Zod for MCP tool inputs
const inputSchema = {
  url: z.string().url().describe('URL to fetch'),
  fileKey: z.string().regex(/^[a-zA-Z0-9]+$/).describe('Figma file key'),
};

// Sanitize URLs to prevent SSRF
function isPrivateIP(url: string): boolean {
  // Block private IPs: 10.x.x.x, 172.16-31.x.x, 192.168.x.x, 127.x.x.x
  // Block localhost, link-local, etc.
}

// Validate before processing
if (isPrivateIP(url)) {
  throw new Error('Private/local URLs are not allowed');
}
```

**Prevent common attacks:**
- **SSRF:** Validate and sanitize URLs, block private IPs
- **XSS:** Sanitize user input in generated HTML
- **Path Traversal:** Validate file paths, use path.resolve()
- **Injection:** Use parameterized queries, escape user input

### Docker Security

**Multi-stage builds:**

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
USER nodejs
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

**Best practices:**
- Use official, minimal base images (alpine)
- Run as non-root user
- Don't copy `.env` files into images
- Use `.dockerignore` to exclude sensitive files
- Scan images for vulnerabilities: `docker scan <image>`

### Git Security

**Pre-commit hooks:**

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Lint staged files
npx lint-staged || exit 1

# Check for secrets (optional: use git-secrets or gitleaks)
# git secrets --scan || exit 1

# Dependency check (non-blocking)
npm run deps:check --silent || echo "⚠️  Dependencies outdated"

# Security audit (non-blocking)
npm audit --audit-level=high --silent || echo "⚠️  Security issues detected"
```

**Branch protection:**
- Require PR reviews before merge
- Require status checks to pass (CI)
- Require branches to be up to date
- Restrict force pushes
- Restrict deletions

### API Security

**Rate limiting:**

```typescript
// Implement rate limiting for external APIs
const RATE_LIMIT = 100; // requests per minute
const rateLimiter = new Map<string, number>();

function checkRateLimit(key: string): boolean {
  const count = rateLimiter.get(key) || 0;
  if (count >= RATE_LIMIT) return false;
  rateLimiter.set(key, count + 1);
  setTimeout(() => rateLimiter.delete(key), 60000);
  return true;
}
```

**Authentication:**
- Use API keys/tokens for external services
- Validate tokens before processing requests
- Implement token rotation strategy
- Use HTTPS only for API calls

### Dependency Lock Files

**Always commit lock files:**

```bash
# Commit package-lock.json for reproducible builds
git add package-lock.json
git commit -m "chore: update dependencies"
```

**Benefits:**
- Reproducible builds across environments
- Prevents supply chain attacks
- Ensures consistent dependency versions
- Faster CI/CD (uses exact versions)

### Supply Chain Security

**Verify package integrity:**

```bash
# Check package checksums
npm audit signatures

# Verify package publisher
npm view <package> --json | jq '.maintainers'
```

**Best practices:**
- Review dependency tree: `npm ls`
- Minimize dependencies (fewer attack vectors)
- Use `npm ci` in CI/CD (respects lock file exactly)
- Enable 2FA for npm account
- Monitor security advisories: GitHub Dependabot

### Security Headers (for web deployments)

```typescript
// Express.js example
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  next();
});
```

## Monitoring & Alerts

### Automated Monitoring

**Set up alerts for:**
- New security vulnerabilities (GitHub Dependabot)
- Failed CI/CD builds
- Dependency updates available
- License compliance issues

### Regular Reviews

**Weekly:**
- Review `npm outdated` output
- Check GitHub security alerts
- Review CI/CD failures

**Monthly:**
- Full dependency audit
- Review and update major versions
- Security policy review
- Access control review

## Compliance & Licensing

### License Compatibility

**Allowed licenses:**
- MIT, ISC, Apache-2.0, BSD-2-Clause, BSD-3-Clause
- CC0-1.0 (public domain)
- Unlicense

**Restricted licenses:**
- GPL, LGPL, AGPL (viral, avoid for libraries)
- Commercial licenses (violates zero-cost mandate)

**Check licenses:**

```bash
# List all dependency licenses
npx license-checker --summary

# Check for problematic licenses
npx license-checker --onlyAllow "MIT;ISC;Apache-2.0;BSD-2-Clause;BSD-3-Clause"
```

### SBOM (Software Bill of Materials)

**Generate SBOM for transparency:**

```bash
# Generate CycloneDX SBOM
npx @cyclonedx/cyclonedx-npm --output-file sbom.json

# Generate SPDX SBOM
npm sbom --sbom-format spdx
```

## Emergency Response

### Critical Vulnerability Response

**Immediate actions (< 4 hours):**

1. Assess impact and exploitability
2. Check if actively exploited (CVE databases)
3. Apply emergency patch if available
4. Deploy hotfix to production
5. Notify team and stakeholders
6. Document incident

### Incident Template

```markdown
## Security Incident Report

**Date:** YYYY-MM-DD
**Severity:** Critical/High/Moderate/Low
**CVE:** CVE-YYYY-XXXXX
**Package:** package-name@version
**Impact:** Description of vulnerability
**Exploitability:** Yes/No/Unknown
**Fix Applied:** Version X.Y.Z / Workaround description
**Deployment:** Production/Staging/Development
**Timeline:**
- Detection: HH:MM
- Assessment: HH:MM
- Fix applied: HH:MM
- Deployed: HH:MM
**Lessons Learned:** ...
```

## Resources

- [npm audit documentation](https://docs.npmjs.com/cli/audit)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Snyk Vulnerability Database](https://snyk.io/vuln)
- [GitHub Security Advisories](https://github.com/advisories)
- [CVE Database](https://cve.mitre.org/)
