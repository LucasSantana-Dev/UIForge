'use client';

import { useState } from 'react';
import { useProject } from '@/hooks/use-projects';
import GeneratorForm from './GeneratorForm';
import CodeEditor from './CodeEditor';
import LivePreview from './LivePreview';
import { SparklesIcon } from 'lucide-react';

interface ComponentGeneratorProps {
  projectId: string;
}

export default function ComponentGenerator({ projectId }: ComponentGeneratorProps) {
  const { data: project, isLoading } = useProject(projectId);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Project not found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center space-x-3">
          <SparklesIcon className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Component Generator</h1>
            <p className="text-sm text-gray-600">
              Generate {project.framework} components with AI
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Generator Form */}
        <div className="w-96 border-r border-gray-200 flex flex-col">
          <GeneratorForm
            projectId={projectId}
            framework={project.framework}
            onGenerate={(code: string) => {
              setGeneratedCode(code);
              setIsGenerating(false);
            }}
            onGenerating={() => setIsGenerating(true)}
            isGenerating={isGenerating}
          />
        </div>

        {/* Right Panel - Split View */}
        <div className="flex-1 flex flex-col">
          {/* Code Editor */}
          <div className="flex-1 border-b border-gray-200">
            <CodeEditor
              code={generatedCode}
              onChange={setGeneratedCode}
              language={project.framework === 'vue' ? 'vue' : 'typescript'}
            />
          </div>

          {/* Live Preview */}
          <div className="flex-1">
            <LivePreview
              code={generatedCode}
              framework={project.framework}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
