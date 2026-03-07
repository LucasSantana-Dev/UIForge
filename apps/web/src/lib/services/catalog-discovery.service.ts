import yaml from 'js-yaml';
import { getInstallationOctokit } from '@/lib/github/client';
import { listRepos } from '@/lib/github/operations';
import { createClient } from '@/lib/supabase/server';
import { importCatalogYaml, type ImportResult } from './catalog-import.service';

export interface DiscoveredRepo {
  repoId: number;
  fullName: string;
  defaultBranch: string;
  description: string | null;
  language: string | null;
  installationId: number;
  catalogYaml: string;
  entityCount: number;
  entities: Array<{ name: string; kind: string; type: string }>;
  docsDetected: boolean;
  docsUrl: string | null;
}

export interface DiscoveryResult {
  discovered: DiscoveredRepo[];
  scanned: number;
  errors: Array<{ repo: string; error: string }>;
}

const CATALOG_FILE_PATHS = ['catalog-info.yaml', 'catalog-info.yml'];
const DOCS_INDICATORS = [
  'docs/index.md',
  'docs/README.md',
  'mkdocs.yml',
  'docusaurus.config.js',
  'docusaurus.config.ts',
];

async function fetchFileContent(
  installationId: number,
  owner: string,
  repo: string,
  path: string
): Promise<string | null> {
  const octokit = await getInstallationOctokit(installationId);
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });
    if ('content' in data && typeof data.content === 'string') {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    return null;
  } catch {
    return null;
  }
}

function extractEntitiesPreview(
  yamlContent: string
): Array<{ name: string; kind: string; type: string }> {
  try {
    const docs = yaml.loadAll(yamlContent) as Record<string, unknown>[];
    return docs
      .filter((doc) => doc && typeof doc === 'object' && 'kind' in doc && 'metadata' in doc)
      .map((doc) => {
        const meta = doc.metadata as Record<string, unknown>;
        const kind = String(doc.kind || 'Component');
        const kindMap: Record<string, string> = {
          Component: 'component',
          API: 'api',
          System: 'system',
          Domain: 'domain',
          Resource: 'library',
          Group: 'service',
        };
        return {
          name: String(meta?.name || 'unknown'),
          kind,
          type: kindMap[kind] || 'component',
        };
      });
  } catch {
    return [];
  }
}

export async function discoverCatalogFiles(userId: string): Promise<DiscoveryResult> {
  const supabase = await createClient();
  const { data: installations } = await supabase
    .from('github_installations')
    .select('installation_id, account_login')
    .eq('user_id', userId)
    .is('suspended_at', null);

  if (!installations?.length) {
    return { discovered: [], scanned: 0, errors: [] };
  }

  const result: DiscoveryResult = {
    discovered: [],
    scanned: 0,
    errors: [],
  };

  for (const inst of installations) {
    let repos;
    try {
      repos = await listRepos(inst.installation_id);
    } catch {
      result.errors.push({
        repo: inst.account_login,
        error: 'Failed to list repositories',
      });
      continue;
    }

    const scanPromises = repos.map(async (repo) => {
      result.scanned++;
      const [owner, name] = repo.fullName.split('/');

      for (const filePath of CATALOG_FILE_PATHS) {
        const content = await fetchFileContent(inst.installation_id, owner, name, filePath);

        if (content) {
          const entities = extractEntitiesPreview(content);
          let docsUrl: string | null = null;
          for (const docPath of DOCS_INDICATORS) {
            const docFile = await fetchFileContent(inst.installation_id, owner, name, docPath);
            if (docFile !== null) {
              docsUrl = `https://github.com/${repo.fullName}/blob/${repo.defaultBranch}/${docPath}`;
              break;
            }
          }
          result.discovered.push({
            repoId: repo.id,
            fullName: repo.fullName,
            defaultBranch: repo.defaultBranch,
            description: repo.description,
            language: repo.language,
            installationId: inst.installation_id,
            catalogYaml: content,
            entityCount: entities.length,
            entities,
            docsDetected: docsUrl !== null,
            docsUrl,
          });
          break;
        }
      }
    });

    await Promise.all(scanPromises);
  }

  return result;
}

export async function importDiscoveredRepos(
  userId: string,
  repos: Array<{ installationId: number; fullName: string }>
): Promise<ImportResult> {
  const combined: ImportResult = { imported: [], errors: [] };

  for (const repo of repos) {
    const [owner, name] = repo.fullName.split('/');

    let yamlContent: string | null = null;
    for (const filePath of CATALOG_FILE_PATHS) {
      yamlContent = await fetchFileContent(repo.installationId, owner, name, filePath);
      if (yamlContent) break;
    }

    if (!yamlContent) {
      combined.errors.push({
        name: repo.fullName,
        error: 'catalog-info.yaml not found',
      });
      continue;
    }

    const result = await importCatalogYaml(yamlContent, userId, 'github');
    combined.imported.push(...result.imported);
    combined.errors.push(...result.errors);
  }

  return combined;
}
