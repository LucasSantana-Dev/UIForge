'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SparklesIcon, WandIcon, KeyIcon } from 'lucide-react';
import { useGeneration } from '@/hooks/use-generation';
import { useApiKeyForProvider, useHasApiKey, useAIKeyStore } from '@/stores/ai-keys';
import { decryptApiKey } from '@/lib/encryption';
import GenerationProgress from './GenerationProgress';

const generatorSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(1000),
  componentName: z.string().min(1, 'Component name is required').max(50),
  componentLibrary: z.enum(['tailwind', 'mui', 'chakra', 'shadcn', 'none']).optional(),
  style: z.enum(['modern', 'minimal', 'colorful']).optional(),
  typescript: z.boolean(),
});

type GeneratorFormData = z.infer<typeof generatorSchema>;

interface GeneratorFormProps {
  projectId: string;
  framework: string;
  onGenerate: (code: string, settings: any) => void;
  onGenerating: () => void;
  isGenerating: boolean;
  initialDescription?: string;
}

export default function GeneratorForm({
  projectId,
  framework,
  onGenerate,
  onGenerating,
  isGenerating,
  initialDescription,
}: GeneratorFormProps) {
  const generation = useGeneration(projectId);
  const googleKey = useApiKeyForProvider('google');
  const hasGoogleKey = useHasApiKey('google');
  const encryptionKey = useAIKeyStore((s) => s.encryptionKey);
  const [currentSettings, setCurrentSettings] = useState({
    componentName: '',
    componentLibrary: '',
    style: '',
    typescript: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<GeneratorFormData>({
    resolver: zodResolver(generatorSchema),
    defaultValues: {
      componentName: '',
      prompt: initialDescription || '',
      componentLibrary: framework === 'react' ? 'shadcn' : 'tailwind',
      style: 'modern',
      typescript: true,
    },
  });

  useEffect(() => {
    if (initialDescription) {
      setValue('prompt', initialDescription);
    }
  }, [initialDescription, setValue]);

  const onSubmit = async (data: GeneratorFormData) => {
    try {
      onGenerating();

      setCurrentSettings({
        componentName: data.componentName,
        componentLibrary: data.componentLibrary || 'none',
        style: data.style || 'modern',
        typescript: data.typescript,
      });

      await generation.startGeneration({
        framework: framework as 'react' | 'vue' | 'angular' | 'svelte',
        componentLibrary: data.componentLibrary || 'none',
        description: data.prompt,
        style: data.style,
        typescript: data.typescript,
        componentName: data.componentName,
        prompt: data.prompt,
        ...(googleKey &&
          encryptionKey && {
            userApiKey: decryptApiKey(googleKey.encryptedKey, encryptionKey),
          }),
      });
    } catch (err) {
      console.error('Generation failed:', err);
    }
  };

  useEffect(() => {
    if (generation.code && !generation.isGenerating && !generation.error) {
      onGenerate(generation.code, currentSettings);
    }
  }, [generation.code, generation.isGenerating, generation.error, onGenerate, currentSettings]);

  useEffect(() => {
    if (generation.isGenerating && !isGenerating) {
      onGenerating();
    }
  }, [generation.isGenerating, isGenerating, onGenerating]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {generation.error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {generation.error}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-md border">
            <KeyIcon className="h-3.5 w-3.5" />
            {hasGoogleKey ? (
              <span className="text-green-700">Using your Gemini API key</span>
            ) : (
              <span className="text-amber-700">
                Using server API key &mdash;{' '}
                <a href="/ai-keys" className="underline">
                  add your own
                </a>
              </span>
            )}
          </div>

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
            {errors.prompt && <p className="mt-1 text-sm text-red-600">{errors.prompt.message}</p>}
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="componentLibrary"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Component Library
              </label>
              <select
                {...register('componentLibrary')}
                id="componentLibrary"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="tailwind">Tailwind CSS</option>
                <option value="shadcn">shadcn/ui</option>
                <option value="mui">Material-UI</option>
                <option value="chakra">Chakra UI</option>
                <option value="none">None</option>
              </select>
            </div>

            <div>
              <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-2">
                Design Style
              </label>
              <select
                {...register('style')}
                id="style"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="modern">Modern</option>
                <option value="minimal">Minimal</option>
                <option value="colorful">Colorful</option>
              </select>
            </div>

            <label className="flex items-center">
              <input
                {...register('typescript')}
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Use TypeScript</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={generation.isGenerating}
            className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generation.isGenerating ? (
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

      {(generation.isGenerating || generation.progress > 0 || generation.error) && (
        <div className="border-t border-gray-200">
          <GenerationProgress
            isGenerating={generation.isGenerating}
            progress={generation.progress}
            events={generation.events}
            error={generation.error}
          />
        </div>
      )}

      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="text-xs text-gray-600">
          <p className="font-medium mb-1">Tips:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Be specific about styling and behavior</li>
            <li>Mention any props or state needed</li>
            <li>Describe responsive behavior if needed</li>
            <li>Choose component library for better results</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
