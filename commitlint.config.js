// Conventional Commits, restricted to the types and scopes in CONTRIBUTING.md.
// Keep these lists in sync with that file.
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'refactor',
        'perf',
        'test',
        'docs',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    'scope-enum': [
      2,
      'always',
      ['source', 'matching', 'review', 'apple', 'infra', 'deps', 'adr'],
    ],
    'header-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 72],
  },
};
