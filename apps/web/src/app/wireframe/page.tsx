export const dynamic = 'force-dynamic';
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

import { WireframeClient } from './wireframe-client';

export default function WireframePage() {
  return <WireframeClient />;
}
