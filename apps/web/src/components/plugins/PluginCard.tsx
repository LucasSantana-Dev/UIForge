'use client';

import {
  AlertTriangle,
  Shield,
  Lock,
  TrendingUp,
  ClipboardCheck,
  Package,
  Download,
  Trash2,
  Settings,
  CheckCircle2,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertTriangle,
  Shield,
  Lock,
  TrendingUp,
  ClipboardCheck,
  Package,
};

const CATEGORY_COLORS: Record<string, string> = {
  governance: 'bg-violet-500/10 text-violet-400',
  quality: 'bg-amber-500/10 text-amber-400',
  security: 'bg-red-500/10 text-red-400',
  architecture: 'bg-blue-500/10 text-blue-400',
  integration: 'bg-cyan-500/10 text-cyan-400',
  monitoring: 'bg-green-500/10 text-green-400',
  documentation: 'bg-slate-500/10 text-slate-400',
};

interface PluginCardProps {
  plugin: {
    slug: string;
    name: string;
    description: string | null;
    version: string;
    author: string;
    icon: string | null;
    category: string;
    status: string;
    widget_slots: string[];
    installation?: {
      id: string;
      enabled: boolean;
      config: Record<string, unknown>;
    } | null;
  };
  onInstall: (slug: string) => void;
  onUninstall: (slug: string) => void;
  onConfigure?: (slug: string) => void;
  installing?: boolean;
}

export function PluginCard({
  plugin,
  onInstall,
  onUninstall,
  onConfigure,
  installing,
}: PluginCardProps) {
  const Icon = plugin.icon ? ICON_MAP[plugin.icon] : Shield;
  const isInstalled = !!plugin.installation;
  const categoryStyle = CATEGORY_COLORS[plugin.category] ?? CATEGORY_COLORS.governance;
  const categoryLabel = plugin.category
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  return (
    <div className="group rounded-xl border border-border/50 bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-brand/30">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
            {Icon && <Icon className="h-5 w-5 text-brand" />}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{plugin.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${categoryStyle}`}
              >
                {categoryLabel}
              </span>
              <span className="text-[10px] text-text-tertiary">v{plugin.version}</span>
            </div>
          </div>
        </div>
        {isInstalled && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
      </div>

      <p className="mb-4 text-xs text-text-secondary leading-relaxed line-clamp-3">
        {plugin.description}
      </p>

      <div className="mb-4 flex flex-wrap gap-1">
        {plugin.widget_slots.map((slot) => (
          <span
            key={slot}
            className="rounded-md bg-surface-secondary px-1.5 py-0.5 text-[10px] text-text-tertiary"
          >
            {slot}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border/30 pt-3">
        <span className="text-[10px] text-text-tertiary">by {plugin.author}</span>
        <div className="flex items-center gap-1.5">
          {isInstalled ? (
            <>
              {onConfigure && (
                <button
                  onClick={() => onConfigure(plugin.slug)}
                  className="rounded-md p-1.5 text-text-tertiary hover:bg-surface-secondary hover:text-text-primary transition-colors"
                  title="Configure"
                >
                  <Settings className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => onUninstall(plugin.slug)}
                className="rounded-md p-1.5 text-text-tertiary hover:bg-red-500/10 hover:text-red-400 transition-colors"
                title="Uninstall"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => onInstall(plugin.slug)}
              disabled={installing}
              className="flex items-center gap-1 rounded-md bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand hover:bg-brand/20 transition-colors disabled:opacity-50"
            >
              <Download className="h-3 w-3" />
              Install
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
