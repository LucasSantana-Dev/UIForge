# Siza Claude Subagents

This directory contains specialized Claude subagents for different areas of the Siza application. Each subagent is configured with specific expertise, tools, and best practices for their domain.

## Available Subagents

### 🎨 Frontend Developer
**File**: `frontend-developer.md`
- **Expertise**: React 19, Next.js 16, TypeScript, Tailwind CSS, shadcn/ui
- **Key Areas**: UI components, pages, hooks, state management
- **When to Use**: Creating/editing React components, styling, frontend features

### ⚙️ Backend API Developer  
**File**: `backend-api-developer.md`
- **Expertise**: Cloudflare Workers, MCP protocol, Gemini AI, Supabase
- **Key Areas**: API endpoints, MCP handlers, server-side logic
- **When to Use**: API development, MCP tools, backend services

### 🗄️ Database Schema Specialist
**File**: `database-schema-specialist.md`
- **Expertise**: PostgreSQL, Supabase, RLS policies, migrations
- **Key Areas**: Database design, schema changes, data architecture
- **When to Use**: Database modifications, migrations, data modeling

### 🧪 E2E Testing Specialist
**File**: `e2e-testing-specialist.md`
- **Expertise**: Playwright, test automation, CI/CD integration
- **Key Areas**: User flow testing, test debugging, test coverage
- **When to Use**: Writing E2E tests, debugging test failures

### 🔧 MCP Tools Developer
**File**: `mcp-tools-developer.md`
- **Expertise**: MCP SDK, tool development, protocol implementation
- **Key Areas**: MCP tool creation, schema design, protocol compliance
- **When to Use**: Adding MCP tools, protocol development

### 📝 Code Generation Templates
**File**: `code-generation-templates.md`
- **Expertise**: Multi-framework templates, scaffold generation
- **Key Areas**: React, Vue, Angular, Next.js templates
- **When to Use**: Template development, code generation patterns

### 🔒 Security & Performance Specialist
**File**: `security-performance-specialist.md`
- **Expertise**: Snyk integration, XSS prevention, Core Web Vitals
- **Key Areas**: Security scanning, performance optimization
- **When to Use**: Security audits, performance improvements

### 🚀 DevOps & Deployment Specialist
**File**: `devops-deployment-specialist.md`
- **Expertise**: GitHub Actions, Cloudflare deployment, CI/CD
- **Key Areas**: Deployment pipelines, environment management
- **When to Use**: CI/CD setup, deployment issues

## Usage Patterns

### Automatic Delegation
Claude automatically delegates to appropriate subagents based on:
- File locations being modified
- Task complexity and domain
- Tool requirements
- Context from previous interactions

### Manual Invocation
Explicitly invoke subagents:
```bash
/agent frontend-developer
Use the frontend developer to create a new dashboard component
```

### Subagent Collaboration
Multiple subagents can work together:
- **Frontend + Backend**: Full-stack feature development
- **Database + API**: Data layer implementation
- **Testing + Security**: Quality assurance workflows

## Subagent Configuration

Each subagent follows this structure:
```yaml
---
name: subagent-name
description: Expert description
tools: Read, Edit, Grep, Glob, Bash
model: inherit
---
# Detailed subagent instructions
```

### Tool Permissions
- **Read, Edit, Grep, Glob, Bash**: Full development access
- **Read, Grep, Glob, Bash**: Security-focused (no Edit permissions)
- **model: inherit**: Uses main conversation model

## Integration with Existing Skills

The subagents complement `.windsurf/skills/` files:
- `frontend-react-vite.md` → `frontend-developer`
- `backend-express.md` → `backend-api-developer`
- `e2e-playwright.md` → `e2e-testing-specialist`
- `mcp-docs-search.md` → `mcp-tools-developer`
- `code-generation-templates.md` → `code-generation-templates`

## Benefits

1. **Specialized Expertise**: Deep domain knowledge for each area
2. **Context Management**: Better focus on specific tasks
3. **Quality Assurance**: Built-in quality checklists and standards
4. **Efficiency**: Faster task completion with expert assistance
5. **Consistency**: Standardized patterns and practices
6. **Scalability**: Easy to add new specialized subagents

## Best Practices

### When Using Subagents
- Choose the right subagent for the task domain
- Provide clear context and requirements
- Follow the subagent's quality checklist
- Review and test the subagent's work

### For Subagent Development
- Keep expertise focused and specific
- Include comprehensive quality checklists
- Provide clear usage guidelines
- Maintain up-to-date documentation
- Test subagent effectiveness regularly

## Contributing

To add a new subagent:
1. Create a new `.md` file in this directory
2. Follow the standard configuration format
3. Include comprehensive expertise documentation
4. Add quality checklists and best practices
5. Update this README file

## Support

For issues or questions about subagents:
- Check individual subagent documentation
- Review the main Siza documentation in `CLAUDE.md`
- Consult the project's `.windsurf/skills/` files
- Refer to official Claude subagents documentation

These subagents are designed to enhance development workflows by providing specialized expertise for different aspects of the Siza application, ensuring high-quality, consistent, and efficient development across all domains.
