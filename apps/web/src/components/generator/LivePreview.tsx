'use client';

import { useEffect, useRef, useState } from 'react';
import { RefreshCwIcon, MaximizeIcon } from 'lucide-react';

interface LivePreviewProps {
  code: string;
  framework: string;
}

export default function LivePreview({ code, framework }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code || !iframeRef.current) return;

    const updatePreview = async () => {
      try {
        const iframeDoc = iframeRef.current?.contentDocument;
        if (!iframeDoc) return;

        // Create preview HTML
        const previewHTML = createPreviewHTML(code, framework);

        iframeDoc.open();
        iframeDoc.write(previewHTML);
        iframeDoc.close();

        // Clear any previous error after successful render
        setTimeout(() => setError(null), 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to render preview');
      }
    };

    updatePreview();
  }, [code, framework]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (iframeRef.current) {
      // Force refresh by clearing and resetting
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc;
        }
      }, 50);
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">Live Preview</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            aria-label="Refresh preview"
          >
            <RefreshCwIcon className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      <div className="flex-1 relative">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        ) : !code ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MaximizeIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Generate a component to see preview</p>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts"
            title="Component Preview"
          />
        )}
      </div>
    </div>
  );
}

function createPreviewHTML(code: string, framework: string): string {
  // For React components, create a simple preview
  if (framework === 'react') {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body>
  <div id="root">
    <div class="p-8">
      <div class="text-gray-600 text-sm mb-4">Component Preview (Static)</div>
      <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p class="text-gray-500">Live preview will be available once the component is fully integrated</p>
        <p class="text-sm text-gray-400 mt-2">For now, copy the code and test it in your project</p>
      </div>
    </div>
  </div>
</body>
</html>`;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 20px; font-family: system-ui, sans-serif; }
  </style>
</head>
<body>
  <div>Preview for ${framework} components coming soon</div>
</body>
</html>`;
}
