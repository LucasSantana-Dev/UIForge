import type { MetadataRoute } from 'next';
import { MARKETING_INDEXABLE_PATHS } from '@/lib/marketing/seo';

const BASE_URL = 'https://siza.forgespace.co';
const LAST_MODIFIED = new Date('2026-03-11T00:00:00.000Z');

const PRIORITY_BY_PATH: Record<string, number> = {
  '/': 1,
  '/pricing': 0.9,
  '/docs': 0.8,
  '/roadmap': 0.8,
  '/about': 0.7,
  '/gallery': 0.7,
  '/legal/privacy': 0.5,
  '/legal/terms': 0.5,
};

const FREQUENCY_BY_PATH: Record<string, MetadataRoute.Sitemap[number]['changeFrequency']> = {
  '/': 'weekly',
  '/pricing': 'weekly',
  '/docs': 'weekly',
  '/roadmap': 'weekly',
  '/about': 'monthly',
  '/gallery': 'weekly',
  '/legal/privacy': 'yearly',
  '/legal/terms': 'yearly',
};

export default function sitemap(): MetadataRoute.Sitemap {
  return MARKETING_INDEXABLE_PATHS.map((path) => ({
    url: path === '/' ? BASE_URL : `${BASE_URL}${path}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: FREQUENCY_BY_PATH[path] ?? 'monthly',
    priority: PRIORITY_BY_PATH[path] ?? 0.7,
  }));
}
