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
A public Spotify playlist reachable by its Share Link, read without the person signing in to Spotify.
_Avoid_: Shared playlist, Spotify playlist, input playlist

**Destination Playlist**:
The new playlist a Transfer creates in the person's Apple Music library.
_Avoid_: Target playlist, Apple playlist, output

### Matching

**Source Track**:
One entry in the Source Playlist.
_Avoid_: Spotify track, song, item

**Match**:
The Apple Music catalog song chosen as the equivalent of a Source Track.
_Avoid_: Mapping, result, conversion

**Match Method**:
How a Match was found: **ISRC** (exact recording code) or **Search** (title, artist and duration). Search Matches are less certain.
_Avoid_: Match type, confidence source

**Review**:
The step where the person sees every Source Track next to its Match (or lack of one) before anything is saved to Apple Music. No Apple sign-in is needed until they choose to save.
_Avoid_: Preview, results page
