export const dynamic = 'force-dynamic';

import Image from 'next/image';
import { Wrench, Clock, Github } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/50 px-4">
      <div className="mx-auto max-w-2xl text-center">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <Image
            src="/anvil-logo.svg"
            alt="Siza"
            width={40}
            height={40}
            className="flex-shrink-0"
          />
          <span className="text-2xl font-bold">Siza</span>
        </Link>

        {/* Maintenance Icon */}
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-primary/10 p-6">
            <Wrench className="h-16 w-16 text-primary" />
          </div>
        </div>

        {/* Message */}
        <h1 className="mb-4 text-4xl font-bold tracking-tight">We&apos;ll be back soon!</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Siza is currently undergoing scheduled maintenance to improve your experience. We
          apologize for any inconvenience.
        </p>

        {/* Estimated Time */}
        <Card className="mb-12 inline-flex">
          <CardContent className="flex items-center gap-2 py-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">
              Estimated downtime: <span className="text-primary">30 minutes</span>
            </span>
          </CardContent>
        </Card>

        {/* What's Happening */}
        <Card className="text-left mb-8">
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

        {/* Social Links */}
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">Stay updated on our progress:</p>
          <div className="flex gap-4">
            <Button asChild variant="outline" size="icon" className="rounded-full">
              <a
                href="https://github.com/siza"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
