export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export const METHOD_COLORS: Record<HttpMethod, string> = {
  get: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  post: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  put: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  patch: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  delete: 'bg-red-500/15 text-red-400 border-red-500/30',
};

export interface Schema {
  type?: string;
  format?: string;
  description?: string;
  properties?: Record<string, Schema>;
  items?: Schema;
  required?: string[];
  enum?: (string | number | boolean)[];
  nullable?: boolean;
  $ref?: string;
  allOf?: Schema[];
  oneOf?: Schema[];
  anyOf?: Schema[];
  default?: unknown;
  example?: unknown;
}

export interface Parameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  required?: boolean;
  description?: string;
  schema?: Schema;
}

export interface RequestBody {
  description?: string;
  required?: boolean;
  content?: Record<string, { schema?: Schema }>;
}

export interface ResponseObject {
  description?: string;
  content?: Record<string, { schema?: Schema }>;
}

export interface Operation {
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses?: Record<string, ResponseObject>;
  deprecated?: boolean;
}

export type PathItem = Partial<Record<HttpMethod, Operation>>;

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: { url: string; description?: string }[];
  paths: Record<string, PathItem>;
  components?: {
    schemas?: Record<string, Schema>;
  };
}

export interface Endpoint {
  method: HttpMethod;
  path: string;
  operation: Operation;
}
