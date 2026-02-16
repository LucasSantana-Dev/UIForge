'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import GeneratorForm from '@/components/generator/GeneratorForm';
import CodeEditor from '@/components/generator/CodeEditor';
import LivePreview from '@/components/generator/LivePreview';
import { Card } from '@/components/ui/card';

function GeneratePageClient() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const framework = searchParams.get('framework') || 'react';

  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (code: string) => {
    setGeneratedCode(code);
    setIsGenerating(false);
  };

  const handleGenerating = () => {
    setIsGenerating(true);
  };

  const handleCodeChange = (code: string) => {
    setGeneratedCode(code);
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
        <h1 className="text-3xl font-bold">Generate Component</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Describe your component and let AI generate the code for you
        </p>
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
