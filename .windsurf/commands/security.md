# Security Audit

Run comprehensive security audit on Siza codebase.

## Security Checks:
1. Snyk code scan for vulnerabilities
2. Dependency vulnerability check
3. Secret detection scan
4. XSS vulnerability analysis
5. Authentication security review
6. Database security audit
7. API security validation

## Tools Used:
- Snyk for code and dependency scanning
- Gitleaks for secret detection
- Custom XSS analysis
- Security headers validation
- OWASP security checklist

## Priority Levels:
- Critical: Immediate fix required
- High: Fix within 24 hours
- Medium: Fix within 1 week
- Low: Fix in next sprint

## Report Format:
- Executive summary
- Detailed findings
- Risk assessment
- Remediation steps
- Timeline for fixes

## Usage:
/security audit - Full security audit
/security scan - Quick vulnerability scan
/security secrets - Secret detection only
/security deps - Dependency check only

## Integration:
Automatically runs on:
- Pull request creation
- Main branch merge
- Weekly security review

Current security posture: Analyzing...
