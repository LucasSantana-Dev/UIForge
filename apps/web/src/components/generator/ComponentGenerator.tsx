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

  // Initialize generation hook with projectId
  const generation = useGeneration(projectId);

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
            onGenerate={(code: string, settings: any) => {
              // Update current settings for save functionality
              setCurrentComponentName(settings.componentName);
              setCurrentSettings({
                componentLibrary: settings.componentLibrary,
                style: settings.style,
                typescript: settings.typescript,
              });
            }}
            onGenerating={() => {
              // Generation state is handled by the hook
            }}
            isGenerating={generation.isGenerating}
          />
        </div>

        {/* Right Panel - Split View */}
        <div className="flex-1 flex flex-col">
          {/* Code Editor */}
          <div className="flex-1 border-b border-gray-200">
            <CodeEditor
              code={isEdited ? editedCode : generation.code}
              onChange={(code) => {
                setEditedCode(code);
                setIsEdited(true);
              }}
              language={project.framework === 'vue' ? 'vue' : 'typescript'}
            />
          </div>

          {/* Live Preview */}
          <div className="flex-1 border-b border-gray-200">
            <LivePreview
              code={isEdited ? editedCode : generation.code}
              framework={project.framework}
            />
          </div>

          {/* Generation History */}
          <div className="h-48">
            <GenerationHistory
              projectId={projectId}
              onSelectGeneration={(code) => {
                setEditedCode(code);
                setIsEdited(true);
              }}
            />
          </div>

          {/* Save to Project */}
          {generation.code && (
            <SaveToProject
              projectId={projectId}
              code={isEdited ? editedCode : generation.code}
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
