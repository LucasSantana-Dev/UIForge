import { importCatalogYaml } from '@/lib/services/catalog-import.service';

jest.mock('@/lib/repositories/catalog.repo', () => ({
  findCatalogEntryByName: jest.fn().mockResolvedValue(null),
  upsertCatalogEntry: jest.fn().mockResolvedValue({ id: 'test-id', name: 'test' }),
}));

const { findCatalogEntryByName, upsertCatalogEntry } = jest.requireMock(
  '@/lib/repositories/catalog.repo'
);

const SAMPLE_YAML = `apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  title: My Service
  description: A sample microservice
  tags:
    - typescript
    - node
  annotations:
    backstage.io/source-location: "url:https://github.com/org/my-service"
  links:
    - url: https://docs.example.com
      title: Documentation
spec:
  type: service
  lifecycle: production
  owner: team-platform
  system: platform-system
  dependsOn:
    - component:shared-lib
    - api:user-api
  consumesApis:
    - api:payment-api`;

const MULTI_DOC_YAML = `apiVersion: backstage.io/v1alpha1
kind: System
metadata:
  name: platform-system
  title: Platform System
spec:
  owner: team-platform
---
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: web-app
  title: Web Application
spec:
  type: website
  lifecycle: production
  system: platform-system`;

describe('importCatalogYaml', () => {
  const ownerId = '00000000-0000-0000-0000-000000000001';

  beforeEach(() => {
    jest.clearAllMocks();
    findCatalogEntryByName.mockResolvedValue(null);
    upsertCatalogEntry.mockResolvedValue({ id: 'id-1', name: 'test' });
  });

  it('imports a single entity from YAML', async () => {
    const result = await importCatalogYaml(SAMPLE_YAML, ownerId);

    expect(result.imported).toHaveLength(1);
    expect(result.imported[0]).toEqual({
      name: 'my-service',
      type: 'service',
      action: 'created',
    });
    expect(result.errors).toHaveLength(0);

    expect(upsertCatalogEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'my-service',
        display_name: 'My Service',
        type: 'service',
        lifecycle: 'production',
        owner_id: ownerId,
        description: 'A sample microservice',
        tags: ['typescript', 'node'],
        dependencies: expect.arrayContaining(['shared-lib', 'user-api', 'payment-api']),
        documentation_url: 'https://docs.example.com',
        repository_url: 'https://github.com/org/my-service',
      })
    );
  });

  it('imports multiple entities from multi-document YAML', async () => {
    const result = await importCatalogYaml(MULTI_DOC_YAML, ownerId);

    expect(result.imported).toHaveLength(2);
    expect(result.imported[0].name).toBe('platform-system');
    expect(result.imported[0].type).toBe('system');
    expect(result.imported[1].name).toBe('web-app');
    expect(result.imported[1].type).toBe('website');
  });

  it('marks existing entries as updated', async () => {
    findCatalogEntryByName.mockResolvedValueOnce({
      id: 'existing-id',
      name: 'my-service',
    });

    const result = await importCatalogYaml(SAMPLE_YAML, ownerId);

    expect(result.imported[0].action).toBe('updated');
  });

  it('returns error for empty YAML', async () => {
    const result = await importCatalogYaml('', ownerId);

    expect(result.errors).toHaveLength(1);
  });

  it('normalizes entity names to lowercase with hyphens', async () => {
    const yamlStr = [
      'apiVersion: backstage.io/v1alpha1',
      'kind: Component',
      'metadata:',
      '  name: My_Service.Name',
      'spec:',
      '  type: service',
      '  lifecycle: production',
    ].join('\n');

    await importCatalogYaml(yamlStr, ownerId);

    expect(upsertCatalogEntry).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'my-service-name' })
    );
  });

  it('maps Backstage kinds to Siza types', async () => {
    const yamlStr = [
      'apiVersion: backstage.io/v1alpha1',
      'kind: API',
      'metadata:',
      '  name: user-api',
      'spec:',
      '  lifecycle: production',
    ].join('\n');

    await importCatalogYaml(yamlStr, ownerId);

    expect(upsertCatalogEntry).toHaveBeenCalledWith(expect.objectContaining({ type: 'api' }));
  });

  it('defaults lifecycle to experimental when unknown', async () => {
    const yamlStr = [
      'apiVersion: backstage.io/v1alpha1',
      'kind: Component',
      'metadata:',
      '  name: test-comp',
      'spec:',
      '  lifecycle: beta',
    ].join('\n');

    await importCatalogYaml(yamlStr, ownerId);

    expect(upsertCatalogEntry).toHaveBeenCalledWith(
      expect.objectContaining({ lifecycle: 'experimental' })
    );
  });

  it('resolves parent_id from spec.system', async () => {
    findCatalogEntryByName.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: 'parent-uuid',
      name: 'platform-system',
    });

    const yamlStr = [
      'apiVersion: backstage.io/v1alpha1',
      'kind: Component',
      'metadata:',
      '  name: web-frontend',
      'spec:',
      '  system: platform-system',
      '  lifecycle: production',
    ].join('\n');

    await importCatalogYaml(yamlStr, ownerId);

    expect(upsertCatalogEntry).toHaveBeenCalledWith(
      expect.objectContaining({ parent_id: 'parent-uuid' })
    );
  });

  it('stores Backstage metadata in metadata field', async () => {
    await importCatalogYaml(SAMPLE_YAML, ownerId);

    expect(upsertCatalogEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          source: 'file',
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          namespace: 'default',
        }),
      })
    );
  });

  it('handles upsert errors gracefully per entity', async () => {
    upsertCatalogEntry
      .mockRejectedValueOnce(new Error('DB constraint violation'))
      .mockResolvedValueOnce({ id: 'id-2' });

    const result = await importCatalogYaml(MULTI_DOC_YAML, ownerId);

    expect(result.imported).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].error).toBe('DB constraint violation');
  });
});
