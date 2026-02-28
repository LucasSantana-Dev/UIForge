import Link from 'next/link';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from './layout.config';
import { Rocket, Zap, Cloud, Layers } from 'lucide-react';

const features = [
  { title: 'AI-Powered Generation', description: 'Generate production-ready React components, pages, and full applications with natural language.', href: '/docs', Icon: Rocket },
  { title: 'MCP Protocol', description: 'Connect any AI model via the Model Context Protocol. Works with Claude, Gemini, and more.', href: '/docs/guides/mcp-integration', Icon: Zap },
  { title: 'Deploy Anywhere', description: 'Self-host on Cloudflare Workers, run locally with the desktop app, or use the hosted platform.', href: '/docs/getting-started/self-hosting', Icon: Cloud },
  { title: 'Full Ecosystem', description: 'Six integrated repos covering generation, routing, branding, and shared standards.', href: '/docs/ecosystem/architecture', Icon: Layers },
];

const techStack = {
  Frontend: ['React 19', 'Next.js 16', 'shadcn/ui', 'Radix UI'],
  Backend: ['Supabase', 'Cloudflare Workers', 'Stripe'],
  AI: ['MCP', 'Claude API', 'Gemini', 'Ollama'],
};

const ecosystem = [
  { name: 'forge-patterns', desc: 'Shared configs', repo: 'Forge-Space/core', position: 'left-top' },
  { name: 'siza-gen', desc: 'Generation core', repo: 'Forge-Space/siza-gen', position: 'left-bottom' },
  { name: 'siza', desc: 'AI workspace', repo: 'Forge-Space/siza', position: 'center', active: true },
  { name: 'siza-mcp', desc: 'MCP adapter', repo: 'Forge-Space/ui-mcp', position: 'right-top' },
  { name: 'mcp-gateway', desc: 'AI routing', repo: 'Forge-Space/mcp-gateway', position: 'right-mid' },
  { name: 'branding-mcp', desc: 'Brand identity', repo: 'Forge-Space/branding-mcp', position: 'right-bottom' },
];

export default function HomePage() {
  return (
    <HomeLayout {...baseOptions}>
      <main className="docs-hero">
        <div className="docs-hero-content">
          <h1 className="docs-hero-title">Build with Siza</h1>
          <p className="docs-hero-subtitle">
            The open full-stack AI workspace. Generate production-ready UI,
            connect any model via MCP, and ship to any platform.
          </p>
          <div className="docs-cta-group">
            <Link href="/docs" className="docs-cta">
              Get Started <span aria-hidden="true">&rarr;</span>
            </Link>
            <a href="https://github.com/Forge-Space" className="docs-cta docs-cta--secondary" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </div>

        <div className="docs-terminal">
          <div className="docs-terminal-header">
            <span className="docs-terminal-dot" />
            <span className="docs-terminal-dot" />
            <span className="docs-terminal-dot" />
          </div>
          <div className="docs-terminal-body">
            <div><span className="docs-terminal-prompt">$ </span><span className="docs-terminal-command">npx siza generate</span></div>
            <div className="docs-terminal-output">Generating pricing card component...</div>
            <div className="docs-terminal-output">Framework: React + Tailwind CSS</div>
            <div className="docs-terminal-output">Quality score: <span className="docs-terminal-success">94/100</span></div>
            <div className="docs-terminal-output docs-terminal-success">Done in 3.2s</div>
          </div>
        </div>

        <section className="docs-section">
          <h2 className="docs-section-title">Why Siza?</h2>
          <p className="docs-section-desc">Everything you need to go from idea to production-ready UI.</p>
          <div className="docs-card-grid">
            {features.map((f) => (
              <Link key={f.title} href={f.href} className="docs-card">
                <span className="docs-card-icon"><f.Icon size={20} /></span>
                <h3 className="docs-card-title">{f.title}</h3>
                <p className="docs-card-desc">{f.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="docs-section">
          <h2 className="docs-section-title">Simple, Powerful API</h2>
          <p className="docs-section-desc">Use MCP tools directly from your IDE or call the REST API.</p>
          <div className="docs-code-example">
            <div className="docs-code-header"><span>mcp-tool-call.json</span></div>
            <div className="docs-code-body">
              <span className="docs-code-line">{'{'}</span>
              <span className="docs-code-line">{'  '}<span className="docs-code-keyword">&quot;tool&quot;</span>{': '}<span className="docs-code-string">&quot;generate_ui_component&quot;</span>{','}</span>
              <span className="docs-code-line">{'  '}<span className="docs-code-keyword">&quot;input&quot;</span>{': {'}</span>
              <span className="docs-code-line">{'    '}<span className="docs-code-prop">&quot;description&quot;</span>{': '}<span className="docs-code-string">&quot;A pricing card with toggle&quot;</span>{','}</span>
              <span className="docs-code-line">{'    '}<span className="docs-code-prop">&quot;framework&quot;</span>{': '}<span className="docs-code-string">&quot;react-tailwind&quot;</span>{','}</span>
              <span className="docs-code-line">{'    '}<span className="docs-code-prop">&quot;mood&quot;</span>{': '}<span className="docs-code-string">&quot;professional&quot;</span></span>
              <span className="docs-code-line">{'  }'}</span>
              <span className="docs-code-line">{'}'}</span>
            </div>
          </div>
        </section>

        <section className="docs-section">
          <h2 className="docs-section-title">The Forge Ecosystem</h2>
          <p className="docs-section-desc">Six repositories working together to power AI-driven development.</p>
          <div className="docs-ecosystem-hub">
            {ecosystem.map((repo) => (
              <a
                key={repo.name}
                href={`https://github.com/${repo.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`docs-ecosystem-node ${repo.active ? 'docs-ecosystem-node--active' : ''}`}
                style={
                  repo.position === 'center' ? { gridColumn: '2', gridRow: '2' }
                    : repo.position === 'left-top' ? { gridColumn: '1', gridRow: '1' }
                    : repo.position === 'left-bottom' ? { gridColumn: '1', gridRow: '3' }
                    : repo.position === 'right-top' ? { gridColumn: '3', gridRow: '1' }
                    : repo.position === 'right-mid' ? { gridColumn: '3', gridRow: '2' }
                    : { gridColumn: '3', gridRow: '3' }
                }
              >
                <strong>{repo.name}</strong>
                <span>{repo.desc}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="docs-section">
          <h2 className="docs-section-title">Built With</h2>
          <p className="docs-section-desc">Modern stack for fast, reliable, AI-powered development.</p>
          <div className="docs-tech-categories">
            {Object.entries(techStack).map(([category, items]) => (
              <div key={category} className="docs-tech-category">
                <span className="docs-tech-category-label">{category}</span>
                <div className="docs-tech-grid">
                  {items.map((tech) => (
                    <span key={tech} className="docs-tech-pill">{tech}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="docs-footer-cta">
          <h2 className="docs-footer-cta-title">Ready to build?</h2>
          <p className="docs-footer-cta-desc">Start generating production-ready components in minutes.</p>
          <Link href="/docs" className="docs-cta">Get Started <span aria-hidden="true">&rarr;</span></Link>
        </div>

        <footer className="docs-footer">
          <div className="docs-footer-links">
            <a href="https://github.com/Forge-Space" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://siza.dev" target="_blank" rel="noopener noreferrer">Platform</a>
            <Link href="/docs">Docs</Link>
          </div>
          <span>Siza by Forge Space</span>
        </footer>
      </main>
    </HomeLayout>
  );
}
