'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useCreateProject } from '@/hooks/use-projects';

const schema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  framework: z.enum(['react', 'vue', 'angular', 'svelte']),
});

type FormData = z.infer<typeof schema>;

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (projectId: string) => void;
  defaultFramework?: string;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultFramework,
}: CreateProjectDialogProps) {
  const createProject = useCreateProject();
  const [error, setError] = useState<string | null>(null);

  const validFramework =
    defaultFramework && ['react', 'vue', 'angular', 'svelte'].includes(defaultFramework)
      ? (defaultFramework as FormData['framework'])
      : 'react';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { framework: validFramework },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      const project = await createProject.mutateAsync({
        name: data.name,
        description: null,
        framework: data.framework,
      });
      reset();
      onOpenChange(false);
      onSuccess(project.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-md">{error}</div>
          )}
          <div>
            <label htmlFor="cpd-name" className="block text-sm font-medium text-text-primary mb-1">
              Project Name
            </label>
            <input
              {...register('name')}
              id="cpd-name"
              type="text"
              className="w-full px-3 py-2 bg-surface-1 text-text-primary border border-surface-3 rounded-md focus:ring-brand focus:border-brand"
              placeholder="My Project"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label
              htmlFor="cpd-framework"
              className="block text-sm font-medium text-text-primary mb-1"
            >
              Framework
            </label>
            <select
              {...register('framework')}
              id="cpd-framework"
              className="w-full px-3 py-2 bg-surface-1 text-text-primary border border-surface-3 rounded-md focus:ring-brand focus:border-brand"
            >
              <option value="react">React</option>
              <option value="vue">Vue</option>
              <option value="angular">Angular</option>
              <option value="svelte">Svelte</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
