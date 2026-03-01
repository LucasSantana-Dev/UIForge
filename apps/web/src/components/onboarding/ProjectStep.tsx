'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@siza/ui';
import { Input } from '@siza/ui';
import { Label } from '@siza/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@siza/ui';
import { useCreateProject } from '@/hooks/use-projects';

const schema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  framework: z.enum(['react', 'vue', 'svelte', 'angular']),
});

type FormData = z.infer<typeof schema>;

interface ProjectStepProps {
  onNext: (data: { project: { id: string; name: string; framework: string } }) => void;
  onSkip: () => void;
}

const frameworks = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'angular', label: 'Angular' },
];

export function ProjectStep({ onNext, onSkip }: ProjectStepProps) {
  const createProject = useCreateProject();
  const [error, setError] = useState<string | null>(null);
  const [framework, setFramework] = useState<FormData['framework']>('react');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: 'My First Project',
      framework: 'react',
    },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const project = await createProject.mutateAsync({
        name: data.name,
        framework: data.framework,
      });
      onNext({
        project: {
          id: project.id,
          name: project.name,
          framework: project.framework,
        },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create project');
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Create your first project</h1>
        <p className="text-white/60">Projects organize your generated components</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Project name</Label>
          <Input id="name" {...register('name')} placeholder="My First Project" />
          {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="framework">Framework</Label>
          <Select
            value={framework}
            onValueChange={(v) => {
              const fw = v as FormData['framework'];
              setFramework(fw);
              setValue('framework', fw);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select framework" />
            </SelectTrigger>
            <SelectContent>
              {frameworks.map((fw) => (
                <SelectItem key={fw.value} value={fw.value}>
                  {fw.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-center gap-3">
          <Button type="button" variant="ghost" onClick={onSkip} className="text-white/40">
            Skip
          </Button>
          <Button type="submit" disabled={createProject.isPending}>
            {createProject.isPending ? 'Creating...' : 'Create project'}
          </Button>
        </div>
      </form>
    </div>
  );
}
