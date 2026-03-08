'use client';

import Link from 'next/link';
import { ArrowRightIcon, ArrowLeftIcon, PlusIcon, TrashIcon, NetworkIcon } from 'lucide-react';
import { useRelationships, useDeleteRelationship } from '@/hooks/use-relationships';
import { toast } from 'sonner';

const RELATION_LABELS: Record<string, { label: string; color: string }> = {
  dependsOn: { label: 'Depends on', color: 'text-sky-400' },
  consumesAPI: { label: 'Consumes API', color: 'text-violet-400' },
  providesAPI: { label: 'Provides API', color: 'text-emerald-400' },
  ownedBy: { label: 'Owned by', color: 'text-amber-400' },
  partOf: { label: 'Part of', color: 'text-blue-400' },
  hasPart: { label: 'Has part', color: 'text-blue-400' },
  implements: { label: 'Implements', color: 'text-cyan-400' },
  deployedTo: { label: 'Deployed to', color: 'text-green-400' },
  monitoredBy: { label: 'Monitored by', color: 'text-rose-400' },
};

interface RelationshipsPanelProps {
  entityId: string;
  isOwner: boolean;
  onAddRelationship?: () => void;
}

export function RelationshipsPanel({
  entityId,
  isOwner,
  onAddRelationship,
}: RelationshipsPanelProps) {
  const { data, isLoading } = useRelationships(entityId);
  const deleteMutation = useDeleteRelationship();

  const relationships = data?.data ?? [];
  const outbound = relationships.filter((r) => r.source_id === entityId);
  const inbound = relationships.filter((r) => r.target_id === entityId);

  function handleDelete(relationshipId: string) {
    deleteMutation.mutate(
      { entityId, relationshipId },
      {
        onSuccess: () => toast.success('Relationship removed'),
        onError: () => toast.error('Failed to remove relationship'),
      }
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/30 bg-surface p-6">
        <div className="h-24 animate-pulse rounded-lg bg-surface-secondary" />
      </div>
    );
  }

  if (relationships.length === 0 && !isOwner) return null;

  return (
    <div className="rounded-xl border border-border/30 bg-surface p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <NetworkIcon className="h-5 w-5 text-brand" />
          <h2 className="text-sm font-semibold text-text-primary">Relationships</h2>
          <span className="text-xs text-text-tertiary">({relationships.length})</span>
        </div>
        {isOwner && onAddRelationship && (
          <button
            onClick={onAddRelationship}
            className="flex items-center gap-1 rounded-md bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand hover:bg-brand/20 transition-colors"
          >
            <PlusIcon className="h-3 w-3" />
            Add
          </button>
        )}
      </div>

      {relationships.length === 0 ? (
        <p className="text-xs text-text-tertiary text-center py-4">No relationships defined yet</p>
      ) : (
        <div className="space-y-3">
          {outbound.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">
                Outbound
              </span>
              {outbound.map((rel) => {
                const info = RELATION_LABELS[rel.type] ?? {
                  label: rel.type,
                  color: 'text-text-secondary',
                };
                return (
                  <div
                    key={rel.id}
                    className="flex items-center gap-2 rounded-lg bg-surface-secondary/50 px-3 py-2"
                  >
                    <ArrowRightIcon className="h-3 w-3 text-text-tertiary shrink-0" />
                    <span className={`text-xs font-medium ${info.color}`}>{info.label}</span>
                    <Link
                      href={`/catalog/${rel.target_id}`}
                      className="text-xs text-text-primary hover:text-brand truncate"
                    >
                      {rel.target?.display_name ?? rel.target_id}
                    </Link>
                    <span className="text-[10px] text-text-tertiary ml-auto shrink-0">
                      {rel.target?.type}
                    </span>
                    {isOwner && (
                      <button
                        onClick={() => handleDelete(rel.id)}
                        className="p-1 text-text-tertiary hover:text-red-400 transition-colors shrink-0"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {inbound.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">
                Inbound
              </span>
              {inbound.map((rel) => {
                const info = RELATION_LABELS[rel.type] ?? {
                  label: rel.type,
                  color: 'text-text-secondary',
                };
                return (
                  <div
                    key={rel.id}
                    className="flex items-center gap-2 rounded-lg bg-surface-secondary/50 px-3 py-2"
                  >
                    <ArrowLeftIcon className="h-3 w-3 text-text-tertiary shrink-0" />
                    <Link
                      href={`/catalog/${rel.source_id}`}
                      className="text-xs text-text-primary hover:text-brand truncate"
                    >
                      {rel.source?.display_name ?? rel.source_id}
                    </Link>
                    <span className={`text-xs font-medium ${info.color}`}>{info.label}</span>
                    <span className="text-[10px] text-text-tertiary ml-auto shrink-0">
                      {rel.source?.type}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
