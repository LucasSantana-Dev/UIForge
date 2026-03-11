# Scripts Directory

## 🚨 Security Notice

**All deployment and setup scripts have been moved to GitHub Actions workflows for better security and access control.**

### Why This Change Was Made

- **Security**: Scripts in this directory could be executed by anyone with repository access
- **Access Control**: GitHub Actions workflows can be restricted to specific users (admins only)
- **Audit Trail**: Workflow runs are logged and tracked in GitHub
- **Environment Safety**: Sensitive operations are now protected by GitHub's security features

## 🔄 New Deployment Approach

### GitHub Actions Workflows (Admin Only)

#### 1. **Deploy Web App** - `.github/workflows/deploy-web-admin.yml`
- **Purpose**: Deploy web app to Cloudflare Pages
- **Access**: Admin only
- **Environments**: Preview, Production
- **Manual Trigger**: Yes, via GitHub Actions UI

#### 2. **Supabase Setup** - `.github/workflows/supabase-setup-admin.yml`
- **Purpose**: Supabase project setup and maintenance
- **Access**: Admin only
- **Actions**: Setup, Link, Generate Types, Migrate
- **Manual Trigger**: Yes, via GitHub Actions UI

#### 3. **Deploy Application** - `.github/workflows/deploy-admin.yml`
- **Purpose**: Full application deployment
- **Access**: Admin only
- **Environments**: Dev, Production
- **Manual Trigger**: Yes, via GitHub Actions UI

## 🚀 How to Use the New Workflows

### Step 1: Go to GitHub Actions
1. Navigate to your repository on GitHub
2. Click on "Actions" tab
3. Select the appropriate workflow

### Step 2: Run Workflow
1. Click "Run workflow" button
2. Select the desired parameters:
   - Environment (dev/production/preview)
   - Force deploy (if needed)
   - Skip tests (emergency only)
3. Click "Run workflow"

### Step 3: Monitor Deployment
1. Watch the workflow progress in real-time
2. Check the deployment summary
3. Verify the application is working

## 🔐 Security Benefits

### Before (Insecure)
- ❌ Scripts could be run by anyone
- ❌ No access control
- ❌ No audit trail
- ❌ Sensitive operations exposed

### After (Secure)
- ✅ Only admins can run deployments
- ✅ Full audit trail in GitHub
- ✅ Environment protection
- ✅ Workflow-based security

## 📋 Required Secrets

To use these workflows, add these secrets to your GitHub repository:

### Cloudflare Deployment
- `CLOUDFLARE_API_TOKEN`: Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID

### Supabase Setup
- `SUPABASE_ACCESS_TOKEN`: Supabase access token
- `SUPABASE_DB_PASSWORD`: Database password (for migrations)

## 🛠️ Development vs Production

### Development
- Use **Deploy Application** workflow with `environment: dev`
- Tests and checks run automatically
- Deployed to `dev.siza.com`

### Production
- Use **Deploy Application** workflow with `environment: production`
- Requires release branch merge to main
- Deployed to `siza.com`
- Additional security checks included

## 🆘 Emergency Procedures

### Force Deploy (Bypass Checks)
1. Use the "Force deploy" option in workflow
2. This bypasses tests and some security checks
3. Only for emergency situations
4. Requires admin approval

### Skip Tests (Emergency Only)
1. Use the "Skip tests" option in workflow
2. Tests are skipped for faster deployment
3. Only for critical emergency fixes
4. Requires admin approval

## 📚 Documentation

For detailed setup instructions:
- See `docs/SUPABASE_CLOUD_SETUP.md`
- See `docs/DEPLOYMENT.md`
- Check individual workflow files for more details

## 🤝 Support

If you need help with the new deployment process:
1. Check the workflow logs in GitHub Actions
2. Review the deployment summary
3. Contact the admin team for access issues

## Local Utility

For local or staging setup where you need to promote a user:

```bash
npm run admin:grant -- <email>
```

This command runs `scripts/grant-admin-by-email.ts` and updates `public.profiles.role` to `admin`.

For Codex Playwright MCP transport compatibility:

```bash
npm run mcp:playwright:wrapper -- --help
```

Use this command path when wiring the `playwright` MCP server in Codex:
`node /absolute/path/to/siza/scripts/playwright-mcp-wrapper.mjs --headless`.

---

**Note**: This change improves security while maintaining all deployment functionality. The new approach is safer and more auditable.
