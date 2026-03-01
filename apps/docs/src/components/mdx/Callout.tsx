import type { ReactNode } from 'react';
import { Info, AlertTriangle, Lightbulb, AlertCircle } from 'lucide-react';

type CalloutType = 'info' | 'warning' | 'tip' | 'danger';

const ICONS: Record<CalloutType, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  tip: Lightbulb,
  danger: AlertCircle,
};

export default function Callout({
  type = 'info',
  children,
}: {
  type?: CalloutType;
  children: ReactNode;
}) {
  const Icon = ICONS[type];

  return (
    <div className={`docs-callout docs-callout--${type}`}>
      <span className="docs-callout-icon">
        <Icon size={18} />
      </span>
      <div className="docs-callout-content">{children}</div>
    </div>
  );
}
