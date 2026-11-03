import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

// The Spotify embed page has no CORS headers, so the browser fetches it from
// our own origin. Locally Vite proxies it; in production CloudFront does (ADR 0001).
const spotifyEmbedProxy = {
  '/embed/playlist': {
    target: 'https://open.spotify.com',
    changeOrigin: true,
  },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: { proxy: spotifyEmbedProxy },
  preview: { proxy: spotifyEmbedProxy },
  test: {
    include: ['src/**/*.test.ts', 'infra/**/*.test.ts'],
    environment: 'node',
    // Only measured by `npm run test:coverage` (the Sonar workflow), so
    // `npm test` and the pre-commit hook stay as fast as before.
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text-summary'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.{ts,svelte}', 'infra/**/*.ts'],
      exclude: [
        '**/*.test.ts',
        '**/*.live.ts',
        'src/lib/transfer/fixtures/**',
        // Same list as sonar.coverage.exclusions; keep the two in step.
        // The Svelte UI and its entry point are checked by hand in V1
        // (spec #1, Testing Decisions); the real Spotify adapter is exercised
        // by the live Source Playlist check rather than unit tests.
        'src/**/*.svelte',
        'src/main.ts',
        'src/lib/spotify-embed-fetch.ts',
      ],
    },
  },
});
