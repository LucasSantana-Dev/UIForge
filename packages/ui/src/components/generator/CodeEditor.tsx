'use client';

import { useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { CopyIcon, DownloadIcon, CheckIcon } from 'lucide-react';
import { registerSizaCompletions } from './completion-provider';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  language?: string;
  framework?: string;
  componentLibrary?: string;
}

export default function CodeEditor({
  code,
  onChange,
  language = 'typescript',
  framework = 'react',
  componentLibrary = 'tailwind',
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<any>(null);

  const disposeRef = useRef<(() => void) | null>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    if (disposeRef.current) disposeRef.current();
    disposeRef.current = registerSizaCompletions(monaco, framework, componentLibrary);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `component.${language === 'typescript' ? 'tsx' : 'vue'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-surface-0 border-b border-surface-3">
        <h3 className="text-sm font-medium text-text-primary">Code Editor</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center px-3 py-1 text-xs font-medium text-text-primary bg-surface-1 border border-surface-3 rounded hover:bg-surface-0"
            aria-label="Copy code"
          >
            {copied ? (
              <>
                <CheckIcon className="h-3 w-3 mr-1" />
                Copied
              </>
            ) : (
              <>
                <CopyIcon className="h-3 w-3 mr-1" />
                Copy
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-3 py-1 text-xs font-medium text-text-primary bg-surface-1 border border-surface-3 rounded hover:bg-surface-0"
            aria-label="Download code"
          >
            <DownloadIcon className="h-3 w-3 mr-1" />
            Download
          </button>
        </div>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage={language}
          language={language}
          value={code}
          onChange={(value) => onChange(value || '')}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  );
}
