'use client';

interface SkillBadgeProps {
  count: number;
}

export function SkillBadge({ count }: SkillBadgeProps) {
  if (count === 0) return null;

  return (
    <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-medium rounded-full bg-brand text-white">
      {count}
    </span>
  );
}
