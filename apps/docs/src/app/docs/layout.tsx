import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { source } from '@/lib/source';
import Image from 'next/image';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      nav={{
        title: (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Image src="/siza-icon.png" alt="Siza" width={24} height={24} />
            <span style={{ fontWeight: 600 }}>Siza</span>
          </div>
        ),
      }}
    >
      {children}
    </DocsLayout>
  );
}
