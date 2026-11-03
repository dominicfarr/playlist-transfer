/**
 * The Transfer core: plain TypeScript, with no Svelte or network code.
 * Everything outside the core talks to it through this module.
 */
export {
  transferableTracks,
  type SourcePlaylist,
  type SourceTrack,
  type UntransferableReason,
} from './source-playlist';
export type { SpotifyEmbedPort, EmbedPage } from './spotify-embed-port';
export {
  readSourcePlaylist,
  type SourcePlaylistRead,
  type ReadSourcePlaylistError,
} from './read-source-playlist';
