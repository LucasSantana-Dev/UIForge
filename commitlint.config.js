module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation only
        'style', // Code style (formatting, missing semi-colons, etc)
        'refactor', // Code refactoring
        'perf', // Performance improvement
        'test', // Adding/updating tests
        'chore', // Maintenance tasks
        'ci', // CI/CD changes
        'build', // Build system changes
        'revert', // Revert previous commit
      ],
    ],
    'subject-case': [2, 'always', 'sentence-case'],
    'header-max-length': [2, 'always', 100],
  },
};
