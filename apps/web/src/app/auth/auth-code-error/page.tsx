import Image from 'next/image';
import Link from 'next/link';
import { AuthCardShell } from '@/components/migration/migration-primitives';

export const dynamic = 'force-dynamic';

type SearchParams = {
  reason?: string;
};

const REASON_LABELS: Record<string, string> = {
  missing_code: 'No authentication code was provided.',
  exchange_failed: 'The authentication code expired or was invalid.',
};

export default async function AuthCodeErrorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { reason } = await searchParams;
  const reasonLabel = reason ? REASON_LABELS[reason] || 'Authentication callback failed.' : null;

  return (
    <AuthCardShell>
      <div className="w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/monogram.svg" alt="Siza" width={28} height={28} priority />
            <span className="text-2xl font-display font-bold">Siza</span>
          </Link>
          <h1 className="mt-6 text-2xl font-semibold text-foreground">Authentication failed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We could not complete your sign in. Please try again.
          </p>
          {reasonLabel ? <p className="mt-3 text-xs text-muted-foreground">{reasonLabel}</p> : null}
        </div>

        <div className="space-y-3">
          <Link
            href="/signin"
            className="block w-full rounded-lg border border-border px-4 py-2 text-center text-sm font-medium text-muted-foreground hover:bg-surface-alt"
          >
            Retry sign in
          </Link>
          <Link
            href="/signin"
            className="block w-full rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary-hover"
          >
            Go to Sign in
          </Link>
          <Link
            href="/signup"
            className="block w-full rounded-lg border border-border px-4 py-2 text-center text-sm font-medium text-muted-foreground hover:bg-surface-alt"
          >
            Create new account
          </Link>
          <Link
            href="/"
            className="block text-center text-xs text-muted-foreground hover:text-foreground"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </AuthCardShell>
  );
}
