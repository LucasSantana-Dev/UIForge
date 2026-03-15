'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { captureLeadAttributionFromCurrentUrl } from '@/lib/analytics/lead-attribution';

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  params?: Record<string, string | number | boolean | null>;
}

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: Record<string, unknown>) => void;
    dataLayer: unknown[];
  }
}

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;
const GOOGLE_ADS_ID = 'AW-959867732';

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  useEffect(() => {
    if (!GA_TRACKING_ID) return;

    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_TRACKING_ID}', {
        page_location: window.location.href,
        debug_mode: ${process.env.NODE_ENV === 'development'}
      });
      gtag('config', '${GOOGLE_ADS_ID}');
    `;
    document.head.appendChild(script2);

    return () => {
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, []);

  useEffect(() => {
    if (!GA_TRACKING_ID || typeof window.gtag !== 'function') return;
    const url = pathname + (searchParamsString ? `?${searchParamsString}` : '');
    window.gtag('config', GA_TRACKING_ID, {
      page_location: url,
    });
  }, [pathname, searchParamsString]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    captureLeadAttributionFromCurrentUrl(new URL(window.location.href));
  }, [pathname, searchParamsString]);

  return <>{children}</>;
}

export const trackEvent = ({ action, category, label, value, params }: AnalyticsEvent) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...params,
    });
  }
};

export const trackPageView = (url: string) => {
  if (!GA_TRACKING_ID || typeof window.gtag !== 'function') return;
  window.gtag('config', GA_TRACKING_ID, {
    page_location: url,
  });
};

export const trackUserInteraction = (element: string, action: string) => {
  trackEvent({
    action,
    category: 'User Interaction',
    label: element,
  });
};

export const trackTemplateUsage = (templateId: string, templateName: string) => {
  trackEvent({
    action: 'template_used',
    category: 'Templates',
    label: `${templateName} (${templateId})`,
  });
};

export const trackComponentGeneration = (framework: string, componentLibrary: string) => {
  trackEvent({
    action: 'component_generated',
    category: 'Generation',
    label: `${framework} + ${componentLibrary}`,
  });
};

export const trackProjectCreation = () => {
  trackEvent({
    action: 'project_created',
    category: 'Projects',
  });
};

export const trackError = (error: string, context: string) => {
  trackEvent({
    action: 'error_occurred',
    category: 'Errors',
    label: `${context}: ${error}`,
  });
};

export const trackGoogleAdsConversion = (conversionLabel: string) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'conversion', {
      send_to: `${GOOGLE_ADS_ID}/${conversionLabel}`,
    });
  }
};
