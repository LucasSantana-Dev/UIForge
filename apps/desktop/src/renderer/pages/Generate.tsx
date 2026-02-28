import { useState, useCallback, useEffect } from 'react';
import {
  Button,
  Textarea,
  Input,
  Label,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
  CodeEditor,
  LivePreview,
} from '@siza/ui';
import { SparklesIcon, SaveIcon, CpuIcon, CloudIcon } from 'lucide-react';
import { useMcp } from '../hooks/use-mcp';
import { useOllama } from '../hooks/use-ollama';

type GenerationSource = 'mcp' | 'ollama';

export function Generate() {
  const [prompt, setPrompt] = useState('');
  const [componentName, setComponentName] = useState('');
  const [framework, setFramework] = useState<'react' | 'vue'>('react');
  const [generatedCode, setGeneratedCode] = useState('');
  const [source, setSource] = useState<GenerationSource>('mcp');
  const [ollamaModel, setOllamaModel] = useState('');
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  const { callTool, isLoading: mcpLoading, error: mcpError } = useMcp();
  const { running: ollamaRunning, models } = useOllama();
  const [ollamaLoading, setOllamaLoading] = useState(false);
  const [ollamaError, setOllamaError] = useState<string | null>(null);

  const isLoading = source === 'mcp' ? mcpLoading : ollamaLoading;
  const error = source === 'mcp' ? mcpError : ollamaError;

  useEffect(() => {
    window.siza.getPreference('ollamaModel').then((model) => {
      if (model) setOllamaModel(model);
    });
  }, []);

  useEffect(() => {
    if (!ollamaModel && models.length > 0) {
      setOllamaModel(models[0].name);
    }
  }, [models, ollamaModel]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || !componentName.trim()) return;
    setGenerationTime(null);

    if (source === 'ollama') {
      if (!ollamaModel) return;
      setOllamaLoading(true);
      setOllamaError(null);
      const start = Date.now();
      try {
        const result = await window.siza.generateWithOllama({
          model: ollamaModel,
          framework,
          componentName,
          description: prompt,
        });
        setGeneratedCode(result.code);
        setGenerationTime(result.duration || Date.now() - start);
      } catch (err) {
        setOllamaError(err instanceof Error ? err.message : 'Ollama generation failed');
      } finally {
        setOllamaLoading(false);
      }
      return;
    }

    try {
      const start = Date.now();
      const result = await callTool('generate_ui_component', {
        component_type: componentName
          .toLowerCase()
          .replace(/([A-Z])/g, ' $1')
          .trim(),
        description: prompt,
        framework,
        component_library: 'shadcn',
      });
      setGenerationTime(Date.now() - start);
      const text = result.content?.find((c) => c.type === 'text')?.text;
      if (text) setGeneratedCode(text);
    } catch {
      // error is set in useMcp hook
    }
  }, [prompt, componentName, framework, source, ollamaModel, callTool]);

  const handleSave = useCallback(async () => {
    if (!generatedCode) return;
    const dir = await window.siza.selectDirectory();
    if (!dir) return;
    const safeName = componentName.replace(/[^a-zA-Z0-9_-]/g, '_').trim();
    if (!safeName) return;
    const ext = framework === 'react' ? 'tsx' : 'vue';
    const fileName = `${safeName}.${ext}`;
    await window.siza.writeFile(`${dir}/${fileName}`, generatedCode);
  }, [generatedCode, componentName, framework]);

  const canGenerate =
    prompt.trim() &&
    componentName.trim() &&
    !isLoading &&
    (source === 'mcp' || (ollamaRunning && ollamaModel));

  return (
    <div className="flex h-full">
      <div className="w-96 border-r border-surface-3 flex flex-col">
        <div className="p-4 border-b border-surface-3">
          <h2 className="text-lg font-semibold">Generate</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <Label className="text-xs text-text-muted mb-1.5 block">Source</Label>
            <div className="flex gap-2">
              <Button
                variant={source === 'mcp' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSource('mcp')}
              >
                <CloudIcon className="w-3.5 h-3.5 mr-1.5" />
                MCP Registry
              </Button>
              <Button
                variant={source === 'ollama' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSource('ollama')}
                disabled={!ollamaRunning}
                title={ollamaRunning ? 'Generate with local Ollama model' : 'Ollama not running'}
              >
                <CpuIcon className="w-3.5 h-3.5 mr-1.5" />
                Ollama
                {ollamaRunning && (
                  <span className="ml-1 w-1.5 h-1.5 rounded-full bg-success inline-block" />
                )}
              </Button>
            </div>
          </div>

          {source === 'ollama' && ollamaRunning && models.length > 0 && (
            <div>
              <Label htmlFor="ollama-model">Model</Label>
              <select
                id="ollama-model"
                value={ollamaModel}
                onChange={(e) => setOllamaModel(e.target.value)}
                className="mt-1 w-full px-3 py-2 bg-surface-1 border border-surface-3 rounded-md text-text-primary text-sm"
              >
                {models.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name} ({(m.size / 1e9).toFixed(1)}GB)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <Label htmlFor="name">Component Name</Label>
            <Input
              id="name"
              value={componentName}
              onChange={(e) => setComponentName(e.target.value)}
              placeholder="MyComponent"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="prompt">Description</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A modern card component with hover effects..."
              rows={6}
              className="mt-1"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={framework === 'react' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFramework('react')}
            >
              React
            </Button>
            <Button
              variant={framework === 'vue' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFramework('vue')}
            >
              Vue
            </Button>
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <Button onClick={handleGenerate} disabled={!canGenerate} className="w-full">
            <SparklesIcon className="w-4 h-4 mr-2" />
            {isLoading ? 'Generating...' : 'Generate'}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <Tabs defaultValue="code" className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-surface-3">
            <div className="flex items-center gap-3">
              <TabsList>
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              {generationTime !== null && (
                <Badge variant="outline" className="text-xs">
                  {generationTime >= 1000
                    ? `${(generationTime / 1000).toFixed(1)}s`
                    : `${generationTime}ms`}
                </Badge>
              )}
            </div>
            {generatedCode && (
              <Button variant="outline" size="sm" onClick={handleSave}>
                <SaveIcon className="w-4 h-4 mr-1" />
                Save to Project
              </Button>
            )}
          </div>
          <TabsContent value="code" className="flex-1 m-0">
            <CodeEditor code={generatedCode} onChange={setGeneratedCode} language="typescript" />
          </TabsContent>
          <TabsContent value="preview" className="flex-1 m-0">
            <LivePreview code={generatedCode} framework={framework} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
