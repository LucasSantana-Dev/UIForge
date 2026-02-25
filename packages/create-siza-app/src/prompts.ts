import enquirer from 'enquirer';

export type Framework = 'nextjs' | 'react' | 'vue' | 'svelte';
export type UILibrary = 'shadcn' | 'tailwind' | 'none';
export type Template = 'blank' | 'dashboard' | 'landing' | 'ecommerce' | 'auth';

export interface ProjectOptions {
  name: string;
  framework: Framework;
  ui: UILibrary;
  template: Template;
  mcp: boolean;
}

export async function promptProjectName(initial?: string): Promise<string> {
  if (initial) return initial;
  const { name } = await (enquirer as any).prompt({
    type: 'input',
    name: 'name',
    message: 'Project name:',
    initial: 'my-siza-app',
  });
  return name as string;
}

export async function promptOptions(
  overrides: Partial<ProjectOptions>
): Promise<Omit<ProjectOptions, 'name'>> {
  const questions: any[] = [];

  if (!overrides.framework) {
    questions.push({
      type: 'select',
      name: 'framework',
      message: 'Framework:',
      choices: [
        { name: 'nextjs', message: 'Next.js (recommended)' },
        { name: 'react', message: 'React (Vite)' },
        { name: 'vue', message: 'Vue (Vite)' },
        { name: 'svelte', message: 'SvelteKit' },
      ],
    });
  }

  if (!overrides.ui) {
    questions.push({
      type: 'select',
      name: 'ui',
      message: 'UI library:',
      choices: [
        { name: 'shadcn', message: 'shadcn/ui (recommended)' },
        { name: 'tailwind', message: 'Tailwind CSS only' },
        { name: 'none', message: 'None' },
      ],
    });
  }

  if (!overrides.template) {
    questions.push({
      type: 'select',
      name: 'template',
      message: 'Starter template:',
      choices: [
        { name: 'blank', message: 'Blank project' },
        { name: 'dashboard', message: 'Dashboard' },
        { name: 'landing', message: 'Landing page' },
        { name: 'ecommerce', message: 'E-commerce' },
        { name: 'auth', message: 'Auth + Profile' },
      ],
    });
  }

  if (overrides.mcp === undefined) {
    questions.push({
      type: 'confirm',
      name: 'mcp',
      message: 'Configure MCP server for IDE integration?',
      initial: true,
    });
  }

  const answers = questions.length > 0
    ? await (enquirer as any).prompt(questions)
    : {};

  return {
    framework: overrides.framework || answers.framework,
    ui: overrides.ui || answers.ui,
    template: overrides.template || answers.template,
    mcp: overrides.mcp ?? answers.mcp ?? false,
  };
}
