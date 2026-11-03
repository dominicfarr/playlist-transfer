import { it } from 'vitest';
import { checkLiveSourcePlaylist } from './live-source-check';
import { createSpotifyEmbedFetch } from './spotify-embed-fetch';

/**
 * The daily live Source Playlist check (`npm run check:live`). It reads a
 * real playlist from live Spotify through the same seam as the unit tests,
 * with the real Spotify embed port. There is no proxy here, so the port
 * goes straight to open.spotify.com.
 */
const EXAMPLE_SHARE_LINK =
  'https://open.spotify.com/playlist/4KN5k0MupIBcAX41GKLk51';

// Set LIVE_CHECK_SHARE_LINK to point the check elsewhere, e.g. at an
// invalid playlist id to see what a failure looks like.
const shareLink: string =
  import.meta.env.LIVE_CHECK_SHARE_LINK || EXAMPLE_SHARE_LINK;

it(`reads a Source Playlist from live Spotify (${shareLink})`, async () => {
  const check = await checkLiveSourcePlaylist(
    shareLink,
    createSpotifyEmbedFetch('https://open.spotify.com'),
  );
  if (!check.passed) throw new Error(check.message);
  console.info(check.summary);
});
