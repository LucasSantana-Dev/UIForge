'use client';

import { useState, useCallback, Suspense, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import GeneratorForm from '@/components/generator/GeneratorForm';
import CodeEditor from '@/components/generator/CodeEditor';
import LivePreview from '@/components/generator/LivePreview';
import RefinementInput from '@/components/generator/RefinementInput';
import GenerationHistory from '@/components/generator/GenerationHistory';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@siza/ui';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  ArrowLeft,
  Code,
  Eye,
  Github,
  Loader2,
  Check,
  AlertTriangle,
  Save,
  HistoryIcon,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import FeedbackPanel from '@/components/generator/FeedbackPanel';
import { QualityBadge } from '@/components/generator/QualityBadge';
import type { QualityReport } from '@/lib/quality/gates';
import { SaveTemplateDialog } from '@/components/generator/SaveTemplateDialog';
import { isFeatureEnabled } from '@/lib/features/flags';
import { useGeneration } from '@/hooks/use-generation';
import { useGeneratePageShortcuts } from '@/hooks/use-generate-page-shortcuts';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { FolderPlus } from 'lucide-react';

type OutputTab = 'preview' | 'code';

function GeneratePageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get('projectId');
  const framework = searchParams.get('framework') || 'react';

  const template = searchParams.get('template');
  const description = searchParams.get('description');

  const generation = useGeneration(projectId ?? undefined);
  const conversationEnabled = isFeatureEnabled('ENABLE_CONVERSATION_MODE');

  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTemplateMode, setIsTemplateMode] = useState(false);
  const [componentName, setComponentName] = useState('');
  const [pushState, setPushState] = useState<'idle' | 'pushing' | 'success' | 'error' | 'no-repo'>(
    'idle'
  );
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const [pushError, setPushError] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [ragEnriched, setRagEnriched] = useState(false);
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [lastFormOptions, setLastFormOptions] = useState<any>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [activeTab, setActiveTab] = useState<OutputTab>('preview');
  const [configCollapsed, setConfigCollapsed] = useState(false);

  const githubEnabled = isFeatureEnabled('ENABLE_GITHUB_APP');

  useGeneratePageShortcuts({
    formRef,
    onSaveTemplate: () => setSaveDialogOpen(true),
    saveDialogOpen,
    onCloseModals: () => setSaveDialogOpen(false),
    promptInputId: 'prompt',
  });

  useEffect(() => {
    if (!template) return;

    async function loadTemplate() {
      try {
        const res = await fetch(`/api/templates/${template}`);
        if (res.ok) {
          const json = await res.json();
          const t = json.data?.template;
          const firstFile = t?.code?.files?.[0];
          if (firstFile?.content) {
            setGeneratedCode(firstFile.content);
            setIsTemplateMode(true);
            return;
          }
        }
      } catch {
        // fall through
      }

      if (description) {
        setGeneratedCode(
          `import React from 'react';
export default function TemplateComponent() {
  return <div className="p-4"><h2>${template}</h2><p>${description}</p></div>;
}`
        );
        setIsTemplateMode(true);
      }
    }

    loadTemplate();
  }, [template, description]);

  const handleGenerate = useCallback(
    async (
      code: string,
      settings?: {
        componentName?: string;
        generationId?: string;
        ragEnriched?: boolean;
        qualityReport?: QualityReport | null;
        formOptions?: any;
      }
    ) => {
      setGeneratedCode(code);
      setIsGenerating(false);
      setIsTemplateMode(false);
      setPushState('idle');
      setPrUrl(null);
      setPushError(null);
      if (settings?.componentName) setComponentName(settings.componentName);
      setGenerationId(settings?.generationId ?? null);
      setRagEnriched(settings?.ragEnriched ?? false);
      setQualityReport(settings?.qualityReport ?? null);
      if (settings?.formOptions) setLastFormOptions(settings.formOptions);
      setActiveTab('code');
    },
    []
  );

  const handleRefine = async (refinementPrompt: string) => {
    if (!lastFormOptions) return;
    setIsGenerating(true);
    try {
      const result = await generation.startGeneration({
        ...lastFormOptions,
        parentGenerationId: generationId ?? undefined,
        previousCode: generatedCode,
        refinementPrompt,
      });
      if (result) {
        setGeneratedCode(result.code);
        setGenerationId(result.generationId);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewGeneration = useCallback(() => {
    generation.reset();
    setGeneratedCode('');
    setGenerationId(null);
    setQualityReport(null);
  }, [generation]);

  const handleSelectFromHistory = useCallback(
    (code: string, id: string) => {
      setGeneratedCode(code);
      setGenerationId(id);
      generation.reset();
      setActiveTab('code');
    },
    [generation]
  );

  const handleForkFromHistory = useCallback(
    (code: string, _prompt: string) => {
      setGeneratedCode(code);
      generation.reset();
    },
    [generation]
  );

  const handlePushToGitHub = async () => {
    if (!generatedCode || !projectId) return;
    setPushState('pushing');
    setPushError(null);

    try {
      const res = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          componentName: componentName || 'GeneratedComponent',
          code: generatedCode,
          prompt: description || '',
          model: 'gemini-2.5-flash',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          setPushState('no-repo');
          setPushError('No GitHub repo linked.');
        } else {
          setPushState('error');
          setPushError(data.error || 'Failed to push');
        }
        return;
      }

      setPrUrl(data.pr.htmlUrl);
      setPushState('success');
    } catch {
      setPushState('error');
      setPushError('Network error');
    }
  };

  const handleGenerating = () => setIsGenerating(true);

  const handleCodeChange = (code: string) => {
    setGeneratedCode(code);
    setIsTemplateMode(false);
  };

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleProjectCreated = (newProjectId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('projectId', newProjectId);
    router.push('/generate?' + params.toString());
  };

  if (!projectId) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="p-8 max-w-md text-center border-surface-3">
          <div className="mx-auto w-14 h-14 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
            <FolderPlus className="w-7 h-7 text-violet-400" />
          </div>
          <h2 className="text-lg font-semibold font-display text-text-primary mb-2">
            No Project Selected
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            Create a project to start generating components.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-violet-600 hover:bg-violet-500 shadow-[0_0_20px_rgba(124,58,237,0.15)]"
            >
              Create Project
            </Button>
            <Button variant="outline" onClick={() => router.push('/projects')}>
              Browse Projects
            </Button>
          </div>
          <CreateProjectDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            onSuccess={handleProjectCreated}
            defaultFramework={framework}
          />
        </Card>
      </div>
    );
  }

  const tabCls = (tab: OutputTab) =>
    `flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
      activeTab === tab
        ? 'border-violet-500 text-violet-300'
        : 'border-transparent text-text-secondary hover:text-text-primary'
    }`;

  return (
    <div className="h-full flex flex-col -m-4 sm:-m-6 lg:-m-8">
      {/* Workspace Header */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-surface-3 bg-surface-0 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setConfigCollapsed(!configCollapsed)}
            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
            aria-label={configCollapsed ? 'Show config panel' : 'Hide config panel'}
          >
            {configCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-text-primary">Generate</span>
          </div>
          {isTemplateMode && (
            <Badge
              variant="secondary"
              className="bg-violet-500/15 text-violet-300 border-0 text-xs"
            >
              Template: {template}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isTemplateMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/templates')}
              className="text-xs"
            >
              <ArrowLeft className="w-3 h-3 mr-1" />
              Templates
            </Button>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-text-secondary hover:text-text-primary"
              >
                <HistoryIcon className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[380px] sm:w-[420px] p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Generation History</SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto h-[calc(100%-60px)]">
                <GenerationHistory
                  projectId={projectId}
                  onSelectGeneration={handleSelectFromHistory}
                  onForkGeneration={handleForkFromHistory}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Workspace Body */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Config Panel */}
        <div
          className={`flex-shrink-0 border-r border-surface-3 bg-surface-0 overflow-y-auto transition-[width] duration-200 ease-siza ${
            configCollapsed ? 'w-0 overflow-hidden' : 'w-full lg:w-[400px]'
          }`}
        >
          <GeneratorForm
            projectId={projectId}
            framework={framework}
            onGenerate={handleGenerate}
            onGenerating={handleGenerating}
            isGenerating={isGenerating}
            initialDescription={isTemplateMode ? description || undefined : undefined}
            formRef={formRef}
          />
        </div>

        {/* Right: Output Panel */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {/* Output Tab Bar */}
          <div className="flex items-center justify-between border-b border-surface-3 bg-surface-0 flex-shrink-0 px-2">
            <div className="flex items-center">
              <button onClick={() => setActiveTab('preview')} className={tabCls('preview')}>
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
              <button onClick={() => setActiveTab('code')} className={tabCls('code')}>
                <Code className="w-3.5 h-3.5" />
                Code
              </button>
              {qualityReport && (
                <div className="ml-3">
                  <QualityBadge report={qualityReport} />
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {generatedCode && (
                <>
                  <Button
                    onClick={() => setSaveDialogOpen(true)}
                    variant="ghost"
                    size="sm"
                    className="text-xs text-text-secondary hover:text-text-primary"
                    title="Save as template (⌘S)"
                  >
                    <Save className="w-3.5 h-3.5 mr-1" />
                    Save
                  </Button>
                  {githubEnabled && pushState === 'idle' && (
                    <Button
                      onClick={handlePushToGitHub}
                      variant="ghost"
                      size="sm"
                      className="text-xs text-text-secondary hover:text-text-primary"
                    >
                      <Github className="w-3.5 h-3.5 mr-1" />
                      Push
                    </Button>
                  )}
                  {githubEnabled && pushState === 'pushing' && (
                    <Button disabled variant="ghost" size="sm" className="text-xs">
                      <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                      Pushing...
                    </Button>
                  )}
                  {githubEnabled && pushState === 'success' && prUrl && (
                    <a
                      href={prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                    >
                      <Check className="w-3.5 h-3.5" />
                      View PR
                    </a>
                  )}
                  {githubEnabled && (pushState === 'error' || pushState === 'no-repo') && (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {pushError}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-h-0 relative">
            {!generatedCode && !isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold font-display text-text-primary mb-2">
                  Ready to generate
                </h3>
                <p className="text-sm text-text-secondary max-w-sm">
                  Describe your component in the config panel and hit Generate. Your code and
                  preview will appear here.
                </p>
              </div>
            ) : (
              <div className="h-full">
                <div className={activeTab === 'preview' ? 'h-full' : 'hidden'}>
                  <LivePreview code={generatedCode} framework={framework} />
                </div>
                <div className={activeTab === 'code' ? 'h-full' : 'hidden'}>
                  <CodeEditor
                    code={generatedCode}
                    onChange={handleCodeChange}
                    language={
                      framework === 'react' || framework === 'angular' ? 'typescript' : framework
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar: Refinement + Feedback */}
          {generatedCode && !isGenerating && (
            <div className="border-t border-surface-3 bg-surface-0 flex-shrink-0">
              {conversationEnabled && generationId && (
                <div className="px-4 pt-3">
                  <RefinementInput
                    onRefine={handleRefine}
                    onNewGeneration={handleNewGeneration}
                    isGenerating={generation.isGenerating}
                    conversationTurn={generation.conversationTurn}
                    maxTurns={generation.maxConversationTurns}
                  />
                </div>
              )}
              <div className="flex items-center justify-between px-4 py-2">
                <FeedbackPanel generationId={generationId} ragEnriched={ragEnriched} />
              </div>
            </div>
          )}
        </div>
      </div>

      <SaveTemplateDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        code={generatedCode}
        framework={framework}
      />
    </div>
  );
}

function GenerateLoadingSkeleton() {
  return (
    <div className="h-full flex -m-4 sm:-m-6 lg:-m-8">
      <div className="w-[400px] border-r border-surface-3 p-6 space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex-1 flex flex-col">
        <div className="h-10 border-b border-surface-3 flex items-center px-4 gap-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Skeleton className="h-16 w-16 rounded-2xl mx-auto mb-4" />
            <Skeleton className="h-5 w-40 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function GenerateClient() {
  return (
    <Suspense fallback={<GenerateLoadingSkeleton />}>
      <GeneratePageClient />
    </Suspense>
  );
}
