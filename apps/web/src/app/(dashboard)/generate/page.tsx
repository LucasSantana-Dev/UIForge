'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import GeneratorForm from '@/components/generator/GeneratorForm';
import CodeEditor from '@/components/generator/CodeEditor';
import LivePreview from '@/components/generator/LivePreview';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Code } from 'lucide-react';

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

  // Handle template instantiation
  useEffect(() => {
    if (template && description) {
      // This would typically fetch the template code from an API
      // For now, we'll simulate it with a basic template structure
      const templateCode = `// Template: ${template}
// Framework: ${framework}
// Component Library: ${componentLibrary}

import React from 'react';

export default function ${template.replace(/[^a-zA-Z0-9]/g, '')}Component() {
  return (
    <div className="p-4">
      <h2>Template: ${template}</h2>
      <p>${description}</p>
      <p>This is a template component that you can customize further.</p>
    </div>
  );
}`;

      setGeneratedCode(templateCode);
      setIsTemplateMode(true);
    }
  }, [template, description, framework, componentLibrary]);

  const handleGenerate = async (code: string) => {
    setGeneratedCode(code);
    setIsGenerating(false);
    setIsTemplateMode(false);
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
    // Clear URL parameters
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
      {/* Header with template indicator */}
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
              This template has been pre-loaded. You can customize it further or generate new components.
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Generator Form - Left Panel */}
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

        {/* Code Editor - Middle Panel */}
        <div className="lg:col-span-1">
          <Card className="h-full overflow-hidden">
            <CodeEditor
              code={generatedCode}
              onChange={handleCodeChange}
              language={framework === 'react' || framework === 'angular' ? 'typescript' : framework}
            />
          </Card>
        </div>

        {/* Live Preview - Right Panel */}
        <div className="lg:col-span-1">
          <Card className="h-full overflow-hidden">
            <LivePreview code={generatedCode} framework={framework} />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <Card className="p-6 max-w-md">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </Card>
      </div>
    }>
      <GeneratePageClient />
    </Suspense>
  );
}