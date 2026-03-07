'use client';

import { useState } from 'react';
import { useProject } from '@/hooks/use-projects';
import { useComponents, type Component } from '@/hooks/use-components';
import { useGenerations, type Generation } from '@/hooks/use-generations';
import {
  ArrowLeftIcon,
  Edit2Icon,
  SparklesIcon,
  CodeIcon,
  EyeIcon,
  ClockIcon,
  BoxIcon,
  PlusIcon,
  FolderIcon,
  ChevronRightIcon,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import ProjectActions from './ProjectActions';
import CodeEditor from '@/components/generator/CodeEditor';
import LivePreview from '@/components/generator/LivePreview';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@siza/ui';

interface ProjectDetailProps {
  projectId: string;
}

type DetailTab = 'code' | 'preview';
type SidebarTab = 'components' | 'history';

function ComponentListItem({
  component,
  isActive,
  onClick,
}: {
  component: Component;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-colors ${
        isActive
          ? 'bg-violet-500/15 text-violet-300'
          : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
      }`}
    >
      <BoxIcon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-violet-400' : ''}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{component.name}</p>
        <p className="text-xs text-text-muted truncate">{component.framework}</p>
      </div>
    </button>
  );
}

function GenerationListItem({
  generation,
  isActive,
  onClick,
}: {
  generation: Generation;
  isActive: boolean;
  onClick: () => void;
}) {
  const statusColor = {
    completed: 'bg-emerald-400',
    failed: 'bg-red-400',
    in_progress: 'bg-amber-400',
    pending: 'bg-gray-400',
  }[generation.status];

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-colors ${
        isActive
          ? 'bg-violet-500/15 text-violet-300'
          : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
      }`}
    >
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{generation.component_name}</p>
        <p className="text-xs text-text-muted">
          {formatDistanceToNow(new Date(generation.created_at), { addSuffix: true })}
        </p>
      </div>
    </button>
  );
}

export default function ProjectDetail({ projectId }: ProjectDetailProps) {
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: components, isLoading: componentsLoading } = useComponents(projectId);
  const { data: generations, isLoading: generationsLoading } = useGenerations(projectId);

  const [selectedCode, setSelectedCode] = useState<string>('');
  const [selectedName, setSelectedName] = useState<string>('');
  const [selectedFramework, setSelectedFramework] = useState<string>('react');
  const [activeTab, setActiveTab] = useState<DetailTab>('code');
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('components');
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const handleSelectGeneration = (gen: Generation) => {
    setSelectedCode(gen.generated_code || '');
    setSelectedName(gen.component_name);
    setSelectedFramework(gen.framework);
    setActiveItemId(gen.id);
    setActiveTab('code');
  };

  if (projectLoading) {
    return (
      <div className="h-full flex -m-4 sm:-m-6 lg:-m-8">
        <div className="w-72 border-r border-surface-3 p-4 space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="h-16 w-16 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Failed to load project.</p>
        <Link
          href="/projects"
          className="mt-4 inline-flex items-center text-sm text-violet-400 hover:text-violet-300"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Projects
        </Link>
      </div>
    );
  }

  const componentCount = components?.length ?? 0;
  const generationCount = generations?.length ?? 0;
  const completedGenerations = generations?.filter((g) => g.status === 'completed').length ?? 0;

  const tabCls = (tab: DetailTab) =>
    `flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
      activeTab === tab
        ? 'border-violet-500 text-violet-300'
        : 'border-transparent text-text-secondary hover:text-text-primary'
    }`;

  const sidebarTabCls = (tab: SidebarTab) =>
    `flex-1 py-2 text-xs font-medium text-center transition-colors ${
      sidebarTab === tab
        ? 'text-violet-300 border-b-2 border-violet-500'
        : 'text-text-muted hover:text-text-secondary border-b-2 border-transparent'
    }`;

  return (
    <div className="h-full flex flex-col -m-4 sm:-m-6 lg:-m-8">
      {/* Project Header */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-surface-3 bg-surface-0 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <FolderIcon className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-text-primary">{project.name}</span>
            <span className="text-xs text-text-muted font-mono">{project.framework}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3 mr-4 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <BoxIcon className="w-3 h-3" /> {componentCount}
            </span>
            <span className="flex items-center gap-1">
              <SparklesIcon className="w-3 h-3" /> {completedGenerations}/{generationCount}
            </span>
          </div>
          <Button asChild size="sm" variant="ghost" className="text-xs">
            <Link href={`/projects/${project.id}/edit`}>
              <Edit2Icon className="w-3.5 h-3.5 mr-1" />
              Edit
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-violet-600 hover:bg-violet-500 text-xs">
            <Link href={`/generate?projectId=${project.id}&framework=${project.framework}`}>
              <SparklesIcon className="w-3.5 h-3.5 mr-1" />
              Generate
            </Link>
          </Button>
          <ProjectActions projectId={project.id} projectName={project.name} />
        </div>
      </div>

      {/* IDE Body */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Component/History Sidebar */}
        <div className="w-72 flex-shrink-0 border-r border-surface-3 bg-surface-0 flex flex-col">
          <div className="flex border-b border-surface-3">
            <button
              onClick={() => setSidebarTab('components')}
              className={sidebarTabCls('components')}
            >
              Components ({componentCount})
            </button>
            <button onClick={() => setSidebarTab('history')} className={sidebarTabCls('history')}>
              History ({generationCount})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {sidebarTab === 'components' && (
              <>
                {componentsLoading && (
                  <div className="space-y-2 p-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                  </div>
                )}
                {!componentsLoading && componentCount === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3">
                      <BoxIcon className="w-5 h-5 text-violet-400" />
                    </div>
                    <p className="text-xs text-text-secondary mb-3">No components yet</p>
                    <Button asChild size="sm" className="bg-violet-600 hover:bg-violet-500 text-xs">
                      <Link href={`/generate?projectId=${project.id}`}>
                        <PlusIcon className="w-3 h-3 mr-1" />
                        Generate
                      </Link>
                    </Button>
                  </div>
                )}
                {components?.map((comp) => (
                  <ComponentListItem
                    key={comp.id}
                    component={comp}
                    isActive={activeItemId === comp.id}
                    onClick={() => {
                      setActiveItemId(comp.id);
                      setSelectedName(comp.name);
                      setSelectedFramework(comp.framework);
                      setSelectedCode('');
                    }}
                  />
                ))}
              </>
            )}
            {sidebarTab === 'history' && (
              <>
                {generationsLoading && (
                  <div className="space-y-2 p-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                  </div>
                )}
                {!generationsLoading && generationCount === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3">
                      <ClockIcon className="w-5 h-5 text-violet-400" />
                    </div>
                    <p className="text-xs text-text-secondary">No generations yet</p>
                  </div>
                )}
                {generations?.map((gen) => (
                  <GenerationListItem
                    key={gen.id}
                    generation={gen}
                    isActive={activeItemId === gen.id}
                    onClick={() => handleSelectGeneration(gen)}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        {/* Right: Code/Preview Panel */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {/* Tab Bar */}
          <div className="flex items-center justify-between border-b border-surface-3 bg-surface-0 flex-shrink-0 px-2">
            <div className="flex items-center">
              <button onClick={() => setActiveTab('code')} className={tabCls('code')}>
                <CodeIcon className="w-3.5 h-3.5" />
                Code
              </button>
              <button onClick={() => setActiveTab('preview')} className={tabCls('preview')}>
                <EyeIcon className="w-3.5 h-3.5" />
                Preview
              </button>
              {selectedName && (
                <div className="ml-4 flex items-center gap-1.5 text-xs text-text-muted">
                  <ChevronRightIcon className="w-3 h-3" />
                  <span className="font-mono">{selectedName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0">
            {!selectedCode ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
                  <CodeIcon className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold font-display text-text-primary mb-2">
                  Select a component
                </h3>
                <p className="text-sm text-text-secondary max-w-sm">
                  Choose a component or generation from the sidebar to view its code and preview.
                </p>
                <Button asChild className="mt-6 bg-violet-600 hover:bg-violet-500" size="sm">
                  <Link href={`/generate?projectId=${project.id}&framework=${project.framework}`}>
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    Generate New Component
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="h-full">
                <div className={activeTab === 'code' ? 'h-full' : 'hidden'}>
                  <CodeEditor
                    code={selectedCode}
                    onChange={setSelectedCode}
                    language={
                      selectedFramework === 'react' || selectedFramework === 'angular'
                        ? 'typescript'
                        : selectedFramework
                    }
                  />
                </div>
                <div className={activeTab === 'preview' ? 'h-full' : 'hidden'}>
                  <LivePreview code={selectedCode} framework={selectedFramework} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
