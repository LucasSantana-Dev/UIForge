'use client';

import { useState } from 'react';
import { useProject } from '@/hooks/use-projects';
import { useGeneration } from '@/hooks/use-generation';
import GeneratorForm from './GeneratorForm';
import CodeEditor from './CodeEditor';
import LivePreview from './LivePreview';
import GenerationHistory from './GenerationHistory';
import SaveToProject from './SaveToProject';
import { SparklesIcon } from 'lucide-react';

interface ComponentGeneratorProps {
  projectId: string;
}

function LoadingSkeleton() {
  return (
    <div className="flex-1 flex flex-col bg-surface-1 rounded-xl border border-surface-3 overflow-hidden animate-pulse">
      <div className="px-6 py-4 border-b border-surface-3">
        <div className="flex items-center space-x-3">
          <div className="h-6 w-6 rounded bg-surface-3" />
          <div className="space-y-2">
            <div className="h-5 w-48 rounded bg-surface-3" />
            <div className="h-3 w-64 rounded bg-surface-3" />
          </div>
        </div>
      </div>
      <div className="flex-1 flex">
        <div className="w-96 border-r border-surface-3 p-6 space-y-4">
          <div className="h-10 rounded bg-surface-2" />
          <div className="h-32 rounded bg-surface-2" />
          <div className="h-10 rounded bg-surface-2" />
          <div className="h-10 rounded bg-surface-2" />
        </div>
        <div className="flex-1 bg-surface-0" />
      </div>
    </div>
  );
}

export default function ComponentGenerator({
  projectId,
}: ComponentGeneratorProps) {
  const { data: project, isLoading } =
    useProject(projectId);
  const [currentComponentName, setCurrentComponentName] =
    useState('');
  const [currentSettings, setCurrentSettings] = useState({
    componentLibrary: '',
    style: '',
    typescript: false,
  });
  const [editedCode, setEditedCode] = useState('');
  const [isEdited, setIsEdited] = useState(false);

  const generation = useGeneration(projectId);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center mb-4">
          <SparklesIcon className="h-6 w-6 text-error" />
        </div>
        <p className="text-error font-medium">
          Project not found
        </p>
        <p className="text-sm text-text-muted mt-1">
          This project may have been deleted
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-1 rounded-xl border border-surface-3 overflow-hidden shadow-card">
      <div className="px-6 py-4 border-b border-surface-3 bg-gradient-to-r from-brand/5 to-transparent">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center">
            <SparklesIcon className="h-5 w-5 text-brand" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              Component Generator
            </h1>
            <p className="text-sm text-text-secondary">
              Generate {project.framework} components with AI
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-96 border-r border-surface-3 flex flex-col">
          <GeneratorForm
            projectId={projectId}
            framework={project.framework}
            onGenerate={(code: string, settings: any) => {
              setCurrentComponentName(
                settings.componentName
              );
              setCurrentSettings({
                componentLibrary:
                  settings.componentLibrary,
                style: settings.style,
                typescript: settings.typescript,
              });
            }}
            onGenerating={() => {}}
            isGenerating={generation.isGenerating}
          />
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 border-b border-surface-3">
            <CodeEditor
              code={
                isEdited ? editedCode : generation.code
              }
              onChange={(code) => {
                setEditedCode(code);
                setIsEdited(true);
              }}
              language={
                project.framework === 'vue'
                  ? 'vue'
                  : 'typescript'
              }
            />
          </div>

          <div className="flex-1 border-b border-surface-3">
            <LivePreview
              code={
                isEdited ? editedCode : generation.code
              }
              framework={project.framework}
            />
          </div>

          <div className="h-48">
            <GenerationHistory
              projectId={projectId}
              onSelectGeneration={(code) => {
                setEditedCode(code);
                setIsEdited(true);
              }}
            />
          </div>

          {generation.code && (
            <SaveToProject
              projectId={projectId}
              code={
                isEdited ? editedCode : generation.code
              }
              componentName={
                currentComponentName ||
                'GeneratedComponent'
              }
              framework={project.framework}
              componentLibrary={
                currentSettings.componentLibrary
              }
              style={currentSettings.style}
              typescript={currentSettings.typescript}
            />
          )}
        </div>
      </div>
    </div>
  );
}
