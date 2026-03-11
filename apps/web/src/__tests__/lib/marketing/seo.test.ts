import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import {
  MARKETING_INDEXABLE_PATHS,
  NON_MARKETING_DISALLOW_PATHS,
  getMarketingPageMetadata,
  getMarketingWebPageJsonLd,
  globalStructuredData,
  softwareApplicationJsonLd,
} from '@/lib/marketing/seo';

describe('marketing SEO contract', () => {
  const pageCases = [
    { key: 'home' as const, canonical: 'https://siza.forgespace.co' },
    { key: 'about' as const, canonical: 'https://siza.forgespace.co/about' },
    { key: 'roadmap' as const, canonical: 'https://siza.forgespace.co/roadmap' },
    { key: 'pricing' as const, canonical: 'https://siza.forgespace.co/pricing' },
    { key: 'docs' as const, canonical: 'https://siza.forgespace.co/docs' },
    { key: 'gallery' as const, canonical: 'https://siza.forgespace.co/gallery' },
    { key: 'privacy' as const, canonical: 'https://siza.forgespace.co/legal/privacy' },
    { key: 'terms' as const, canonical: 'https://siza.forgespace.co/legal/terms' },
  ];

  it('returns canonical, OG URL, and Twitter metadata per marketing page', () => {
    for (const pageCase of pageCases) {
      const metadata = getMarketingPageMetadata(pageCase.key);
      const openGraph = metadata.openGraph as { url?: string } | undefined;
      const twitter = metadata.twitter as { title?: string } | undefined;

      expect(metadata.alternates?.canonical).toBe(pageCase.canonical);
      expect(openGraph?.url).toBe(pageCase.canonical);
      expect((metadata.description ?? '').length).toBeGreaterThan(0);
      expect((twitter?.title ?? '').length).toBeGreaterThan(0);
    }
  });

  it('keeps route descriptions unique to avoid metadata duplication', () => {
    const descriptions = pageCases.map(
      (pageCase) => getMarketingPageMetadata(pageCase.key).description
    );
    const uniqueDescriptions = new Set(descriptions);

    expect(uniqueDescriptions.size).toBe(pageCases.length);
  });

  it('exposes route-level WebPage schema with canonical URLs', () => {
    for (const pageCase of pageCases) {
      const schema = getMarketingWebPageJsonLd(pageCase.key);

      expect(schema['@type']).toBe('WebPage');
      expect(schema.url).toBe(pageCase.canonical);
      expect(schema.isPartOf.url).toBe('https://siza.forgespace.co');
    }
  });
});

describe('marketing crawl policy', () => {
  it('includes only indexable marketing paths in sitemap output', () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(MARKETING_INDEXABLE_PATHS).toEqual([
      '/',
      '/about',
      '/roadmap',
      '/pricing',
      '/docs',
      '/gallery',
      '/legal/privacy',
      '/legal/terms',
    ]);
    expect(urls).toEqual([
      'https://siza.forgespace.co',
      'https://siza.forgespace.co/about',
      'https://siza.forgespace.co/roadmap',
      'https://siza.forgespace.co/pricing',
      'https://siza.forgespace.co/docs',
      'https://siza.forgespace.co/gallery',
      'https://siza.forgespace.co/legal/privacy',
      'https://siza.forgespace.co/legal/terms',
    ]);

    for (const entry of entries) {
      expect((entry.lastModified as Date).toISOString()).toBe('2026-03-11T00:00:00.000Z');
    }
  });

  it('publishes robots rules for marketing allowlist and non-marketing disallow paths', () => {
    const config = robots();
    const firstRule = Array.isArray(config.rules) ? config.rules[0] : undefined;

    expect(config.host).toBe('https://siza.forgespace.co');
    expect(config.sitemap).toBe('https://siza.forgespace.co/sitemap.xml');
    expect(firstRule?.allow).toEqual(MARKETING_INDEXABLE_PATHS);
    expect(firstRule?.disallow).toEqual(NON_MARKETING_DISALLOW_PATHS);
  });
});

describe('structured data contracts', () => {
  it('includes Organization + WebSite schema in global graph', () => {
    const graph = globalStructuredData['@graph'];

    expect(globalStructuredData['@context']).toBe('https://schema.org');
    expect(graph.some((item) => item['@type'] === 'Organization')).toBe(true);
    expect(graph.some((item) => item['@type'] === 'WebSite')).toBe(true);
  });

  it('includes SoftwareApplication schema for homepage', () => {
    expect(softwareApplicationJsonLd['@context']).toBe('https://schema.org');
    expect(softwareApplicationJsonLd['@type']).toBe('SoftwareApplication');
    expect(softwareApplicationJsonLd.url).toBe('https://siza.forgespace.co');
    expect(softwareApplicationJsonLd.offers.price).toBe('0');
  });
});
