import Link from 'next/link';

export default function HomePage() {
  return (
    <main
      style={{
        display: 'flex',
        minHeight: '100vh',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '3rem', fontWeight: 700 }}>Siza Documentation</h1>
      <p style={{ maxWidth: '36rem', fontSize: '1.125rem', opacity: 0.8 }}>
        The Open Full-Stack AI Workspace — generate production-ready UI with AI.
      </p>
      <Link
        href="/docs"
        style={{
          borderRadius: '0.5rem',
          background: 'rgb(var(--color-fd-primary))',
          padding: '0.75rem 1.5rem',
          fontWeight: 600,
          color: 'white',
          textDecoration: 'none',
        }}
      >
        Get Started
      </Link>
    </main>
  );
}
