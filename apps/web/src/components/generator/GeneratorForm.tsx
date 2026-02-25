'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  SparklesIcon,
  WandIcon,
  KeyIcon,
  ImageIcon,
  XIcon,
  ChevronDownIcon,
  CpuIcon,
} from 'lucide-react';
import { useGeneration } from '@/hooks/use-generation';
import { useApiKeyForProvider, useHasApiKey, useAIKeyStore } from '@/stores/ai-keys';
import { decryptApiKey, type AIProvider } from '@/lib/encryption';
import { PROVIDER_MODELS } from '@/lib/services/generation';
import { isFeatureEnabled } from '@/lib/features/flags';
import GenerationProgress from './GenerationProgress';
import { DesignContext, DESIGN_DEFAULTS, type DesignContextValues } from './DesignContext';
import { UpgradePrompt } from '@/components/billing/UpgradePrompt';
import { useSubscription } from '@/hooks/use-subscription';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const generatorSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(1000),
  componentName: z.string().min(1, 'Component name is required').max(50),
  componentLibrary: z.enum(['tailwind', 'mui', 'chakra', 'shadcn', 'none']).optional(),
  style: z.enum(['modern', 'minimal', 'colorful']).optional(),
  typescript: z.boolean(),
});

type GeneratorFormData = z.infer<typeof generatorSchema>;

interface ImageState {
  base64: string;
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp';
  name: string;
  previewUrl: string;
}

interface GeneratorFormProps {
  projectId: string;
  framework: string;
  onGenerate: (code: string, settings: any) => void;
  onGenerating: () => void;
  isGenerating: boolean;
  initialDescription?: string;
}

const PROVIDER_LABELS: Record<AIProvider, string> = {
  google: 'Google Gemini',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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
  const hasProviderKey = useHasApiKey(selectedProvider);

  const models = useMemo(() => PROVIDER_MODELS[selectedProvider] || [], [selectedProvider]);

  const handleProviderChange = (provider: AIProvider) => {
    setSelectedProvider(provider);
    const firstModel = PROVIDER_MODELS[provider]?.[0];
    if (firstModel) {
      setSelectedModel(firstModel.id);
    }
  };

  const [currentSettings, setCurrentSettings] = useState({
    componentName: '',
    componentLibrary: '',
    style: '',
    typescript: false,
  });
  const designContextEnabled = isFeatureEnabled('ENABLE_DESIGN_CONTEXT');
  const [designContext, setDesignContext] = useState<DesignContextValues>(DESIGN_DEFAULTS);
  const [image, setImage] = useState<ImageState | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const processFile = useCallback(async (file: File) => {
    setImageError(null);

    if (!ACCEPTED_TYPES.includes(file.type as any)) {
      setImageError('Only PNG, JPEG, and WebP images are supported.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setImageError('Image must be under 5MB.');
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setImage({
        base64,
        mimeType: file.type as ImageState['mimeType'],
        name: file.name,
        previewUrl: URL.createObjectURL(file),
      });
    } catch {
      setImageError('Failed to process image.');
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const removeImage = useCallback(() => {
    if (image?.previewUrl) URL.revokeObjectURL(image.previewUrl);
    setImage(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [image]);

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
        ...(image && {
          imageBase64: image.base64,
          imageMimeType: image.mimeType,
        }),
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

  const needsApiKey = selectedProvider !== 'google' && !hasProviderKey;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {generation.error &&
            (generation.error.toLowerCase().includes('quota') ||
            generation.error.toLowerCase().includes('limit reached') ? (
              <UpgradePrompt resource="Generation" />
            ) : (
              <div className="rounded-md border border-red-800 bg-red-900/20 px-4 py-3 text-sm text-red-400">
                {generation.error}
              </div>
            ))}

          {isQuotaExceeded && !generation.error && <UpgradePrompt resource="Generation" />}

          {multiLlmEnabled && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                <CpuIcon className="h-4 w-4" />
                AI Provider
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(PROVIDER_LABELS) as AIProvider[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleProviderChange(p)}
                    className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                      selectedProvider === p
                        ? 'border-brand bg-brand/10 text-brand-light'
                        : 'border-surface-3 text-text-secondary hover:border-surface-3 hover:text-text-primary'
                    }`}
                  >
                    {PROVIDER_LABELS[p]}
                  </button>
                ))}
              </div>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 border border-surface-3 rounded-md text-sm focus:ring-brand focus:border-brand"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-md border">
            <KeyIcon className="h-3.5 w-3.5" />
            {hasProviderKey ? (
              <span className="text-green-700">
                Using your {PROVIDER_LABELS[selectedProvider]} API key
              </span>
            ) : selectedProvider === 'google' ? (
              <span className="text-amber-700">
                Using server API key &mdash;{' '}
                <a href="/ai-keys" className="underline">
                  add your own
                </a>
              </span>
            ) : (
              <span className="text-red-700">
                API key required &mdash;{' '}
                <a href="/ai-keys" className="underline">
                  add your {PROVIDER_LABELS[selectedProvider]} key
                </a>
              </span>
            )}
          </div>

          {usage && usage.generations_limit !== -1 && (
            <div className="flex items-center justify-between text-xs px-3 py-2 rounded-md border border-surface-3">
              <span className="text-text-secondary">
                {usage.generations_count} / {usage.generations_limit} generations this month
              </span>
              {usage.generations_count >= usage.generations_limit * 0.8 &&
                usage.generations_count < usage.generations_limit && (
                  <span className="text-yellow-400 font-medium">Nearing limit</span>
                )}
            </div>
          )}

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
              className="w-full px-3 py-2 border border-surface-3 rounded-md focus:ring-brand focus:border-brand"
              placeholder="MyButton"
            />
            {errors.componentName && (
              <p className="mt-1 text-sm text-red-600">{errors.componentName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-text-primary mb-2">
              Describe Your Component *
            </label>
            <textarea
              {...register('prompt')}
              id="prompt"
              rows={6}
              className="w-full px-3 py-2 border border-surface-3 rounded-md focus:ring-brand focus:border-brand"
              placeholder="Create a modern button component with primary and secondary variants, hover effects, and loading state..."
            />
            {errors.prompt && <p className="mt-1 text-sm text-red-600">{errors.prompt.message}</p>}
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowImageUpload(!showImageUpload)}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
            >
              <ImageIcon className="h-4 w-4" />
              <span>Reference Image</span>
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform ${showImageUpload ? 'rotate-180' : ''}`}
              />
              {image && <span className="text-xs text-green-600 font-medium ml-1">attached</span>}
            </button>

            {showImageUpload && (
              <div className="mt-3">
                {image ? (
                  <div className="relative rounded-lg border border-surface-3 overflow-hidden">
                    <img
                      src={image.previewUrl}
                      alt="Reference"
                      className="w-full max-h-48 object-contain bg-surface-0"
                    />
                    <div className="flex items-center justify-between px-3 py-2 bg-surface-0 border-t border-surface-3">
                      <span className="text-xs text-text-secondary truncate">{image.name}</span>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="text-text-muted hover:text-red-500"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed cursor-pointer transition-colors w-full ${
                      isDragOver
                        ? 'border-blue-400 bg-brand/10'
                        : 'border-surface-3 hover:border-surface-3'
                    }`}
                  >
                    <ImageIcon className="h-8 w-8 text-text-muted" />
                    <p className="text-sm text-text-secondary">
                      Drop a screenshot here, or <span className="text-brand">browse</span>
                    </p>
                    <p className="text-xs text-text-muted">PNG, JPEG, or WebP up to 5MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </button>
                )}
                {imageError && <p className="mt-2 text-sm text-red-600">{imageError}</p>}
              </div>
            )}
          </div>

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
