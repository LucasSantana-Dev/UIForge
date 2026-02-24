# Git Workflow

Smart Git workflow automation for Siza development.

## Workflow Commands:
/git feature "feature-name" - Create feature branch
/git fix "issue-description" - Create fix branch
/git commit "message" - Smart commit with conventional format
/git pr "title" - Create pull request with description
/git merge - Merge current branch with validation
/git status - Enhanced git status with context

## Branch Management:
- Feature branches: feat/feature-name
- Fix branches: fix/issue-description
- Hotfix branches: hotfix/urgent-fix
- Release branches: release/v1.2.3

## Commit Conventions:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code formatting
- refactor: Code refactoring
- test: Test additions
- chore: Maintenance tasks

## Pull Request Template:
- Description of changes
- Testing performed
- Breaking changes (if any)
- Screenshots (if applicable)
- Related issues

## Validation Steps:
1. Code quality checks (ESLint, Prettier)
2. Test suite execution
3. Security vulnerability scan
4. Performance impact assessment
5. Documentation updates

## Usage:
/git start "new feature" - Start new feature branch
/git save "commit message" - Commit current changes
/git share "PR title" - Create and share PR
/git deploy - Deploy to production after merge

Current git status: Checking...
