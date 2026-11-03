import { describe, expect, it } from 'vitest';
import {
  readSourcePlaylist,
  transferableTracks,
  type SpotifyEmbedPort,
} from './index';
import { embedServing, embedServingHtml } from './fixtures/embed-fixtures';

const EXAMPLE_SHARE_LINK =
  'https://open.spotify.com/playlist/4KN5k0MupIBcAX41GKLk51?si=abc123';

describe('reading a Source Playlist from a Share Link', () => {
  it('reads the example playlist name, owner and Source Tracks in order', async () => {
    const sourceRead = await readSourcePlaylist(
      EXAMPLE_SHARE_LINK,
      embedServing('sailing-into-yesterday.html'),
    );

    if (!sourceRead.ok) throw new Error(`expected ok, got ${sourceRead.error}`);
    const playlist = sourceRead.sourcePlaylist;
    expect(playlist.name).toBe('Sailing into yesterday');
    expect(playlist.owner).toBe('julian.edgerton');
    expect(playlist.sourceTracks).toHaveLength(15);
    expect(playlist.sourceTracks[0]).toEqual({
      position: 1,
      title: 'Sailing into yesterday',
      artists: 'Ray Sterling',
      durationMs: 227799,
      untransferableReason: null,
      untransferableDetail: null,
    });
    expect(playlist.sourceTracks.map((t) => t.title).slice(-2)).toEqual([
      'Many Men - Jazz Version',
      'Cantaloop Island',
    ]);
  });

  it('marks a podcast episode as an Untransferable Track that is not a song', async () => {
    const sourceRead = await readSourcePlaylist(
      EXAMPLE_SHARE_LINK,
      embedServing('with-podcast-episode.html'),
    );

    if (!sourceRead.ok) throw new Error(`expected ok, got ${sourceRead.error}`);
    const episode = sourceRead.sourcePlaylist.sourceTracks[2];
    expect(episode).toMatchObject({
      position: 3,
      title: 'Episode 12: Jazz on the water',
      untransferableReason: 'not a song',
    });
    expect(transferableTracks(sourceRead.sourcePlaylist)).toHaveLength(14);
    expect(transferableTracks(sourceRead.sourcePlaylist)).not.toContain(
      episode,
    );
  });

  it("marks an unplayable track as an Untransferable Track that is unavailable on Spotify, with Spotify's playabilityReason", async () => {
    const sourceRead = await readSourcePlaylist(
      EXAMPLE_SHARE_LINK,
      embedServing('with-unplayable-track.html'),
    );

    if (!sourceRead.ok) throw new Error(`expected ok, got ${sourceRead.error}`);
    expect(sourceRead.sourcePlaylist.sourceTracks[4]).toMatchObject({
      position: 5,
      title: 'Late Night Drive',
      untransferableReason: 'unavailable on Spotify',
      untransferableDetail: 'UNAVAILABLE',
    });
    expect(transferableTracks(sourceRead.sourcePlaylist)).toHaveLength(14);
  });

  it('marks a Source Track it cannot read as an Untransferable Track, keeping the rest', async () => {
    const sourceRead = await readSourcePlaylist(
      EXAMPLE_SHARE_LINK,
      embedServing('with-malformed-track.html'),
    );

    if (!sourceRead.ok) throw new Error(`expected ok, got ${sourceRead.error}`);
    const tracks = sourceRead.sourcePlaylist.sourceTracks;
    expect(tracks).toHaveLength(15);
    // The fixture's third track has no duration.
    expect(tracks[2]).toMatchObject({
      position: 3,
      title: 'Waterline',
      artists: 'Four80East',
      untransferableReason: 'unreadable from Spotify',
      untransferableDetail: 'missing or invalid duration',
    });
    expect(tracks[3]).toMatchObject({
      position: 4,
      title: 'Patience - Cool Wave Mix',
      untransferableReason: null,
    });
    expect(transferableTracks(sourceRead.sourcePlaylist)).toHaveLength(14);
  });

  it('marks a track list item that is not an object as an Untransferable Track', async () => {
    const nextData = {
      props: {
        pageProps: {
          state: {
            data: {
              entity: { name: 'Odd', subtitle: 'someone', trackList: [null] },
            },
          },
        },
      },
    };

    const sourceRead = await readSourcePlaylist(
      EXAMPLE_SHARE_LINK,
      embedServingHtml(
        `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify(nextData)}</script>`,
      ),
    );

    if (!sourceRead.ok) throw new Error(`expected ok, got ${sourceRead.error}`);
    expect(sourceRead.sourcePlaylist.sourceTracks).toEqual([
      {
        position: 1,
        title: '',
        artists: '',
        durationMs: 0,
        untransferableReason: 'unreadable from Spotify',
        untransferableDetail: 'not a track object',
      },
    ]);
  });

  it('counts every Source Track of the example playlist as transferable', async () => {
    const sourceRead = await readSourcePlaylist(
      EXAMPLE_SHARE_LINK,
      embedServing('sailing-into-yesterday.html'),
    );

    if (!sourceRead.ok) throw new Error(`expected ok, got ${sourceRead.error}`);
    expect(transferableTracks(sourceRead.sourcePlaylist)).toHaveLength(15);
  });

  it('keeps artist names containing commas as one artist string with plain spaces', async () => {
    const sourceRead = await readSourcePlaylist(
      EXAMPLE_SHARE_LINK,
      embedServing('with-comma-artist-names.html'),
    );

    if (!sourceRead.ok) throw new Error(`expected ok, got ${sourceRead.error}`);
    const tracks = sourceRead.sourcePlaylist.sourceTracks;
    // The saved page separates artists with a no-break space after the comma.
    expect(tracks[1]?.artists).toBe('Tyler, The Creator, Kali Uchis');
    expect(tracks[9]?.artists).toBe('Postmodern Jukebox, Rogelio Douglas, Jr.');
  });

  it('warns that a Source Playlist of exactly 100 Source Tracks is possibly truncated', async () => {
    const sourceRead = await readSourcePlaylist(
      'https://open.spotify.com/playlist/37i9dQZF1DWXRqgorJj26U',
      embedServing('rock-classics-100.html'),
    );

    if (!sourceRead.ok) throw new Error(`expected ok, got ${sourceRead.error}`);
    expect(sourceRead.sourcePlaylist.name).toBe('Rock Classics');
    expect(sourceRead.sourcePlaylist.owner).toBe('Spotify');
    expect(sourceRead.sourcePlaylist.sourceTracks).toHaveLength(100);
    expect(sourceRead.sourcePlaylist.possiblyTruncated).toBe(true);
  });

  it('does not warn about truncation for fewer than 100 Source Tracks', async () => {
    const sourceRead = await readSourcePlaylist(
      EXAMPLE_SHARE_LINK,
      embedServing('sailing-into-yesterday.html'),
    );

    if (!sourceRead.ok) throw new Error(`expected ok, got ${sourceRead.error}`);
    expect(sourceRead.sourcePlaylist.possiblyTruncated).toBe(false);
  });

  it('reports playlist not found for the page Spotify serves for an unknown id', async () => {
    const sourceRead = await readSourcePlaylist(
      'https://open.spotify.com/playlist/0000000000000000000000',
      embedServing('playlist-not-found.html'),
    );

    expect(sourceRead).toEqual({ ok: false, error: 'playlist not found' });
  });

  it('reports playlist not found when the embed port finds no page', async () => {
    const embed: SpotifyEmbedPort = {
      fetchEmbedPage: async () => ({ found: false }),
    };

    const sourceRead = await readSourcePlaylist(EXAMPLE_SHARE_LINK, embed);

    expect(sourceRead).toEqual({ ok: false, error: 'playlist not found' });
  });

  it('reports source unreadable when the page has no __NEXT_DATA__', async () => {
    const sourceRead = await readSourcePlaylist(
      EXAMPLE_SHARE_LINK,
      embedServing('missing-next-data.html'),
    );

    expect(sourceRead).toEqual({ ok: false, error: 'source unreadable' });
  });

  it.each([
    [
      'broken JSON',
      '<script id="__NEXT_DATA__" type="application/json">{</script>',
    ],
    [
      'an unexpected shape',
      '<script id="__NEXT_DATA__" type="application/json">{"props":{}}</script>',
    ],
  ])('reports source unreadable for %s in __NEXT_DATA__', async (_, html) => {
    const embed: SpotifyEmbedPort = {
      fetchEmbedPage: async () => ({ found: true, html }),
    };

    const sourceRead = await readSourcePlaylist(EXAMPLE_SHARE_LINK, embed);

    expect(sourceRead).toEqual({ ok: false, error: 'source unreadable' });
  });

  it('reports source unreadable when the embed port fails', async () => {
    const embed: SpotifyEmbedPort = {
      fetchEmbedPage: async () => {
        throw new Error('network down');
      },
    };

    const sourceRead = await readSourcePlaylist(EXAMPLE_SHARE_LINK, embed);

    expect(sourceRead).toEqual({ ok: false, error: 'source unreadable' });
  });

  it.each([
    'https://open.spotify.com/playlist/4KN5k0MupIBcAX41GKLk51',
    'https://open.spotify.com/playlist/4KN5k0MupIBcAX41GKLk51?si=abc123&pt=x',
    'https://open.spotify.com/intl-de/playlist/4KN5k0MupIBcAX41GKLk51',
    'open.spotify.com/playlist/4KN5k0MupIBcAX41GKLk51',
    '  https://open.spotify.com/playlist/4KN5k0MupIBcAX41GKLk51/  ',
    'spotify:playlist:4KN5k0MupIBcAX41GKLk51',
  ])('accepts the Share Link %s', async (shareLink) => {
    const embed = embedServing('sailing-into-yesterday.html');

    const sourceRead = await readSourcePlaylist(shareLink, embed);

    expect(sourceRead.ok).toBe(true);
    expect(embed.requestedIds).toEqual(['4KN5k0MupIBcAX41GKLk51']);
  });

  it.each([
    '',
    'hello',
    'https://open.spotify.com/album/4KN5k0MupIBcAX41GKLk51',
    'https://open.spotify.com/track/4KN5k0MupIBcAX41GKLk51',
    'https://example.com/playlist/4KN5k0MupIBcAX41GKLk51',
    'https://open.spotify.com/playlist/not-an-id',
    'spotify:album:4KN5k0MupIBcAX41GKLk51',
  ])('rejects %j as not a playlist link', async (shareLink) => {
    const embed = embedServing('sailing-into-yesterday.html');

    const sourceRead = await readSourcePlaylist(shareLink, embed);

    expect(sourceRead).toEqual({ ok: false, error: 'not a playlist link' });
    expect(embed.requestedIds).toEqual([]);
  });
});
