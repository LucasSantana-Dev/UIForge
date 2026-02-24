'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import GeneratorForm from '@/components/generator/GeneratorForm';
import CodeEditor from '@/components/generator/CodeEditor';
import LivePreview from '@/components/generator/LivePreview';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Code, Github, Loader2, Check, AlertTriangle, Save } from 'lucide-react';
import FeedbackPanel from '@/components/generator/FeedbackPanel';
import { SaveTemplateDialog } from '@/components/generator/SaveTemplateDialog';
import { isFeatureEnabled } from '@/lib/features/flags';

function GeneratePageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get('projectId');
  const framework = searchParams.get('framework') || 'react';
  const componentLibrary = searchParams.get('componentLibrary') || 'tailwind';
  const template = searchParams.get('template');
  const description = searchParams.get('description');

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
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

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
        // fall through to stub
      }

      if (description) {
        const stub = `import React from 'react';

export default function TemplateComponent() {
  return (
    <div className="p-4">
      <h2>${template}</h2>
      <p>${description}</p>
    </div>
  );
}`;
        setGeneratedCode(stub);
        setIsTemplateMode(true);
      }
    }

    loadTemplate();
  }, [template, description]);

  const handleGenerate = async (
    code: string,
    settings?: {
      componentName?: string;
      generationId?: string;
      ragEnriched?: boolean;
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
  };

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
          setPushError('No GitHub repo linked. Go to Settings to link one.');
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

  const handleGenerating = () => {
    setIsGenerating(true);
  };

  const handleCodeChange = (code: string) => {
    setGeneratedCode(code);
    setIsTemplateMode(false);
  };

  const handleBackToTemplates = () => {
    router.push('/templates');
  };

  const handleClearTemplate = () => {
    setGeneratedCode('');
    setIsTemplateMode(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('template');
    url.searchParams.delete('framework');
    url.searchParams.delete('componentLibrary');
    url.searchParams.delete('description');
    window.history.replaceState({}, '', url.toString());
  };

  if (!projectId) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="p-6 max-w-md">
          <h2 className="text-lg font-semibold mb-2">No Project Selected</h2>
          <p className="text-sm text-muted-foreground">
            Please select a project from the projects page to generate components.
          </p>
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
          {isTemplateMode && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleBackToTemplates}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Templates
              </Button>
              <Button variant="ghost" onClick={handleClearTemplate}>
                Clear Template
              </Button>
            </div>
          )}
        </div>

        {isTemplateMode && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Template Mode: {template}
              </span>
              <Badge variant="secondary" className="text-xs">
                {framework}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {componentLibrary}
              </Badge>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              This template has been pre-loaded. You can customize it further or generate new
              components.
            </p>
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
        <div className="mt-4 flex items-center justify-between gap-3 p-3 rounded-lg border bg-card">
          <FeedbackPanel generationId={generationId} ragEnriched={ragEnriched} />
          <div className="flex items-center gap-3">
            <Button onClick={() => setSaveDialogOpen(true)} variant="outline" size="sm">
              <Save className="mr-2 h-4 w-4" />
              Save as Template
            </Button>

            {githubEnabled && (
              <>
                {pushState === 'idle' && (
                  <Button onClick={handlePushToGitHub} variant="outline" size="sm">
                    <Github className="mr-2 h-4 w-4" />
                    Push to GitHub
                  </Button>
                )}
                {pushState === 'pushing' && (
                  <Button disabled variant="outline" size="sm">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating PR...
                  </Button>
                )}
                {pushState === 'success' && prUrl && (
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>PR created!</span>
                    <a
                      href={prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      View on GitHub
                    </a>
                  </div>
                )}
                {(pushState === 'error' || pushState === 'no-repo') && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-muted-foreground">{pushError}</span>
                    {pushState === 'error' && (
                      <Button onClick={handlePushToGitHub} variant="ghost" size="sm">
                        Retry
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
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
