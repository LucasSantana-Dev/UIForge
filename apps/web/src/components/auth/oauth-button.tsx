import { Button } from '@/components/ui/button';
import { Gmail, Github } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OAuthButtonProps {
  provider: 'google' | 'github';
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

const providerConfig = {
  google: {
    name: 'Google',
    icon: Gmail,
    bgColor: 'bg-background',
    textColor: 'text-foreground',
    borderColor: 'border-border',
    hoverBg: 'hover:bg-accent',
  },
  github: {
    name: 'GitHub',
    icon: Github,
    bgColor: 'bg-card',
    textColor: 'text-card-foreground',
    borderColor: 'border-border',
    hoverBg: 'hover:bg-accent',
  },
};

export function OAuthButton({ provider, onClick, disabled = false, className }: OAuthButtonProps) {
  const config = providerConfig[provider];
  const Icon = config.icon;

  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full gap-3 font-normal',
        config.bgColor,
        config.textColor,
        config.borderColor,
        config.hoverBg,
        className
      )}
    >
      <Icon className="h-4 w-4" />
      Continue with {config.name}
    </Button>
  );
}
