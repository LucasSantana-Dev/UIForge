import yaml from 'js-yaml';
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
  imported: Array<{
    name: string;
    type: string;
    action: 'created' | 'updated';
  }>;
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

function parseEntities(yamlContent: string): CatalogInfoEntity[] {
  const docs = yaml.loadAll(yamlContent) as Record<string, unknown>[];
  const entities: CatalogInfoEntity[] = [];

  for (const doc of docs) {
    if (
      doc &&
      typeof doc === 'object' &&
      'apiVersion' in doc &&
      'kind' in doc &&
      'metadata' in doc
    ) {
      const meta = doc.metadata as Record<string, unknown>;
      if (meta && typeof meta === 'object' && 'name' in meta) {
        entities.push(doc as unknown as CatalogInfoEntity);
      }
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

  if (!yamlContent.trim()) {
    result.errors.push({
      error: 'No valid catalog entities found in YAML',
    });
    return result;
  }

  let entities: CatalogInfoEntity[];
  try {
    entities = parseEntities(yamlContent);
  } catch {
    result.errors.push({ error: 'Failed to parse YAML content' });
    return result;
  }

  if (entities.length === 0) {
    result.errors.push({
      error: 'No valid catalog entities found in YAML',
    });
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
        (l) => l.title?.toLowerCase().includes('doc') || l.url.includes('docs')
      )?.url;

      const data: Record<string, unknown> = {
        name,
        display_name: entity.metadata.title || entity.metadata.name,
        type,
        lifecycle,
        owner_id: ownerId,
        tags: Array.isArray(tags) ? tags.slice(0, 20) : [],
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
          links: Array.isArray(links) ? links : [],
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
