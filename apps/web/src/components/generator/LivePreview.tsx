'use client';

import { useState, useMemo } from 'react';
import { RefreshCwIcon, MaximizeIcon } from 'lucide-react';

interface LivePreviewProps {
  code: string;
  framework: string;
}

export default function LivePreview({ code, framework }: LivePreviewProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const previewHTML = useMemo(() => {
    if (!code) return '';
    return framework === 'react'
      ? createReactPreviewHTML(code)
      : createFallbackHTML(code, framework);
  }, [code, framework]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setIsRefreshing(false), 300);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">Live Preview</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || !code}
            className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            aria-label="Refresh preview"
          >
            <RefreshCwIcon className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      <div className="flex-1 relative">
        {!code ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MaximizeIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Generate a component to see preview</p>
            </div>
          </div>
        ) : (
          <iframe
            key={refreshKey}
            srcDoc={previewHTML}
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts"
            title="Component Preview"
          />
        )}
      </div>
    </div>
  );
}

function stripImportsAndExports(code: string): string {
  return code
    .replace(/^import\s+.*$/gm, '')
    .replace(/^export\s+default\s+/gm, 'const __DefaultExport__ = ')
    .replace(/^export\s+/gm, '');
}

function extractComponentName(code: string): string | null {
  const defaultExport = code.match(/export\s+default\s+(?:function\s+)?(\w+)/);
  if (defaultExport) return defaultExport[1];

  const namedFunction = code.match(/(?:function|const|class)\s+([A-Z]\w+)/);
  return namedFunction ? namedFunction[1] : null;
}

function createReactPreviewHTML(code: string): string {
  const componentName = extractComponentName(code) || '__DefaultExport__';
  const strippedCode = stripImportsAndExports(code);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { margin: 0; padding: 16px; font-family: system-ui, -apple-system, sans-serif; }
    #error-display { color: #dc2626; padding: 16px; font-size: 13px; font-family: monospace; white-space: pre-wrap; display: none; }
    #root { min-height: 40px; }
  </style>
</head>
<body>
  <div id="root"></div>
  <div id="error-display"></div>
  <script type="text/babel" data-type="module">
    try {
      const { useState, useEffect, useRef, useCallback, useMemo, useContext, createContext, forwardRef, memo, Fragment } = React;

      ${strippedCode}

      const App = ${componentName};
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(App));
    } catch (err) {
      const errorDiv = document.getElementById('error-display');
      errorDiv.style.display = 'block';
      errorDiv.textContent = err.message;
      document.getElementById('root').style.display = 'none';
    }
  </script>
</body>
</html>`;
}

function createFallbackHTML(code: string, framework: string): string {
  const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 16px; font-family: system-ui, sans-serif; }
    pre { background: #f8f9fa; padding: 16px; border-radius: 8px; overflow: auto; font-size: 13px; }
    .badge { display: inline-block; background: #e5e7eb; color: #374151; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-bottom: 8px; }
  </style>
</head>
<body>
  <span class="badge">${framework} preview</span>
  <pre><code>${escaped}</code></pre>
</body>
</html>`;
}
