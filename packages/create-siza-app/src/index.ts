#!/usr/bin/env node
import { Command } from 'commander';
import kleur from 'kleur';
import { version } from './version.js';
import { promptProjectName, promptOptions } from './prompts.js';
import { createApp } from './create.js';
import type { Framework, UILibrary, Template } from './prompts.js';

const program = new Command();

program
  .name('create-siza-app')
  .description('Create a new Siza app with AI-powered UI generation')
  .version(version)
  .argument('[project-name]', 'Name of the project')
  .option('-f, --framework <framework>', 'Framework: nextjs, react, vue, svelte')
  .option('--ui <library>', 'UI library: shadcn, tailwind, none')
  .option('--template <name>', 'Template: blank, dashboard, landing, ecommerce, auth')
  .option('--mcp', 'Configure MCP server for IDE integration')
  .option('--no-mcp', 'Skip MCP configuration')
  .action(async (projectName: string | undefined, opts: Record<string, unknown>) => {
    console.log();
    console.log(kleur.magenta().bold('  create-siza-app') + kleur.gray(` v${version}`));
    console.log();

    try {
      const name = await promptProjectName(projectName);
      const options = await promptOptions({
        framework: opts.framework as Framework | undefined,
        ui: opts.ui as UILibrary | undefined,
        template: opts.template as Template | undefined,
        mcp: typeof opts.mcp === 'boolean' ? opts.mcp : undefined,
      });

      await createApp({ name, ...options });
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ERR_USE_AFTER_CLOSE') {
        process.exit(0);
      }
      console.error(kleur.red('Error:'), (err as Error).message);
      process.exit(1);
    }
  });

program.parse();
