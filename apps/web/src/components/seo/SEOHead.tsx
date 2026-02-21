'use client';

import Head from 'next/head';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  structuredData?: Record<string, any>;
}

export function SEOHead({
  title,
  description,
  keywords,
  image = '/og-image-1200x630.png',
  url = 'https://uiforge.app',
  type = 'website',
  structuredData,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | UIForge` : 'UIForge - AI-Driven UI Generation';
  const fullDescription = description || 
    'Generate production-ready UI components with AI. Zero-cost platform for developers. Transform natural language into React, Vue, Angular, and Svelte components.';
  const fullKeywords = keywords?.join(', ') || 
    'UI generation, AI, React, Next.js, Vue, Angular, Svelte, Components, Code generation, Web development';

  const jsonLd = structuredData || {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'UIForge',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    description: fullDescription,
    url: url,
    author: {
      '@type': 'Organization',
      name: 'UIForge Team',
      url: 'https://github.com/LucasSantana-Dev/uiforge-webapp',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    featureList: [
      'AI-powered UI generation',
      'Multiple framework support',
      'Real-time code editing',
      'Template library',
      'Project management',
      'Zero-cost platform',
    ],
  };

  return (
    <Head>
      {/* Meta tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={fullKeywords} />
      <meta name="author" content="UIForge Team" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="UIForge" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@uiforge" />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <link rel="canonical" href={url} />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
    </Head>
  );
}