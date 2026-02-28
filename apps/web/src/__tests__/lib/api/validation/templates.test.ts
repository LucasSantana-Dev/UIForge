import { createTemplateSchema, templateQuerySchema } from '@/lib/api/validation/templates';

describe('createTemplateSchema', () => {
  const validTemplate = {
    name: 'Login Form',
    category: 'auth',
    framework: 'react',
    code: { files: [{ path: 'index.tsx', content: '<div>Login</div>' }] },
  };

  it('accepts valid template', () => {
    const result = createTemplateSchema.safeParse(validTemplate);
    expect(result.success).toBe(true);
  });

  it('accepts template with description', () => {
    const result = createTemplateSchema.safeParse({
      ...validTemplate,
      description: 'A login form',
    });
    expect(result.success).toBe(true);
  });

  it('rejects name shorter than 3 chars', () => {
    const result = createTemplateSchema.safeParse({ ...validTemplate, name: 'ab' });
    expect(result.success).toBe(false);
  });

  it('rejects name longer than 100 chars', () => {
    const result = createTemplateSchema.safeParse({
      ...validTemplate,
      name: 'x'.repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid category', () => {
    const result = createTemplateSchema.safeParse({
      ...validTemplate,
      category: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('accepts all valid categories', () => {
    const categories = [
      'landing',
      'dashboard',
      'auth',
      'ecommerce',
      'blog',
      'portfolio',
      'admin',
      'other',
    ];
    for (const category of categories) {
      const result = createTemplateSchema.safeParse({ ...validTemplate, category });
      expect(result.success).toBe(true);
    }
  });

  it('rejects empty files array', () => {
    const result = createTemplateSchema.safeParse({
      ...validTemplate,
      code: { files: [] },
    });
    expect(result.success).toBe(false);
  });

  it('rejects file with empty path', () => {
    const result = createTemplateSchema.safeParse({
      ...validTemplate,
      code: { files: [{ path: '', content: 'x' }] },
    });
    expect(result.success).toBe(false);
  });

  it('rejects file with empty content', () => {
    const result = createTemplateSchema.safeParse({
      ...validTemplate,
      code: { files: [{ path: 'index.tsx', content: '' }] },
    });
    expect(result.success).toBe(false);
  });

  it('rejects description longer than 500 chars', () => {
    const result = createTemplateSchema.safeParse({
      ...validTemplate,
      description: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe('templateQuerySchema', () => {
  it('applies defaults for empty query', () => {
    const result = templateQuerySchema.parse({});
    expect(result.sort).toBe('created_at');
    expect(result.limit).toBe(50);
    expect(result.offset).toBe(0);
  });

  it('accepts valid query params', () => {
    const result = templateQuerySchema.parse({
      category: 'dashboard',
      framework: 'vue',
      search: 'login',
      sort: 'name',
      limit: 25,
      offset: 10,
    });
    expect(result.category).toBe('dashboard');
    expect(result.framework).toBe('vue');
    expect(result.limit).toBe(25);
  });

  it('coerces string numbers', () => {
    const result = templateQuerySchema.parse({ limit: '20', offset: '5' });
    expect(result.limit).toBe(20);
    expect(result.offset).toBe(5);
  });

  it('rejects limit above 100', () => {
    const result = templateQuerySchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });

  it('rejects negative offset', () => {
    const result = templateQuerySchema.safeParse({ offset: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid sort field', () => {
    const result = templateQuerySchema.safeParse({ sort: 'invalid' });
    expect(result.success).toBe(false);
  });
});
