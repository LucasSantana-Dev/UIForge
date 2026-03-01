'use client';

import { useState, type ReactNode } from 'react';

interface RepoNode {
  id: string;
  name: string;
  desc: string;
  icon: ReactNode;
  badges: string[];
  accent: string;
  github: string;
  deps: string[];
}

const repos: RepoNode[] = [
  {
    id: 'forge-patterns',
    name: 'forge-patterns',
    desc: 'Shared configs, TypeScript types, security framework',
    icon: <IconCube />,
    badges: ['TypeScript', 'ESLint', 'Security'],
    accent: '#60a5fa',
    github: 'https://github.com/Forge-Space/core',
    deps: [],
  },
  {
    id: 'mcp-gateway',
    name: 'mcp-gateway',
    desc: 'AI routing, scoring, multi-provider gateway',
    icon: <IconRoute />,
    badges: ['Python', 'FastAPI', 'Redis'],
    accent: '#a78bfa',
    github: 'https://github.com/Forge-Space/mcp-gateway',
    deps: ['forge-patterns'],
  },
  {
    id: 'siza-gen',
    name: 'siza-gen',
    desc: 'AI generation core — ML, snippets, quality scoring',
    icon: <IconBrain />,
    badges: ['TypeScript', 'ML', 'npm'],
    accent: '#f59e0b',
    github: 'https://github.com/Forge-Space/siza-gen',
    deps: ['forge-patterns'],
  },
  {
    id: 'branding-mcp',
    name: 'branding-mcp',
    desc: 'Brand identity generation — logos, palettes, tokens',
    icon: <IconPalette />,
    badges: ['TypeScript', 'MCP', 'Design'],
    accent: '#fb923c',
    github: 'https://github.com/Forge-Space/branding-mcp',
    deps: ['forge-patterns'],
  },
  {
    id: 'siza-mcp',
    name: 'siza-mcp',
    desc: 'MCP protocol adapter — 17 tools for IDEs',
    icon: <IconPlug />,
    badges: ['TypeScript', 'MCP', 'SQLite'],
    accent: '#34d399',
    github: 'https://github.com/Forge-Space/ui-mcp',
    deps: ['forge-patterns', 'siza-gen'],
  },
  {
    id: 'siza',
    name: 'siza',
    desc: 'Web app, desktop, docs — the main platform',
    icon: <IconApp />,
    badges: ['Next.js', 'Electron', 'Supabase'],
    accent: '#f59e0b',
    github: 'https://github.com/Forge-Space/siza',
    deps: ['forge-patterns', 'mcp-gateway', 'siza-mcp'],
  },
];

const tiers = [
  { label: 'Foundation', ids: ['forge-patterns'] },
  { label: 'Services', ids: ['mcp-gateway', 'siza-gen', 'branding-mcp'] },
  { label: 'Integration', ids: ['siza-mcp', 'siza'] },
];

export function ArchitectureDiagram() {
  const [active, setActive] = useState<string | null>(null);

  const getRepo = (id: string) => repos.find((r) => r.id === id)!;

  const isRelated = (id: string) => {
    if (!active) return false;
    const activeRepo = getRepo(active);
    return (
      activeRepo.deps.includes(id) ||
      getRepo(id).deps.includes(active)
    );
  };

  const isDimmed = (id: string) => {
    if (!active) return false;
    return id !== active && !isRelated(id);
  };

  return (
    <div className="arch-diagram">
      {tiers.map((tier) => (
        <div key={tier.label} className="arch-tier">
          <div className="arch-tier-label">{tier.label}</div>
          <div
            className="arch-tier-row"
            data-cols={tier.ids.length}
          >
            {tier.ids.map((id) => {
              const repo = getRepo(id);
              return (
                <a
                  key={id}
                  className="arch-card"
                  style={
                    { '--card-accent': repo.accent } as React.CSSProperties
                  }
                  data-active={active === id}
                  data-dimmed={isDimmed(id)}
                  href={repo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setActive(id)}
                  onMouseLeave={() => setActive(null)}
                >
                  <div className="arch-card-header">
                    <div className="arch-card-icon">{repo.icon}</div>
                    <span className="arch-card-name">{repo.name}</span>
                  </div>
                  <div className="arch-card-desc">{repo.desc}</div>
                  <div className="arch-card-badges">
                    {repo.badges.map((b) => (
                      <span key={b} className="arch-badge">
                        {b}
                      </span>
                    ))}
                  </div>
                </a>
              );
            })}
          </div>
          {tier.label !== 'Integration' && (
            <div className="arch-connector">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

interface DataFlowProps {
  label: string;
  children: ReactNode;
}

export function DataFlow({ label, children }: DataFlowProps) {
  return (
    <div className="flow-diagram">
      <div className="flow-label">{label}</div>
      <div className="flow-track">{children}</div>
    </div>
  );
}

interface FlowStepProps {
  type?: 'start' | 'end' | 'default';
  children: ReactNode;
}

export function FlowStep({ type = 'default', children }: FlowStepProps) {
  return (
    <div className="flow-node" data-type={type}>
      {children}
    </div>
  );
}

export function FlowArrow() {
  return (
    <span className="flow-arrow">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </span>
  );
}

function IconCube() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function IconRoute() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
      <circle cx="18" cy="5" r="3" />
    </svg>
  );
}

function IconBrain() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  );
}

function IconPalette() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2Z" />
    </svg>
  );
}

function IconPlug() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22v-5" />
      <path d="M9 8V2" />
      <path d="M15 8V2" />
      <path d="M18 8v5a6 6 0 0 1-6 6v0a6 6 0 0 1-6-6V8Z" />
    </svg>
  );
}

function IconApp() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}
