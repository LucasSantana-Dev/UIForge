'use client';

import { useState, useMemo } from 'react';
import { RefreshCwIcon, MaximizeIcon, Smartphone, Tablet, Monitor } from 'lucide-react';

interface LivePreviewProps {
  code: string;
  framework: string;
}

type Viewport = 'mobile' | 'tablet' | 'desktop';

const VIEWPORT_WIDTHS: Record<Viewport, string> = {
  mobile: '375px',
  tablet: '768px',
  desktop: '100%',
};

export default function LivePreview({ code, framework }: LivePreviewProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewport, setViewport] = useState<Viewport>('desktop');

  const previewHTML = useMemo(() => {
    if (!code) return '';
    if (framework === 'react') return createReactPreviewHTML(code);
    if (framework === 'vue') return createVuePreviewHTML(code);
    return createFallbackHTML(code, framework);
  }, [code, framework]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setIsRefreshing(false), 300);
  };

  const viewportButtons: Array<{
    key: Viewport;
    icon: typeof Smartphone;
    label: string;
  }> = [
    { key: 'mobile', icon: Smartphone, label: 'Mobile' },
    { key: 'tablet', icon: Tablet, label: 'Tablet' },
    { key: 'desktop', icon: Monitor, label: 'Desktop' },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">Live Preview</h3>
        <div className="flex items-center space-x-1">
          {viewportButtons.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setViewport(key)}
              className={`inline-flex items-center px-2 py-1 text-xs rounded ${
                viewport === key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-500 hover:bg-gray-200'
              }`}
              aria-label={label}
              title={label}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}

          <div className="w-px h-4 bg-gray-300 mx-1" />

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
      <div className="flex-1 relative overflow-auto">
        {!code ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MaximizeIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Generate a component to see preview</p>
            </div>
          </div>
        ) : (
          <div
            className="h-full flex justify-center"
            style={{
              padding: viewport !== 'desktop' ? '0 16px' : undefined,
            }}
          >
            <iframe
              key={refreshKey}
              srcDoc={previewHTML}
              className="h-full border-0 bg-white transition-all duration-200"
              style={{
                width: VIEWPORT_WIDTHS[viewport],
                maxWidth: '100%',
                boxShadow: viewport !== 'desktop' ? '0 0 0 1px rgba(0,0,0,0.1)' : undefined,
              }}
              sandbox="allow-scripts"
              title="Component Preview"
            />
          </div>
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
    #error-display { color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; font-size: 13px; font-family: monospace; white-space: pre-wrap; display: none; margin: 16px; }
    #root { min-height: 40px; }
  </style>
</head>
<body>
  <div id="root"></div>
  <div id="error-display"></div>
  <script>
    window.onerror = function(msg, src, line, col) {
      var el = document.getElementById('error-display');
      el.style.display = 'block';
      el.textContent = msg + (line ? ' (line ' + line + ')' : '');
      document.getElementById('root').style.display = 'none';
      return true;
    };
  </script>
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

function createVuePreviewHTML(code: string): string {
  const processed = code
    .replace(/^import\s+.*$/gm, '')
    .replace(/export\s+default\s+/gm, 'const __VueComponent__ = ');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
  <style>
    body { margin: 0; padding: 16px; font-family: system-ui, -apple-system, sans-serif; }
    #error-display { color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; font-size: 13px; font-family: monospace; white-space: pre-wrap; display: none; margin: 16px; }
    #app { min-height: 40px; }
  </style>
</head>
<body>
  <div id="app"></div>
  <div id="error-display"></div>
  <script>
    window.onerror = function(msg, src, line, col) {
      var el = document.getElementById('error-display');
      el.style.display = 'block';
      el.textContent = msg + (line ? ' (line ' + line + ')' : '');
      document.getElementById('app').style.display = 'none';
      return true;
    };

    try {
      const { createApp, ref, reactive, computed, watch, watchEffect, onMounted, onUnmounted, defineComponent, h, toRefs, nextTick } = Vue;

      ${processed}

      var component = (typeof __VueComponent__ !== 'undefined') ? __VueComponent__ : null;

      if (component) {
        var app = createApp(component);
        app.config.errorHandler = function(err) {
          var el = document.getElementById('error-display');
          el.style.display = 'block';
          el.textContent = err.message || String(err);
          document.getElementById('app').style.display = 'none';
        };
        app.mount('#app');
      } else {
        document.getElementById('error-display').style.display = 'block';
        document.getElementById('error-display').textContent = 'No default export found. Use "export default { ... }" or "export default defineComponent({ ... })"';
      }
    } catch (err) {
      var errorDiv = document.getElementById('error-display');
      errorDiv.style.display = 'block';
      errorDiv.textContent = err.message;
      document.getElementById('app').style.display = 'none';
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
