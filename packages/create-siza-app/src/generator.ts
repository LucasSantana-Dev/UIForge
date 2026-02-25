import fs from 'fs-extra';
import path from 'path';
import type { Framework, UILibrary, Template } from './prompts.js';

interface GeneratorOptions {
  name: string;
  framework: Framework;
  ui: UILibrary;
  template: Template;
  mcp: boolean;
  targetDir: string;
}

const FRAMEWORK_DEPS: Record<Framework, Record<string, string>> = {
  nextjs: { next: '^15.0.0', react: '^19.0.0', 'react-dom': '^19.0.0' },
  react: { react: '^19.0.0', 'react-dom': '^19.0.0' },
  vue: { vue: '^3.5.0' },
  svelte: { svelte: '^5.0.0', '@sveltejs/kit': '^2.0.0' },
};

const FRAMEWORK_DEV_DEPS: Record<Framework, Record<string, string>> = {
  nextjs: { '@types/react': '^19.0.0', typescript: '^5.7.0' },
  react: {
    '@types/react': '^19.0.0',
    '@types/react-dom': '^19.0.0',
    typescript: '^5.7.0',
    vite: '^6.0.0',
    '@vitejs/plugin-react': '^4.0.0',
  },
  vue: { typescript: '^5.7.0', vite: '^6.0.0', '@vitejs/plugin-vue': '^5.0.0' },
  svelte: { typescript: '^5.7.0', vite: '^6.0.0', '@sveltejs/vite-plugin-svelte': '^4.0.0' },
};

const UI_DEPS: Record<UILibrary, Record<string, string>> = {
  shadcn: {
    tailwindcss: '^4.0.0',
    '@radix-ui/react-slot': '^1.1.0',
    'class-variance-authority': '^0.7.0',
    clsx: '^2.1.0',
    'tailwind-merge': '^2.6.0',
    'lucide-react': '^0.460.0',
  },
  tailwind: { tailwindcss: '^4.0.0' },
  none: {},
};

export async function generateProject(options: GeneratorOptions): Promise<void> {
  const { name, framework, ui, template, mcp, targetDir } = options;

  await fs.ensureDir(targetDir);
  await fs.ensureDir(path.join(targetDir, 'src'));
  await fs.ensureDir(path.join(targetDir, 'public'));

  await writePackageJson(targetDir, name, framework, ui);
  await writeTsConfig(targetDir, framework);
  await writeGitignore(targetDir);
  await writeGlobalsCss(targetDir, ui);
  await writeEntryPage(targetDir, framework, template, name);

  if (mcp) {
    await writeMcpConfig(targetDir);
  }

  await writeReadme(targetDir, name, framework, ui, template);
}

async function writePackageJson(
  dir: string, name: string, framework: Framework, ui: UILibrary
): Promise<void> {
  const scripts: Record<string, string> = {
    nextjs: '{ "dev": "next dev", "build": "next build", "start": "next start", "lint": "next lint" }',
    react: '{ "dev": "vite", "build": "vite build", "preview": "vite preview" }',
    vue: '{ "dev": "vite", "build": "vite build", "preview": "vite preview" }',
    svelte: '{ "dev": "vite dev", "build": "vite build", "preview": "vite preview" }',
  };

  const pkg = {
    name,
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: JSON.parse(scripts[framework]),
    dependencies: { ...FRAMEWORK_DEPS[framework], ...UI_DEPS[ui] },
    devDependencies: FRAMEWORK_DEV_DEPS[framework],
  };

  await fs.writeJson(path.join(dir, 'package.json'), pkg, { spaces: 2 });
}

async function writeTsConfig(dir: string, framework: Framework): Promise<void> {
  const base = {
    compilerOptions: {
      target: 'ES2022',
      module: framework === 'nextjs' ? 'ESNext' : 'ES2022',
      moduleResolution: framework === 'nextjs' ? 'bundler' : 'bundler',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      jsx: framework === 'svelte' ? undefined : 'react-jsx',
      paths: { '@/*': ['./src/*'] },
    },
    include: ['src'],
    exclude: ['node_modules'],
  };

  if (!base.compilerOptions.jsx) {
    delete base.compilerOptions.jsx;
  }

  await fs.writeJson(path.join(dir, 'tsconfig.json'), base, { spaces: 2 });
}

async function writeGitignore(dir: string): Promise<void> {
  const content = `node_modules/
dist/
.next/
.svelte-kit/
.env
.env.local
*.log
`;
  await fs.writeFile(path.join(dir, '.gitignore'), content);
}

async function writeGlobalsCss(dir: string, ui: UILibrary): Promise<void> {
  if (ui === 'none') return;

  const content = ui === 'shadcn'
    ? `@import 'tailwindcss';

:root {
  --background: 0 0% 7%;
  --foreground: 0 0% 95%;
  --primary: 262 83% 58%;
  --primary-foreground: 0 0% 100%;
  --muted: 0 0% 15%;
  --muted-foreground: 0 0% 64%;
  --border: 0 0% 15%;
  --card: 0 0% 9%;
  --card-foreground: 0 0% 95%;
  --accent: 262 83% 58%;
  --accent-foreground: 0 0% 100%;
  --radius: 0.5rem;
}

body {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-family: system-ui, sans-serif;
}
`
    : `@import 'tailwindcss';

body {
  background: #111;
  color: #f5f5f5;
  font-family: system-ui, sans-serif;
}
`;
  await fs.ensureDir(path.join(dir, 'src'));
  await fs.writeFile(path.join(dir, 'src', 'globals.css'), content);
}

async function writeEntryPage(
  dir: string, framework: Framework, template: Template, name: string
): Promise<void> {
  const templates: Record<Template, string> = {
    blank: `<main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold">{name}</h1>
      <p className="mt-4 text-lg text-gray-400">Built with Siza</p>
    </main>`,
    dashboard: `<div className="flex min-h-screen">
      <aside className="w-64 border-r border-gray-800 p-4">
        <h2 className="text-xl font-bold mb-4">{name}</h2>
        <nav className="space-y-2">
          <a href="#" className="block px-3 py-2 rounded hover:bg-gray-800">Overview</a>
          <a href="#" className="block px-3 py-2 rounded hover:bg-gray-800">Analytics</a>
          <a href="#" className="block px-3 py-2 rounded hover:bg-gray-800">Settings</a>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-gray-800 p-4">
            <p className="text-sm text-gray-400">Total Users</p>
            <p className="text-2xl font-bold">1,234</p>
          </div>
          <div className="rounded-lg border border-gray-800 p-4">
            <p className="text-sm text-gray-400">Revenue</p>
            <p className="text-2xl font-bold">$12,345</p>
          </div>
          <div className="rounded-lg border border-gray-800 p-4">
            <p className="text-sm text-gray-400">Active Now</p>
            <p className="text-2xl font-bold">42</p>
          </div>
        </div>
      </main>
    </div>`,
    landing: `<div className="min-h-screen">
      <header className="flex items-center justify-between p-6">
        <span className="text-xl font-bold">{name}</span>
        <nav className="space-x-4">
          <a href="#features" className="text-gray-400 hover:text-white">Features</a>
          <a href="#pricing" className="text-gray-400 hover:text-white">Pricing</a>
          <button className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">Get Started</button>
        </nav>
      </header>
      <main className="flex flex-col items-center justify-center py-32 text-center">
        <h1 className="text-6xl font-bold">Build faster with AI</h1>
        <p className="mt-6 max-w-xl text-xl text-gray-400">
          {name} helps you ship beautiful interfaces in minutes, not hours.
        </p>
        <div className="mt-8 flex gap-4">
          <button className="rounded-lg bg-purple-600 px-6 py-3 text-lg text-white hover:bg-purple-700">Start Free</button>
          <button className="rounded-lg border border-gray-600 px-6 py-3 text-lg hover:bg-gray-800">View Demo</button>
        </div>
      </main>
    </div>`,
    ecommerce: `<div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-gray-800 p-6">
        <span className="text-xl font-bold">{name}</span>
        <div className="flex items-center gap-4">
          <input type="search" placeholder="Search products..." className="rounded-lg border border-gray-700 bg-transparent px-4 py-2" />
          <button className="rounded-lg bg-purple-600 px-4 py-2 text-white">Cart (0)</button>
        </div>
      </header>
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-6">Featured Products</h1>
        <div className="grid grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-lg border border-gray-800 overflow-hidden">
              <div className="aspect-square bg-gray-800" />
              <div className="p-4">
                <h3 className="font-medium">Product {i}</h3>
                <p className="text-purple-400 font-bold mt-1">$99.00</p>
                <button className="mt-3 w-full rounded bg-purple-600 py-2 text-sm text-white hover:bg-purple-700">Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>`,
    auth: `<div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-xl border border-gray-800 p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Sign in to {name}</h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input type="email" className="w-full rounded-lg border border-gray-700 bg-transparent px-4 py-2" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input type="password" className="w-full rounded-lg border border-gray-700 bg-transparent px-4 py-2" />
          </div>
          <button type="submit" className="w-full rounded-lg bg-purple-600 py-2 text-white hover:bg-purple-700">Sign In</button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Or continue with</p>
          <div className="mt-3 flex gap-3 justify-center">
            <button className="rounded-lg border border-gray-700 px-4 py-2 hover:bg-gray-800">GitHub</button>
            <button className="rounded-lg border border-gray-700 px-4 py-2 hover:bg-gray-800">Google</button>
          </div>
        </div>
      </div>
    </div>`,
  };

  const jsx = templates[template].replace(/\{name\}/g, name);

  if (framework === 'nextjs') {
    await fs.ensureDir(path.join(dir, 'src', 'app'));
    const page = `import './globals.css';

export default function Home() {
  const name = '${name}';
  return (
    ${jsx}
  );
}
`;
    await fs.writeFile(path.join(dir, 'src', 'app', 'page.tsx'), page);

    const layout = `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '${name}',
  description: 'Built with Siza',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
`;
    await fs.writeFile(path.join(dir, 'src', 'app', 'layout.tsx'), layout);
  } else if (framework === 'vue') {
    await fs.ensureDir(path.join(dir, 'src'));
    const app = `<template>
  <div>
    ${jsx.replace(/className=/g, 'class=').replace(/\{name\}/g, '{{ name }}')}
  </div>
</template>

<script setup lang="ts">
const name = '${name}';
</script>

<style>
@import './globals.css';
</style>
`;
    await fs.writeFile(path.join(dir, 'src', 'App.vue'), app);
  } else if (framework === 'svelte') {
    await fs.ensureDir(path.join(dir, 'src', 'routes'));
    const page = `<script lang="ts">
  const name = '${name}';
</script>

${jsx.replace(/className=/g, 'class=').replace(/\{name\}/g, '{name}')}

<style>
  @import '../globals.css';
</style>
`;
    await fs.writeFile(path.join(dir, 'src', 'routes', '+page.svelte'), page);
  } else {
    await fs.ensureDir(path.join(dir, 'src'));
    const app = `import './globals.css';

export default function App() {
  const name = '${name}';
  return (
    ${jsx}
  );
}
`;
    await fs.writeFile(path.join(dir, 'src', 'App.tsx'), app);
  }
}

async function writeMcpConfig(dir: string): Promise<void> {
  const config = {
    mcpServers: {
      siza: {
        command: 'npx',
        args: ['-y', '@forgespace/siza-mcp@latest'],
        env: {},
      },
    },
  };
  await fs.writeJson(path.join(dir, '.mcp.json'), config, { spaces: 2 });
}

async function writeReadme(
  dir: string, name: string, framework: Framework, ui: UILibrary, template: Template
): Promise<void> {
  const frameworkName = { nextjs: 'Next.js', react: 'React', vue: 'Vue', svelte: 'SvelteKit' };
  const content = `# ${name}

Created with [create-siza-app](https://github.com/Forge-Space/siza).

## Stack

- **Framework**: ${frameworkName[framework]}
- **UI**: ${ui === 'shadcn' ? 'shadcn/ui + Tailwind CSS' : ui === 'tailwind' ? 'Tailwind CSS' : 'Custom'}
- **Template**: ${template}

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## AI-Powered Development

This project is configured for AI-assisted development with Siza.

\`\`\`bash
# Generate a component
npx siza generate "A responsive pricing card with three tiers"

# Start the AI workspace
npx siza workspace
\`\`\`

## Learn More

- [Siza Documentation](https://docs.siza.dev)
- [Siza GitHub](https://github.com/Forge-Space/siza)
`;
  await fs.writeFile(path.join(dir, 'README.md'), content);
}
