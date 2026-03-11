export interface OfficialGoldenPathSeed {
  name: string;
  display_name: string;
  description: string;
  type: 'service' | 'library' | 'website' | 'worker' | 'api' | 'package';
  lifecycle: 'draft' | 'beta' | 'ga' | 'deprecated';
  framework: string;
  language: string;
  stack: 'nextjs' | 'api-service' | 'library' | 'worker' | 'monorepo';
  tags: string[];
  parameters: Array<{
    name: string;
    type: 'string' | 'boolean' | 'number' | 'select';
    required?: boolean;
    default?: unknown;
    description?: string;
    options?: string[];
  }>;
  steps: Array<{
    id: string;
    name: string;
    action: string;
    description?: string;
  }>;
  is_official: boolean;
  includes_ci: boolean;
  includes_testing: boolean;
  includes_linting: boolean;
  includes_monitoring: boolean;
  includes_docker: boolean;
  catalog_type: string;
  catalog_lifecycle: string;
  icon: string;
}

type GoldenPathDefaults = Pick<
  OfficialGoldenPathSeed,
  | 'is_official'
  | 'includes_ci'
  | 'includes_testing'
  | 'includes_linting'
  | 'includes_monitoring'
  | 'includes_docker'
  | 'catalog_lifecycle'
>;

type OfficialGoldenPathInput = Omit<OfficialGoldenPathSeed, keyof GoldenPathDefaults> &
  Partial<GoldenPathDefaults>;

type GoldenPathParam = OfficialGoldenPathSeed['parameters'][number];
type GoldenPathStep = OfficialGoldenPathSeed['steps'][number];

const DEFAULT_GOLDEN_PATH_VALUES: GoldenPathDefaults = {
  is_official: true,
  includes_ci: true,
  includes_testing: true,
  includes_linting: true,
  includes_monitoring: true,
  includes_docker: false,
  catalog_lifecycle: 'production',
};

function defineOfficialGoldenPath(input: OfficialGoldenPathInput): OfficialGoldenPathSeed {
  return { ...DEFAULT_GOLDEN_PATH_VALUES, ...input };
}

function textParam(name: string, description: string, required = false): GoldenPathParam {
  if (required) {
    return { name, type: 'string', required: true, description };
  }
  return { name, type: 'string', description };
}

function boolParam(name: string, description: string, defaultValue: boolean): GoldenPathParam {
  return { name, type: 'boolean', default: defaultValue, description };
}

function numberParam(name: string, description: string, defaultValue: number): GoldenPathParam {
  return { name, type: 'number', default: defaultValue, description };
}

function selectParam(
  name: string,
  description: string,
  defaultValue: string,
  options: string[]
): GoldenPathParam {
  return { name, type: 'select', default: defaultValue, description, options };
}

function fileStep(id: string, name: string, description: string): GoldenPathStep {
  return { id, name, action: 'create-files', description };
}

function registerCatalogStep(description: string): GoldenPathStep {
  return {
    id: 'register',
    name: 'Register in Catalog',
    action: 'register-catalog',
    description,
  };
}

export const OFFICIAL_GOLDEN_PATHS: OfficialGoldenPathSeed[] = [
  defineOfficialGoldenPath({
    name: 'forge-next-service',
    display_name: 'Next.js Service',
    description: 'Production-ready Next.js service with Supabase auth, Tailwind, and CI/CD.',
    type: 'service',
    lifecycle: 'ga',
    framework: 'next.js',
    language: 'typescript',
    stack: 'nextjs',
    tags: ['next.js', 'supabase', 'tailwind', 'ci-cd'],
    parameters: [
      textParam('projectName', 'Project name (kebab-case)', true),
      textParam('description', 'Short description'),
      boolParam('includeAuth', 'Include Supabase auth setup', true),
      selectParam('cssFramework', 'CSS framework', 'tailwind', [
        'tailwind',
        'vanilla-extract',
        'css-modules',
        'none',
      ]),
      numberParam('port', 'Dev server port', 3000),
    ],
    steps: [
      fileStep('scaffold', 'Scaffold project', 'Create Next.js project structure with App Router.'),
      fileStep('configure', 'Configure CI/CD', 'Add GitHub Actions workflows.'),
      registerCatalogStep('Create catalog entry for the new service.'),
    ],
    catalog_type: 'service',
    icon: 'globe',
  }),
  defineOfficialGoldenPath({
    name: 'forge-mcp-server',
    display_name: 'MCP Server',
    description: 'MCP server template with tool definitions, testing, and npm publishing.',
    type: 'service',
    lifecycle: 'ga',
    framework: 'node.js',
    language: 'typescript',
    stack: 'api-service',
    tags: ['mcp', 'sdk', 'npm'],
    parameters: [
      textParam('serverName', 'Server name (kebab-case)', true),
      textParam('description', 'Server description'),
      textParam('tools', 'Comma-separated initial tool names'),
    ],
    steps: [
      fileStep('scaffold', 'Scaffold MCP server', 'Create MCP server with SDK setup.'),
      fileStep('tools', 'Create tool stubs', 'Generate initial tool definitions.'),
      fileStep('test', 'Setup testing', 'Configure testing.'),
      registerCatalogStep('Create catalog entry.'),
    ],
    catalog_type: 'service',
    icon: 'server',
  }),
  defineOfficialGoldenPath({
    name: 'forge-react-library',
    display_name: 'React Component Library',
    description: 'Shared React component library with Storybook, tests, and npm publishing.',
    type: 'library',
    lifecycle: 'ga',
    framework: 'react',
    language: 'typescript',
    stack: 'library',
    tags: ['react', 'storybook', 'npm', 'components'],
    parameters: [
      textParam('packageName', 'Package name (@scope/name)', true),
      textParam('description', 'Library description'),
    ],
    steps: [
      fileStep('scaffold', 'Scaffold library', 'Create component library structure.'),
      fileStep('storybook', 'Setup Storybook', 'Configure Storybook.'),
      registerCatalogStep('Create catalog entry.'),
    ],
    catalog_type: 'library',
    icon: 'book-open',
  }),
  defineOfficialGoldenPath({
    name: 'forge-python-api',
    display_name: 'Python API Service',
    description: 'FastAPI service with Docker, pytest, and CI/CD.',
    type: 'api',
    lifecycle: 'beta',
    framework: 'fastapi',
    language: 'python',
    stack: 'api-service',
    tags: ['python', 'fastapi', 'docker', 'api'],
    parameters: [
      textParam('serviceName', 'Service name (kebab-case)', true),
      textParam('description', 'API description'),
      boolParam('includeDocker', 'Include Dockerfile and docker-compose', true),
      selectParam('pythonVersion', 'Python version', '3.12', ['3.11', '3.12', '3.13']),
      numberParam('port', 'API server port', 8000),
    ],
    steps: [
      fileStep('scaffold', 'Scaffold API', 'Create FastAPI project with routers.'),
      fileStep('docker', 'Setup Docker', 'Add Dockerfile and compose config.'),
      registerCatalogStep('Create catalog entry.'),
    ],
    includes_monitoring: false,
    includes_docker: true,
    catalog_type: 'api',
    icon: 'server',
  }),
  defineOfficialGoldenPath({
    name: 'forge-cloudflare-worker',
    display_name: 'Cloudflare Worker',
    description: 'Edge worker with KV storage, rate limiting, and wrangler deploy.',
    type: 'worker',
    lifecycle: 'beta',
    framework: 'cloudflare',
    language: 'typescript',
    stack: 'worker',
    tags: ['cloudflare', 'workers', 'edge', 'serverless'],
    parameters: [
      textParam('workerName', 'Worker name (kebab-case)', true),
      boolParam('includeKV', 'Include KV namespace binding', false),
    ],
    steps: [
      fileStep('scaffold', 'Scaffold worker', 'Create Cloudflare Worker project.'),
      fileStep('deploy', 'Configure deployment', 'Setup wrangler.toml and deploy scripts.'),
      registerCatalogStep('Create catalog entry.'),
    ],
    includes_monitoring: false,
    catalog_type: 'worker',
    icon: 'code',
  }),
];
