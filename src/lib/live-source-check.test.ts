import { describe, expect, it } from 'vitest';
import { checkLiveSourcePlaylist } from './live-source-check';
import {
  embedServing,
  embedServingHtml,
} from './transfer/fixtures/embed-fixtures';

const EXAMPLE_SHARE_LINK =
  'https://open.spotify.com/playlist/4KN5k0MupIBcAX41GKLk51';

/** An embed page whose `__NEXT_DATA__` holds the given entity. */
function embedPageWith(entity: unknown): string {
  const nextData = { props: { pageProps: { state: { data: { entity } } } } };
  return `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify(nextData)}</script>`;
}

const goodTrack = {
  title: 'Sailing into yesterday',
  subtitle: 'Ray Sterling',
  duration: 227799,
  entityType: 'track',
  isPlayable: true,
};

describe('the live Source Playlist check', () => {
  it('passes for a non-empty, well-shaped Source Playlist', async () => {
    const check = await checkLiveSourcePlaylist(
      EXAMPLE_SHARE_LINK,
      embedServing('sailing-into-yesterday.html'),
    );

    expect(check).toEqual({
      passed: true,
      summary:
        'Read "Sailing into yesterday" by julian.edgerton: 15 Source Tracks',
    });
  });

  it('fails when the embed page has no readable __NEXT_DATA__', async () => {
    const check = await checkLiveSourcePlaylist(
      EXAMPLE_SHARE_LINK,
      embedServing('missing-next-data.html'),
    );

    expect(check).toEqual({
      passed: false,
      message:
        'Could not read a Source Playlist from https://open.spotify.com/playlist/4KN5k0MupIBcAX41GKLk51: the embed page could not be fetched, has no readable __NEXT_DATA__, or has changed shape (see ADR 0001)',
    });
  });

  it('fails when the embed page cannot be fetched', async () => {
    const check = await checkLiveSourcePlaylist(EXAMPLE_SHARE_LINK, {
      fetchEmbedPage: async () => {
        throw new Error('Spotify embed page returned HTTP 503');
      },
    });

    expect(check).toEqual({
      passed: false,
      message:
        'Could not read a Source Playlist from https://open.spotify.com/playlist/4KN5k0MupIBcAX41GKLk51: the embed page could not be fetched, has no readable __NEXT_DATA__, or has changed shape (see ADR 0001)',
    });
  });

  it('fails when Spotify says the playlist does not exist', async () => {
    const check = await checkLiveSourcePlaylist(
      'https://open.spotify.com/playlist/0000000000000000000000',
      embedServing('playlist-not-found.html'),
    );

    expect(check).toEqual({
      passed: false,
      message:
        'Could not read a Source Playlist from https://open.spotify.com/playlist/0000000000000000000000: Spotify says the playlist does not exist',
    });
  });

  it('fails when the Source Playlist has no Source Tracks', async () => {
    const check = await checkLiveSourcePlaylist(
      EXAMPLE_SHARE_LINK,
      embedServingHtml(
        embedPageWith({ name: 'Empty', subtitle: 'someone', trackList: [] }),
      ),
    );

    expect(check).toEqual({
      passed: false,
      message:
        'Read "Empty" from https://open.spotify.com/playlist/4KN5k0MupIBcAX41GKLk51 but it has no Source Tracks; the embed page may have changed (see ADR 0001)',
    });
  });

  it('fails, naming their positions, when Source Tracks lack a title, artists or duration', async () => {
    const check = await checkLiveSourcePlaylist(
      EXAMPLE_SHARE_LINK,
      embedServingHtml(
        embedPageWith({
          name: 'Odd',
          subtitle: 'someone',
          trackList: [
            goodTrack,
            { ...goodTrack, title: ' ' },
            goodTrack,
            { ...goodTrack, subtitle: '' },
            { ...goodTrack, duration: 0 },
          ],
        }),
      ),
    );

    expect(check).toEqual({
      passed: false,
      message:
        'Read "Odd" from https://open.spotify.com/playlist/4KN5k0MupIBcAX41GKLk51 but Source Tracks 2, 4, 5 lack a title, artists or duration; the embed page may have changed (see ADR 0001)',
    });
  });

  it('fails, naming their positions, when Source Tracks are unreadable from Spotify', async () => {
    const withoutIsPlayable: Record<string, unknown> = { ...goodTrack };
    delete withoutIsPlayable.isPlayable;
    const check = await checkLiveSourcePlaylist(
      EXAMPLE_SHARE_LINK,
      embedServingHtml(
        embedPageWith({
          name: 'Odd',
          subtitle: 'someone',
          trackList: [goodTrack, withoutIsPlayable, goodTrack],
        }),
      ),
    );

    expect(check).toEqual({
      passed: false,
      message:
        'Read "Odd" from https://open.spotify.com/playlist/4KN5k0MupIBcAX41GKLk51 but Source Tracks 2 (missing or invalid isPlayable) could not be read; the embed page may have changed (see ADR 0001)',
    });
  });
});
