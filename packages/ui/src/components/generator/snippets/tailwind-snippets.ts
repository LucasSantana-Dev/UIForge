import type { Snippet } from './react-snippets';

export const tailwindSnippets: Snippet[] = [
  {
    label: 'flex-center',
    insertText: 'flex items-center justify-center',
    detail: 'Flexbox center alignment',
  },
  {
    label: 'flex-between',
    insertText: 'flex items-center justify-between',
    detail: 'Flexbox space-between',
  },
  {
    label: 'flex-col',
    insertText: 'flex flex-col gap-${1:4}',
    detail: 'Flexbox column with gap',
  },
  {
    label: 'grid-responsive',
    insertText: 'grid grid-cols-1 md:grid-cols-${1:2} lg:grid-cols-${2:3} gap-${3:6}',
    detail: 'Responsive grid layout',
  },
  {
    label: 'card',
    insertText: 'rounded-lg border border-border bg-card p-6 shadow-sm',
    detail: 'Card container styles',
  },
  {
    label: 'input-base',
    insertText:
      'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
    detail: 'Form input base styles',
  },
  {
    label: 'btn-primary',
    insertText:
      'inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50',
    detail: 'Primary button styles',
  },
  {
    label: 'btn-secondary',
    insertText:
      'inline-flex items-center justify-center rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80',
    detail: 'Secondary button styles',
  },
  {
    label: 'container',
    insertText: 'mx-auto max-w-${1:7xl} px-4 sm:px-6 lg:px-8',
    detail: 'Responsive container',
  },
  {
    label: 'sr-only',
    insertText: 'sr-only',
    detail: 'Screen reader only (visually hidden)',
  },
  {
    label: 'truncate-text',
    insertText: 'truncate overflow-hidden text-ellipsis',
    detail: 'Truncate text with ellipsis',
  },
  {
    label: 'animate-fade-in',
    insertText: 'animate-in fade-in duration-${1:200}',
    detail: 'Fade-in animation',
  },
];
