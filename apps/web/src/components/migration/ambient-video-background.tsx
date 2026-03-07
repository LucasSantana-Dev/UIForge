interface AmbientVideoBackgroundProps {
  className?: string;
  overlayClassName?: string;
}

export function AmbientVideoBackground({
  className = '',
  overlayClassName = '',
}: AmbientVideoBackgroundProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div className="ambient-noise absolute inset-0 opacity-[0.035]" />
      <div
        className="absolute inset-0 animate-[ambient-shift_20s_ease-in-out_infinite]"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(139,92,246,0.15), transparent 70%), radial-gradient(ellipse 60% 50% at 80% 20%, rgba(6,182,212,0.10), transparent 60%)',
        }}
      />
      <div
        className={`absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.25),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.18),transparent_50%)] ${overlayClassName}`}
      />
    </div>
  );
}
