'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SparklesIcon, WandIcon, ChevronDownIcon, SettingsIcon, CpuIcon } from 'lucide-react';
import { useGeneration } from '@/hooks/use-generation';
import { useApiKeyForProvider, useAIKeyStore, useAIKeys } from '@/stores/ai-keys';
import { decryptApiKey, type AIProvider } from '@/lib/encryption';
import { PROVIDER_MODELS } from '@/lib/services/generation';
import { isFeatureEnabled } from '@/lib/features/flags';
import GenerationProgress from './GenerationProgress';
import { DesignContext, DESIGN_DEFAULTS, type DesignContextValues } from './DesignContext';
import { useThemeStore } from '@/stores/theme-store';
import { PromptAutocomplete } from './PromptAutocomplete';
import { useSubscription } from '@/hooks/use-subscription';
import { ImageUpload, type ImageState } from './ImageUpload';
import DesignAnalysisPanel from './DesignAnalysisPanel';
import type { DesignAnalysis } from '@/lib/services/image-analysis';
import { QuotaGuard } from './QuotaGuard';
import { SizaAICard } from './SizaAICard';
import { BYOKProviderGrid } from './BYOKProviderGrid';
import { SkillSelector } from '../skills/SkillSelector';
import { SkillBadge } from '../skills/SkillBadge';

type ProviderOption = AIProvider | 'siza';

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
  formRef?: React.RefObject<HTMLFormElement | null>;
}

function CollapsibleSection({
  title,
  icon: Icon,
  defaultOpen = false,
  badge,
  children,
}: {
  title: string;
  icon: React.ElementType;
  defaultOpen?: boolean;
  badge?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-surface-3 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-1 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
          {badge && (
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-brand/15 text-brand-light">
              {badge}
            </span>
          )}
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="px-3 pb-3 space-y-3">{children}</div>}
    </div>
  );
}

export default function GeneratorForm({
  projectId,
  framework,
  onGenerate,
  onGenerating,
  isGenerating,
  initialDescription,
  formRef,
}: GeneratorFormProps) {
  const generation = useGeneration(projectId);
  const encryptionKey = useAIKeyStore((s) => s.encryptionKey);
  const apiKeys = useAIKeys();
  const { usage } = useSubscription();
  const isQuotaExceeded =
    usage != null &&
    usage.generations_limit !== -1 &&
    usage.generations_count >= usage.generations_limit;

  const sizaAiEnabled = isFeatureEnabled('ENABLE_SIZA_AI');
  const skillsEnabled = isFeatureEnabled('ENABLE_SKILLS');
  const [selectedProvider, setSelectedProvider] = useState<ProviderOption>(
    sizaAiEnabled ? 'siza' : 'google'
  );
  const [selectedModel, setSelectedModel] = useState(
    sizaAiEnabled ? 'siza-auto' : 'gemini-2.5-flash'
  );
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [skillParams, setSkillParams] = useState<Record<string, Record<string, unknown>>>({});

  const realProvider: AIProvider = selectedProvider === 'siza' ? 'google' : selectedProvider;
  const providerKey = useApiKeyForProvider(realProvider);

  const handleBYOKProviderChange = (provider: AIProvider) => {
    setSelectedProvider(provider);
    const firstModel = PROVIDER_MODELS[provider]?.[0];
    if (firstModel) setSelectedModel(firstModel.id);
  };

  const handleSelectSiza = () => {
    setSelectedProvider('siza');
    setSelectedModel('siza-auto');
  };

  const [currentSettings, setCurrentSettings] = useState({
    componentName: '',
    componentLibrary: '',
    style: '',
    typescript: false,
  });
  const designContextEnabled = isFeatureEnabled('ENABLE_DESIGN_CONTEXT');
  const autocompleteEnabled = isFeatureEnabled('ENABLE_PROMPT_AUTOCOMPLETE');
  const [designContext, setDesignContext] = useState<DesignContextValues>(DESIGN_DEFAULTS);
  const activeTheme = useThemeStore((s) => s.getActiveTheme)(projectId);
  const [promptValue, setPromptValue] = useState(initialDescription || '');
  const [image, setImage] = useState<ImageState | null>(null);
  const designAnalysisEnabled = isFeatureEnabled('ENABLE_DESIGN_ANALYSIS');

  const handleApplyAnalysis = (analysis: DesignAnalysis) => {
    if (analysis.colors.length >= 1) {
      setDesignContext((prev) => ({
        ...prev,
        primaryColor: analysis.colors[0],
        ...(analysis.colors[1] && { secondaryColor: analysis.colors[1] }),
        ...(analysis.colors[2] && { accentColor: analysis.colors[2] }),
      }));
    }
    if (analysis.suggestedPrompt) {
      setPromptValue(analysis.suggestedPrompt);
      setValue('prompt', analysis.suggestedPrompt, { shouldValidate: true });
    }
  };

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
    if (initialDescription) setValue('prompt', initialDescription);
  }, [initialDescription, setValue]);

  const needsApiKey = selectedProvider !== 'google' && selectedProvider !== 'siza' && !providerKey;

  const advancedCount = [
    image !== null,
    designContext !== DESIGN_DEFAULTS,
    selectedSkillIds.length > 0,
  ].filter(Boolean).length;

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
        projectId,
        provider: selectedProvider as AIProvider,
        model: selectedModel,
        ...(image && { imageBase64: image.base64, imageMimeType: image.mimeType }),
        ...(apiKey && { userApiKey: apiKey }),
        ...(skillsEnabled &&
          selectedSkillIds.length > 0 && {
            skillIds: selectedSkillIds,
            skillParams,
          }),
        ...(designContextEnabled && {
          colorMode: designContext.colorMode,
          primaryColor: designContext.primaryColor,
          secondaryColor: designContext.secondaryColor,
          accentColor: designContext.accentColor,
          animation: designContext.animation,
          spacing: designContext.spacing,
          borderRadius: designContext.borderRadius,
          typography: designContext.typography,
          ...(activeTheme?.brandMeta && {
            brandHeadingFont: activeTheme.brandMeta.headingFont,
            brandBodyFont: activeTheme.brandMeta.bodyFont,
            brandSemanticColors: activeTheme.brandMeta.semanticColors,
          }),
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
        generationId: generation.parentGenerationId,
        formOptions: {
          framework: framework as 'react' | 'vue' | 'angular' | 'svelte',
          componentLibrary: currentSettings.componentLibrary || 'none',
          description: promptValue,
          style: currentSettings.style,
          typescript: currentSettings.typescript,
          componentName: currentSettings.componentName,
          prompt: promptValue,
          provider: selectedProvider,
          model: selectedModel,
        },
      });
    }
  }, [
    generation.code,
    generation.isGenerating,
    generation.error,
    generation.qualityReport,
    generation.parentGenerationId,
    onGenerate,
    currentSettings,
    framework,
    promptValue,
    selectedProvider,
    selectedModel,
  ]);

  useEffect(() => {
    if (generation.isGenerating && !isGenerating) onGenerating();
  }, [generation.isGenerating, isGenerating, onGenerating]);

  const providerLabel =
    selectedProvider === 'siza'
      ? 'Siza AI'
      : PROVIDER_MODELS[selectedProvider as AIProvider]?.[0]
        ? selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)
        : selectedProvider;

  return (
    <div className="flex flex-col h-full">
      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col flex-1 overflow-y-auto p-4 space-y-3"
      >
        <QuotaGuard error={generation.error} usage={usage} isQuotaExceeded={isQuotaExceeded} />

        <div>
          <label
            htmlFor="componentName"
            className="block text-xs font-medium text-text-secondary mb-1"
          >
            Component Name
          </label>
          <input
            {...register('componentName')}
            type="text"
            id="componentName"
            aria-describedby={errors.componentName ? 'componentName-error' : undefined}
            aria-invalid={!!errors.componentName}
            className="w-full px-3 py-2 text-sm bg-surface-1 text-text-primary border border-surface-3 rounded-md focus:ring-brand focus:border-brand"
            placeholder="MyButton"
          />
          {errors.componentName && (
            <p id="componentName-error" role="alert" className="mt-1 text-xs text-error">
              {errors.componentName.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="prompt" className="block text-xs font-medium text-text-secondary mb-1">
            Describe Your Component
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
              rows={4}
              className="w-full px-3 py-2 text-sm bg-surface-1 text-text-primary border border-surface-3 rounded-md focus:ring-brand focus:border-brand"
              placeholder="A modern button with primary/secondary variants, hover effects, and loading state..."
            />
          ) : (
            <textarea
              {...register('prompt')}
              id="prompt"
              rows={4}
              aria-describedby={errors.prompt ? 'prompt-error' : undefined}
              aria-invalid={!!errors.prompt}
              className="w-full px-3 py-2 text-sm bg-surface-1 text-text-primary border border-surface-3 rounded-md focus:ring-brand focus:border-brand"
              placeholder="A modern button with primary/secondary variants, hover effects, and loading state..."
            />
          )}
          {errors.prompt && (
            <p id="prompt-error" role="alert" className="mt-1 text-xs text-error">
              {errors.prompt.message}
            </p>
          )}
        </div>

        <CollapsibleSection title="AI Provider" icon={CpuIcon} badge={providerLabel}>
          {sizaAiEnabled && (
            <SizaAICard
              selected={selectedProvider === 'siza'}
              onSelect={handleSelectSiza}
              generationsUsed={usage?.generations_count ?? 0}
              generationsLimit={usage?.generations_limit ?? 50}
            />
          )}
          <BYOKProviderGrid
            selectedProvider={selectedProvider !== 'siza' ? selectedProvider : null}
            selectedModel={selectedModel}
            onProviderChange={handleBYOKProviderChange}
            onModelChange={setSelectedModel}
            hasKey={(p) => apiKeys.some((k) => k.provider === p)}
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="Advanced"
          icon={SettingsIcon}
          badge={advancedCount > 0 ? `${advancedCount}` : undefined}
        >
          <div>
            <label
              htmlFor="componentLibrary"
              className="block text-xs font-medium text-text-secondary mb-1"
            >
              Component Library
            </label>
            <select
              {...register('componentLibrary')}
              id="componentLibrary"
              className="w-full px-3 py-2 text-sm bg-surface-1 text-text-primary border border-surface-3 rounded-md focus:ring-brand focus:border-brand"
            >
              <option value="tailwind">Tailwind CSS</option>
              <option value="shadcn">shadcn/ui</option>
              <option value="mui">Material-UI</option>
              <option value="chakra">Chakra UI</option>
              <option value="none">None</option>
            </select>
          </div>

          <div>
            <label htmlFor="style" className="block text-xs font-medium text-text-secondary mb-1">
              Design Style
            </label>
            <select
              {...register('style')}
              id="style"
              className="w-full px-3 py-2 text-sm bg-surface-1 text-text-primary border border-surface-3 rounded-md focus:ring-brand focus:border-brand"
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

          <ImageUpload image={image} onImageChange={setImage} />

          {designAnalysisEnabled && image && (
            <DesignAnalysisPanel
              imageBase64={image.base64}
              imageMimeType={image.mimeType}
              onApply={handleApplyAnalysis}
            />
          )}

          {designContextEnabled && (
            <DesignContext
              projectId={projectId}
              values={designContext}
              onChange={setDesignContext}
            />
          )}

          {skillsEnabled && (
            <SkillSelector
              selectedSkillIds={selectedSkillIds}
              onSelectedChange={setSelectedSkillIds}
              skillParams={skillParams}
              onParamsChange={setSkillParams}
            />
          )}
        </CollapsibleSection>

        <button
          type="submit"
          disabled={generation.isGenerating || isQuotaExceeded || needsApiKey}
          title="Generate component (⌘↵)"
          className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {generation.isGenerating ? (
            <>
              <WandIcon className="animate-spin h-4 w-4 mr-2" />
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="h-4 w-4 mr-2" />
              Generate
              {selectedSkillIds.length > 0 && <SkillBadge count={selectedSkillIds.length} />}
            </>
          )}
        </button>

        {(generation.isGenerating || generation.progress > 0 || generation.error) && (
          <GenerationProgress
            isGenerating={generation.isGenerating}
            progress={generation.progress}
            events={generation.events}
            error={generation.error}
          />
        )}
      </form>
    </div>
  );
}
