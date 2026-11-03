export type UntransferableReason = 'not a song' | 'unavailable on Spotify';

/** One entry in the Source Playlist. */
export interface SourceTrack {
  /** 1-based position in the Source Playlist. */
  position: number;
  title: string;
  /** The artist string as Spotify shows it, e.g. "Chris Botti, Mark Knopfler". */
  artists: string;
  durationMs: number;
  /** Why this is an Untransferable Track, or null if it can be transferred. */
  untransferableReason: UntransferableReason | null;
}

export interface SourcePlaylist {
  id: string;
  name: string;
  owner: string;
  sourceTracks: SourceTrack[];
}

const NEXT_DATA =
  /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/;

interface EmbedTrack {
  title: string;
  subtitle: string;
  duration: number;
}

interface EmbedEntity {
  name: string;
  subtitle: string;
  trackList: EmbedTrack[];
}

/** Extracts the Source Playlist from an embed page's `__NEXT_DATA__`. */
export function parseEmbedPage(id: string, html: string): SourcePlaylist {
  const json = NEXT_DATA.exec(html)?.[1];
  if (json === undefined) throw new Error('no __NEXT_DATA__');
  const entity = JSON.parse(json).props.pageProps.state.data
    .entity as EmbedEntity;
  return {
    id,
    name: entity.name,
    owner: entity.subtitle,
    sourceTracks: entity.trackList.map((track, index) => ({
      position: index + 1,
      title: track.title,
      artists: track.subtitle,
      durationMs: track.duration,
      untransferableReason: null,
    })),
  };
}
