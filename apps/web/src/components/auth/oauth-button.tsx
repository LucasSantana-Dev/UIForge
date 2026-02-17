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
    bgColor: 'bg-white',
    textColor: 'text-gray-900',
    borderColor: 'border-gray-300',
    hoverBg: 'hover:bg-gray-50',
  },
  github: {
    name: 'GitHub',
    icon: Github,
    bgColor: 'bg-gray-900',
    textColor: 'text-white',
    borderColor: 'border-gray-700',
    hoverBg: 'hover:bg-gray-800',
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
