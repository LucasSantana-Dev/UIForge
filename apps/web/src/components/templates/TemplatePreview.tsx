'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, Eye, EyeOff } from 'lucide-react';
import { Template } from './TemplateCard';

interface TemplatePreviewProps {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseTemplate?: (template: Template) => void;
}

export function TemplatePreview({
  template,
  open,
  onOpenChange,
  onUseTemplate,
}: TemplatePreviewProps) {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!template) return null;

  const handleCopyCode = async () => {
    if (template.code) {
      await navigator.clipboard.writeText(template.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUseTemplate = () => {
    onUseTemplate?.(template);
    onOpenChange(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-surface-1 text-text-primary';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-lg font-semibold">{template.name}</span>
            <Badge variant="secondary">{template.framework}</Badge>
            <Badge variant="outline">{template.componentLibrary}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Info */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">Category:</span>
                <Badge variant="outline">{template.category}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Difficulty:</span>
                <Badge className={getDifficultyColor(template.difficulty)}>
                  {template.difficulty}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Usage:</span>
                <span className="text-muted-foreground">{template.usage} times</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Rating:</span>
                <span className="text-muted-foreground">⭐ {template.rating}</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Preview</h3>
              <Button variant="outline" size="sm" onClick={() => setShowCode(!showCode)}>
                {showCode ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                {showCode ? 'Hide Code' : 'Show Code'}
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              {!showCode ? (
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-muted-foreground font-medium">Component Preview</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {template.framework} • {template.componentLibrary}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute top-2 right-2 z-10 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyCode}
                      disabled={!template.code}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyCode}
                      disabled={!template.code}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  <div className="bg-muted p-4">
                    <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                      <code>
                        {template.code || '// Code will be available when template is used'}
                      </code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleUseTemplate} className="flex-1">
              Use This Template
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
