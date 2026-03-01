'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Copy, Check } from 'lucide-react';

const LANG_MAP: Record<string, string> = {
  ts: 'TypeScript',
  tsx: 'TypeScript',
  js: 'JavaScript',
  jsx: 'JavaScript',
  bash: 'Bash',
  sh: 'Shell',
  json: 'JSON',
  css: 'CSS',
  html: 'HTML',
  yaml: 'YAML',
  yml: 'YAML',
  sql: 'SQL',
  py: 'Python',
  rs: 'Rust',
  go: 'Go',
  mdx: 'MDX',
  md: 'Markdown',
};

interface ChildProps {
  className?: string;
  children?: ReactNode;
}

function isElementWithProps(node: ReactNode): node is React.ReactElement<ChildProps> {
  return (
    node !== null &&
    node !== undefined &&
    typeof node === 'object' &&
    'props' in node &&
    node.props !== undefined &&
    typeof node.props === 'object'
  );
}

function extractLanguage(children: ReactNode): string | undefined {
  if (isElementWithProps(children)) {
    const className = children.props.className;
    if (typeof className === 'string') {
      const match = className.match(/language-(\w+)/);
      if (match) return match[1];
    }
  }
  return undefined;
}

function extractText(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!node) return '';
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (isElementWithProps(node)) {
    return extractText(node.props.children);
  }
  return '';
}

export default function CodeBlock({ children, ...props }: { children: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const lang = extractLanguage(children);
  const label = lang ? (LANG_MAP[lang] ?? lang) : undefined;

  const handleCopy = () => {
    const text = extractText(children);
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="docs-codeblock">
      {label && (
        <div className="docs-codeblock-header">
          <span className="docs-codeblock-lang">{label}</span>
          <button
            type="button"
            className="docs-codeblock-copy"
            onClick={handleCopy}
            aria-label={copied ? 'Copied' : 'Copy code'}
            aria-live="polite"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      )}
      <pre {...props}>{children}</pre>
    </div>
  );
}
