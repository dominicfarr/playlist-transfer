# Playlist Transfer

[![CI](https://github.com/dominicfarr/playlist-transfer/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/dominicfarr/playlist-transfer/actions/workflows/ci.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=dominicfarr_playlist-transfer&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=dominicfarr_playlist-transfer)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=dominicfarr_playlist-transfer&metric=coverage)](https://sonarcloud.io/summary/new_code?id=dominicfarr_playlist-transfer)

Copy a public Spotify playlist into your Apple Music library. You only need to paste the playlist's share link. You don't need a Spotify account.

> **Status:** in progress at [playlist.domfarr.com](https://playlist.domfarr.com). Reading a Source Playlist from a share link works. Matching, Review and saving to Apple Music are not built yet.

Every push to `main` is checked by CI and analysed by [SonarQube Cloud](https://sonarcloud.io/summary/new_code?id=dominicfarr_playlist-transfer) for bugs, vulnerabilities, code smells, duplication and test coverage.

## How it works

1. Paste a Spotify playlist share link (`https://open.spotify.com/playlist/...`).
2. The app reads the playlist's tracks and searches Apple Music for each one. It matches on title, artist and duration.
3. In **Review**, each Spotify track is shown next to its Apple Music match. Uncertain matches are flagged, and you can untick tracks or pick a different candidate.
4. Sign in with your Apple ID (an Apple Music subscription is required) and save. A new playlist appears in your library.

Each run is a one-off copy and nothing is kept in sync. The app stores nothing: it is a static site, and your Apple Music sign-in stays in your browser.

## Limitations

- Only **public** Spotify playlists work, and only the **first 100 tracks** are read.
- Matching is a best guess, because Spotify's public pages don't expose ISRCs (the standard recording IDs). Expect the occasional wrong version, such as a live recording or a remaster.
- The track list is read from Spotify's public embed page, not the Spotify Web API, which no longer serves other people's playlists to apps like this one. This is against Spotify's terms of use, so the project is a personal tool and not a public service. See [ADR 0001](docs/adr/0001-read-spotify-embed-page-via-cloudfront.md).
- The Apple Music API can't edit or delete playlists, so a saved playlist can only be changed in the Music app.

## Stack

- Svelte 5, Vite and TypeScript, built as a static single-page app
- MusicKit JS v3 for Apple sign-in, catalog search and saving playlists
- AWS: S3 and CloudFront at `playlist.domfarr.com`. CloudFront also proxies Spotify's embed page so the browser can read it. DNS is in Route 53, and the infrastructure is a CloudFormation stack ([ADR 0002](docs/adr/0002-route53-dns-and-cloudformation-per-subdomain.md)).
- GitHub Actions for continuous delivery from `main`, signing in to AWS through OIDC

## Development setup

You need:

- Node 22+
- [uv](https://docs.astral.sh/uv/)
- pre-commit: `uv tool install pre-commit==4.7.0` (the version CI uses; bump both together)
- shellcheck: `brew install shellcheck`, or `uv tool install shellcheck-py`

Then:

```sh
npm ci
npm run hooks:install
npm run dev
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow and the commit message format.

## Live Source Playlist check

This check reads a real Source Playlist from live Spotify. It only runs when you start it:

- **In GitHub:** go to Actions → _Live Source Playlist check_ → _Run workflow_. You can give it a Share Link, or leave that blank to use the example playlist.
- **From the CLI:** `gh workflow run live-source-check.yml --ref main`
- **Locally:** `npm run check:live`. Set `LIVE_CHECK_SHARE_LINK` to check a different Share Link.

If it fails, Spotify has probably changed or blocked its embed page, and reading Source Playlists will break until the parser catches up. See [ADR 0001](docs/adr/0001-read-spotify-embed-page-via-cloudfront.md).

## Docs

| File                               | What it covers                                                                                                        |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| [PLAN.md](PLAN.md)                 | The full design: behaviour, stack, delivery and infrastructure                                                        |
| [GLOSSARY.md](GLOSSARY.md)         | Domain terms such as Source Playlist, Match, Match Confidence and Review. Use these words in code, commits and issues |
| [docs/adr/](docs/adr/)             | Architecture decisions and why they were made                                                                         |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Workflow, pre-commit hooks and the commit message format (Conventional Commits)                                       |
