'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ZoomIn, ZoomOut, RotateCcw, Download, Share2 } from 'lucide-react';

interface WireframePreviewProps {
  wireframe: {
    wireframe: {
      type: string;
      width: number;
      height: number;
      elements: Array<{
        id?: string;
        type: string;
        name?: string;
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        fills?: Array<{
          type: string;
          color: { r: number; g: number; b: number; a: number };
        }>;
        strokes?: Array<{
          type: string;
          color: { r: number; g: number; b: number; a: number };
          weight?: number;
        }>;
        cornerRadius?: number;
        textContent?: string;
        fontSize?: number;
        fontFamily?: string;
      }>;
      styles?: any;
    };
    metadata?: {
      framework: string;
      componentType: string;
      generatedAt: string;
      outputFormat: string;
    };
  };
}

export function WireframePreview({ wireframe }: WireframePreviewProps) {
  const [scale, setScale] = useState(1);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const { wireframe: wf, metadata } = wireframe;
  const { width, height, elements } = wf;

  // Convert color from 0-255 to 0-1 range if needed
  const normalizeColor = (color: { r: number; g: number; b: number; a: number }) => {
    const r = color.r > 1 ? color.r / 255 : color.r;
    const g = color.g > 1 ? color.g / 255 : color.g;
    const b = color.b > 1 ? color.b / 255 : color.b;
    return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${color.a})`;
  };

  const handleZoomIn = () => setScale(Math.min(scale + 0.1, 2));
  const handleZoomOut = () => setScale(Math.max(scale - 0.1, 0.5));
  const handleResetZoom = () => setScale(1);

  const renderElement = (element: any, index: number) => {
    const fill = element.fills?.[0];
    const stroke = element.strokes?.[0];
    const isSelected = selectedElement === (element.id || `element-${index}`);

    const commonProps = {
      key: element.id || `element-${index}`,
      onClick: () => setSelectedElement(element.id || `element-${index}`),
      style: {
        cursor: 'pointer',
        transition: 'all 0.2s',
      },
      className: isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : '',
    };

    switch (element.type.toLowerCase()) {
      case 'container':
      case 'frame':
      case 'rectangle':
      case 'button':
      case 'input':
        return (
          <rect
            {...commonProps}
            x={element.x || 0}
            y={element.y || 0}
            width={element.width || 100}
            height={element.height || 100}
            fill={fill ? normalizeColor(fill.color) : '#f3f4f6'}
            stroke={stroke ? normalizeColor(stroke.color) : '#d1d5db'}
            strokeWidth={stroke?.weight || 1}
            rx={element.cornerRadius || 0}
          />
        );

      case 'text':
        return (
          <g {...commonProps}>
            <text
              x={element.x || 0}
              y={(element.y || 0) + (element.fontSize || 16)}
              fontSize={element.fontSize || 16}
              fontFamily={element.fontFamily || 'Inter, sans-serif'}
              fill={fill ? normalizeColor(fill.color) : '#000'}
            >
              {element.textContent || element.name || 'Text'}
            </text>
          </g>
        );

      case 'group':
        return (
          <g {...commonProps} transform={`translate(${element.x || 0}, ${element.y || 0})`}>
            <rect
              width={element.width || 100}
              height={element.height || 100}
              fill="none"
              stroke="#9ca3af"
              strokeWidth="1"
              strokeDasharray="4"
            />
          </g>
        );

      default:
        return (
          <rect
            {...commonProps}
            x={element.x || 0}
            y={element.y || 0}
            width={element.width || 100}
            height={element.height || 100}
            fill="#f9fafb"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        );
    }
  };

  const selectedElementData = elements.find(
    (el, idx) => (el.id || `element-${idx}`) === selectedElement
  );

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-muted-foreground min-w-16 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={scale >= 2}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetZoom}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {width} × {height}
          </Badge>
          {metadata && (
            <Badge variant="outline">
              {metadata.componentType}
            </Badge>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex gap-4">
        {/* SVG Preview */}
        <div className="flex-1 bg-white dark:bg-gray-950 rounded-lg border border-border overflow-auto">
          <div className="p-8 flex justify-center items-center min-h-full">
            <div
              className="bg-white dark:bg-gray-950 border-2 border-border rounded-lg shadow-lg"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'center',
                transition: 'transform 0.2s',
              }}
            >
              <svg
                width={width}
                height={height}
                className="block"
                style={{ maxWidth: '100%', height: 'auto' }}
              >
                {elements.map((element, index) => renderElement(element, index))}
              </svg>
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        {selectedElementData && (
          <Card className="w-80">
            <CardHeader>
              <CardTitle className="text-lg">Element Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-sm font-mono mt-1">
                  {selectedElementData.name || 'Unnamed Element'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <Badge variant="secondary" className="mt-1">
                  {selectedElementData.type}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Position</label>
                <p className="text-sm font-mono mt-1">
                  X: {selectedElementData.x || 0}, Y: {selectedElementData.y || 0}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Size</label>
                <p className="text-sm font-mono mt-1">
                  {selectedElementData.width || 0} × {selectedElementData.height || 0}
                </p>
              </div>
              {selectedElementData.cornerRadius && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Corner Radius
                  </label>
                  <p className="text-sm font-mono mt-1">
                    {selectedElementData.cornerRadius}px
                  </p>
                </div>
              )}
              {selectedElementData.textContent && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Text</label>
                  <p className="text-sm mt-1">{selectedElementData.textContent}</p>
                </div>
              )}
              {selectedElementData.fontSize && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Font Size
                  </label>
                  <p className="text-sm font-mono mt-1">
                    {selectedElementData.fontSize}px
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Metadata Footer */}
      {metadata && (
        <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-4">
            <span>Framework: {metadata.framework}</span>
            <span>Generated: {new Date(metadata.generatedAt).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{metadata.outputFormat}</Badge>
          </div>
        </div>
      )}
    </div>
  );
}
