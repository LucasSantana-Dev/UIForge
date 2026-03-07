import type { Schema } from '@/lib/openapi/types';

interface SchemaViewerProps {
  schema: Schema;
  depth?: number;
  seen?: Set<Schema>;
}

const MAX_DEPTH = 5;

function renderType(schema: Schema): string {
  if (schema.type === 'array' && schema.items) {
    return `${renderType(schema.items)}[]`;
  }
  const base = schema.type || 'any';
  return schema.nullable ? `${base} | null` : base;
}

export default function SchemaViewer({ schema, depth = 0, seen = new Set() }: SchemaViewerProps) {
  if (depth > MAX_DEPTH || seen.has(schema)) {
    return <span className="text-text-secondary text-xs italic">...</span>;
  }

  const nextSeen = new Set(seen).add(schema);

  if (schema.enum) {
    return (
      <span className="text-xs">
        <span className="text-emerald-400 font-mono">enum</span>
        <span className="text-text-secondary ml-1">[{schema.enum.map(String).join(' | ')}]</span>
      </span>
    );
  }

  if (schema.type === 'object' && schema.properties) {
    const required = new Set(schema.required || []);
    return (
      <div className="space-y-1" style={{ paddingLeft: depth > 0 ? 12 : 0 }}>
        {Object.entries(schema.properties).map(([name, prop]) => (
          <div key={name} className="flex items-start gap-2 text-xs">
            <span className="text-violet-400 font-mono shrink-0">{name}</span>
            {required.has(name) && <span className="text-amber-400 text-[10px]">*</span>}
            <span className="text-emerald-400 font-mono shrink-0">{renderType(prop)}</span>
            {prop.description && (
              <span className="text-text-secondary truncate">{prop.description}</span>
            )}
            {prop.type === 'object' && prop.properties && (
              <SchemaViewer schema={prop} depth={depth + 1} seen={nextSeen} />
            )}
          </div>
        ))}
      </div>
    );
  }

  if (schema.type === 'array' && schema.items) {
    return (
      <div className="text-xs">
        <span className="text-emerald-400 font-mono">{renderType(schema)}</span>
        {schema.items.type === 'object' && schema.items.properties && (
          <SchemaViewer schema={schema.items} depth={depth + 1} seen={nextSeen} />
        )}
      </div>
    );
  }

  return <span className="text-emerald-400 font-mono text-xs">{renderType(schema)}</span>;
}
