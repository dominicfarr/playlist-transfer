import { describe, expect, it } from 'vitest';
import { readSourcePlaylist, type SpotifyEmbedPort } from './index';

const EXAMPLE_SHARE_LINK =
  'https://open.spotify.com/playlist/4KN5k0MupIBcAX41GKLk51?si=abc123';

// Saved copies of real embed pages (tokens redacted), plus hand-edited variants.
const fixtures = import.meta.glob<string>('./fixtures/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function fixture(name: string): string {
  const html = fixtures[`./fixtures/${name}`];
  if (html === undefined) throw new Error(`no fixture ${name}`);
  return html;
}

/** A Spotify embed port that serves one saved embed page for any playlist id. */
function embedServing(fixtureName: string): SpotifyEmbedPort & {
  requestedIds: string[];
} {
  const requestedIds: string[] = [];
  return {
    requestedIds,
    async fetchEmbedPage(playlistId) {
      requestedIds.push(playlistId);
      return { found: true, html: fixture(fixtureName) };
    },
  };
}

describe('reading a Source Playlist from a Share Link', () => {
  it('reads the example playlist name, owner and Source Tracks in order', async () => {
    const result = await readSourcePlaylist(
      EXAMPLE_SHARE_LINK,
      embedServing('sailing-into-yesterday.html'),
    );

    if (!result.ok) throw new Error(`expected ok, got ${result.error}`);
    const playlist = result.sourcePlaylist;
    expect(playlist.name).toBe('Sailing into yesterday');
    expect(playlist.owner).toBe('julian.edgerton');
    expect(playlist.sourceTracks).toHaveLength(15);
    expect(playlist.sourceTracks[0]).toEqual({
      position: 1,
      title: 'Sailing into yesterday',
      artists: 'Ray Sterling',
      durationMs: 227799,
      untransferableReason: null,
    });
    expect(playlist.sourceTracks.map((t) => t.title).slice(-2)).toEqual([
      'Many Men - Jazz Version',
      'Cantaloop Island',
    ]);
  });
});
