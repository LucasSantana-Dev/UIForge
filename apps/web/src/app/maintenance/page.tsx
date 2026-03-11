export const dynamic = 'force-dynamic';
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

import Image from 'next/image';
import { Wrench, Clock } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function MaintenancePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-surface-0 px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.18),transparent_45%)]"
      />
      <div className="mx-auto max-w-2xl text-center">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <Image src="/monogram.svg" alt="Siza" width={40} height={40} className="flex-shrink-0" />
          <span className="text-2xl font-bold">Siza</span>
        </Link>

        {/* Maintenance Icon */}
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-primary/10 p-6">
            <Wrench className="h-16 w-16 text-primary" />
          </div>
        </div>

        {/* Message */}
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-text-primary">
          We&apos;ll be back soon!
        </h1>
        <p className="mb-8 text-lg text-text-secondary">
          Siza is currently undergoing scheduled maintenance to improve your experience. We
          apologize for any inconvenience.
        </p>

        {/* Estimated Time */}
        <Card className="mb-12 inline-flex siza-shell-card">
          <CardContent className="flex items-center gap-2 py-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">
              Estimated downtime: <span className="text-primary">30 minutes</span>
            </span>
          </CardContent>
        </Card>

        {/* What's Happening */}
        <Card className="text-left mb-8 siza-shell-card">
          <CardHeader>
            <CardTitle className="text-sm">What we&apos;re working on:</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Performance improvements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Database optimization</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Security updates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>New features deployment</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-text-secondary">Need immediate help?</p>
          <Button asChild variant="outline">
            <a href="mailto:support@forgespace.co">Contact support</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
