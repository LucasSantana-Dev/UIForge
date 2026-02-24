export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { SettingsClient } from './settings-client';

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="animate-pulse p-8">Loading settings...</div>}>
      <SettingsClient />
    </Suspense>
  );
}
