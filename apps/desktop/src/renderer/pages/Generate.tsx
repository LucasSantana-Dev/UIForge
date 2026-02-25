import { useState, useCallback } from 'react';
import {
  Button,
  Textarea,
  Input,
  Label,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  CodeEditor,
  LivePreview,
} from '@siza/ui';
import { SparklesIcon, SaveIcon } from 'lucide-react';
import { useMcp } from '../hooks/use-mcp';

export function Generate() {
  const [prompt, setPrompt] = useState('');
  const [componentName, setComponentName] = useState('');
  const [framework, setFramework] = useState<'react' | 'vue'>('react');
  const [generatedCode, setGeneratedCode] = useState('');
  const { callTool, isLoading, error } = useMcp();

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || !componentName.trim()) return;
    try {
      const result = await callTool('generate-ui-component', {
        description: prompt,
        framework,
        componentName,
        componentLibrary: 'shadcn',
        typescript: true,
      });

      const text = result.content?.find(
        (c) => c.type === 'text'
      )?.text;
      if (text) setGeneratedCode(text);
    } catch {
      // error is set in useMcp hook
    }
  }, [prompt, componentName, framework, callTool]);

  const handleSave = useCallback(async () => {
    if (!generatedCode) return;
    const dir = await window.siza.selectDirectory();
    if (!dir) return;
    const ext = framework === 'react' ? 'tsx' : 'vue';
    const fileName = `${componentName}.${ext}`;
    await window.siza.writeFile(`${dir}/${fileName}`, generatedCode);
  }, [generatedCode, componentName, framework]);

  return (
    <div className="flex h-full">
      <div className="w-96 border-r border-surface-3 flex flex-col">
        <div className="p-4 border-b border-surface-3">
          <h2 className="text-lg font-semibold">Generate</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
          {error && (
            <p className="text-sm text-error">{error}</p>
          )}
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="w-full"
          >
            <SparklesIcon className="w-4 h-4 mr-2" />
            {isLoading ? 'Generating...' : 'Generate'}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <Tabs defaultValue="code" className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-surface-3">
            <TabsList>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            {generatedCode && (
              <Button variant="outline" size="sm" onClick={handleSave}>
                <SaveIcon className="w-4 h-4 mr-1" />
                Save to Project
              </Button>
            )}
          </div>
          <TabsContent value="code" className="flex-1 m-0">
            <CodeEditor
              code={generatedCode}
              onChange={setGeneratedCode}
              language="typescript"
            />
          </TabsContent>
          <TabsContent value="preview" className="flex-1 m-0">
            <LivePreview
              code={generatedCode}
              framework={framework}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
