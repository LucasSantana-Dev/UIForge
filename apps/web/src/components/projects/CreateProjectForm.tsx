'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useCreateProject, useUpdateProject } from '@/hooks/use-projects';
import { useProjectThumbnail } from '@/hooks/use-project-thumbnail';
import { useState } from 'react';
import { UploadIcon } from 'lucide-react';

const projectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  description: z.string().max(500).optional(),
  framework: z.enum(['react', 'vue', 'angular', 'svelte']),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function CreateProjectForm() {
  const router = useRouter();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const { uploadThumbnail, uploading: uploadingThumbnail } = useProjectThumbnail();
  const [error, setError] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      framework: 'react',
    },
  });

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      setError(null);
      const project = await createProject.mutateAsync({
        name: data.name,
        description: data.description || null,
        framework: data.framework,
      });

      if (thumbnailFile) {
        const thumbnailUrl = await uploadThumbnail(project.id, thumbnailFile);
        if (thumbnailUrl) {
          await updateProject.mutateAsync({
            id: project.id,
            thumbnail_url: thumbnailUrl,
          });
        }
      }

      router.push(`/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
          Project Name *
        </label>
        <input
          {...register('name')}
          type="text"
          id="name"
          className="w-full px-3 py-2 border border-surface-3 rounded-md focus:ring-brand focus:border-brand"
          placeholder="My Awesome Project"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
          Description
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={3}
          className="w-full px-3 py-2 border border-surface-3 rounded-md focus:ring-brand focus:border-brand"
          placeholder="A brief description of your project..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="framework" className="block text-sm font-medium text-text-primary mb-2">
          Framework *
        </label>
        <select
          {...register('framework')}
          id="framework"
          className="w-full px-3 py-2 border border-surface-3 rounded-md focus:ring-brand focus:border-brand"
        >
          <option value="react">React</option>
          <option value="vue">Vue</option>
          <option value="angular">Angular</option>
          <option value="svelte">Svelte</option>
        </select>
        {errors.framework && (
          <p className="mt-1 text-sm text-red-600">{errors.framework.message}</p>
        )}
      </div>

      <div>
        <p className="block text-sm font-medium text-text-primary mb-2">Thumbnail (optional)</p>
        <div className="mt-1 flex items-center space-x-4">
          {thumbnailPreview ? (
            <div className="relative w-32 h-32">
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="w-full h-full object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => {
                  setThumbnailFile(null);
                  setThumbnailPreview(null);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                aria-label="Remove thumbnail"
              >
                ×
              </button>
            </div>
          ) : (
            <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-surface-3 rounded-md cursor-pointer hover:border-brand/50">
              <UploadIcon className="h-8 w-8 text-text-muted" />
              <span className="mt-2 text-xs text-text-secondary">Upload</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-surface-3 rounded-md text-sm font-medium text-text-primary hover:bg-surface-0"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || uploadingThumbnail}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting || uploadingThumbnail ? 'Creating...' : 'Create Project'}
        </button>
      </div>
    </form>
  );
}
