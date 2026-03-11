import type { Metadata } from 'next';

const SITE_URL = 'https://siza.forgespace.co';

type MarketingSeoEntry = {
  title: string;
  description: string;
  canonicalPath: string;
  keywords: string[];
};

const MARKETING_SEO_MAP = {
  home: {
    title: 'Siza — Vibe Code the Right Way',
    description:
      'Open-source full-stack AI workspace for generating production-grade code with governance, migration support, and reliable live previews.',
    canonicalPath: '/',
    keywords: [
      'full-stack AI workspace',
      'AI code generation',
      'developer governance',
      'migration tooling',
      'live preview',
      'open source',
    ],
  },
  about: {
    title: 'About Siza | Open Full-Stack AI Workspace',
    description:
      'Learn how Siza delivers full-stack AI generation with skills, governance, migration strategy, and zero lock-in architecture.',
    canonicalPath: '/about',
    keywords: [
      'about siza',
      'forge space ecosystem',
      'AI development platform',
      'open source workspace',
    ],
  },
  roadmap: {
    title: 'Siza Roadmap | Full-Stack AI Development',
    description:
      'Track shipped milestones and upcoming roadmap phases across Siza, from generation reliability to governance and ecosystem scale.',
    canonicalPath: '/roadmap',
    keywords: ['siza roadmap', 'AI development roadmap', 'developer platform milestones'],
  },
  pricing: {
    title: 'Siza Pricing | Free and Team Plans',
    description:
      'Compare Siza plans for individual developers and teams. Start free and scale with governance and collaboration workflows.',
    canonicalPath: '/pricing',
    keywords: ['siza pricing', 'AI code generator pricing', 'developer tool pricing'],
  },
  docs: {
    title: 'Siza Docs | Generation, Providers, and Governance',
    description:
      'Access Siza documentation for setup, AI providers, templates, billing, and production-grade governance workflows.',
    canonicalPath: '/docs',
    keywords: ['siza documentation', 'AI provider setup', 'generation guides', 'governance docs'],
  },
  gallery: {
    title: 'Siza Gallery | Production-Grade UI Generations',
    description:
      'Explore generated UI examples built with Siza across React, Vue, and Svelte to accelerate prompt-to-production workflows.',
    canonicalPath: '/gallery',
    keywords: ['AI UI gallery', 'generated UI examples', 'siza gallery'],
  },
  privacy: {
    title: 'Privacy Policy | Siza',
    description: 'How Siza handles data, security boundaries, and privacy protections.',
    canonicalPath: '/legal/privacy',
    keywords: ['siza privacy policy', 'developer data privacy'],
  },
  terms: {
    title: 'Terms of Service | Siza',
    description: 'Terms and service conditions for using Siza and its hosted platform.',
    canonicalPath: '/legal/terms',
    keywords: ['siza terms', 'developer platform terms'],
  },
} satisfies Record<string, MarketingSeoEntry>;

export type MarketingPageKey = keyof typeof MARKETING_SEO_MAP;

export const MARKETING_INDEXABLE_PATHS = Object.values(MARKETING_SEO_MAP).map(
  (entry) => entry.canonicalPath
);

export const NON_MARKETING_DISALLOW_PATHS = [
  '/api/',
  '/dashboard',
  '/admin',
  '/onboarding',
  '/generate',
  '/projects',
  '/templates',
  '/settings',
  '/teams',
  '/catalog',
  '/skills',
  '/billing',
  '/plugins',
  '/history',
  '/golden-paths',
  '/ai-keys',
  '/signin',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/maintenance',
  '/wireframe',
  '/auth/',
  '/landing',
];

function toAbsoluteUrl(path: string): string {
  return path === '/' ? SITE_URL : `${SITE_URL}${path}`;
}

function getSeoEntry(page: MarketingPageKey): MarketingSeoEntry {
  return MARKETING_SEO_MAP[page];
}

export function getMarketingPageMetadata(page: MarketingPageKey): Metadata {
  const seo = getSeoEntry(page);
  const canonicalUrl = toAbsoluteUrl(seo.canonicalPath);

  return {
    title: { absolute: seo.title },
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      title: seo.title,
      description: seo.description,
      url: canonicalUrl,
      siteName: 'Siza',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Siza — Vibe Code the Right Way',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: ['/og-image.png'],
    },
  };
}

export const globalStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'Siza',
      url: SITE_URL,
      logo: `${SITE_URL}/monogram.png`,
      sameAs: ['https://github.com/Forge-Space/siza'],
    },
    {
      '@type': 'WebSite',
      name: 'Siza',
      url: SITE_URL,
    },
  ],
};

export const softwareApplicationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Siza',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Cross-platform',
  description:
    'AI-powered full-stack generation with architecture, security, and quality built in.',
  url: SITE_URL,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  author: {
    '@type': 'Organization',
    name: 'Forge Space',
    url: 'https://forgespace.co',
  },
};

export function getMarketingWebPageJsonLd(page: MarketingPageKey) {
  const seo = getSeoEntry(page);
  const canonicalUrl = toAbsoluteUrl(seo.canonicalPath);

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: seo.title,
    description: seo.description,
    url: canonicalUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Siza',
      url: SITE_URL,
    },
  };
}
