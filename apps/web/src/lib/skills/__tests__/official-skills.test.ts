import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseSkillMd } from '../parser';

describe('official skills content', () => {
  it('parses all SKILL.md files under repository skills directory', async () => {
    const skillsRoot = resolve(process.cwd(), '..', '..', 'skills');
    const entries = await readdir(skillsRoot, { withFileTypes: true });
    const directories = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

    expect(directories.length).toBeGreaterThan(0);

    for (const directory of directories) {
      const skillPath = resolve(skillsRoot, directory, 'SKILL.md');
      const content = await readFile(skillPath, 'utf8');
      const parsed = parseSkillMd(content);

      expect(parsed.frontmatter.description).toBeTruthy();
      expect(parsed.instructions.length).toBeGreaterThan(20);
    }
  });
});
