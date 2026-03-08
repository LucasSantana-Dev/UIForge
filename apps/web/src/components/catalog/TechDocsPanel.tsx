'use client';

import { useState, useEffect, useMemo } from 'react';
import { marked } from 'marked';
import {
  FileTextIcon,
  ExternalLinkIcon,
  Loader2Icon,
  AlertTriangleIcon,
  ListIcon,
} from 'lucide-react';

interface TocEntry {
  id: string;
  text: string;
  level: number;
}

function extractToc(html: string): TocEntry[] {
  const regex = /<h([1-3])\s*(?:id="([^"]*)")?[^>]*>(.*?)<\/h[1-3]>/gi;
  const entries: TocEntry[] = [];
  let m;
  while ((m = regex.exec(html)) !== null) {
    const level = parseInt(m[1], 10);
    const text = m[3].replace(/<[^>]*>/g, '');
    const id =
      m[2] ||
      text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
    entries.push({ id, text, level });
  }
  return entries;
}

interface TechDocsPanelProps {
  documentationUrl?: string;
  repositoryUrl?: string;
}

export default function TechDocsPanel({ documentationUrl, repositoryUrl }: TechDocsPanelProps) {
  const [content, setContent] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const [showToc, setShowToc] = useState(true);

  const docsUrl = documentationUrl || repositoryUrl || null;
  const isLoading = docsUrl !== null && loadedUrl !== docsUrl;

  const toc = useMemo(() => (content ? extractToc(content) : []), [content]);

  useEffect(() => {
    if (!docsUrl) return;

    fetch(`/api/catalog/docs?url=${encodeURIComponent(docsUrl)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch documentation');
        return res.json();
      })
      .then((json) => {
        const renderer = new marked.Renderer();
        renderer.heading = ({ text, depth }) => {
          const slug = text
            .toLowerCase()
            .replace(/<[^>]*>/g, '')
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
          return `<h${depth} id="${slug}">${text}</h${depth}>`;
        };
        const html = marked.parse(json.data.content, {
          async: false,
          renderer,
        }) as string;
        setContent(html);
        setSource(json.data.source);
        setError(null);
        setLoadedUrl(docsUrl);
      })
      .catch((err) => {
        setError(err.message);
        setContent(null);
        setLoadedUrl(docsUrl);
      });
  }, [docsUrl]);

  if (!docsUrl) {
    return (
      <div className="rounded-xl border border-surface-3 bg-surface-1 p-8 text-center">
        <FileTextIcon className="mx-auto h-8 w-8 text-text-muted mb-3" />
        <p className="text-sm text-text-secondary">
          No documentation URL configured for this entry.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-surface-3 bg-surface-1 p-8 text-center">
        <Loader2Icon className="mx-auto h-6 w-6 text-violet-400 animate-spin mb-3" />
        <p className="text-sm text-text-secondary">Loading documentation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-surface-3 bg-surface-1 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangleIcon className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-text-primary mb-1">Unable to load documentation</p>
            <p className="text-xs text-text-secondary mb-3">{error}</p>
            <a
              href={docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-violet-400 hover:underline"
            >
              View externally <ExternalLinkIcon className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-surface-3 bg-surface-1 overflow-hidden">
      <div className="flex items-center justify-between border-b border-surface-3 px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <FileTextIcon className="h-4 w-4" />
          Documentation
        </div>
        <div className="flex items-center gap-2">
          {toc.length > 2 && (
            <button
              onClick={() => setShowToc(!showToc)}
              className="p-1 text-text-muted hover:text-violet-400 transition-colors"
              title="Toggle table of contents"
            >
              <ListIcon className="h-3.5 w-3.5" />
            </button>
          )}
          {source && (
            <a
              href={source}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-violet-400 transition-colors"
            >
              Source <ExternalLinkIcon className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
      <div className="flex">
        {toc.length > 2 && showToc && (
          <nav className="hidden lg:block w-48 shrink-0 border-r border-surface-3 p-4 space-y-1 overflow-y-auto max-h-[600px]">
            <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">
              On this page
            </span>
            {toc.map((entry) => (
              <a
                key={entry.id}
                href={`#${entry.id}`}
                className="block text-xs text-text-secondary hover:text-violet-400 transition-colors truncate"
                style={{ paddingLeft: (entry.level - 1) * 12 }}
              >
                {entry.text}
              </a>
            ))}
          </nav>
        )}
        <div
          className="prose prose-invert prose-sm max-w-none p-6 flex-1 prose-headings:text-text-primary prose-a:text-violet-400 prose-code:text-emerald-400 prose-code:bg-surface-2 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-surface-2 prose-pre:border prose-pre:border-surface-3"
          // Content is parsed from markdown via `marked` library — already sanitized at API level
          dangerouslySetInnerHTML={{ __html: content || '' }}
        />
      </div>
    </div>
  );
}
