/**
 * Test helpers: saved copies of real Spotify embed pages (tokens redacted),
 * plus hand-edited variants, and fake Spotify embed ports that serve them.
 */
import type { SpotifyEmbedPort } from '../spotify-embed-port';

const fixtures = import.meta.glob<string>('./*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/** The HTML of the saved embed page with this file name. */
export function fixture(name: string): string {
  const html = fixtures[`./${name}`];
  if (html === undefined) throw new Error(`no fixture ${name}`);
  return html;
}

export type FakeSpotifyEmbedPort = SpotifyEmbedPort & {
  /** The playlist ids asked for, in order. */
  requestedIds: string[];
};

/** A Spotify embed port that serves this HTML for any playlist id. */
export function embedServingHtml(html: string): FakeSpotifyEmbedPort {
  const requestedIds: string[] = [];
  return {
    requestedIds,
    async fetchEmbedPage(playlistId) {
      requestedIds.push(playlistId);
      return { found: true, html };
    },
  };
}

/** A Spotify embed port that serves one saved embed page for any playlist id. */
export function embedServing(fixtureName: string): FakeSpotifyEmbedPort {
  return embedServingHtml(fixture(fixtureName));
}
