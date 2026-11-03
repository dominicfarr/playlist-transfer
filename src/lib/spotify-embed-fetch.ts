import type { SpotifyEmbedPort } from './transfer';

/**
 * Makes the real Spotify embed port, fetching `/embed/playlist/<id>` from
 * `baseUrl`. The browser passes `''` (its own origin) because Spotify sends
 * no CORS headers: the Vite dev server proxies the path locally, and
 * CloudFront does so in production (ADR 0001). Outside a browser, such as
 * the live check in CI, pass `https://open.spotify.com`.
 */
export function createSpotifyEmbedFetch(baseUrl: string): SpotifyEmbedPort {
  return {
    async fetchEmbedPage(playlistId) {
      const response = await fetch(
        `${baseUrl}/embed/playlist/${encodeURIComponent(playlistId)}`,
      );
      if (response.status === 404) return { found: false };
      if (!response.ok) {
        throw new Error(`Spotify embed page returned HTTP ${response.status}`);
      }
      return { found: true, html: await response.text() };
    },
  };
}

/** The real Spotify embed port as the browser uses it, on our own origin. */
export const spotifyEmbedFetch: SpotifyEmbedPort = createSpotifyEmbedFetch('');
