'use client';

interface JsonSchemaProperty {
  type: string;
  enum?: string[];
  description?: string;
}

interface ParameterSchema {
  type: string;
  properties?: Record<string, JsonSchemaProperty>;
}

interface SkillParameterFormProps {
  schema: ParameterSchema;
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
}

export function SkillParameterForm({ schema, values, onChange }: SkillParameterFormProps) {
  if (!schema.properties || Object.keys(schema.properties).length === 0) return null;

  const handleChange = (key: string, value: unknown) => {
    onChange({ ...values, [key]: value });
  };

  return (
    <div className="space-y-2 pl-6 border-l-2 border-brand/20">
      {Object.entries(schema.properties).map(([key, prop]) => (
        <div key={key}>
          <label
            htmlFor={`skill-param-${key}`}
            className="block text-xs font-medium text-text-secondary mb-1"
          >
            {key}
            {prop.description && (
              <span className="ml-1 font-normal text-text-secondary/70">— {prop.description}</span>
            )}
          </label>
          {prop.enum ? (
            <select
              id={`skill-param-${key}`}
              value={(values[key] as string) ?? ''}
              onChange={(e) => handleChange(key, e.target.value || undefined)}
              className="w-full px-2 py-1.5 text-xs bg-surface-1 text-text-primary border border-surface-3 rounded-md focus:ring-brand focus:border-brand"
            >
              <option value="">Default</option>
              {prop.enum.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          ) : prop.type === 'boolean' ? (
            <label className="flex items-center gap-2">
              <input
                id={`skill-param-${key}`}
                type="checkbox"
                checked={!!values[key]}
                onChange={(e) => handleChange(key, e.target.checked)}
                className="rounded border-surface-3 text-brand focus:ring-brand"
              />
              <span className="text-xs text-text-secondary">Enable</span>
            </label>
          ) : (
            <input
              id={`skill-param-${key}`}
              type="text"
              value={(values[key] as string) ?? ''}
              onChange={(e) => handleChange(key, e.target.value || undefined)}
              className="w-full px-2 py-1.5 text-xs bg-surface-1 text-text-primary border border-surface-3 rounded-md focus:ring-brand focus:border-brand"
            />
          )}
        </div>
      ))}
    </div>
  );
}
