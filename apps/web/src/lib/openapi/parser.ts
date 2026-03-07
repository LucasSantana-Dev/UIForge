import yaml from 'js-yaml';
import type { OpenAPISpec, Endpoint, HttpMethod, Parameter } from './types';

const HTTP_METHODS: HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete'];

export function detectFormat(content: string): 'yaml' | 'json' {
  const trimmed = content.trimStart();
  return trimmed.startsWith('{') || trimmed.startsWith('[') ? 'json' : 'yaml';
}

export function parseSpec(content: string): OpenAPISpec {
  const format = detectFormat(content);
  const parsed = format === 'json' ? JSON.parse(content) : yaml.load(content);
  if (!validateSpec(parsed)) {
    throw new Error('Invalid OpenAPI specification');
  }
  return resolveRefs(parsed);
}

export function validateSpec(spec: unknown): spec is OpenAPISpec {
  if (!spec || typeof spec !== 'object') return false;
  const s = spec as Record<string, unknown>;
  if (typeof s.openapi !== 'string') return false;
  if (!s.openapi.startsWith('3.')) return false;
  if (!s.info || typeof s.info !== 'object' || !('title' in s.info)) return false;
  if (!s.paths || typeof s.paths !== 'object') return false;
  return true;
}

export function resolveRefs(spec: OpenAPISpec): OpenAPISpec {
  const schemas = spec.components?.schemas || {};

  function resolve(node: unknown): unknown {
    if (!node || typeof node !== 'object') return node;
    if (Array.isArray(node)) return node.map(resolve);

    const obj = node as Record<string, unknown>;
    if (typeof obj.$ref === 'string') {
      const match = obj.$ref.match(/^#\/components\/schemas\/(.+)$/);
      if (match && schemas[match[1]]) {
        return resolve(schemas[match[1]]);
      }
      return obj;
    }

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = resolve(value);
    }
    return result;
  }

  return resolve(spec) as OpenAPISpec;
}

export function getEndpoints(spec: OpenAPISpec): Endpoint[] {
  const endpoints: Endpoint[] = [];

  for (const [path, pathItem] of Object.entries(spec.paths)) {
    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];
      if (operation) {
        endpoints.push({
          method,
          path,
          operation: {
            ...operation,
            parameters: [
              ...((pathItem as { parameters?: Parameter[] }).parameters || []),
              ...(operation.parameters || []),
            ],
          },
        });
      }
    }
  }

  return endpoints.sort((a, b) => a.path.localeCompare(b.path));
}
