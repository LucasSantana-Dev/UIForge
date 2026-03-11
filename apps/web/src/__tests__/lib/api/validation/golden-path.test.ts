import {
  createGoldenPathSchema,
  updateGoldenPathSchema,
  goldenPathQuerySchema,
} from '@/lib/api/validation/golden-path';

describe('createGoldenPathSchema', () => {
  const validInput = {
    name: 'my-template',
    display_name: 'My Template',
    type: 'service' as const,
    framework: 'next.js',
  };

  it('accepts valid minimal input', () => {
    const result = createGoldenPathSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('accepts full input with all fields', () => {
    const result = createGoldenPathSchema.safeParse({
      ...validInput,
      description: 'A great template',
      lifecycle: 'ga',
      language: 'typescript',
      tags: ['next.js', 'supabase'],
      parameters: [
        {
          name: 'projectName',
          type: 'string',
          required: true,
          description: 'Project name',
        },
      ],
      steps: [
        {
          id: 'scaffold',
          name: 'Scaffold project',
          action: 'create-files',
        },
      ],
      repository_url: 'https://github.com/org/repo',
      documentation_url: 'https://docs.example.com',
      icon: 'rocket',
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-kebab-case name', () => {
    const result = createGoldenPathSchema.safeParse({
      ...validInput,
      name: 'My Template',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid type', () => {
    const result = createGoldenPathSchema.safeParse({
      ...validInput,
      type: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('rejects name too short', () => {
    const result = createGoldenPathSchema.safeParse({
      ...validInput,
      name: 'ab',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid lifecycle', () => {
    const result = createGoldenPathSchema.safeParse({
      ...validInput,
      lifecycle: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('rejects too many tags', () => {
    const result = createGoldenPathSchema.safeParse({
      ...validInput,
      tags: Array(21).fill('tag'),
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid parameter type', () => {
    const result = createGoldenPathSchema.safeParse({
      ...validInput,
      parameters: [{ name: 'x', type: 'invalid' }],
    });
    expect(result.success).toBe(false);
  });
});

describe('updateGoldenPathSchema', () => {
  it('accepts partial updates', () => {
    const result = updateGoldenPathSchema.safeParse({
      display_name: 'Updated Name',
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty object', () => {
    const result = updateGoldenPathSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('still validates field constraints', () => {
    const result = updateGoldenPathSchema.safeParse({
      name: 'INVALID NAME',
    });
    expect(result.success).toBe(false);
  });
});

describe('goldenPathQuerySchema', () => {
  it('accepts empty query', () => {
    const result = goldenPathQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts valid filters', () => {
    const result = goldenPathQuerySchema.safeParse({
      search: 'next',
      type: 'service',
      lifecycle: 'ga',
      framework: 'next.js',
      stack: 'nextjs',
      language: 'typescript',
      page: '2',
      limit: '10',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it('rejects invalid type', () => {
    const result = goldenPathQuerySchema.safeParse({
      type: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('rejects page less than 1', () => {
    const result = goldenPathQuerySchema.safeParse({ page: '0' });
    expect(result.success).toBe(false);
  });

  it('rejects limit over 100', () => {
    const result = goldenPathQuerySchema.safeParse({ limit: '101' });
    expect(result.success).toBe(false);
  });
});
