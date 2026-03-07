import { upsertCatalogEntry, findCatalogEntryByName } from '@/lib/repositories/catalog.repo';

interface CatalogInfoSpec {
  type?: string;
  lifecycle?: string;
  owner?: string;
  system?: string;
  dependsOn?: string[];
  providesApis?: string[];
  consumesApis?: string[];
}

interface CatalogInfoMetadata {
  name: string;
  namespace?: string;
  title?: string;
  description?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  tags?: string[];
  links?: Array<{ url: string; title?: string; icon?: string }>;
}

interface CatalogInfoEntity {
  apiVersion: string;
  kind: string;
  metadata: CatalogInfoMetadata;
  spec?: CatalogInfoSpec;
}

const KIND_TO_TYPE: Record<string, string> = {
  Component: 'component',
  API: 'api',
  System: 'system',
  Domain: 'domain',
  Resource: 'library',
  Group: 'service',
  User: 'service',
};

const VALID_TYPES = new Set([
  'domain',
  'system',
  'service',
  'component',
  'api',
  'library',
  'website',
]);

const VALID_LIFECYCLES = new Set(['experimental', 'production', 'deprecated']);

export interface ImportResult {
  imported: Array<{ name: string; type: string; action: 'created' | 'updated' }>;
  errors: Array<{ name?: string; error: string }>;
}

function normalizeType(kind: string, specType?: string): string {
  if (specType && VALID_TYPES.has(specType)) return specType;
  const mapped = KIND_TO_TYPE[kind];
  if (mapped) return mapped;
  return 'component';
}

function normalizeLifecycle(lifecycle?: string): string {
  if (lifecycle && VALID_LIFECYCLES.has(lifecycle)) return lifecycle;
  return 'experimental';
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}

function extractDependencies(spec?: CatalogInfoSpec): string[] {
  const deps: string[] = [];
  if (spec?.dependsOn) {
    for (const ref of spec.dependsOn) {
      const name =
        ref
          .replace(/^(component|resource|api):/, '')
          .split('/')
          .pop() || '';
      if (name) deps.push(normalizeName(name));
    }
  }
  if (spec?.consumesApis) {
    for (const ref of spec.consumesApis) {
      const name = ref.replace(/^api:/, '').split('/').pop() || '';
      if (name) deps.push(normalizeName(name));
    }
  }
  return [...new Set(deps)];
}

function parseSimpleYaml(text: string): Record<string, any> {
  const result: Record<string, any> = {};
  const lines = text.split('\n');
  const stack: Array<{ indent: number; obj: Record<string, any> }> = [{ indent: -1, obj: result }];

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const indent = line.search(/\S/);
    const content = line.trim();

    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    const parent = stack[stack.length - 1].obj;

    if (content.startsWith('- ')) {
      const arrayItem = content.slice(2).trim();
      const lastKey = Object.keys(parent).pop();
      if (lastKey && !Array.isArray(parent[lastKey])) {
        parent[lastKey] = [];
      }
      if (lastKey && Array.isArray(parent[lastKey])) {
        if (arrayItem.includes(': ')) {
          const obj: Record<string, any> = {};
          const [k, ...vParts] = arrayItem.split(': ');
          obj[k.trim()] = vParts
            .join(': ')
            .trim()
            .replace(/^['"]|['"]$/g, '');
          parent[lastKey].push(obj);
        } else {
          parent[lastKey].push(arrayItem.replace(/^['"]|['"]$/g, ''));
        }
      }
      continue;
    }

    const colonIdx = content.indexOf(':');
    if (colonIdx === -1) continue;

    const key = content.slice(0, colonIdx).trim();
    const value = content.slice(colonIdx + 1).trim();

    if (!value) {
      parent[key] = {};
      stack.push({ indent, obj: parent[key] });
    } else if (value === '[]') {
      parent[key] = [];
    } else {
      const cleanValue = value.replace(/^['"]|['"]$/g, '');
      parent[key] = cleanValue;
    }
  }

  return result;
}

function parseEntities(yamlContent: string): CatalogInfoEntity[] {
  const documents = yamlContent.split(/^---$/m).filter((d) => d.trim());
  const entities: CatalogInfoEntity[] = [];

  for (const doc of documents) {
    const entity = parseSimpleYaml(doc.trim());
    if (entity && entity.apiVersion && entity.kind && entity.metadata?.name) {
      entities.push(entity as CatalogInfoEntity);
    }
  }

  return entities;
}

export async function importCatalogYaml(
  yamlContent: string,
  ownerId: string,
  source: 'file' | 'github' = 'file'
): Promise<ImportResult> {
  const result: ImportResult = { imported: [], errors: [] };

  let entities: CatalogInfoEntity[];
  try {
    entities = parseEntities(yamlContent);
  } catch {
    result.errors.push({ error: 'Failed to parse YAML content' });
    return result;
  }

  if (entities.length === 0) {
    result.errors.push({ error: 'No valid catalog entities found in YAML' });
    return result;
  }

  for (const entity of entities) {
    const name = normalizeName(entity.metadata.name);
    try {
      const existing = await findCatalogEntryByName(name);
      const type = normalizeType(entity.kind, entity.spec?.type);
      const lifecycle = normalizeLifecycle(entity.spec?.lifecycle);
      const dependencies = extractDependencies(entity.spec);

      const parentName = entity.spec?.system;
      let parentId: string | null = null;
      if (parentName) {
        const parent = await findCatalogEntryByName(normalizeName(parentName));
        if (parent) parentId = parent.id;
      }

      const tags = entity.metadata.tags || [];
      const links = entity.metadata.links || [];
      const docUrl = links.find(
        (l: { url: string; title?: string }) =>
          l.title?.toLowerCase().includes('doc') || l.url.includes('docs')
      )?.url;

      const data: Record<string, unknown> = {
        name,
        display_name: entity.metadata.title || entity.metadata.name,
        type,
        lifecycle,
        owner_id: ownerId,
        tags: tags.slice(0, 20),
        dependencies: dependencies.slice(0, 50),
        description: entity.metadata.description || null,
        parent_id: parentId,
        metadata: {
          source,
          apiVersion: entity.apiVersion,
          kind: entity.kind,
          namespace: entity.metadata.namespace || 'default',
          annotations: entity.metadata.annotations || {},
          labels: entity.metadata.labels || {},
          links,
        },
      };

      if (docUrl) data.documentation_url = docUrl;

      const repoAnnotation = entity.metadata.annotations?.['backstage.io/source-location'];
      if (repoAnnotation) {
        const repoUrl = repoAnnotation.replace('url:', '').trim();
        if (repoUrl.startsWith('http')) data.repository_url = repoUrl;
      }

      await upsertCatalogEntry(data);
      result.imported.push({
        name,
        type,
        action: existing ? 'updated' : 'created',
      });
    } catch (err) {
      result.errors.push({
        name,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  return result;
}
