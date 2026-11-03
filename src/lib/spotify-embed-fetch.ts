import type { SpotifyEmbedPort } from './transfer';

/**
 * The real Spotify embed port. It fetches the embed page from our own
 * origin because Spotify sends no CORS headers: the Vite dev server proxies
 * `/embed/playlist/*` locally, and CloudFront does so in production (ADR 0001).
 */
export const spotifyEmbedFetch: SpotifyEmbedPort = {
  async fetchEmbedPage(playlistId) {
    const response = await fetch(
      `/embed/playlist/${encodeURIComponent(playlistId)}`,
    );
    if (response.status === 404) return { found: false };
    if (!response.ok) {
      throw new Error(`Spotify embed page returned HTTP ${response.status}`);
    }
    return { found: true, html: await response.text() };
  },
};
