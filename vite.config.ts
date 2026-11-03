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
  },
});
