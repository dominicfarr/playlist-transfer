---
status: accepted
---

# Read Source Playlists from Spotify's public embed page, proxied through CloudFront

Since February/March 2026, Spotify's Web API returns no tracks for playlists the caller doesn't own or collaborate on in Development Mode. Extended Quota is only available to registered businesses with 250k+ monthly active users. So the official API can't serve the core need: copying someone else's public playlist, for a person who may not have a Spotify account. We therefore read the track list from the server-rendered JSON (`__NEXT_DATA__`) on `open.spotify.com/embed/playlist/<id>`. That page has no CORS headers, so `open.spotify.com` is added as a second origin on our own CloudFront distribution, with a single behaviour matching `/embed/playlist/*`. The browser fetches it from our own domain and parses it itself, and no code runs on AWS.

## Considered Options

- **Spotify OAuth sign-in**: within Spotify's rules, but limited to the person's own playlists and 5 allowlisted users, and it requires a Spotify account. Rejected.
- **Pasted track links, resolved via the API**: still limited to Development Mode, and it needs the Spotify app. Rejected.
- **Pasted "Artist – Title" text**: no Spotify dependency, but more work for the person. Kept in mind as a fallback if the embed page stops working.
- **A Lambda function that fetches and parses**: the planned next step if Spotify rejects CloudFront's requests or parsing outgrows the browser.

## Consequences

- Verified 2026-11-03 with a temporary distribution: through CloudFront (with the browser User-Agent forwarded and caching disabled), the embed page returned 200 with full `__NEXT_DATA__` in about 0.3–0.7s. Other paths, including `/embed/track/*`, returned 404, so the distribution is not a general Spotify proxy.

- This is against Spotify's terms, which prohibit scraping. We accept that for a personal / close-friends tool (V1/V2). It is a real blocker for any public V3.
- No ISRC is available, so every Match comes from search and has a Match Confidence.
- The embed page returns at most 100 tracks and gives no total count, so exactly 100 Source Tracks is treated as possibly truncated.
- The page structure can change without notice. A scheduled CI job fetches the live page and fails when parsing breaks.
