const PLAYLIST_PATH = /^\/playlist\/([A-Za-z0-9]{22})\/?$/;

/** Returns the playlist id a Share Link points to, or null if it isn't one. */
export function parseShareLink(shareLink: string): string | null {
  let url: URL;
  try {
    url = new URL(shareLink.trim());
  } catch {
    return null;
  }
  if (url.hostname !== 'open.spotify.com') return null;
  return PLAYLIST_PATH.exec(url.pathname)?.[1] ?? null;
}
