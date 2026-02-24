'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Download, CheckCircle, AlertCircle } from 'lucide-react';

interface FigmaExportDialogProps {
  wireframe: {
    wireframe: {
      type: string;
      width: number;
      height: number;
      elements: any[];
      styles?: any;
    };
    metadata: {
      framework: string;
      componentType: string;
      generatedAt: string;
      outputFormat: string;
    };
  };
  onClose: () => void;
}

export function FigmaExportDialog({ wireframe, onClose }: FigmaExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState('Siza Wireframe');
  const [exportFormat, setExportFormat] = useState<'json' | 'figma-plugin'>('json');

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    setExportResult(null);

    try {
      const response = await fetch('/api/wireframe/export/figma', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wireframe,
          fileName,
          exportFormat,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export to Figma');
      }

      const result = await response.json();
      setExportResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export to Figma');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    if (!exportResult) return;

    const dataStr = JSON.stringify(exportResult.data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `${fileName.replace(/\s+/g, '_')}_figma_export.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleCopyToClipboard = async () => {
    if (!exportResult) return;

    try {
      await navigator.clipboard.writeText(JSON.stringify(exportResult.data, null, 2));
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Export to Figma</DialogTitle>
          <DialogDescription>
            Export your wireframe to Figma-compatible format for import or plugin use.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Wireframe Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Wireframe Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Type:</span>
                <Badge variant="secondary">{wireframe.wireframe.type}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Dimensions:</span>
                <span className="text-sm font-mono">
                  {wireframe.wireframe.width} × {wireframe.wireframe.height}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Elements:</span>
                <Badge variant="outline">{wireframe.wireframe.elements.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Framework:</span>
                <Badge variant="outline">{wireframe.metadata.framework}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="fileName">File Name</Label>
              <Input
                id="fileName"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter file name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="exportFormat">Export Format</Label>
              <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select export format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-brand rounded-full" />
                      <span>JSON Format</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="figma-plugin">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <span>Figma Plugin Format</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {exportFormat === 'json'
                  ? 'Standard JSON format for manual import or plugin use'
                  : 'Optimized format for Figma plugin integration'}
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Result */}
          {exportResult && (
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-base text-green-700 dark:text-green-400">
                    Export Successful
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-600">
                    {exportResult.format}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {wireframe.wireframe.elements.length} elements exported
                  </span>
                </div>

                {exportResult.instructions && (
                  <Alert>
                    <AlertDescription>{exportResult.instructions}</AlertDescription>
                  </Alert>
                )}

                <Separator />

                <div className="flex gap-2">
                  <Button onClick={handleDownload} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download JSON
                  </Button>
                  <Button onClick={handleCopyToClipboard} variant="outline" size="sm">
                    Copy to Clipboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {!exportResult && (
            <Button onClick={handleExport} disabled={isExporting || !fileName.trim()}>
              {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Export to Figma
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
