'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { trackEvent, trackGoogleAdsConversion } from './AnalyticsProvider';

export function EmailVerifiedTracker() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get('email_verified') !== '1') return;

    trackEvent({
      action: 'email_verified',
      category: 'Lead',
      label: 'email',
    });
    trackGoogleAdsConversion('email_verified');

    const params = new URLSearchParams(searchParams.toString());
    params.delete('email_verified');
    const newUrl = pathname + (params.size > 0 ? `?${params.toString()}` : '');
    router.replace(newUrl, { scroll: false });
  }, [searchParams, router, pathname]);

  return null;
}
