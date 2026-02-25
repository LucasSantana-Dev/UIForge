import { useState } from 'react';
import { SizaBackground } from '@siza/ui';
import { Generate } from './pages/Generate';
import { Projects } from './pages/Projects';
import { Settings } from './pages/Settings';
import { OllamaStatus } from './components/OllamaStatus';
import { CodeIcon, FolderOpenIcon, SettingsIcon } from 'lucide-react';

type Page = 'generate' | 'projects' | 'settings';

const NAV_ITEMS: Array<{
  id: Page;
  label: string;
  icon: typeof CodeIcon;
}> = [
  { id: 'generate', label: 'Generate', icon: CodeIcon },
  { id: 'projects', label: 'Projects', icon: FolderOpenIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export function App() {
  const [page, setPage] = useState<Page>('generate');

  return (
    <SizaBackground>
      <div className="flex h-screen">
        <aside className="w-16 flex flex-col items-center py-4 gap-2 border-r border-surface-3 bg-surface-0/50">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                page === id
                  ? 'bg-brand text-white'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
              }`}
              title={label}
            >
              <Icon className="w-5 h-5" />
            </button>
          ))}
          <div className="flex-1" />
          <OllamaStatus />
        </aside>

        <main className="flex-1 overflow-hidden">
          {page === 'generate' && <Generate />}
          {page === 'projects' && <Projects />}
          {page === 'settings' && <Settings />}
        </main>
      </div>
    </SizaBackground>
  );
}
