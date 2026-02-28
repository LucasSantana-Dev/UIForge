'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SparklesIcon, WandIcon } from 'lucide-react';
import { useGeneration } from '@/hooks/use-generation';
import { useApiKeyForProvider, useAIKeyStore } from '@/stores/ai-keys';
import { decryptApiKey, type AIProvider } from '@/lib/encryption';
import { PROVIDER_MODELS } from '@/lib/services/generation';
import { isFeatureEnabled } from '@/lib/features/flags';
import GenerationProgress from './GenerationProgress';
import { DesignContext, DESIGN_DEFAULTS, type DesignContextValues } from './DesignContext';
import { PromptAutocomplete } from './PromptAutocomplete';
import { useSubscription } from '@/hooks/use-subscription';
import { ImageUpload, type ImageState } from './ImageUpload';
import { ProviderSelector } from './ProviderSelector';
import { QuotaGuard } from './QuotaGuard';
import RefinementInput from './RefinementInput';

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
  onReset?: () => void;
}

export default function GeneratorForm({
  projectId,
  framework,
  onGenerate,
  onGenerating,
  isGenerating,
  initialDescription,
  onReset,
}: GeneratorFormProps) {
  const generation = useGeneration(projectId);
  const encryptionKey = useAIKeyStore((s) => s.encryptionKey);
  const { usage } = useSubscription();
  const isQuotaExceeded =
    usage != null &&
    usage.generations_limit !== -1 &&
    usage.generations_count >= usage.generations_limit;

  const multiLlmEnabled = isFeatureEnabled('ENABLE_MULTI_LLM');
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('google');
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
  const providerKey = useApiKeyForProvider(selectedProvider);

  const handleProviderChange = (provider: AIProvider) => {
    setSelectedProvider(provider);
    const firstModel = PROVIDER_MODELS[provider]?.[0];
    if (firstModel) setSelectedModel(firstModel.id);
  };

  const [currentSettings, setCurrentSettings] = useState({
    componentName: '',
    componentLibrary: '',
    style: '',
    typescript: false,
  });
  const designContextEnabled = isFeatureEnabled('ENABLE_DESIGN_CONTEXT');
  const conversationEnabled = isFeatureEnabled('ENABLE_CONVERSATION_MODE');
  const autocompleteEnabled = isFeatureEnabled('ENABLE_PROMPT_AUTOCOMPLETE');
  const [designContext, setDesignContext] = useState<DesignContextValues>(DESIGN_DEFAULTS);
  const [promptValue, setPromptValue] = useState(initialDescription || '');
  const [image, setImage] = useState<ImageState | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
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
    if (initialDescription) setValue('prompt', initialDescription);
  }, [initialDescription, setValue]);

  const needsApiKey = selectedProvider !== 'google' && !providerKey;

  const onSubmit = async (data: GeneratorFormData) => {
    try {
      onGenerating();
      setCurrentSettings({
        componentName: data.componentName,
        componentLibrary: data.componentLibrary || 'none',
        style: data.style || 'modern',
        typescript: data.typescript,
      });

      let apiKey: string | undefined;
      if (providerKey && encryptionKey) {
        apiKey = decryptApiKey(providerKey.encryptedKey, encryptionKey);
      }

      await generation.startGeneration({
        framework: framework as 'react' | 'vue' | 'angular' | 'svelte',
        componentLibrary: data.componentLibrary || 'none',
        description: data.prompt,
        style: data.style,
        typescript: data.typescript,
        componentName: data.componentName,
        prompt: data.prompt,
        provider: selectedProvider,
        model: selectedModel,
        ...(image && { imageBase64: image.base64, imageMimeType: image.mimeType }),
        ...(apiKey && { userApiKey: apiKey }),
        ...(designContextEnabled && {
          colorMode: designContext.colorMode,
          primaryColor: designContext.primaryColor,
          secondaryColor: designContext.secondaryColor,
          accentColor: designContext.accentColor,
          animation: designContext.animation,
          spacing: designContext.spacing,
          borderRadius: designContext.borderRadius,
          typography: designContext.typography,
        }),
      });
    } catch {
      // Generation errors are handled by useGeneration hook
    }
  };

  useEffect(() => {
    if (generation.code && !generation.isGenerating && !generation.error) {
      onGenerate(generation.code, {
        ...currentSettings,
        qualityReport: generation.qualityReport,
        generationId: generation.generationId,
      });
    }
  }, [
    generation.code,
    generation.isGenerating,
    generation.error,
    generation.qualityReport,
    generation.generationId,
    onGenerate,
    currentSettings,
  ]);

  useEffect(() => {
    if (generation.isGenerating && !isGenerating) onGenerating();
  }, [generation.isGenerating, isGenerating, onGenerating]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <QuotaGuard error={generation.error} usage={usage} isQuotaExceeded={isQuotaExceeded} />

          <ProviderSelector
            selectedProvider={selectedProvider}
            selectedModel={selectedModel}
            onProviderChange={handleProviderChange}
            onModelChange={setSelectedModel}
            multiLlmEnabled={multiLlmEnabled}
          />

          <div>
            <label
              htmlFor="componentName"
              className="block text-sm font-medium text-text-primary mb-2"
            >
              Component Name *
            </label>
            <input
              {...register('componentName')}
              type="text"
              id="componentName"
              aria-describedby={errors.componentName ? 'componentName-error' : undefined}
              aria-invalid={!!errors.componentName}
              className="w-full px-3 py-2 border border-surface-3 rounded-md focus:ring-brand focus:border-brand"
              placeholder="MyButton"
            />
            {errors.componentName && (
              <p id="componentName-error" role="alert" className="mt-1 text-sm text-error">
                {errors.componentName.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-text-primary mb-2">
              Describe Your Component *
            </label>
            {autocompleteEnabled ? (
              <PromptAutocomplete
                id="prompt"
                value={promptValue}
                onChange={(val) => {
                  setPromptValue(val);
                  setValue('prompt', val, { shouldValidate: true });
                }}
                framework={framework}
                rows={6}
                className="w-full px-3 py-2 border border-surface-3 rounded-md focus:ring-brand focus:border-brand"
                placeholder="Create a modern button component with primary and secondary variants, hover effects, and loading state..."
              />
            ) : (
              <textarea
                {...register('prompt')}
                id="prompt"
                rows={6}
                aria-describedby={errors.prompt ? 'prompt-error' : undefined}
                aria-invalid={!!errors.prompt}
                className="w-full px-3 py-2 border border-surface-3 rounded-md focus:ring-brand focus:border-brand"
                placeholder="Create a modern button component with primary and secondary variants, hover effects, and loading state..."
              />
            )}
            {errors.prompt && (
              <p id="prompt-error" role="alert" className="mt-1 text-sm text-error">
                {errors.prompt.message}
              </p>
            )}
          </div>

          <ImageUpload image={image} onImageChange={setImage} />

          {designContextEnabled && (
            <DesignContext
              projectId={projectId}
              values={designContext}
              onChange={setDesignContext}
            />
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="componentLibrary"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Component Library
              </label>
              <select
                {...register('componentLibrary')}
                id="componentLibrary"
                className="w-full px-3 py-2 border border-surface-3 rounded-md focus:ring-brand focus:border-brand"
              >
                <option value="tailwind">Tailwind CSS</option>
                <option value="shadcn">shadcn/ui</option>
                <option value="mui">Material-UI</option>
                <option value="chakra">Chakra UI</option>
                <option value="none">None</option>
              </select>
            </div>
            <div>
              <label htmlFor="style" className="block text-sm font-medium text-text-primary mb-2">
                Design Style
              </label>
              <select
                {...register('style')}
                id="style"
                className="w-full px-3 py-2 border border-surface-3 rounded-md focus:ring-brand focus:border-brand"
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
                className="rounded border-surface-3 text-brand focus:ring-brand"
              />
              <span className="ml-2 text-sm text-text-primary">Use TypeScript</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={generation.isGenerating || isQuotaExceeded || needsApiKey}
            className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="border-t border-surface-3">
          <GenerationProgress
            isGenerating={generation.isGenerating}
            progress={generation.progress}
            events={generation.events}
            error={generation.error}
          />
        </div>
      )}


      {conversationEnabled &&
        generation.conversationTurn > 0 &&
        !generation.isGenerating &&
        generation.code && (
          <div className="border-t border-surface-3 p-4">
            <RefinementInput
              onRefine={(prompt) => {
                onGenerating();
                const data = getValues();
                generation.startRefinement(prompt, {
                  framework: framework as 'react' | 'vue' | 'angular' | 'svelte',
                  componentLibrary: data.componentLibrary,
                  description: data.prompt,
                  style: data.style,
                  typescript: data.typescript,
                  componentName: data.componentName,
                  prompt: data.prompt,
                });
              }}
              onNewGeneration={() => {
                generation.reset();
                onReset?.();
              }}
              isGenerating={generation.isGenerating}
              conversationTurn={generation.conversationTurn}
              maxTurns={10}
            />
          </div>
        )}

      <div className="border-t border-surface-3 p-4 bg-surface-0">
        <div className="text-xs text-text-secondary">
          <p className="font-medium mb-1">Tips:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Be specific about styling and behavior</li>
            <li>Mention any props or state needed</li>
            <li>Describe responsive behavior if needed</li>
            <li>Upload a screenshot to match an existing design</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
