import Link from 'next/link';

const quickLinks = [
  {
    title: 'Quick Start',
    description: 'Set up Siza and generate your first component in minutes.',
    href: '/docs',
    icon: '→',
  },
  {
    title: 'MCP Integration',
    description: 'Connect AI models via the Model Context Protocol.',
    href: '/docs/guides/mcp-integration',
    icon: '⚡',
  },
  {
    title: 'Self-Hosting',
    description: 'Deploy your own Siza instance with Cloudflare Workers.',
    href: '/docs/deployment/self-hosting',
    icon: '☁',
  },
  {
    title: 'Architecture',
    description: 'Understand how forge-patterns, mcp-gateway, and siza connect.',
    href: '/docs/ecosystem/architecture',
    icon: '◈',
  },
];

const techStack = [
  'React 19',
  'Next.js 16',
  'Tailwind CSS',
  'shadcn/ui',
  'Radix UI',
  'Supabase',
  'Cloudflare Workers',
  'Stripe',
  'MCP',
  'Claude API',
  'Gemini',
];

const ecosystem = [
  { name: 'forge-patterns', desc: 'Shared configs & standards', active: false },
  { name: 'mcp-gateway', desc: 'AI routing & orchestration', active: false },
  { name: 'siza', desc: 'Full-stack AI workspace', active: true },
];

export default function HomePage() {
  return (
    <main className="docs-hero">
      <div className="docs-hero-content">
        <h1 className="docs-hero-title">Siza Documentation</h1>
        <p className="docs-hero-subtitle">
          The open full-stack AI workspace — generate production-ready UI with AI. Guides, API
          references, and examples to get you started.
        </p>
        <Link href="/docs" className="docs-cta">
          Get Started
        </Link>
      </div>

      <section className="docs-section">
        <h2 className="docs-section-title">Quick Links</h2>
        <div className="docs-card-grid">
          {quickLinks.map((link) => (
            <Link key={link.title} href={link.href} className="docs-card">
              <span className="docs-card-icon">{link.icon}</span>
              <h3 className="docs-card-title">{link.title}</h3>
              <p className="docs-card-desc">{link.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Tech Stack</h2>
        <div className="docs-tech-grid">
          {techStack.map((tech) => (
            <span key={tech} className="docs-tech-pill">
              {tech}
            </span>
          ))}
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Ecosystem</h2>
        <div className="docs-ecosystem">
          {ecosystem.map((repo, i) => (
            <div key={repo.name}>
              <div
                className={`docs-ecosystem-repo ${repo.active ? 'docs-ecosystem-repo--active' : ''}`}
              >
                <strong>{repo.name}</strong>
                <span>{repo.desc}</span>
              </div>
              {i < ecosystem.length - 1 && <span className="docs-ecosystem-arrow">→</span>}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
