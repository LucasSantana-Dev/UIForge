'use client';

import { useState, useEffect } from 'react';
import { marked } from 'marked';
import { FileTextIcon, ExternalLinkIcon, Loader2Icon, AlertTriangleIcon } from 'lucide-react';

interface TechDocsPanelProps {
  documentationUrl?: string;
  repositoryUrl?: string;
}

export default function TechDocsPanel({ documentationUrl, repositoryUrl }: TechDocsPanelProps) {
  const [content, setContent] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);

  const docsUrl = documentationUrl || repositoryUrl || null;
  const isLoading = docsUrl !== null && loadedUrl !== docsUrl;

  useEffect(() => {
    if (!docsUrl) return;

    fetch(`/api/catalog/docs?url=${encodeURIComponent(docsUrl)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch documentation');
        return res.json();
      })
      .then((json) => {
        const html = marked.parse(json.data.content, {
          async: false,
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
      <div
        className="prose prose-invert prose-sm max-w-none p-6 prose-headings:text-text-primary prose-a:text-violet-400 prose-code:text-emerald-400 prose-code:bg-surface-2 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-surface-2 prose-pre:border prose-pre:border-surface-3"
        dangerouslySetInnerHTML={{ __html: content || '' }}
      />
    </div>
  );
}
