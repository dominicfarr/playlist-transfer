import { defineConfig } from 'vitest/config';

// Only the live checks, which hit real services. `npm test` never runs them.
export default defineConfig({
  test: {
    include: ['src/**/*.live.ts'],
    environment: 'node',
    testTimeout: 30_000,
  },
});
