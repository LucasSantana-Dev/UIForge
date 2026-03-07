import Link from 'next/link';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from './layout.config';
import {
  Shield,
  Zap,
  Layers,
  BarChart3,
  FileCode,
  Workflow,
  Terminal,
  GitBranch,
} from 'lucide-react';

const features = [
  {
    title: 'AI Code Generation',
    description:
      'Generate production-ready components with natural language. Quality-scored at generation time.',
    href: '/docs',
    Icon: Zap,
  },
  {
    title: 'Governance Scorecards',
    description:
      'Automatic A-F quality grading across security, accessibility, lint, and type-safety gates.',
    href: '/docs/guides/scorecard-integration',
    Icon: BarChart3,
  },
  {
    title: 'Policy Engine',
    description:
      'Built-in policy packs for security, quality, and compliance. Block violations before they ship.',
    href: '/docs/guides/policy-packs',
    Icon: Shield,
  },
  {
    title: 'Golden Path Templates',
    description:
      'Backstage-inspired project scaffolds with CI, testing, linting, and governance baked in.',
    href: '/docs/guides/golden-path-templates',
    Icon: FileCode,
  },
  {
    title: 'Service Catalog',
    description:
      'Track every service, library, and API across your organization with lifecycle management.',
    href: '/docs/guides/service-catalog',
    Icon: Layers,
  },
  {
    title: 'MCP-Native Architecture',
    description:
      'Gateway-central hub connecting AI providers via Model Context Protocol with full audit trails.',
    href: '/docs/guides/mcp-integration',
    Icon: Workflow,
  },
];

const techStack = {
  Platform: ['Next.js 16', 'React 19', 'Supabase', 'Cloudflare Workers'],
  Governance: ['Policy Engine', 'Scorecards', 'Audit Trail', 'Feature Flags'],
  AI: ['MCP Protocol', 'Claude', 'Gemini', 'Ollama', 'BYOK'],
  Tooling: ['forge-scorecard', 'forge-policy', 'forge-init', 'forge-features'],
};

const ecosystem = [
  { name: 'forge-patterns', desc: 'Shared standards & CLI tools', repo: 'Forge-Space/core' },
  { name: 'mcp-gateway', desc: 'Central auth, routing & audit', repo: 'Forge-Space/mcp-gateway' },
  { name: 'siza', desc: 'Developer portal & webapp', repo: 'Forge-Space/siza', active: true },
  { name: 'siza-mcp', desc: 'MCP tool server', repo: 'Forge-Space/ui-mcp' },
  { name: 'siza-gen', desc: 'Generation engine', repo: 'Forge-Space/siza-gen' },
  { name: 'branding-mcp', desc: 'Brand identity tools', repo: 'Forge-Space/branding-mcp' },
  { name: 'brand-guide', desc: 'Design tokens & assets', repo: 'Forge-Space/brand-guide' },
  { name: 'forgespace-web', desc: 'Marketing site', repo: 'Forge-Space/forgespace-web' },
  { name: 'siza-desktop', desc: 'Electron desktop app', repo: 'Forge-Space/siza-desktop' },
];

export default function HomePage() {
  return (
    <HomeLayout {...baseOptions}>
      <main className="docs-hero">
        <div className="docs-hero-content">
          <h1 className="docs-hero-title">Prompt to Prod</h1>
          <p className="docs-hero-subtitle">
            The accessible Internal Developer Platform that prevents AI limbo engineering. Generate
            governed code, enforce quality gates, and ship with confidence.
          </p>
          <div className="docs-cta-group">
            <Link href="/docs" className="docs-cta">
              Get Started <span aria-hidden="true">&rarr;</span>
            </Link>
            <Link
              href="/docs/guides/scorecard-integration"
              className="docs-cta docs-cta--secondary"
            >
              <Shield size={16} />
              Governance Guide
            </Link>
          </div>
        </div>

        <div className="docs-terminal">
          <div className="docs-terminal-header">
            <span className="docs-terminal-dot" />
            <span className="docs-terminal-dot" />
            <span className="docs-terminal-dot" />
          </div>
          <div className="docs-terminal-body">
            <div>
              <span className="docs-terminal-prompt">$ </span>
              <span className="docs-terminal-command">npx forge-init my-service</span>
            </div>
            <div className="docs-terminal-output">Scaffolding from golden path template...</div>
            <div className="docs-terminal-output">
              Policy pack: forge-defaults (security + quality)
            </div>
            <div>
              <span className="docs-terminal-prompt">$ </span>
              <span className="docs-terminal-command">npx forge-scorecard</span>
            </div>
            <div className="docs-terminal-output">
              Overall score: <span className="docs-terminal-success">A (96/100)</span>
            </div>
            <div className="docs-terminal-output docs-terminal-success">
              All governance gates passed
            </div>
          </div>
        </div>

        <section className="docs-section">
          <h2 className="docs-section-title">IDP for the rest of us</h2>
          <p className="docs-section-desc">
            Like Backstage and Fury, but accessible. Zero-cost-first, gateway-central governance,
            and MCP-native extensibility.
          </p>
          <div className="docs-card-grid">
            {features.map((f) => (
              <Link key={f.title} href={f.href} className="docs-card">
                <span className="docs-card-icon">
                  <f.Icon size={20} />
                </span>
                <h3 className="docs-card-title">{f.title}</h3>
                <p className="docs-card-desc">{f.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="docs-section">
          <h2 className="docs-section-title">Generate with Governance</h2>
          <p className="docs-section-desc">
            Every generated artifact is scored, validated, and audit-logged automatically.
          </p>
          <div className="docs-code-example">
            <div className="docs-code-header">
              <Terminal size={14} />
              <span>forge-scorecard output</span>
            </div>
            <div className="docs-code-body">
              <span className="docs-code-line">
                <span className="docs-code-fn">Forge Scorecard</span>
                {' \u2014 my-service'}
              </span>
              <span className="docs-code-line">&nbsp;</span>
              <span className="docs-code-line">
                {'  '}
                <span className="docs-code-string">\u25a0 Security</span>
                {'     98/100  (zero secrets, deps scanned)'}
              </span>
              <span className="docs-code-line">
                {'  '}
                <span className="docs-code-string">\u25a0 Quality</span>
                {'      95/100  (lint clean, tests passing)'}
              </span>
              <span className="docs-code-line">
                {'  '}
                <span className="docs-code-string">\u25a0 Compliance</span>
                {'   100/100  (structured logs, runbook)'}
              </span>
              <span className="docs-code-line">
                {'  '}
                <span className="docs-code-string">\u25a0 Dependencies</span>
                {' 92/100  (2 outdated, 0 vulns)'}
              </span>
              <span className="docs-code-line">&nbsp;</span>
              <span className="docs-code-line">
                {'  Overall: '}
                <span className="docs-code-keyword">A (96/100)</span>
              </span>
            </div>
          </div>
        </section>

        <section className="docs-section">
          <h2 className="docs-section-title">The Forge Ecosystem</h2>
          <p className="docs-section-desc">
            Nine open-source repositories powering governance-first development.
          </p>
          <div className="docs-card-grid">
            {ecosystem.map((repo) => (
              <a
                key={repo.name}
                href={`https://github.com/${repo.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`docs-card ${repo.active ? 'docs-ecosystem-node--active' : ''}`}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.25rem',
                  }}
                >
                  <GitBranch size={14} />
                  <span className="docs-card-title" style={{ marginBottom: 0 }}>
                    {repo.name}
                  </span>
                </div>
                <p className="docs-card-desc">{repo.desc}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="docs-section">
          <h2 className="docs-section-title">Built With</h2>
          <p className="docs-section-desc">
            Modern stack for governed, AI-powered development at any scale.
          </p>
          <div className="docs-tech-categories">
            {Object.entries(techStack).map(([category, items]) => (
              <div key={category} className="docs-tech-category">
                <span className="docs-tech-category-label">{category}</span>
                <div className="docs-tech-grid">
                  {items.map((tech) => (
                    <span key={tech} className="docs-tech-pill">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="docs-footer-cta">
          <h2 className="docs-footer-cta-title">Ready to govern your AI output?</h2>
          <p className="docs-footer-cta-desc">
            Set up governance in minutes. No vendor lock-in, no enterprise gatekeeping.
          </p>
          <div className="docs-cta-group" style={{ justifyContent: 'center' }}>
            <Link href="/docs" className="docs-cta">
              Get Started <span aria-hidden="true">&rarr;</span>
            </Link>
            <a
              href="https://github.com/Forge-Space"
              className="docs-cta docs-cta--secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitBranch size={16} />
              View on GitHub
            </a>
          </div>
        </div>

        <footer className="docs-footer">
          <div className="docs-footer-links">
            <a href="https://github.com/Forge-Space" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href="https://siza.forgespace.co" target="_blank" rel="noopener noreferrer">
              Platform
            </a>
            <a href="https://forgespace.co" target="_blank" rel="noopener noreferrer">
              Website
            </a>
            <Link href="/docs">Docs</Link>
          </div>
          <span>Forge Space \u2014 Prompt-to-prod with conscience</span>
        </footer>
      </main>
    </HomeLayout>
  );
}
