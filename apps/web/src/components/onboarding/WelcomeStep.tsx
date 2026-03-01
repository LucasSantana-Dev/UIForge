'use client';

import { Sparkles, Code2, Zap } from 'lucide-react';
import { Button } from '@siza/ui';
import { Card, CardContent } from '@siza/ui';

interface WelcomeStepProps {
  onNext: () => void;
  onSkip: () => void;
}

const features = [
  {
    icon: Sparkles,
    title: 'AI Generation',
    description: 'Describe components with words and get production-ready code',
  },
  {
    icon: Code2,
    title: 'Live Preview',
    description: 'See your generated components rendered instantly',
  },
  {
    icon: Zap,
    title: 'Iterate Fast',
    description: 'Refine results with conversation-style prompts',
  },
];

export function WelcomeStep({ onNext, onSkip }: WelcomeStepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Welcome to Siza</h1>
        <p className="text-white/60">Let&apos;s set up your first project in under a minute</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="border-white/5 bg-white/[0.02]">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                <Icon className="h-5 w-5 text-violet-400" />
              </div>
              <h3 className="font-medium text-white">{title}</h3>
              <p className="text-sm text-white/50">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center gap-3">
        <Button variant="ghost" onClick={onSkip} className="text-white/40">
          Skip tutorial
        </Button>
        <Button onClick={onNext}>Get started</Button>
      </div>
    </div>
  );
}
