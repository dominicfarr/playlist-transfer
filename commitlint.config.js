// Conventional Commits, restricted to the types and scopes in CONTRIBUTING.md.
// Keep these lists in sync with that file.
export default {
  extends: ['@commitlint/config-conventional'],
  // Dependabot (.github/dependabot.yml) writes the headers itself, e.g.
  // `build(deps): bump vite from 8.3.5 to 8.4.0`, but its bodies carry
  // release notes with long lines, so its signed-off commits are not linted.
  ignores: [(message) => message.includes('Signed-off-by: dependabot[bot]')],
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
