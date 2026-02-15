'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SparklesIcon, WandIcon } from 'lucide-react';

const generatorSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(1000),
  componentName: z.string().min(1, 'Component name is required').max(50),
  includeStyles: z.boolean(),
  includeTests: z.boolean(),
});

type GeneratorFormData = z.infer<typeof generatorSchema>;

interface GeneratorFormProps {
  projectId: string;
  framework: string;
  onGenerate: (code: string) => void;
  onGenerating: () => void;
  isGenerating: boolean;
}

export default function GeneratorForm({
  projectId,
  framework,
  onGenerate,
  onGenerating,
  isGenerating,
}: GeneratorFormProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GeneratorFormData>({
    resolver: zodResolver(generatorSchema),
    defaultValues: {
      includeStyles: true,
      includeTests: false,
    },
  });

  const onSubmit = async (data: GeneratorFormData) => {
    try {
      setError(null);
      onGenerating();

      // TODO: Implement MCP client call
      // For now, generate a placeholder component
      const placeholderCode = generatePlaceholder(data.componentName, framework);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      onGenerate(placeholderCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate component');
      onGenerate('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="componentName" className="block text-sm font-medium text-gray-700 mb-2">
              Component Name *
            </label>
            <input
              {...register('componentName')}
              type="text"
              id="componentName"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="MyButton"
            />
            {errors.componentName && (
              <p className="mt-1 text-sm text-red-600">{errors.componentName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
              Describe Your Component *
            </label>
            <textarea
              {...register('prompt')}
              id="prompt"
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Create a modern button component with primary and secondary variants, hover effects, and loading state..."
            />
            {errors.prompt && (
              <p className="mt-1 text-sm text-red-600">{errors.prompt.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                {...register('includeStyles')}
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Include Tailwind styles</span>
            </label>

            <label className="flex items-center">
              <input
                {...register('includeTests')}
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Generate tests</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <WandIcon className="animate-spin h-5 w-5 mr-2" />
                Generating...
              </>
            ) : (
              <>
                <SparklesIcon className="h-5 w-5 mr-2" />
                Generate Component
              </>
            )}
          </button>
        </form>
      </div>

      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="text-xs text-gray-600">
          <p className="font-medium mb-1">Tips:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Be specific about styling and behavior</li>
            <li>Mention any props or state needed</li>
            <li>Describe responsive behavior if needed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function generatePlaceholder(componentName: string, framework: string): string {
  if (framework === 'react') {
    return `import React from 'react';

interface ${componentName}Props {
  children?: React.ReactNode;
  className?: string;
}

export default function ${componentName}({ children, className = '' }: ${componentName}Props) {
  return (
    <div className={\`\${className}\`}>
      {children || '${componentName} Component'}
    </div>
  );
}`;
  }

  return `// ${componentName} component for ${framework}`;
}
