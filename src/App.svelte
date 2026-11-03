<script lang="ts">
  import { appName, appTagline } from './lib/app-info';
  import { spotifyEmbedFetch } from './lib/spotify-embed-fetch';
  import {
    readSourcePlaylist,
    transferableTracks,
    type ReadSourcePlaylistError,
    type ReadSourcePlaylistResult,
  } from './lib/transfer';

  const errorMessages: Record<ReadSourcePlaylistError, string> = {
    'not a playlist link':
      'That is not a Spotify playlist Share Link. It should look like https://open.spotify.com/playlist/…',
    'playlist not found':
      'Spotify has no playlist at that Share Link. Check the link, and that the playlist is public.',
    'source unreadable':
      'We could not read that playlist from Spotify. Please try again in a moment.',
  };

  let shareLink = $state('');
  let reading = $state(false);
  let result = $state<ReadSourcePlaylistResult | null>(null);

  async function read(event: SubmitEvent) {
    event.preventDefault();
    reading = true;
    try {
      result = await readSourcePlaylist(shareLink, spotifyEmbedFetch);
    } finally {
      reading = false;
    }
  }

  function formatDuration(durationMs: number): string {
    const totalSeconds = Math.round(durationMs / 1000);
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${Math.floor(totalSeconds / 60)}:${seconds}`;
  }
</script>

<main>
  <h1>{appName}</h1>
  <p>{appTagline}</p>

  <form onsubmit={read}>
    <label for="share-link">Spotify Share Link</label>
    <div class="row">
      <input
        id="share-link"
        type="text"
        inputmode="url"
        autocomplete="off"
        placeholder="https://open.spotify.com/playlist/…"
        bind:value={shareLink}
        aria-invalid={result !== null && !result.ok}
        aria-describedby={result !== null && !result.ok
          ? 'share-link-error'
          : undefined}
      />
      <button type="submit" disabled={reading || shareLink.trim() === ''}>
        {reading ? 'Reading…' : 'Read playlist'}
      </button>
    </div>
  </form>

  {#if result && !result.ok}
    <p id="share-link-error" class="error" role="alert">
      {errorMessages[result.error]}
    </p>
  {:else if result && result.ok}
    {@const sourcePlaylist = result.sourcePlaylist}
    {@const transferableCount = transferableTracks(sourcePlaylist).length}
    <section aria-labelledby="source-playlist-name">
      <h2 id="source-playlist-name">{sourcePlaylist.name}</h2>
      <p class="owner">by {sourcePlaylist.owner}</p>
      <p>
        {sourcePlaylist.sourceTracks.length} Source Tracks, {transferableCount}
        transferable
      </p>
      {#if sourcePlaylist.possiblyTruncated}
        <p class="warning" role="status">
          Spotify only shows the first 100 Source Tracks, so this playlist may
          have more that were not read.
        </p>
      {/if}

      <ol class="source-tracks">
        {#each sourcePlaylist.sourceTracks as sourceTrack (sourceTrack.position)}
          <li class:untransferable={sourceTrack.untransferableReason !== null}>
            <span class="title">{sourceTrack.title}</span>
            <span class="artists">{sourceTrack.artists}</span>
            <span class="duration"
              >{formatDuration(sourceTrack.durationMs)}</span
            >
            {#if sourceTrack.untransferableReason}
              <span class="reason"
                >Untransferable Track: {sourceTrack.untransferableReason}</span
              >
            {/if}
          </li>
        {/each}
      </ol>
    </section>
  {/if}
</main>

<style>
  main {
    max-width: 40rem;
    margin: 0 auto;
    padding: 3rem 1rem;
  }

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .row {
    display: flex;
    gap: 0.5rem;
  }

  input {
    flex: 1;
    min-width: 0;
    padding: 0.5rem;
    font: inherit;
  }

  button {
    padding: 0.5rem 1rem;
    font: inherit;
  }

  .error {
    color: var(--error);
  }

  .warning {
    padding: 0.5rem 0.75rem;
    border-left: 4px solid var(--warning);
  }

  .owner,
  .artists,
  .duration {
    color: var(--muted);
  }

  .source-tracks {
    padding-left: 2rem;
  }

  .source-tracks li {
    padding: 0.25rem 0;
  }

  .source-tracks li > span {
    margin-right: 0.5rem;
  }

  .title {
    font-weight: 600;
  }

  .untransferable .title {
    font-style: italic;
  }

  .reason {
    display: block;
    color: var(--warning);
  }
</style>
