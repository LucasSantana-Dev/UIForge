'use client';

import { useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type Project = Database['public']['Tables']['projects']['Row'];

export function useRealtimeProjects() {
  const queryClient = useQueryClient();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
          } else if (payload.eventType === 'UPDATE') {
            const updatedProject = payload.new as Project;
            queryClient.setQueryData(['projects', updatedProject.id], updatedProject);
            queryClient.invalidateQueries({ queryKey: ['projects'] });
          } else if (payload.eventType === 'DELETE') {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, supabase]);
}
