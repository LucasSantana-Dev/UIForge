import MethodBadge from './MethodBadge';
import SchemaViewer from './SchemaViewer';
import type { Endpoint, Schema } from '@/lib/openapi/types';

interface EndpointCardProps {
  endpoint: Endpoint;
}

export default function EndpointCard({ endpoint }: EndpointCardProps) {
  const { method, path, operation } = endpoint;
  const params = operation.parameters || [];
  const requestBody = operation.requestBody;
  const responses = operation.responses || {};
  const isDeprecated = operation.deprecated;

  function getBodySchema(): Schema | null {
    if (!requestBody?.content) return null;
    const json = requestBody.content['application/json'];
    return json?.schema || null;
  }

  function getResponseSchema(code: string): Schema | null {
    const resp = responses[code];
    if (!resp?.content) return null;
    const json = resp.content['application/json'];
    return json?.schema || null;
  }

  return (
    <div className={`border border-surface-3 rounded-lg ${isDeprecated ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <MethodBadge method={method} />
        <code
          className={`text-sm text-text-primary font-mono ${isDeprecated ? 'line-through' : ''}`}
        >
          {path}
        </code>
        {operation.summary && (
          <span className="text-sm text-text-secondary ml-auto truncate max-w-[50%]">
            {operation.summary}
          </span>
        )}
      </div>

      <div className="border-t border-surface-3">
        {params.length > 0 && (
          <details className="group">
            <summary className="px-4 py-2 text-xs font-medium text-text-secondary cursor-pointer hover:text-text-primary">
              Parameters ({params.length})
            </summary>
            <div className="px-4 pb-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-text-secondary text-left">
                    <th className="pb-1 pr-3 font-medium">Name</th>
                    <th className="pb-1 pr-3 font-medium">In</th>
                    <th className="pb-1 pr-3 font-medium">Type</th>
                    <th className="pb-1 pr-3 font-medium">Req</th>
                    <th className="pb-1 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {params.map((p) => (
                    <tr key={`${p.in}-${p.name}`}>
                      <td className="py-0.5 pr-3 text-violet-400 font-mono">{p.name}</td>
                      <td className="py-0.5 pr-3 text-text-secondary">{p.in}</td>
                      <td className="py-0.5 pr-3 text-emerald-400 font-mono">
                        {p.schema?.type || 'string'}
                      </td>
                      <td className="py-0.5 pr-3">
                        {p.required && <span className="text-amber-400">*</span>}
                      </td>
                      <td className="py-0.5 text-text-secondary truncate max-w-[200px]">
                        {p.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        )}

        {requestBody && (
          <details className="group">
            <summary className="px-4 py-2 text-xs font-medium text-text-secondary cursor-pointer hover:text-text-primary border-t border-surface-3">
              Request Body
            </summary>
            <div className="px-4 pb-3">
              {getBodySchema() ? (
                <SchemaViewer schema={getBodySchema()!} />
              ) : (
                <span className="text-xs text-text-secondary">No schema</span>
              )}
            </div>
          </details>
        )}

        {Object.keys(responses).length > 0 && (
          <details className="group">
            <summary className="px-4 py-2 text-xs font-medium text-text-secondary cursor-pointer hover:text-text-primary border-t border-surface-3">
              Responses ({Object.keys(responses).length})
            </summary>
            <div className="px-4 pb-3 space-y-2">
              {Object.entries(responses).map(([code, resp]) => (
                <div key={code}>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`font-mono text-xs font-semibold ${
                        code.startsWith('2')
                          ? 'text-emerald-400'
                          : code.startsWith('4')
                            ? 'text-amber-400'
                            : code.startsWith('5')
                              ? 'text-red-400'
                              : 'text-text-secondary'
                      }`}
                    >
                      {code}
                    </span>
                    <span className="text-xs text-text-secondary">{resp.description}</span>
                  </div>
                  {getResponseSchema(code) && <SchemaViewer schema={getResponseSchema(code)!} />}
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
