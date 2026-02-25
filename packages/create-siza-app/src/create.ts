import path from 'path';
import fs from 'fs-extra';
import kleur from 'kleur';
import validateName from 'validate-npm-package-name';
import { generateProject } from './generator.js';
import type { ProjectOptions } from './prompts.js';

export async function createApp(options: ProjectOptions): Promise<void> {
  const { name } = options;

  const validation = validateName(name);
  if (!validation.validForNewPackages) {
    const errors = [...(validation.errors || []), ...(validation.warnings || [])];
    console.error(kleur.red(`Invalid project name: ${errors.join(', ')}`));
    process.exit(1);
  }

  const targetDir = path.resolve(process.cwd(), name);

  if (await fs.pathExists(targetDir)) {
    const files = await fs.readdir(targetDir);
    if (files.length > 0) {
      console.error(kleur.red(`Directory ${name} already exists and is not empty.`));
      process.exit(1);
    }
  }

  console.log();
  console.log(kleur.cyan(`Creating ${kleur.bold(name)} with Siza...`));
  console.log();

  await generateProject({
    ...options,
    targetDir,
  });

  console.log(kleur.green('Installing dependencies...'));
  const { execSync } = await import('child_process');
  try {
    execSync('npm install', { cwd: targetDir, stdio: 'inherit' });
  } catch {
    console.log(kleur.yellow('npm install failed. Run it manually after setup.'));
  }

  console.log();
  console.log(kleur.green('Initializing git...'));
  try {
    execSync('git init', { cwd: targetDir, stdio: 'pipe' });
    execSync('git add -A', { cwd: targetDir, stdio: 'pipe' });
    execSync('git commit -m "Initial commit from create-siza-app"', {
      cwd: targetDir,
      stdio: 'pipe',
    });
  } catch {
    // git init is optional
  }

  console.log();
  console.log(kleur.green().bold('Done!'));
  console.log();
  console.log('  Next steps:');
  console.log();
  console.log(kleur.cyan(`  cd ${name}`));
  console.log(kleur.cyan('  npm run dev'));
  console.log();
  console.log(kleur.gray('  Start generating components:'));
  console.log(kleur.cyan('  npx siza generate "A responsive pricing card"'));
  console.log();
}
