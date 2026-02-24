import * as React from 'react';

import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[60px] w-full rounded-md border border-surface-3 bg-surface-1 px-3 py-2 text-base text-text-primary shadow-sm transition-all duration-200 ease-siza placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:shadow-glow-focus disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
