import { detectFormat, parseSpec, validateSpec, getEndpoints } from '@/lib/openapi/parser';

const VALID_JSON_SPEC = JSON.stringify({
  openapi: '3.0.3',
  info: { title: 'Pet Store', version: '1.0.0' },
  paths: {
    '/pets': {
      get: {
        summary: 'List pets',
        tags: ['pets'],
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'A list of pets',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Pet' },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create pet',
        tags: ['pets'],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Pet' },
            },
          },
        },
        responses: {
          '201': { description: 'Created' },
        },
      },
    },
    '/pets/{id}': {
      get: {
        summary: 'Get pet',
        deprecated: true,
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'A pet' },
        },
      },
    },
  },
  components: {
    schemas: {
      Pet: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          age: { type: 'integer', nullable: true },
        },
      },
    },
  },
});

const VALID_YAML_SPEC = `
openapi: '3.0.0'
info:
  title: Simple API
  version: '0.1.0'
paths:
  /health:
    get:
      summary: Health check
      responses:
        '200':
          description: OK
`;

describe('detectFormat', () => {
  it('detects JSON format', () => {
    expect(detectFormat('{"openapi":"3.0.0"}')).toBe('json');
    expect(detectFormat('  [1,2]')).toBe('json');
  });

  it('detects YAML format', () => {
    expect(detectFormat('openapi: 3.0.0')).toBe('yaml');
    expect(detectFormat('---\nopenapi: 3.0.0')).toBe('yaml');
  });
});

describe('validateSpec', () => {
  it('validates a correct spec', () => {
    expect(
      validateSpec({
        openapi: '3.0.3',
        info: { title: 'Test', version: '1.0' },
        paths: {},
      })
    ).toBe(true);
  });

  it('rejects non-object', () => {
    expect(validateSpec(null)).toBe(false);
    expect(validateSpec('string')).toBe(false);
  });

  it('rejects missing openapi field', () => {
    expect(
      validateSpec({
        info: { title: 'T', version: '1' },
        paths: {},
      })
    ).toBe(false);
  });

  it('rejects non-3.x version', () => {
    expect(
      validateSpec({
        openapi: '2.0',
        info: { title: 'T', version: '1' },
        paths: {},
      })
    ).toBe(false);
  });

  it('rejects missing paths', () => {
    expect(
      validateSpec({
        openapi: '3.0.0',
        info: { title: 'T', version: '1' },
      })
    ).toBe(false);
  });
});

describe('parseSpec', () => {
  it('parses valid JSON spec', () => {
    const spec = parseSpec(VALID_JSON_SPEC);
    expect(spec.info.title).toBe('Pet Store');
    expect(spec.paths['/pets']).toBeDefined();
  });

  it('parses valid YAML spec', () => {
    const spec = parseSpec(VALID_YAML_SPEC);
    expect(spec.info.title).toBe('Simple API');
    expect(spec.paths['/health']).toBeDefined();
  });

  it('throws on invalid spec', () => {
    expect(() => parseSpec('not valid at all {{')).toThrow();
  });

  it('throws on valid JSON but invalid spec', () => {
    expect(() => parseSpec('{"name":"test"}')).toThrow('Invalid OpenAPI specification');
  });
});

describe('resolveRefs', () => {
  it('resolves $ref to component schemas', () => {
    const spec = parseSpec(VALID_JSON_SPEC);
    const postBody = spec.paths['/pets']?.post?.requestBody?.content?.['application/json']?.schema;
    expect(postBody).toBeDefined();
    expect(postBody?.type).toBe('object');
    expect(postBody?.properties?.name?.type).toBe('string');
  });
});

describe('getEndpoints', () => {
  it('returns flat sorted endpoint list', () => {
    const spec = parseSpec(VALID_JSON_SPEC);
    const endpoints = getEndpoints(spec);
    expect(endpoints).toHaveLength(3);
    expect(endpoints[0].path).toBe('/pets');
    expect(endpoints[0].method).toBe('get');
    expect(endpoints[1].method).toBe('post');
    expect(endpoints[2].path).toBe('/pets/{id}');
  });

  it('marks deprecated endpoints', () => {
    const spec = parseSpec(VALID_JSON_SPEC);
    const endpoints = getEndpoints(spec);
    const deprecated = endpoints.find((e) => e.path === '/pets/{id}');
    expect(deprecated?.operation.deprecated).toBe(true);
  });
});
