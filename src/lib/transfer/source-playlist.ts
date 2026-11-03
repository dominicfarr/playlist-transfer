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
  /**
   * The embed page returns at most 100 items and no total count, so exactly
   * 100 Source Tracks may mean the Source Playlist was cut short.
   */
  possiblyTruncated: boolean;
}

const EMBED_PAGE_LIMIT = 100;

const NEXT_DATA =
  /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/;

/** The Source Tracks that are not Untransferable Tracks. */
export function transferableTracks(
  sourcePlaylist: SourcePlaylist,
): SourceTrack[] {
  return sourcePlaylist.sourceTracks.filter(
    (track) => track.untransferableReason === null,
  );
}

interface EmbedTrack {
  title: string;
  subtitle: string;
  duration: number;
  entityType: string;
  isPlayable: boolean;
}

const NO_BREAK_SPACE = String.fromCharCode(0xa0);

/** The embed page uses no-break spaces in artist strings; matching wants plain ones. */
function plainSpaces(text: string): string {
  return text.replaceAll(NO_BREAK_SPACE, ' ');
}

function untransferableReason(track: EmbedTrack): UntransferableReason | null {
  if (track.entityType !== 'track') return 'not a song';
  if (!track.isPlayable) return 'unavailable on Spotify';
  return null;
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
      artists: plainSpaces(track.subtitle),
      durationMs: track.duration,
      untransferableReason: untransferableReason(track),
    })),
    possiblyTruncated: entity.trackList.length === EMBED_PAGE_LIMIT,
  };
}
