const PLAYLIST_ID = '([A-Za-z0-9]{22})';
const SPOTIFY_URI = new RegExp(`^spotify:playlist:${PLAYLIST_ID}$`);
// An optional locale prefix such as /intl-de/ may come before /playlist/.
const PLAYLIST_PATH = new RegExp(
  `^(?:/intl-[A-Za-z-]+)?/playlist/${PLAYLIST_ID}/?$`,
);

/** Returns the playlist id a Share Link points to, or null if it isn't one. */
export function parseShareLink(shareLink: string): string | null {
  const text = shareLink.trim();
  const uri = SPOTIFY_URI.exec(text);
  if (uri) return uri[1] ?? null;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return null;
  }
  if (url.hostname !== 'open.spotify.com') return null;
  return PLAYLIST_PATH.exec(url.pathname)?.[1] ?? null;
}
