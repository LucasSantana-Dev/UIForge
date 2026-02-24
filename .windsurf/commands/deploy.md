# Deploy to Production

Analyze changes and deploy to production for Siza.

## Steps:
1. Check git status for uncommitted changes
2. Run test suite to ensure quality
3. Run Snyk security scan
4. Stage all changes
5. Create semantic commit message
6. Push to main branch
7. Trigger CI/CD deployment

## Quality Gates:
- All tests must pass
- No security vulnerabilities
- TypeScript compilation successful
- Build process completes successfully

Current status: !git status

## Usage:
/deploy [description] - Deploy with optional description
/deploy hotfix - Deploy hotfix with priority
/deploy feature - Deploy feature branch after merge
