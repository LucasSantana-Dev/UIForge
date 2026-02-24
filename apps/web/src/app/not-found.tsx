import Link from 'next/link';
import Image from 'next/image';
import { Home, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
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

        {/* 404 Illustration */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary/20">404</h1>
        </div>

        {/* Error Message */}
        <h2 className="mb-4 text-3xl font-bold tracking-tight">Page not found</h2>
        <p className="mb-8 text-lg text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or
          deleted.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go to Homepage
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/projects">
              <FileText className="h-4 w-4" />
              View Projects
            </Link>
          </Button>
        </div>

        {/* Helpful Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">You might be looking for:</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/projects" className="hover:text-primary transition-colors">
                  → Your Projects
                </Link>
              </li>
              <li>
                <Link href="/projects/new" className="hover:text-primary transition-colors">
                  → Create New Project
                </Link>
              </li>
              <li>
                <Link href="/templates" className="hover:text-primary transition-colors">
                  → Browse Templates
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-primary transition-colors">
                  → Account Settings
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
