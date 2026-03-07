import {
  createCatalogEntrySchema,
  updateCatalogEntrySchema,
  catalogQuerySchema,
} from '@/lib/api/validation/catalog';

describe('createCatalogEntrySchema', () => {
  const validEntry = {
    name: 'my-service',
    display_name: 'My Service',
    type: 'service',
    lifecycle: 'production',
  };

  it('accepts valid entry with required fields only', () => {
    const result = createCatalogEntrySchema.safeParse(validEntry);
    expect(result.success).toBe(true);
  });

  it('accepts entry with all optional fields', () => {
    const result = createCatalogEntrySchema.safeParse({
      ...validEntry,
      team: 'platform',
      repository_url: 'https://github.com/org/repo',
      documentation_url: 'https://docs.example.com',
      tags: ['typescript', 'api'],
      dependencies: ['core', 'shared-lib'],
      project_id: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('rejects name with uppercase letters', () => {
    const result = createCatalogEntrySchema.safeParse({
      ...validEntry,
      name: 'My-Service',
    });
    expect(result.success).toBe(false);
  });

  it('rejects name with spaces', () => {
    const result = createCatalogEntrySchema.safeParse({
      ...validEntry,
      name: 'my service',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid type', () => {
    const result = createCatalogEntrySchema.safeParse({
      ...validEntry,
      type: 'microservice',
    });
    expect(result.success).toBe(false);
  });

  it('accepts all valid types', () => {
    const types = ['service', 'component', 'api', 'library', 'website'];
    for (const type of types) {
      const result = createCatalogEntrySchema.safeParse({
        ...validEntry,
        type,
      });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid lifecycle', () => {
    const result = createCatalogEntrySchema.safeParse({
      ...validEntry,
      lifecycle: 'alpha',
    });
    expect(result.success).toBe(false);
  });

  it('rejects tags exceeding max count', () => {
    const result = createCatalogEntrySchema.safeParse({
      ...validEntry,
      tags: Array.from({ length: 21 }, (_, i) => `tag-${i}`),
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid repository URL', () => {
    const result = createCatalogEntrySchema.safeParse({
      ...validEntry,
      repository_url: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  it('rejects name exceeding max length', () => {
    const result = createCatalogEntrySchema.safeParse({
      ...validEntry,
      name: 'a'.repeat(101),
    });
    expect(result.success).toBe(false);
  });
});

describe('updateCatalogEntrySchema', () => {
  it('accepts partial updates', () => {
    const result = updateCatalogEntrySchema.safeParse({
      display_name: 'Updated Name',
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty object', () => {
    const result = updateCatalogEntrySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('validates partial fields with same rules', () => {
    const result = updateCatalogEntrySchema.safeParse({
      name: 'INVALID',
    });
    expect(result.success).toBe(false);
  });
});

describe('catalogQuerySchema', () => {
  it('applies defaults for empty query', () => {
    const result = catalogQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.sort).toBe('updated_at');
    expect(result.order).toBe('desc');
  });

  it('coerces string numbers for page and limit', () => {
    const result = catalogQuerySchema.parse({
      page: '2',
      limit: '25',
    });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(25);
  });

  it('accepts type and lifecycle filters', () => {
    const result = catalogQuerySchema.parse({
      type: 'service',
      lifecycle: 'production',
    });
    expect(result.type).toBe('service');
    expect(result.lifecycle).toBe('production');
  });

  it('rejects limit exceeding maximum', () => {
    const result = catalogQuerySchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });

  it('accepts search parameter', () => {
    const result = catalogQuerySchema.parse({ search: 'gateway' });
    expect(result.search).toBe('gateway');
  });
});
