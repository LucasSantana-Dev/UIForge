'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@siza/ui';

interface DoneStepProps {
  project: { id: string; name: string } | null;
}

export function DoneStep({ project }: DoneStepProps) {
  const router = useRouter();
  const [completing, setCompleting] = useState(false);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await fetch('/api/onboarding/complete', { method: 'POST' });
      router.push(project ? `/projects/${project.id}` : '/projects');
    } catch {
      router.push('/projects');
    }
  };

  const links = [
    {
      label: 'View your project',
      href: project ? `/projects/${project.id}` : '/projects',
    },
    { label: 'Browse templates', href: '/templates' },
    { label: 'Read the docs', href: '/docs' },
  ];

  return (
    <div className="space-y-8 text-center">
      <div className="space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle className="h-8 w-8 text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold text-white">You&apos;re all set!</h1>
        <p className="text-white/60">
          {project
            ? `You created "${project.name}" and generated your first component`
            : "You're ready to start building with Siza"}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-white/40">What&apos;s next?</p>
        <div className="flex flex-col items-center gap-2">
          {links.map(({ label, href }) => (
            <button
              key={href}
              onClick={async () => {
                await fetch('/api/onboarding/complete', { method: 'POST' });
                router.push(href);
              }}
              className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              {label}
              <ArrowRight className="h-3 w-3" />
            </button>
          ))}
        </div>
      </div>

      <Button onClick={handleComplete} disabled={completing} size="lg">
        {completing ? 'Finishing...' : 'Get started'}
      </Button>
    </div>
  );
}
