'use client';

import { useState, useCallback, useMemo } from 'react';
import { PlayIcon, CopyIcon, CheckIcon, LoaderIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Endpoint, Parameter, Schema } from '@/lib/openapi/types';
import { METHOD_COLORS } from '@/lib/openapi/types';

interface TryItPanelProps {
  endpoint: Endpoint;
  baseUrl: string;
}

interface ParamState {
  [key: string]: string;
}

function buildBodyFromSchema(schema: Schema | null): string {
  if (!schema) return '{}';
  if (schema.type === 'object' && schema.properties) {
    const obj: Record<string, unknown> = {};
    for (const [key, prop] of Object.entries(schema.properties)) {
      if (prop.example !== undefined) {
        obj[key] = prop.example;
      } else if (prop.default !== undefined) {
        obj[key] = prop.default;
      } else if (prop.type === 'string') {
        obj[key] = prop.enum?.[0] ?? '';
      } else if (prop.type === 'number' || prop.type === 'integer') {
        obj[key] = 0;
      } else if (prop.type === 'boolean') {
        obj[key] = false;
      } else if (prop.type === 'array') {
        obj[key] = [];
      } else {
        obj[key] = null;
      }
    }
    return JSON.stringify(obj, null, 2);
  }
  return '{}';
}

export default function TryItPanel({ endpoint, baseUrl }: TryItPanelProps) {
  const { method, path, operation } = endpoint;
  const params = useMemo(() => operation.parameters || [], [operation.parameters]);
  const hasBody = !!operation.requestBody;

  const bodySchema = operation.requestBody?.content?.['application/json']?.schema ?? null;

  const [paramValues, setParamValues] = useState<ParamState>(() => {
    const init: ParamState = {};
    for (const p of params) {
      init[`${p.in}:${p.name}`] = String(p.schema?.example ?? p.schema?.default ?? '');
    }
    return init;
  });

  const [body, setBody] = useState(() => buildBodyFromSchema(bodySchema));
  const [response, setResponse] = useState<{
    status: number;
    statusText: string;
    body: string;
    duration: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const buildUrl = useCallback(() => {
    let url = path;
    const queryParts: string[] = [];

    for (const p of params) {
      const val = paramValues[`${p.in}:${p.name}`] || '';
      if (p.in === 'path') {
        url = url.replace(`{${p.name}}`, encodeURIComponent(val));
      } else if (p.in === 'query' && val) {
        queryParts.push(`${encodeURIComponent(p.name)}=${encodeURIComponent(val)}`);
      }
    }

    const fullUrl = `${baseUrl}${url}`;
    return queryParts.length > 0 ? `${fullUrl}?${queryParts.join('&')}` : fullUrl;
  }, [path, params, paramValues, baseUrl]);

  const handleSend = useCallback(async () => {
    setLoading(true);
    setResponse(null);
    const start = performance.now();

    try {
      const url = buildUrl();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };

      for (const p of params) {
        if (p.in === 'header') {
          const val = paramValues[`header:${p.name}`];
          if (val) headers[p.name] = val;
        }
      }

      const res = await fetch(url, {
        method: method.toUpperCase(),
        headers,
        ...(hasBody && method !== 'get' ? { body } : {}),
      });

      const duration = Math.round(performance.now() - start);
      const text = await res.text();

      let formatted: string;
      try {
        formatted = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        formatted = text;
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        body: formatted,
        duration,
      });
    } catch (err) {
      setResponse({
        status: 0,
        statusText: 'Network Error',
        body: err instanceof Error ? err.message : 'Request failed',
        duration: Math.round(performance.now() - start),
      });
    } finally {
      setLoading(false);
    }
  }, [buildUrl, method, params, paramValues, hasBody, body]);

  const handleCopy = useCallback(() => {
    if (!response) return;
    navigator.clipboard.writeText(response.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [response]);

  const paramGroups = params.reduce<Record<string, Parameter[]>>((acc, p) => {
    (acc[p.in] ??= []).push(p);
    return acc;
  }, {});

  return (
    <div className="border-t border-surface-3 bg-surface-2/50">
      <div className="px-4 py-3 space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
          <PlayIcon className="w-3 h-3" />
          Try It
        </div>

        {Object.entries(paramGroups).map(([location, locationParams]) => (
          <div key={location} className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-text-muted">
              {location} parameters
            </span>
            {locationParams.map((p) => (
              <div key={`${p.in}:${p.name}`} className="flex items-center gap-2">
                <label className="text-xs text-text-secondary w-28 truncate shrink-0">
                  {p.name}
                  {p.required && <span className="text-amber-400 ml-0.5">*</span>}
                </label>
                {p.schema?.enum ? (
                  <select
                    value={paramValues[`${p.in}:${p.name}`] || ''}
                    onChange={(e) =>
                      setParamValues((prev) => ({
                        ...prev,
                        [`${p.in}:${p.name}`]: e.target.value,
                      }))
                    }
                    className="flex-1 h-7 rounded border border-surface-3 bg-surface-1 px-2 text-xs text-text-primary"
                  >
                    <option value="">Select...</option>
                    {p.schema.enum.map((v) => (
                      <option key={String(v)} value={String(v)}>
                        {String(v)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    value={paramValues[`${p.in}:${p.name}`] || ''}
                    onChange={(e) =>
                      setParamValues((prev) => ({
                        ...prev,
                        [`${p.in}:${p.name}`]: e.target.value,
                      }))
                    }
                    placeholder={p.schema?.type || 'string'}
                    className="flex-1 h-7 text-xs bg-surface-1 border-surface-3"
                  />
                )}
              </div>
            ))}
          </div>
        ))}

        {hasBody && method !== 'get' && (
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-text-muted">
              Request body
            </span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={Math.min(body.split('\n').length + 1, 12)}
              className="w-full rounded border border-surface-3 bg-surface-1 px-3 py-2 text-xs font-mono text-text-primary resize-y"
              spellCheck={false}
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSend}
            disabled={loading}
            className={`h-7 text-xs ${METHOD_COLORS[method].split(' ').slice(0, 2).join(' ')} border`}
          >
            {loading ? (
              <LoaderIcon className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <PlayIcon className="w-3 h-3 mr-1" />
            )}
            Send
          </Button>
          <code className="text-[11px] text-text-muted font-mono truncate">{buildUrl()}</code>
        </div>

        {response && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`font-mono text-xs font-semibold ${
                  response.status >= 200 && response.status < 300
                    ? 'text-emerald-400'
                    : response.status >= 400
                      ? 'text-red-400'
                      : 'text-amber-400'
                }`}
              >
                {response.status} {response.statusText}
              </span>
              <span className="text-[10px] text-text-muted">{response.duration}ms</span>
              <button
                onClick={handleCopy}
                className="ml-auto text-text-muted hover:text-text-secondary"
                title="Copy response"
              >
                {copied ? (
                  <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <CopyIcon className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <pre className="rounded border border-surface-3 bg-surface-1 px-3 py-2 text-xs font-mono text-text-primary overflow-x-auto max-h-64 overflow-y-auto">
              {response.body}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
