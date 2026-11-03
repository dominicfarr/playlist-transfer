/** What the Spotify embed port returns for one playlist id. */
export type EmbedPage = { found: true; html: string } | { found: false };

/**
 * The Spotify embed port: fetches the public embed page
 * (`/embed/playlist/<id>`) for a Source Playlist. It returns
 * `{ found: false }` for an HTTP 404 and throws for any other failure.
 */
export interface SpotifyEmbedPort {
  fetchEmbedPage(playlistId: string): Promise<EmbedPage>;
}
