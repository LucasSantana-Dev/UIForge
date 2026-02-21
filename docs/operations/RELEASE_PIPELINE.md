# Automated Release Pipeline - UIForge Web App

This document describes the automated release pipeline for the UIForge web application, a private monorepo deployment.

## Overview

The release pipeline automatically deploys new versions when release branches are merged into the main branch. Since this is a private monorepo, the focus is on deployment automation rather than package publishing.

## Release Process

### 1. Create a Release Branch

Create a release branch following the pattern `release/X.Y.Z` where X.Y.Z follows semantic versioning:

```bash
# Create a new release branch for version 0.3.0
git checkout -b release/0.3.0
```

### 2. Make Changes and Test

Make your changes on the release branch, ensuring:

- All tests pass
- Code is properly formatted
- Security scans pass
- Documentation is updated
- CHANGELOG.md is updated with release notes

### 3. Merge Release Branch

Create a pull request from `release/0.3.0` to `main`:

```bash
git push origin release/0.3.0
```

The PR will be validated by the branch protection workflow.

### 4. Automated Release

Once the PR is merged to main, the automated release pipeline will:

1. **Detect Release Merge**: Identify that a release branch was merged
2. **Trigger Deploy Workflow**: Use repository dispatch to trigger the enhanced release-branch workflow
3. **Update CHANGELOG**: Add release notes to CHANGELOG.md
4. **Run Quality Checks**: Execute full test suite, linting, and security scans
5. **Deploy to Staging**: Automatically deploy to staging environment
6. **Deploy to Production**: Deploy to production environment (automated)
7. **Create GitHub Release**: Generate a tagged GitHub release
8. **Notify Teams**: Send success/failure notifications

## Branch Naming Convention

Release branches must follow the pattern: `release/X.Y.Z`

- **X**: Major version (breaking changes)
- **Y**: Minor version (new features)
- **Z**: Patch version (bug fixes)

Examples:
- `release/0.3.0` - Minor release with new features
- `release/0.2.1` - Patch release with bug fixes
- `release/1.0.0` - Major release with breaking changes

## Quality Gates

The pipeline includes several quality gates:

### Pre-Merge Validation
- Branch name validation
- Version format checking
- Duplicate version prevention
- PR description requirements
- Test coverage suggestions

### Pre-Release Validation
- Full test suite execution (unit, integration, performance)
- Security vulnerability scanning
- Code quality checks (ESLint, TypeScript)
- Build verification
- Documentation validation

### Post-Release Actions
- Staging environment deployment
- Production environment deployment
- GitHub release creation
- Health checks and performance validation

## Environments

### Staging Environment
- **Purpose**: Testing and validation before production
- **URL**: https://staging.uiforge.app
- **Deployment**: Automatic on release branch merge
- **Testing**: Full regression and performance tests
- **Health Checks**: Automated health monitoring

### Production Environment
- **Purpose**: Live user-facing application
- **URL**: https://uiforge.app
- **Deployment**: Automatic after staging validation
- **Monitoring**: Real-time health and performance monitoring
- **Rollback**: Manual rollback procedures available

## Environment Variables

The pipeline uses these secrets:

- `GITHUB_TOKEN`: GitHub API token (automatically provided)
- `STAGING_DEPLOY_TOKEN`: Staging deployment token
- `PRODUCTION_DEPLOY_TOKEN`: Production deployment token
- `HEALTH_CHECK_TOKEN`: Health check authentication token

## Troubleshooting

### Common Issues

**Release not detected**: Ensure the commit message indicates a release branch merge or the tag follows the pattern `release/X.Y.Z`.

**Version conflicts**: Check that the version doesn't already exist and follows semantic versioning.

**Deployment failures**: Verify deployment tokens and environment configurations.

**Health check failures**: Review application logs and environment status.

**Performance test failures**: Analyze performance metrics and optimize code.

### Debugging

1. **Check Workflow Logs**: Go to Actions tab in GitHub
2. **Review Failed Steps**: Identify which quality gate failed
3. **Local Testing**: Run the same checks locally:
   ```bash
   # Install dependencies
   npm ci
   
   # Run tests
   npm test
   
   # Run linting
   npm run lint
   npm run type-check
   
   # Build application
   npm run build
   ```

## Best Practices

### Before Creating Release Branch

1. **Ensure Main is Stable**: Main branch should be in a good state
2. **Update Dependencies**: All dependencies should be up to date
3. **Complete Features**: All intended features should be implemented
4. **Write Tests**: Ensure adequate test coverage
5. **Documentation**: Update relevant documentation

### During Release Development

1. **Semantic Versioning**: Follow semantic versioning guidelines
2. **CHANGELOG Updates**: Update CHANGELOG.md with user-facing changes
3. **Testing**: Test thoroughly in development environment
4. **Breaking Changes**: Document breaking changes clearly

### After Release

1. **Monitor Issues**: Watch for any post-release issues
2. **Check Health**: Monitor application health and performance
3. **User Feedback**: Collect and address user feedback
4. **Next Planning**: Plan for the next release cycle

## Release Notes Template

When updating CHANGELOG.md, use this format:

```markdown
## [0.3.0] - 2026-02-19

### Added
- New feature description
- Another new feature

### Changed
- Updated existing functionality
- Modified behavior

### Fixed
- Bug fix description
- Another bug fix

### Deprecated
- Feature being deprecated (with migration path)

### Removed
- Removed feature (with breaking change notice)

### Security
- Security vulnerability fix

### Documentation
- Updated documentation
- Added new guides
```

## Deployment Architecture

### Application Structure
```
UI/
├── apps/
│   ├── web/           # Main web application
│   └── admin/         # Admin interface
├── packages/          # Shared packages
├── docs/              # Documentation
└── .github/workflows/ # CI/CD workflows
```

### Deployment Process
1. **Build**: Application built using Turborepo
2. **Test**: Full test suite executed
3. **Staging**: Deploy to staging environment
4. **Validation**: Health checks and performance tests
5. **Production**: Deploy to production environment
6. **Monitoring**: Real-time health and performance monitoring

## Monitoring and Observability

### Health Checks
- **Endpoint**: `/health`
- **Metrics**: Response time, error rate, uptime
- **Alerting**: Automated alerts for failures
- **Dashboard**: Real-time monitoring dashboard

### Performance Monitoring
- **Load Testing**: Automated load testing on releases
- **Performance Metrics**: Response time, throughput, error rate
- **User Experience**: Core Web Vitals monitoring
- **Resource Usage**: CPU, memory, and disk usage monitoring

## Rollback Procedures

If a release needs to be rolled back:

1. **Immediate Rollback**: Use deployment platform to rollback
2. **Health Monitoring**: Monitor application health during rollback
3. **User Communication**: Notify users of rollback if needed
4. **Issue Investigation**: Investigate root cause of issues
5. **Hotfix Branch**: Create `release/X.Y.Z+1` for fixes
6. **Document Rollback**: Update CHANGELOG with rollback information

## Security Considerations

- **Private Repository**: Code is kept private and secure
- **Environment Tokens**: Deployment tokens properly secured
- **Access Control**: Role-based access to environments
- **Security Scanning**: Automated security vulnerability scanning
- **Dependency Auditing**: Regular dependency security audits

## Integration with Forge Ecosystem

This release pipeline integrates with:

- **@forgespace/core**: Shared patterns and configurations
- **@forgespace/ui-mcp**: MCP server integration
- **mcp-gateway**: Gateway services coordination
- **Docker Hub**: Container image management
- **GitHub**: Source control and CI/CD

## Workflow Files

- `release-automation.yml`: Detects release branch merges and triggers deployment
- `release-branch.yml`: Handles deployment to staging and production environments
- `branch-protection.yml`: Validates release branches and enforces PR requirements

## Monorepo Considerations

### Turborepo Integration
- **Build Orchestration**: Turborepo manages build dependencies
- **Caching**: Build caching for faster deployments
- **Task Management**: Coordinated task execution across packages
- **Dependency Management**: Efficient dependency resolution

### Package Management
- **Shared Packages**: Common functionality shared across applications
- **Version Coordination**: Coordinated versioning across packages
- **Build Optimization**: Optimized builds for monorepo structure
- **Testing Strategy**: Comprehensive testing across all packages

## Performance Optimization

### Build Optimization
- **Incremental Builds**: Only build changed packages
- **Build Caching**: Cache build artifacts for faster builds
- **Parallel Execution**: Parallel build and test execution
- **Resource Optimization**: Optimized resource usage during builds

### Deployment Optimization
- **Zero-Downtime**: Deployment without application downtime
- **Blue-Green Deployment**: Staging and production environment isolation
- **Health Validation**: Comprehensive health checks before traffic routing
- **Rollback Capability**: Fast rollback if issues detected

## Monitoring and Alerts

### Application Monitoring
- **Real-time Metrics**: Live application performance metrics
- **Error Tracking**: Comprehensive error tracking and alerting
- **User Analytics**: User behavior and performance analytics
- **System Health**: System resource and health monitoring

### Deployment Monitoring
- **Deployment Status**: Real-time deployment progress tracking
- **Rollback Alerts**: Immediate alerts for rollback scenarios
- **Performance Impact**: Performance impact monitoring during deployments
- **User Impact**: User experience monitoring during deployments