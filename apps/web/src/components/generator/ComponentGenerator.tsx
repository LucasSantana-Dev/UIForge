'use client';

import { useState } from 'react';
import { useProject } from '@/hooks/use-projects';
import { useGeneration } from '@/hooks/use-generation';
import GeneratorForm from './GeneratorForm';
import CodeEditor from './CodeEditor';
import LivePreview from './LivePreview';
import GenerationHistory from './GenerationHistory';
import SaveToProject from './SaveToProject';
import { SparklesIcon, Code2, Eye, HistoryIcon } from 'lucide-react';
import {
  Button,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  ScrollArea,
} from '@siza/ui';

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
      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="lg:w-[400px] border-b lg:border-b-0 lg:border-r border-surface-3 p-6 space-y-4">
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

export default function ComponentGenerator({ projectId }: ComponentGeneratorProps) {
  const { data: project, isLoading } = useProject(projectId);
  const [currentComponentName, setCurrentComponentName] = useState('');
  const [currentSettings, setCurrentSettings] = useState({
    componentLibrary: '',
    style: '',
    typescript: false,
  });
  const [editedCode, setEditedCode] = useState('');
  const [isEdited, setIsEdited] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');

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
        <p className="text-error font-medium">Project not found</p>
        <p className="text-sm text-text-muted mt-1">This project may have been deleted</p>
      </div>
    );
  }

  const displayCode = isEdited ? editedCode : generation.code;

  return (
    <div className="flex-1 flex flex-col bg-surface-1 rounded-xl border border-surface-3 overflow-hidden shadow-card">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-surface-3 bg-gradient-to-r from-brand/5 to-transparent">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
            <SparklesIcon className="h-5 w-5 text-brand" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-text-primary truncate">
              Component Generator
            </h1>
            <p className="text-sm text-text-secondary truncate">
              Generate {project.framework} components with AI
            </p>
          </div>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <HistoryIcon className="h-4 w-4" />
              History
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px] p-0">
            <SheetHeader className="px-6 py-4 border-b border-surface-3">
              <SheetTitle>Generation History</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100%-60px)]">
              <GenerationHistory
                projectId={projectId}
                onSelectGeneration={(code) => {
                  setEditedCode(code);
                  setIsEdited(true);
                }}
              />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="lg:w-[400px] border-b lg:border-b-0 lg:border-r border-surface-3 flex flex-col max-h-[50vh] lg:max-h-none">
          <GeneratorForm
            projectId={projectId}
            framework={project.framework}
            onGenerate={(code: string, settings: any) => {
              setCurrentComponentName(settings.componentName);
              setCurrentSettings({
                componentLibrary: settings.componentLibrary,
                style: settings.style,
                typescript: settings.typescript,
              });
            }}
            onGenerating={() => {}}
            isGenerating={generation.isGenerating}
          />
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex border-b border-surface-3 lg:hidden">
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'code'
                  ? 'text-brand-light border-b-2 border-brand'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              aria-label="View code"
            >
              <Code2 className="h-4 w-4" />
              Code
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'text-brand-light border-b-2 border-brand'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              aria-label="View preview"
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
          </div>

          <div
            className={`flex-[3] border-b border-surface-3 ${activeTab !== 'code' ? 'hidden lg:block' : ''}`}
          >
            <CodeEditor
              code={displayCode}
              onChange={(code) => {
                setEditedCode(code);
                setIsEdited(true);
              }}
              language={project.framework === 'vue' ? 'vue' : 'typescript'}
            />
          </div>

          <div
            className={`flex-[2] border-b border-surface-3 ${activeTab !== 'preview' ? 'hidden lg:block' : ''}`}
          >
            <LivePreview code={displayCode} framework={project.framework} />
          </div>

          {generation.code && (
            <SaveToProject
              projectId={projectId}
              code={displayCode}
              componentName={currentComponentName || 'GeneratedComponent'}
              framework={project.framework}
              componentLibrary={currentSettings.componentLibrary}
              style={currentSettings.style}
              typescript={currentSettings.typescript}
            />
          )}
        </div>
      </div>
    </div>
  );
}
