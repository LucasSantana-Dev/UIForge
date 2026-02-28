import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Image src="/siza-icon.png" alt="Siza" width={24} height={24} />
        <span style={{ fontWeight: 600 }}>Siza</span>
      </div>
    ),
  },
  links: [
    {
      text: 'Platform',
      url: 'https://siza.dev',
    },
    {
      text: 'GitHub',
      url: 'https://github.com/Forge-Space',
    },
  ],
};
