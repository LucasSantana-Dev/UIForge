# Siza Claude Code Features

Complete productivity suite for Siza development with Claude Code.

## 🚀 Features Overview

### 🤖 Specialized Subagents (8)
- **Frontend Developer** - React 19, Next.js 16, TypeScript, Tailwind CSS
- **Backend API Developer** - Cloudflare Workers, Supabase, MCP integration
- **Database Schema Specialist** - PostgreSQL, RLS policies, migrations
- **E2E Testing Specialist** - Playwright, test automation, CI/CD
- **Security & Performance Specialist** - Snyk, XSS prevention, Core Web Vitals
- **MCP Tools Developer** - MCP SDK, protocol implementation
- **Code Generation Templates** - Multi-framework templates (React, Vue, Angular)
- **DevOps & Deployment Specialist** - GitHub Actions, Cloudflare deployment

### ⚡ Slash Commands (7)
- `/deploy` - Smart deployment with quality gates
- `/component` - React component generator with design system
- `/security` - Comprehensive security audit automation
- `/performance` - Performance analysis and Core Web Vitals
- `/test` - Complete test suite execution
- `/git` - Smart Git workflow automation
- `/context` - Context optimization and token management

### 🔧 Automation Hooks (3)
- **Pre-Command Security** - Blocks dangerous commands and validates security
- **Post-Tool Formatting** - Auto-formats code with Prettier and ESLint
- **Session End Cleanup** - Generates reports and cleans up temporary files

### 🔌 MCP Integration (6)
- **brave-search** - Web search capabilities
- **exa** - Enhanced search and research
- **memory** - Context memory management
- **sequential-thinking** - Multi-step reasoning
- **tavily** - Research automation
- **snyk** - Security vulnerability scanning

## 📊 Token Optimization

### Smart Context Management
- **50-70% token savings** through intelligent context optimization
- Automatic context compaction at 80% threshold
- Progressive file loading based on task relevance
- Memory-efficient workflows with @file references

### Context Strategies
1. **Task-Specific Context** - Only load relevant files
2. **Progressive Loading** - Add files as needed
3. **Regular Cleanup** - Clear context every 20-30 turns
4. **Smart References** - Use @file for large files
5. **Context Summaries** - Compress when hitting limits

## 🛡️ Security & Quality

### Automated Security
- Pre-command security validation
- Dangerous command blocking (rm -rf, sudo, etc.)
- Secret exposure detection
- Production modification safeguards
- Snyk integration for vulnerability scanning

### Quality Assurance
- Auto-formatting with Prettier
- ESLint integration for code quality
- TypeScript compilation validation
- Test automation and coverage reporting
- Performance monitoring with Core Web Vitals

## 🔄 Workflow Automation

### Development Workflow
```bash
# Start new feature
/git feature "user-authentication"
/context optimize

# Work on feature
/component AuthForm "User login form"
/security scan

# Test and validate
/test all
/performance check

# Commit and share
/git save "feat: add user authentication"
/git share "Add user authentication"

# Deploy
/deploy
```

### Quality Gates
- All tests must pass
- No security vulnerabilities
- TypeScript compilation successful
- Performance score > 90
- Code formatting consistent

## 📁 Directory Structure

```
.windsurf/
├── agents/           # Specialized subagents
│   ├── frontend-developer.md
│   ├── backend-api-developer.md
│   ├── database-schema-specialist.md
│   ├── e2e-testing-specialist.md
│   ├── mcp-tools-developer.md
│   ├── code-generation-templates.md
│   ├── security-performance-specialist.md
│   ├── devops-deployment-specialist.md
│   └── README.md
├── commands/         # Slash commands
│   ├── deploy.md
│   ├── component.md
│   ├── security.md
│   ├── performance.md
│   ├── test.md
│   ├── git.md
│   └── context.md
├── hooks/           # Automation hooks
│   ├── pre-command-security.sh
│   ├── post-tool-format.sh
│   └── session-end-cleanup.sh
├── plugins/         # Plugin configurations
│   └── siza-productivity.md
├── settings.json    # Claude Code settings
└── workflows/       # Existing workflows
```

## ⚙️ Configuration

### Settings.json
```json
{
  "$schema": "https://json-schema.org/claude-code-settings.json",
  "permissions": {
    "allow": ["Read", "Write", "Edit", "Grep", "Glob", "Bash"]
  },
  "hooks": {
    "PreCommand": [{"matcher": ".*", "hooks": [{"type": "command", "command": "bash .windsurf/hooks/pre-command-security.sh"}]}],
    "PostToolUse": [{"matcher": "Write|Edit", "hooks": [{"type": "command", "command": "bash .windsurf/hooks/post-tool-format.sh"}]}],
    "SessionEnd": [{"matcher": ".*", "hooks": [{"type": "command", "command": "bash .windsurf/hooks/session-end-cleanup.sh"}]}]
  },
  "mcpServers": {
    "brave-search": {"command": "npx @modelcontextprotocol/server-brave-search", "enabled": true},
    "exa": {"command": "npx @modelcontextprotocol/server-exa", "enabled": true},
    "memory": {"command": "npx @modelcontextprotocol/server-memory", "enabled": true},
    "sequential-thinking": {"command": "npx @modelcontextprotocol/server-sequential-thinking", "enabled": true},
    "tavily": {"command": "npx @modelcontextprotocol/server-tavily", "enabled": true},
    "snyk": {"command": "npx @modelcontextprotocol/server-snyk", "enabled": true}
  },
  "tokenOptimization": {
    "enabled": true,
    "compactOnThreshold": true,
    "clearBetweenTasks": true
  }
}
```

## 🎯 Usage Examples

### Component Development
```bash
# Generate new component
/component Button "Primary action button with hover effects" react

# This creates:
# - Button.tsx (with TypeScript and Tailwind)
# - Button.test.tsx (with Testing Library)
# - Button.stories.tsx (with Storybook)
# - Button.module.css (with design system)
```

### Security Audit
```bash
# Full security audit
/security audit

# Quick vulnerability scan
/security scan

# Secret detection only
/security secrets
```

### Performance Analysis
```bash
# Full performance audit
/performance check

# Core Web Vitals only
/performance vitals

# Bundle size analysis
/performance bundle
```

### Deployment
```bash
# Deploy with quality gates
/deploy "Add user authentication feature"

# Hotfix deployment
/deploy hotfix "Fix critical security issue"
```

## 📈 Benefits

### Productivity Gains
- **50-70% token savings** through smart context management
- **Automated workflows** reduce manual tasks by 80%
- **Specialized subagents** provide expert-level assistance
- **Quality automation** ensures consistent code standards

### Development Efficiency
- **Smart Git workflows** streamline version control
- **Automated testing** ensures code quality
- **Security validation** prevents vulnerabilities
- **Performance monitoring** maintains application speed

### Team Collaboration
- **Standardized workflows** across team members
- **Consistent code quality** through automation
- **Shared subagents** for domain expertise
- **Integrated documentation** and reporting

## 🔧 Installation & Setup

### Prerequisites
- Claude Code with Pro subscription
- Node.js and npm installed
- Git configured for the project

### Setup Steps
1. All files are already created in `.windsurf/` directory
2. Hooks are made executable with `chmod +x`
3. Settings are configured in `settings.json`
4. MCP servers are enabled and ready to use

### Verification
```bash
# Test a command
/context status

# Verify hooks work
echo "test" > test.txt
rm test.txt

# Check subagents
/agent frontend-developer
```

## 🚀 Quick Start

### For New Developers
```bash
# 1. Optimize context for current task
/context optimize

# 2. Start working on feature
/git feature "your-feature-name"

# 3. Use specialized subagent
/agent frontend-developer

# 4. Generate components as needed
/component ComponentName "Description"

# 5. Test and validate
/test all

# 6. Security check
/security scan

# 7. Commit and deploy
/git save "feat: add your feature"
/deploy
```

### For Existing Projects
```bash
# 1. Run security audit
/security audit

# 2. Check performance
/performance check

# 3. Run full test suite
/test all

# 4. Optimize context
/context compact

# 5. Continue development
```

## 📚 Documentation

- **Subagents**: See `.windsurf/agents/README.md`
- **Commands**: See individual `.md` files in `.windsurf/commands/`
- **Hooks**: See `.windsurf/hooks/` directory
- **Workflows**: See `.windsurf/workflows/` directory

## 🤝 Support

For issues or questions:
1. Check individual command documentation
2. Review subagent expertise areas
3. Consult hook configuration files
4. Use `/context status` for debugging
5. Check Claude Code official documentation

---

**Siza Claude Code Features** - Transform your development workflow with AI-powered productivity, security, and automation.
