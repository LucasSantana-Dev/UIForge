import type { MetadataRoute } from 'next';
import { MARKETING_INDEXABLE_PATHS, NON_MARKETING_DISALLOW_PATHS } from '@/lib/marketing/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: MARKETING_INDEXABLE_PATHS,
        disallow: NON_MARKETING_DISALLOW_PATHS,
      },
    ],
    host: 'https://siza.forgespace.co',
    sitemap: 'https://siza.forgespace.co/sitemap.xml',
  };
}
