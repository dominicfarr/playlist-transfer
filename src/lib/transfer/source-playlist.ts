import type { ReadSourcePlaylistError } from './read-source-playlist';

export type UntransferableReason =
  | 'not a song'
  | 'unavailable on Spotify'
  /** The embed page lists the item, but not in a shape we can read. */
  | 'unreadable from Spotify';

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
  /**
   * More about why it is an Untransferable Track, e.g. Spotify's
   * `playabilityReason` ("UNAVAILABLE") for one unavailable on Spotify.
   * Null when there is nothing more to say.
   */
  untransferableDetail: string | null;
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
  playabilityReason?: unknown;
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

function untransferableDetail(track: EmbedTrack): string | null {
  if (untransferableReason(track) !== 'unavailable on Spotify') return null;
  return typeof track.playabilityReason === 'string'
    ? track.playabilityReason
    : null;
}

interface EmbedEntity {
  name: string;
  subtitle: string;
  trackList: unknown[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

const EMBED_TRACK_FIELDS = {
  title: 'string',
  subtitle: 'string',
  duration: 'number',
  entityType: 'string',
  isPlayable: 'boolean',
} as const;

/** The fields of a track list item that are missing or of the wrong type. */
function badFields(item: Record<string, unknown>): string[] {
  return Object.entries(EMBED_TRACK_FIELDS)
    .filter(([field, type]) => typeof item[field] !== type)
    .map(([field]) => field);
}

function isEmbedTrack(
  item: Record<string, unknown>,
): item is Record<string, unknown> & EmbedTrack {
  return badFields(item).length === 0;
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

/** Turns one track list item into a Source Track, however odd the item. */
function sourceTrack(item: unknown, index: number): SourceTrack {
  const position = index + 1;
  if (!isRecord(item)) {
    return {
      position,
      title: '',
      artists: '',
      durationMs: 0,
      untransferableReason: 'unreadable from Spotify',
      untransferableDetail: 'not a track object',
    };
  }
  if (!isEmbedTrack(item)) {
    return {
      position,
      title: stringOr(item.title, ''),
      artists: plainSpaces(stringOr(item.subtitle, '')),
      durationMs: typeof item.duration === 'number' ? item.duration : 0,
      untransferableReason: 'unreadable from Spotify',
      untransferableDetail: `missing or invalid ${badFields(item).join(', ')}`,
    };
  }
  return {
    position,
    title: item.title,
    artists: plainSpaces(item.subtitle),
    durationMs: item.duration,
    untransferableReason: untransferableReason(item),
    untransferableDetail: untransferableDetail(item),
  };
}

function isEmbedEntity(value: unknown): value is EmbedEntity {
  return (
    isRecord(value) &&
    typeof value.name === 'string' &&
    typeof value.subtitle === 'string' &&
    Array.isArray(value.trackList)
  );
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/** The read errors an embed page itself can cause. */
export type EmbedPageProblem = Exclude<
  ReadSourcePlaylistError,
  'not a playlist link'
>;

/** Extracts the Source Playlist from an embed page's `__NEXT_DATA__`. */
export function parseEmbedPage(
  id: string,
  html: string,
): SourcePlaylist | EmbedPageProblem {
  const json = NEXT_DATA.exec(html)?.[1];
  if (json === undefined) return 'source unreadable';
  const nextData = parseJson(json);
  const pageProps =
    isRecord(nextData) && isRecord(nextData.props)
      ? nextData.props.pageProps
      : undefined;
  if (!isRecord(pageProps)) return 'source unreadable';
  // For an unknown id Spotify still answers 200, with a 404 status inside.
  if (pageProps.status === 404) return 'playlist not found';

  const state = pageProps.state;
  const data = isRecord(state) ? state.data : undefined;
  const entity = isRecord(data) ? data.entity : undefined;
  if (!isEmbedEntity(entity)) return 'source unreadable';
  return {
    id,
    name: entity.name,
    owner: entity.subtitle,
    sourceTracks: entity.trackList.map((item, index) =>
      sourceTrack(item, index),
    ),
    possiblyTruncated: entity.trackList.length === EMBED_PAGE_LIMIT,
  };
}
