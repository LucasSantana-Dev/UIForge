'use client';

import { useState } from 'react';
import {
  useEntityPermissions,
  useGrantPermission,
  useRevokePermission,
} from '@/hooks/use-entity-permissions';
import { useTeams } from '@/hooks/use-teams';
import { ShieldCheckIcon, TrashIcon, PlusIcon, UsersIcon, UserIcon } from 'lucide-react';

const PERMISSION_LABELS: Record<string, { label: string; color: string }> = {
  view: { label: 'View', color: 'text-blue-400' },
  edit: { label: 'Edit', color: 'text-green-400' },
  admin: { label: 'Admin', color: 'text-yellow-400' },
  delete: { label: 'Delete', color: 'text-red-400' },
};

interface EntityPermissionsPanelProps {
  entityType: string;
  entityId: string;
  canManage: boolean;
}

export function EntityPermissionsPanel({
  entityType,
  entityId,
  canManage,
}: EntityPermissionsPanelProps) {
  const { data, isLoading } = useEntityPermissions(entityType, entityId);
  const grant = useGrantPermission(entityType, entityId);
  const revoke = useRevokePermission(entityType, entityId);
  const { data: teamsData } = useTeams();
  const [showForm, setShowForm] = useState(false);
  const [grantType, setGrantType] = useState<'team' | 'user'>('team');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedPermission, setSelectedPermission] = useState('view');

  const permissions = data?.data || [];
  const teams = teamsData?.data || [];

  function handleGrant() {
    const target = grantType === 'team' ? { teamId: selectedTeamId } : { userId: selectedUserId };

    if (grantType === 'team' && !selectedTeamId) return;
    if (grantType === 'user' && !selectedUserId) return;

    grant.mutate(
      { permission: selectedPermission, ...target },
      {
        onSuccess: () => {
          setShowForm(false);
          setSelectedTeamId('');
          setSelectedUserId('');
          setSelectedPermission('view');
        },
      }
    );
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-10 rounded bg-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium text-white/80">
          <ShieldCheckIcon className="h-4 w-4" />
          Permissions
        </h3>
        {canManage && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-violet-400 hover:bg-violet-500/10"
          >
            <PlusIcon className="h-3 w-3" />
            Grant
          </button>
        )}
      </div>

      {showForm && canManage && (
        <div className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="flex gap-2">
            <button
              onClick={() => setGrantType('team')}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${
                grantType === 'team'
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              <UsersIcon className="h-3 w-3" />
              Team
            </button>
            <button
              onClick={() => setGrantType('user')}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${
                grantType === 'user'
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              <UserIcon className="h-3 w-3" />
              User
            </button>
          </div>

          {grantType === 'team' ? (
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white"
            >
              <option value="">Select team...</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              placeholder="User ID"
              className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white placeholder:text-white/30"
            />
          )}

          <select
            value={selectedPermission}
            onChange={(e) => setSelectedPermission(e.target.value)}
            className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white"
          >
            {Object.entries(PERMISSION_LABELS).map(([value, { label }]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="rounded px-3 py-1 text-xs text-white/50 hover:text-white/70"
            >
              Cancel
            </button>
            <button
              onClick={handleGrant}
              disabled={grant.isPending}
              className="rounded bg-violet-600 px-3 py-1 text-xs text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {grant.isPending ? 'Granting...' : 'Grant'}
            </button>
          </div>
        </div>
      )}

      {permissions.length === 0 ? (
        <p className="text-sm text-white/40">No permissions configured</p>
      ) : (
        <div className="space-y-1">
          {permissions.map((perm) => {
            const meta = PERMISSION_LABELS[perm.permission] || {
              label: perm.permission,
              color: 'text-white/60',
            };
            return (
              <div
                key={perm.id}
                className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-white/5"
              >
                <div className="flex items-center gap-2 text-sm">
                  {perm.team ? (
                    <>
                      <UsersIcon className="h-3.5 w-3.5 text-white/40" />
                      <span className="text-white/70">{perm.team.name}</span>
                    </>
                  ) : (
                    <>
                      <UserIcon className="h-3.5 w-3.5 text-white/40" />
                      <span className="text-white/70">
                        {perm.profile?.full_name || perm.user_id}
                      </span>
                    </>
                  )}
                  <span className={`text-xs ${meta.color}`}>{meta.label}</span>
                </div>
                {canManage && (
                  <button
                    onClick={() => revoke.mutate(perm.id)}
                    className="text-white/30 hover:text-red-400"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
