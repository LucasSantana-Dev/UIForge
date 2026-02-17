# UIForge Trunk Based Development Setup

This repository uses Trunk Based Development with automated deployment workflows.

## 🌳 Branch Strategy

### Main Branches
- **`main`**: Production-ready code, always deployable
- **`dev`**: Development environment, continuously deployed
- **`release/1.0.0`**: Release branch for version 1.0.0

### Feature Branches
- **`feature/*`**: Individual features and bug fixes
- **`hotfix/*`**: Critical production fixes

## 🚀 Deployment Workflow

### Development Environment
- **Trigger**: Push to `dev` branch
- **URL**: https://dev.uiforge.com
- **Features**: Latest features enabled, debug tools active

### Production Environment
- **Trigger**: Merge `release/1.0.0` → `main`
- **URL**: https://uiforge.com
- **Features**: Stable features only, optimized for performance

## 📋 Workflow Steps

### 1. Start New Feature
```bash
# Create feature branch from dev
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name

# Work on feature
# ... make changes ...

# Commit changes
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

### 2. Test and Merge to Dev
```bash
# Create PR to dev branch
# Wait for CI/CD checks
# Merge to dev when approved
```

### 3. Prepare for Release
```bash
# Create release branch from main
git checkout main
git pull origin main
git checkout -b release/1.0.0

# Merge dev into release
git merge dev
git push origin release/1.0.0
```

### 4. Deploy to Production
```bash
# Merge release to main (triggers deployment)
git checkout main
git merge release/1.0.0
git push origin main
```

## 🔧 Environment Setup

### Development Environment
- Copy `.env.dev.example` to `.env.dev`
- Configure development variables
- Deploy with: `./scripts/deploy.sh dev`

### Production Environment
- Copy `.env.production.example` to `.env.production`
- Configure production variables
- Deploy with: `./scripts/deploy.sh production`

## 🧪 Quality Gates

### Feature Branch → Dev
- ✅ Unit tests pass
- ✅ Code coverage > 80%
- ✅ Linting passes
- ✅ Type checking passes
- ✅ Build successful

### Dev → Release
- ✅ All feature requirements met
- ✅ Integration tests pass
- ✅ Performance benchmarks met
- ✅ Security scan passes

### Release → Main
- ✅ Full regression tests pass
- ✅ Security audit passes
- ✅ Load tests pass
- ✅ Documentation updated

## 🚨 Emergency Procedures

### Hotfix to Production
```bash
# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# Fix the issue
# ... make changes ...

# Deploy immediately
git push origin hotfix/critical-bug
git checkout main
git merge hotfix/critical-bug
git push origin main
```

### Rollback Production
```bash
# Rollback to previous tag
git checkout v0.9.0
git push -f origin v0.9.0:main
```

## 📊 Monitoring

- **Dev Environment**: Basic monitoring, debug logs
- **Production Environment**: Full monitoring, error tracking, performance metrics
- **Alerts**: Deployment failures, high error rates, performance degradation

## 🤝 Team Guidelines

- **Code Reviews**: Required for all PRs to dev and release branches
- **Testing**: Write tests for new features
- **Documentation**: Update docs for breaking changes
- **Communication**: Use team channels for coordination

## 🛠️ Useful Commands

```bash
# List all branches
git branch -a

# Sync branches
git checkout dev
git merge main

# Clean up feature branches
git branch -d feature/completed-feature
git push origin --delete feature/completed-feature

# Check deployment status
# Check GitHub Actions tab in repository
```

## 📚 Additional Resources

- [GitHub Actions Workflows](.github/workflows/)
- [Branch Protection Rules](.github/branch-protection.yml)
- [Environment Configuration](.env.*.example)
- [Deployment Scripts](scripts/deploy.sh)