export function SizaBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-surface-0">
      <div
        className="pointer-events-none fixed inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(124,58,237,0.06), transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--text-muted) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
