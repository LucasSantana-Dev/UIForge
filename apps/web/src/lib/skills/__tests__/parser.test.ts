import { parseSkillMd, substituteArguments, generateSkillMd } from '../parser';

describe('parseSkillMd', () => {
  it('parses valid SKILL.md with all frontmatter fields', () => {
    const content = `---
name: Test Skill
description: A test skill for unit tests
version: 1.0.0
author: Test Author
license: MIT
tags: [ui, components]
allowed-tools: [Read, Write]
argument-hint: <component-name>
invocation-mode: user
---

Generate a $ARGUMENTS component with accessibility support.`;

    const result = parseSkillMd(content);

    expect(result.frontmatter.name).toBe('Test Skill');
    expect(result.frontmatter.description).toBe('A test skill for unit tests');
    expect(result.frontmatter.version).toBe('1.0.0');
    expect(result.frontmatter.author).toBe('Test Author');
    expect(result.frontmatter.license).toBe('MIT');
    expect(result.frontmatter.tags).toEqual(['ui', 'components']);
    expect(result.frontmatter['allowed-tools']).toEqual(['Read', 'Write']);
    expect(result.frontmatter['argument-hint']).toBe('<component-name>');
    expect(result.frontmatter['invocation-mode']).toBe('user');
    expect(result.instructions).toContain('$ARGUMENTS');
  });

  it('parses minimal frontmatter with defaults', () => {
    const content = `---
name: Minimal
description: Bare minimum
---

Do something.`;

    const result = parseSkillMd(content);

    expect(result.frontmatter.name).toBe('Minimal');
    expect(result.frontmatter['invocation-mode']).toBe('user');
    expect(result.frontmatter.tags).toBeUndefined();
  });

  it('returns body as instructions when no frontmatter', () => {
    const content = 'Just instructions without frontmatter.';
    expect(() => parseSkillMd(content)).toThrow();
  });

  it('handles boolean and numeric YAML values', () => {
    const content = `---
name: Types
description: Type test
---

Body.`;

    const result = parseSkillMd(content);
    expect(result.frontmatter.name).toBe('Types');
  });
});

describe('substituteArguments', () => {
  it('replaces $ARGUMENTS with joined args', () => {
    const result = substituteArguments(
      'Create a $ARGUMENTS component',
      ['DataTable', 'sortable']
    );
    expect(result).toBe('Create a DataTable sortable component');
  });

  it('replaces positional $0, $1 placeholders', () => {
    const result = substituteArguments(
      'Generate $0 with $1 validation',
      ['LoginForm', 'Zod']
    );
    expect(result).toBe('Generate LoginForm with Zod validation');
  });

  it('handles empty args', () => {
    const result = substituteArguments('No args: $ARGUMENTS end', []);
    expect(result).toBe('No args:  end');
  });
});

describe('generateSkillMd', () => {
  it('generates valid SKILL.md format', () => {
    const md = generateSkillMd(
      {
        name: 'Test',
        description: 'A test skill',
        version: '1.0.0',
        tags: ['ui', 'forms'],
      },
      'Create a form component.'
    );

    expect(md).toContain('---');
    expect(md).toContain('name: Test');
    expect(md).toContain('tags: [ui, forms]');
    expect(md).toContain('Create a form component.');
  });

  it('skips null/undefined values', () => {
    const md = generateSkillMd(
      { name: 'Test', description: 'Desc', license: null },
      'Body'
    );
    expect(md).not.toContain('license');
  });

  it('roundtrips through parse and generate', () => {
    const original = `---
name: Roundtrip
description: Test roundtrip
version: 2.0.0
tags: [a, b, c]
---

Instructions here.`;

    const parsed = parseSkillMd(original);
    const regenerated = generateSkillMd(
      parsed.rawFrontmatter,
      parsed.instructions
    );
    const reparsed = parseSkillMd(regenerated);

    expect(reparsed.frontmatter.name).toBe('Roundtrip');
    expect(reparsed.frontmatter.version).toBe('2.0.0');
    expect(reparsed.frontmatter.tags).toEqual(['a', 'b', 'c']);
    expect(reparsed.instructions).toBe('Instructions here.');
  });
});
