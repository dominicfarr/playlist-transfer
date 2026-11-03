import { parseShareLink } from './share-link';
import { parseEmbedPage, type SourcePlaylist } from './source-playlist';
import type { EmbedPage, SpotifyEmbedPort } from './spotify-embed-port';

export type ReadSourcePlaylistError =
  'not a playlist link' | 'playlist not found' | 'source unreadable';

export type ReadSourcePlaylistResult =
  | { ok: true; sourcePlaylist: SourcePlaylist }
  | { ok: false; error: ReadSourcePlaylistError };

/** Reads the Source Playlist that a Share Link points to. */
export async function readSourcePlaylist(
  shareLink: string,
  embed: SpotifyEmbedPort,
): Promise<ReadSourcePlaylistResult> {
  const playlistId = parseShareLink(shareLink);
  if (playlistId === null) return { ok: false, error: 'not a playlist link' };

  let page: EmbedPage;
  try {
    page = await embed.fetchEmbedPage(playlistId);
  } catch {
    return { ok: false, error: 'source unreadable' };
  }
  if (!page.found) return { ok: false, error: 'playlist not found' };

  const parsed = parseEmbedPage(playlistId, page.html);
  if (typeof parsed === 'string') return { ok: false, error: parsed };
  return { ok: true, sourcePlaylist: parsed };
}
