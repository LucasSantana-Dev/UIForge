'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlusIcon, UsersIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@siza/ui';
import { useTeams, useCreateTeam } from '@/hooks/use-teams';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function TeamsClient() {
  const { data, isLoading } = useTeams();
  const createTeam = useCreateTeam();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const teams = data?.data ?? [];

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const slug = slugify(name);
    if (!slug) {
      setError('Name must contain at least one alphanumeric character');
      return;
    }
    try {
      await createTeam.mutateAsync({
        name,
        slug,
        description: description || undefined,
      });
      setName('');
      setDescription('');
      setShowCreate(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team');
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-9 w-40" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teams</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage teams and permissions across your organization
          </p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Team
        </Button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Create Team</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="team-name" className="text-sm text-zinc-400 block mb-1">
                Team Name
              </label>
              <Input
                id="team-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Platform Engineering"
                required
              />
              {name && <p className="text-xs text-zinc-500 mt-1">Slug: {slugify(name)}</p>}
            </div>
            <div>
              <label htmlFor="team-desc" className="text-sm text-zinc-400 block mb-1">
                Description
              </label>
              <Input
                id="team-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={createTeam.isPending}>
              {createTeam.isPending ? 'Creating...' : 'Create'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {teams.length === 0 && !showCreate ? (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl">
          <UsersIcon className="h-12 w-12 mx-auto text-zinc-600 mb-4" />
          <h2 className="text-lg font-medium text-zinc-300">No teams yet</h2>
          <p className="text-sm text-zinc-500 mt-1">Create your first team to manage permissions</p>
          <Button className="mt-4" onClick={() => setShowCreate(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/teams/${team.slug}`}
              className="group border border-zinc-800 rounded-xl p-5 hover:border-violet-500/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <UsersIcon className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold group-hover:text-violet-400 transition-colors">
                      {team.name}
                    </h3>
                    <p className="text-xs text-zinc-500">{team.slug}</p>
                  </div>
                </div>
                <ChevronRightIcon className="h-4 w-4 text-zinc-600 group-hover:text-violet-400 transition-colors" />
              </div>
              {team.description && (
                <p className="text-sm text-zinc-400 mt-3 line-clamp-2">{team.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
