'use client';

import { useState } from 'react';
import { useCreateComponent } from '@/hooks/use-components';
import { CheckIcon, FolderIcon, SaveIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SaveToProjectProps {
  projectId: string;
  code: string;
  componentName: string;
  framework: string;
  componentLibrary?: string;
  style?: string;
  typescript: boolean;
  onSave?: (componentId: string) => void;
}

export default function SaveToProject({
  projectId,
  code,
  componentName,
  framework,
  componentLibrary,
  style,
  typescript,
  onSave,
}: SaveToProjectProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [savedComponentId, setSavedComponentId] = useState<string | null>(null);
  const createComponent = useCreateComponent();

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const result = await createComponent.mutateAsync({
        project_id: projectId,
        name: componentName,
        description: `Generated ${framework} component with ${componentLibrary || 'no'} library`,
        component_type: 'generated',
        framework,
        code_content: code,
        props: {
          componentLibrary,
          style,
          typescript,
        },
      });

      setSavedComponentId(result.id);
      onSave?.(result.id);
    } catch (error) {
      console.error('Failed to save component:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="border-t border-surface-3 p-4 bg-surface-0">
      <div className="flex items-center justify-between">
        <div className="text-sm text-text-secondary">
          <FolderIcon className="h-4 w-4 mr-2" />
          Save to project
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || !!savedComponentId}
          className={cn(
            'inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
            isSaving || savedComponentId
              ? 'bg-green-600 text-white cursor-not-allowed'
              : 'bg-brand text-white hover:bg-brand-light'
          )}
        >
          {isSaving ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
              Saving...
            </>
          ) : savedComponentId ? (
            <>
              <CheckIcon className="h-4 w-4 mr-2" />
              Saved
            </>
          ) : (
            <>
              <SaveIcon className="h-4 w-4 mr-2" />
              Save Component
            </>
          )}
        </button>
      </div>

      {savedComponentId && (
        <div className="mt-2 text-xs text-green-600">Component saved successfully!</div>
      )}
    </div>
  );
}
