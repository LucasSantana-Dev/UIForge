import { useState } from 'react';
import {
  SizaBackground,
  NavigationSidebar,
  type NavigationItem,
} from '@siza/ui';
import { Generate } from './pages/Generate';
import { Projects } from './pages/Projects';
import { Settings } from './pages/Settings';
import { OllamaStatus } from './components/OllamaStatus';
import {
  CodeIcon,
  FolderOpenIcon,
  SettingsIcon,
} from 'lucide-react';

type Page = 'generate' | 'projects' | 'settings';

const NAV_ITEMS: NavigationItem[] = [
  { id: 'generate', label: 'Generate', icon: CodeIcon },
  {
    id: 'projects',
    label: 'Projects',
    icon: FolderOpenIcon,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: SettingsIcon,
  },
];

export function App() {
  const [page, setPage] = useState<Page>('generate');

  return (
    <SizaBackground>
      <div className="flex h-screen">
        <aside className="w-52 border-r border-surface-3 bg-surface-0/50">
          <NavigationSidebar
            items={NAV_ITEMS}
            activeId={page}
            header={
              <div className="flex items-center gap-2">
                <img
                  src="/siza-icon.png"
                  alt="Siza"
                  width={24}
                  height={24}
                />
                <span className="font-bold text-lg">
                  Siza
                </span>
              </div>
            }
            renderLink={(item, _isActive, children) => (
              <button
                onClick={() =>
                  setPage(item.id as Page)
                }
                className="w-full text-left"
              >
                {children}
              </button>
            )}
          />
          <div className="px-4 pb-4">
            <OllamaStatus />
          </div>
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
