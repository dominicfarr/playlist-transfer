import {
  readSourcePlaylist,
  type ReadSourcePlaylistError,
  type SpotifyEmbedPort,
} from './transfer';

const READ_ERROR_EXPLANATIONS: Record<ReadSourcePlaylistError, string> = {
  'not a playlist link': 'it is not a Spotify Share Link for a playlist',
  'playlist not found': 'Spotify says the playlist does not exist',
  'source unreadable':
    'the embed page could not be fetched, has no readable __NEXT_DATA__, or has changed shape (see ADR 0001)',
};

export type LiveSourceCheck =
  { passed: true; summary: string } | { passed: false; message: string };

/**
 * The early warning for Spotify changing its embed page (ADR 0001): reads
 * a Source Playlist through the Transfer core and says whether what it read
 * is a non-empty, correctly shaped Source Playlist.
 */
export async function checkLiveSourcePlaylist(
  shareLink: string,
  embed: SpotifyEmbedPort,
): Promise<LiveSourceCheck> {
  const sourceRead = await readSourcePlaylist(shareLink, embed);
  if (!sourceRead.ok) {
    return {
      passed: false,
      message: `Could not read a Source Playlist from ${shareLink}: ${READ_ERROR_EXPLANATIONS[sourceRead.error]}`,
    };
  }
  const { name, owner, sourceTracks } = sourceRead.sourcePlaylist;
  if (sourceTracks.length === 0) {
    return {
      passed: false,
      message: `Read "${name}" from ${shareLink} but it has no Source Tracks; the embed page may have changed (see ADR 0001)`,
    };
  }
  const unreadable = sourceTracks
    .filter((track) => track.untransferableReason === 'unreadable from Spotify')
    .map((track) => `${track.position} (${track.untransferableDetail})`);
  if (unreadable.length > 0) {
    return {
      passed: false,
      message: `Read "${name}" from ${shareLink} but Source Tracks ${unreadable.join(', ')} could not be read; the embed page may have changed (see ADR 0001)`,
    };
  }
  const badlyShaped = sourceTracks
    .filter(
      (track) =>
        track.title.trim() === '' ||
        track.artists.trim() === '' ||
        !(track.durationMs > 0),
    )
    .map((track) => track.position);
  if (badlyShaped.length > 0) {
    return {
      passed: false,
      message: `Read "${name}" from ${shareLink} but Source Tracks ${badlyShaped.join(', ')} lack a title, artists or duration; the embed page may have changed (see ADR 0001)`,
    };
  }
  return {
    passed: true,
    summary: `Read "${name}" by ${owner}: ${sourceTracks.length} Source Tracks`,
  };
}
