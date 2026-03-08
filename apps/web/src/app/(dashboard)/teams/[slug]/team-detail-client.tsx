'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CrownIcon,
  ShieldIcon,
  PencilIcon,
  EyeIcon,
  UserPlusIcon,
  TrashIcon,
  ChevronDownIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@siza/ui';
import {
  useTeam,
  useAddTeamMember,
  useUpdateMemberRole,
  useRemoveTeamMember,
} from '@/hooks/use-teams';

const ROLE_META: Record<string, { icon: typeof EyeIcon; label: string; color: string }> = {
  owner: { icon: CrownIcon, label: 'Owner', color: 'text-amber-400' },
  admin: { icon: ShieldIcon, label: 'Admin', color: 'text-violet-400' },
  editor: { icon: PencilIcon, label: 'Editor', color: 'text-blue-400' },
  viewer: { icon: EyeIcon, label: 'Viewer', color: 'text-zinc-400' },
};

const ASSIGNABLE_ROLES = ['viewer', 'editor', 'admin'] as const;

export function TeamDetailClient({ slug }: { slug: string }) {
  const { data, isLoading } = useTeam(slug);
  const addMember = useAddTeamMember(slug);
  const updateRole = useUpdateMemberRole(slug);
  const removeMember = useRemoveTeamMember(slug);

  const [showAdd, setShowAdd] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [newRole, setNewRole] = useState<string>('viewer');
  const [error, setError] = useState('');
  const [editingMember, setEditingMember] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-zinc-400">Team not found</p>
        <Link href="/teams" className="text-violet-400 text-sm mt-2 inline-block">
          Back to teams
        </Link>
      </div>
    );
  }

  const team = data.data;
  const userRole = data.userRole;
  const canManage = userRole === 'admin' || userRole === 'owner';
  const members = team.members ?? [];

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await addMember.mutateAsync({ userId: newUserId, role: newRole });
      setNewUserId('');
      setNewRole('viewer');
      setShowAdd(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    }
  }

  async function handleRoleChange(userId: string, role: string) {
    try {
      await updateRole.mutateAsync({ userId, role });
      setEditingMember(null);
    } catch {
      // silently handled by query error state
    }
  }

  async function handleRemove(userId: string) {
    try {
      await removeMember.mutateAsync(userId);
    } catch {
      // silently handled by query error state
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Link
        href="/teams"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Teams
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{team.name}</h1>
          {team.description && <p className="text-sm text-zinc-400 mt-1">{team.description}</p>}
        </div>
        {canManage && (
          <Button onClick={() => setShowAdd(!showAdd)}>
            <UserPlusIcon className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        )}
      </div>

      {showAdd && canManage && (
        <form
          onSubmit={handleAddMember}
          className="border border-zinc-800 rounded-xl p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold">Add Member</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label htmlFor="member-uid" className="text-sm text-zinc-400 block mb-1">
                User ID
              </label>
              <Input
                id="member-uid"
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                placeholder="User UUID"
                required
              />
            </div>
            <div>
              <label htmlFor="member-role" className="text-sm text-zinc-400 block mb-1">
                Role
              </label>
              <select
                id="member-role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full h-10 rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm"
              >
                {ASSIGNABLE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_META[r].label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={addMember.isPending}>
              {addMember.isPending ? 'Adding...' : 'Add'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="font-semibold">Members ({members.length})</h2>
          <div className="flex gap-4 text-xs text-zinc-500">
            {Object.entries(ROLE_META).map(([key, meta]) => {
              const count = members.filter((m) => m.role === key).length;
              if (!count) return null;
              return (
                <span key={key} className={meta.color}>
                  {count} {meta.label}
                  {count > 1 ? 's' : ''}
                </span>
              );
            })}
          </div>
        </div>
        {members.length === 0 ? (
          <div className="px-5 py-8 text-center text-zinc-500">No members yet</div>
        ) : (
          <ul className="divide-y divide-zinc-800/50">
            {members
              .sort((a, b) => {
                const order = ['owner', 'admin', 'editor', 'viewer'];
                return order.indexOf(a.role) - order.indexOf(b.role);
              })
              .map((member) => {
                const meta = ROLE_META[member.role] ?? ROLE_META.viewer;
                const RoleIcon = meta.icon;
                const isOwner = member.role === 'owner';

                return (
                  <li key={member.id} className="px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium">
                        {member.profile?.full_name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {member.profile?.full_name ?? member.user_id}
                        </p>
                        <p className="text-xs text-zinc-500">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingMember === member.user_id && canManage && !isOwner ? (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                          className="h-8 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-xs"
                        >
                          {ASSIGNABLE_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {ROLE_META[r].label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            canManage && !isOwner ? setEditingMember(member.user_id) : undefined
                          }
                          className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md ${meta.color} ${canManage && !isOwner ? 'hover:bg-zinc-800 cursor-pointer' : ''}`}
                        >
                          <RoleIcon className="h-3 w-3" />
                          {meta.label}
                          {canManage && !isOwner && <ChevronDownIcon className="h-3 w-3" />}
                        </button>
                      )}
                      {canManage && !isOwner && (
                        <button
                          type="button"
                          onClick={() => handleRemove(member.user_id)}
                          className="text-zinc-600 hover:text-red-400 p-1"
                          title="Remove member"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
          </ul>
        )}
      </div>
    </div>
  );
}
