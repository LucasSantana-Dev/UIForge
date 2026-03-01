'use client';

import type { ReactNode } from 'react';

export function ContribHero() {
  return (
    <div className="contrib-hero">
      <div className="contrib-hero-badge">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        Open Source
      </div>
      <h1 className="contrib-hero-title">Build the future of AI&#8209;powered&nbsp;UI</h1>
      <p className="contrib-hero-desc">
        Siza is open-source and community-driven. Whether you fix a typo or architect a new
        generator, every contribution moves the ecosystem forward.
      </p>
      <div className="contrib-stats">
        <div className="contrib-stat">
          <span className="contrib-stat-value">7</span>
          <span className="contrib-stat-label">Repositories</span>
        </div>
        <div className="contrib-stat">
          <span className="contrib-stat-value">3,400+</span>
          <span className="contrib-stat-label">Tests passing</span>
        </div>
        <div className="contrib-stat">
          <span className="contrib-stat-value">21</span>
          <span className="contrib-stat-label">MCP Tools</span>
        </div>
        <div className="contrib-stat">
          <span className="contrib-stat-value">500+</span>
          <span className="contrib-stat-label">UI Snippets</span>
        </div>
      </div>
    </div>
  );
}

interface ContribTypeProps {
  icon: ReactNode;
  name: string;
  desc: string;
  tag: string;
  accent?: string;
}

export function ContribType({ icon, name, desc, tag, accent = '#f59e0b' }: ContribTypeProps) {
  return (
    <div className="contrib-type-card" style={{ '--card-accent': accent } as React.CSSProperties}>
      <div className="contrib-type-icon">{icon}</div>
      <div className="contrib-type-name">{name}</div>
      <div className="contrib-type-desc">{desc}</div>
      <div className="contrib-type-tag">{tag}</div>
    </div>
  );
}

export function ContribTypes({ children }: { children: ReactNode }) {
  return <div className="contrib-types">{children}</div>;
}

interface ContribStepProps {
  number: number;
  title: string;
  desc: string;
}

export function ContribStep({ number, title, desc }: ContribStepProps) {
  return (
    <div className="contrib-step">
      <div className="contrib-step-number">{number}</div>
      <div className="contrib-step-content">
        <div className="contrib-step-title">{title}</div>
        <div className="contrib-step-desc">{desc}</div>
      </div>
    </div>
  );
}

export function ContribSteps({ children }: { children: ReactNode }) {
  return <div className="contrib-steps">{children}</div>;
}

interface ContribRepoProps {
  name: string;
  desc: string;
  lang: string;
  langColor?: string;
  tags: string[];
  url: string;
}

export function ContribRepo({
  name,
  desc,
  lang,
  langColor = '#f59e0b',
  tags,
  url,
}: ContribRepoProps) {
  return (
    <a
      className="contrib-repo"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ '--card-accent': langColor } as React.CSSProperties}
    >
      <div className="contrib-repo-header">
        <span className="contrib-repo-name">{name}</span>
        <span className="contrib-repo-lang">{lang}</span>
      </div>
      <div className="contrib-repo-desc">{desc}</div>
      <div className="contrib-repo-tags">
        {tags.map((t) => (
          <span key={t} className="contrib-repo-tag">
            {t}
          </span>
        ))}
      </div>
    </a>
  );
}

export function ContribRepos({ children }: { children: ReactNode }) {
  return <div className="contrib-repos">{children}</div>;
}

export function IconCode() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

export function IconBug() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 2 1.88 1.88" />
      <path d="M14.12 3.88 16 2" />
      <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
      <path d="M12 20v-9" />
      <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
      <path d="M6 13H2" />
      <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
      <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
      <path d="M22 13h-4" />
      <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
    </svg>
  );
}

export function IconBook() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

export function IconLightbulb() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

export function IconTestTube() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5V2" />
      <path d="M8.5 2h7" />
      <path d="M14.5 16h-5" />
    </svg>
  );
}

export function IconGitPR() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <path d="M13 6h3a2 2 0 0 1 2 2v7" />
      <line x1="6" y1="9" x2="6" y2="21" />
    </svg>
  );
}
