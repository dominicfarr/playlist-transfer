/**
 * The Transfer core: plain TypeScript, with no Svelte or network code.
 * Everything outside the core talks to it through this module.
 */
export type {
  SourcePlaylist,
  SourceTrack,
  UntransferableReason,
} from './source-playlist';
export type { SpotifyEmbedPort, EmbedPage } from './spotify-embed-port';
export {
  readSourcePlaylist,
  type ReadSourcePlaylistResult,
  type ReadSourcePlaylistError,
} from './read-source-playlist';
