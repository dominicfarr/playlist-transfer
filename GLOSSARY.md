# Playlist Transfer

Copies a public Spotify playlist into an Apple Music library playlist, for people who may not have a Spotify account.

## Language

### The transfer

**Transfer**:
A single, one-shot copy of a Source Playlist into a new Destination Playlist. Re-running creates another Destination Playlist; nothing is kept in sync.
_Avoid_: Conversion, sync, migration, import

**Share Link**:
The `open.spotify.com/playlist/...` URL a person pastes in to identify the Source Playlist.
_Avoid_: Spotify URL, playlist URL

**Source Playlist**:
A public Spotify playlist reachable by its Share Link, read from Spotify's public web page without anyone signing in to Spotify.
_Avoid_: Shared playlist, Spotify playlist, input playlist

**Destination Playlist**:
The new playlist a Transfer creates in the person's Apple Music library.
_Avoid_: Target playlist, Apple playlist, output

### Matching

**Source Track**:
One entry in the Source Playlist.
_Avoid_: Spotify track, song, item

**Storefront**:
The country-specific Apple Music catalog that Matches are found in. A song can exist in one Storefront and not in another.
_Avoid_: Region, country, market

**Match**:
The Apple Music catalog song chosen as the equivalent of a Source Track.
_Avoid_: Mapping, result, conversion

**Match Confidence**:
How sure we are that a Match is the same recording as its Source Track. It is **Confident** when the titles agree (ignoring noise like "Remastered"), the Match's artist appears among the Source Track's artists, the durations agree, and both carry the same Recording Qualifiers. Otherwise it is **Uncertain**.
_Avoid_: Score, match quality, accuracy

**Recording Qualifier**:
A word in a track title that marks a different recording of the same song: live, mix/remix, version, demo, acoustic, edit. Noise such as "remastered", "original album version", "mono" or "stereo" is not a Recording Qualifier.
_Avoid_: Suffix, tag, variant

**Untransferable Track**:
A Source Track that is not a playable song (e.g. a podcast episode or an unavailable track). It is shown with its reason and never matched.
_Avoid_: Skipped track, invalid track, unmatched track

**Unmatched Track**:
A transferable Source Track for which no Match was found.
_Avoid_: Missing track, failed track

**Review**:
The step where the person sees every Source Track next to its Match (or lack of one) before anything is saved to Apple Music. No Apple sign-in is needed until they choose to save.
_Avoid_: Preview, results page
