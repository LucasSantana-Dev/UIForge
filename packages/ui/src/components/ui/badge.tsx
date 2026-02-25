import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-brand/15 text-brand-light shadow hover:bg-brand/25',
        secondary: 'border-transparent bg-surface-2 text-text-secondary hover:bg-surface-3',
        destructive: 'border-transparent bg-error/15 text-error shadow hover:bg-error/25',
        success: 'border-transparent bg-success/15 text-success shadow hover:bg-success/25',
        warning: 'border-transparent bg-warning/15 text-warning shadow hover:bg-warning/25',
        outline: 'text-text-secondary border-surface-3',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
