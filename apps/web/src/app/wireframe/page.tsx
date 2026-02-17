'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { WireframePreview } from '@/components/wireframe/WireframePreview';
import { FigmaExportDialog } from '@/components/wireframe/FigmaExportDialog';

interface WireframeOptions {
  framework: 'react' | 'vue' | 'angular' | 'svelte';
  componentType: 'mobile' | 'web' | 'desktop' | 'tablet';
  description: string;
  style: 'low-fidelity' | 'high-fidelity' | 'prototype';
  outputFormat: 'figma' | 'json' | 'svg' | 'png';
}

interface WireframeData {
  wireframe: {
    type: string;
    width: number;
    height: number;
    elements: any[];
    styles: any;
  };
  metadata: {
    framework: string;
    componentType: string;
    generatedAt: string;
    outputFormat: string;
  };
}

export default function WireframePage() {
  const [options, setOptions] = useState<WireframeOptions>({
    framework: 'react',
    componentType: 'mobile',
    description: '',
    style: 'high-fidelity',
    outputFormat: 'figma',
  });

  const [wireframe, setWireframe] = useState<WireframeData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const handleGenerate = async () => {
    if (options.description.length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/wireframe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate wireframe');
      }

      const data = await response.json();
      setWireframe(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate wireframe');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportToFigma = () => {
    if (wireframe) {
      setShowExportDialog(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Wireframe Generator
          </h1>
          <p className="mt-2 text-muted-foreground">
            Create wireframes for your UI components and export to Figma
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Framework Selection */}
                <div className="space-y-2">
                  <Label htmlFor="framework">Framework</Label>
                  <Select
                    value={options.framework}
                    onValueChange={(value: any) => setOptions({ ...options, framework: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="react">React</SelectItem>
                      <SelectItem value="vue">Vue</SelectItem>
                      <SelectItem value="angular">Angular</SelectItem>
                      <SelectItem value="svelte">Svelte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Platform Selection */}
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select
                    value={options.componentType}
                    onValueChange={(value: any) => setOptions({ ...options, componentType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile">Mobile (375×812)</SelectItem>
                      <SelectItem value="tablet">Tablet (768×1024)</SelectItem>
                      <SelectItem value="web">Web (1200×800)</SelectItem>
                      <SelectItem value="desktop">Desktop (1440×900)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Style Fidelity */}
                <div className="space-y-2">
                  <Label htmlFor="fidelity">Fidelity</Label>
                  <Select
                    value={options.style}
                    onValueChange={(value: any) => setOptions({ ...options, style: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low-fidelity">Low Fidelity (Wireframe)</SelectItem>
                      <SelectItem value="high-fidelity">High Fidelity (Detailed)</SelectItem>
                      <SelectItem value="prototype">Interactive Prototype</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Output Format */}
                <div className="space-y-2">
                  <Label htmlFor="output">Output Format</Label>
                  <Select
                    value={options.outputFormat}
                    onValueChange={(value: any) => setOptions({ ...options, outputFormat: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="figma">Figma</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="svg">SVG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={options.description}
                    onChange={(e) => setOptions({ ...options, description: e.target.value })}
                    placeholder="Describe your wireframe (e.g., 'A mobile app login screen with email input, password input, and login button')"
                    rows={4}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {options.description.length} / 1000 characters
                  </p>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || options.description.length < 10}
                  className="w-full"
                >
                  {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isGenerating ? 'Generating...' : 'Generate Wireframe'}
                </Button>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Preview</CardTitle>
                  {wireframe && (
                    <Button onClick={handleExportToFigma} variant="secondary">
                      Export to Figma
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="min-h-96">
                {!wireframe && !isGenerating && (
                  <div className="h-96 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                    <p className="text-muted-foreground text-center">
                      Configure and generate a wireframe to see preview
                    </p>
                  </div>
                )}

                {isGenerating && (
                  <div className="h-96 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                      <p className="text-muted-foreground">Generating wireframe...</p>
                    </div>
                  </div>
                )}

                {wireframe && !isGenerating && (
                  <WireframePreview wireframe={wireframe} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Figma Export Dialog */}
      {showExportDialog && wireframe && (
        <FigmaExportDialog
          wireframe={wireframe}
          onClose={() => setShowExportDialog(false)}
        />
      )}
    </div>
  );
}
