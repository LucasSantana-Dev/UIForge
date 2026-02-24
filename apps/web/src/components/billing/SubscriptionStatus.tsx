'use client';

interface SubscriptionStatusProps {
  plan: string;
  status: string;
  cancelAtPeriodEnd?: boolean;
}

export function SubscriptionStatus({ plan, status, cancelAtPeriodEnd }: SubscriptionStatusProps) {
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);

  const statusColor =
    status === 'active'
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : status === 'past_due'
        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">{planLabel}</span>
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}>
        {cancelAtPeriodEnd ? 'Canceling' : status}
      </span>
    </div>
  );
}
