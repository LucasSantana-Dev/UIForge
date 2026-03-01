'use client';

import { useState, useCallback, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import GeneratorForm from '@/components/generator/GeneratorForm';
import CodeEditor from '@/components/generator/CodeEditor';
import LivePreview from '@/components/generator/LivePreview';
import RefinementInput from '@/components/generator/RefinementInput';
import GenerationHistory from '@/components/generator/GenerationHistory';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  ArrowLeft,
  Code,
  Github,
  Loader2,
  Check,
  AlertTriangle,
  Save,
  HistoryIcon,
} from 'lucide-react';
import FeedbackPanel from '@/components/generator/FeedbackPanel';
import { QualityBadge } from '@/components/generator/QualityBadge';
import type { QualityReport } from '@/lib/quality/gates';
import { SaveTemplateDialog } from '@/components/generator/SaveTemplateDialog';
import { isFeatureEnabled } from '@/lib/features/flags';
import { useGeneration } from '@/hooks/use-generation';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { FolderPlus } from 'lucide-react';

function GeneratePageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get('projectId');
  const framework = searchParams.get('framework') || 'react';
  const componentLibrary = searchParams.get('componentLibrary') || 'tailwind';
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

  const githubEnabled = isFeatureEnabled('ENABLE_GITHUB_APP');

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
          `import React from 'react';\nexport default function TemplateComponent() {\n  return <div className="p-4"><h2>${template}</h2><p>${description}</p></div>;\n}`
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
          model: 'gemini-2.0-flash',
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
        <Card className="p-6 max-w-md text-center">
          <FolderPlus className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <h2 className="text-lg font-semibold mb-2">No Project Selected</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Create a project to start generating components.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => setCreateDialogOpen(true)}>Create Project</Button>
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

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Generate Component</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Describe your component and let AI generate the code for you
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isTemplateMode && (
              <>
                <Button variant="outline" onClick={() => router.push('/templates')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Templates
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setGeneratedCode('');
                    setIsTemplateMode(false);
                  }}
                >
                  Clear Template
                </Button>
              </>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <HistoryIcon className="w-4 h-4 mr-2" />
                  History
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

        {isTemplateMode && (
          <div className="mt-4 p-3 bg-brand-muted border border-brand/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-text-brand" />
              <span className="text-sm font-medium text-text-brand">Template Mode: {template}</span>
              <Badge variant="secondary" className="text-xs">
                {framework}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {componentLibrary}
              </Badge>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        <div className="lg:col-span-1">
          <Card className="h-full overflow-hidden">
            <GeneratorForm
              projectId={projectId}
              framework={framework}
              onGenerate={handleGenerate}
              onGenerating={handleGenerating}
              isGenerating={isGenerating}
              initialDescription={isTemplateMode ? description || undefined : undefined}
            />
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-full overflow-hidden">
            <CodeEditor
              code={generatedCode}
              onChange={handleCodeChange}
              language={framework === 'react' || framework === 'angular' ? 'typescript' : framework}
            />
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-full overflow-hidden">
            <LivePreview code={generatedCode} framework={framework} />
          </Card>
        </div>
      </div>

      {generatedCode && !isGenerating && (
        <div className="mt-4 space-y-3">
          {conversationEnabled && generationId && (
            <RefinementInput
              onRefine={handleRefine}
              onNewGeneration={handleNewGeneration}
              isGenerating={generation.isGenerating}
              conversationTurn={generation.conversationTurn}
              maxTurns={generation.maxConversationTurns}
            />
          )}

          <div className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-3">
              <FeedbackPanel generationId={generationId} ragEnriched={ragEnriched} />
              <QualityBadge report={qualityReport} />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => setSaveDialogOpen(true)} variant="outline" size="sm">
                <Save className="mr-2 h-4 w-4" />
                Save as Template
              </Button>
              {githubEnabled && pushState === 'idle' && (
                <Button onClick={handlePushToGitHub} variant="outline" size="sm">
                  <Github className="mr-2 h-4 w-4" />
                  Push to GitHub
                </Button>
              )}
              {githubEnabled && pushState === 'pushing' && (
                <Button disabled variant="outline" size="sm">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating PR...
                </Button>
              )}
              {githubEnabled && pushState === 'success' && prUrl && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <a
                    href={prUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    View PR
                  </a>
                </div>
              )}
              {githubEnabled && (pushState === 'error' || pushState === 'no-repo') && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  {pushError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <SaveTemplateDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        code={generatedCode}
        framework={framework}
      />
    </div>
  );
}

export function GenerateClient() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <Card className="p-6 max-w-md">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </Card>
        </div>
      }
    >
      <GeneratePageClient />
    </Suspense>
  );
}
