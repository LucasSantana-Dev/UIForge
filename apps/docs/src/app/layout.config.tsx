import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Image src="/siza-logo.svg" alt="Siza" width={20} height={20} />
        <span style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>Siza</span>
      </div>
    ),
  },
  links: [
    { text: 'Docs', url: '/docs', active: 'nested-url' },
    { text: 'API', url: '/docs/api-reference/mcp-tools' },
    { text: 'Guides', url: '/docs/guides/first-component' },
    { text: 'Platform', url: 'https://siza.dev', external: true },
    { text: 'GitHub', url: 'https://github.com/Forge-Space', external: true },
  ],
};
