# Playlist Transfer

Web application that copies a public Spotify playlist into a new Apple Music library playlist. The person using it doesn't need a Spotify account.

Example Share Link: https://open.spotify.com/playlist/4KN5k0MupIBcAX41GKLk51

Terms are defined in [GLOSSARY.md](GLOSSARY.md). Key decisions are in [docs/adr/](docs/adr/).

## Audience

- **V1**: me.
- **V2**: close friends, given the link. Tested on iPhone Safari before sharing.
- **V3**: public. Probably never, because of Spotify's terms (ADR 0001).

There is no access gate of our own. Saving needs the person's own Apple sign-in and an active Apple Music subscription.

## What it does

1. The person pastes a **Share Link**.
2. The browser reads the **Source Playlist** from Spotify's public embed page, fetched through our CloudFront distribution (ADR 0001).
   - At most 100 tracks are returned. Exactly 100 is flagged as possibly truncated.
3. Each **Source Track** is searched in one Apple Music **Storefront** (hard-coded for V1) by title, artist and duration. There is no ISRC.
   - The search term uses the text before the first comma in the artist string. If that finds nothing, it retries with the full string.
   - Each **Match** gets a **Match Confidence**. It is Confident only when all of these agree; otherwise it is Uncertain:
     - the title, ignoring noise like "Remastered"
     - the artist: Apple's artist name appears inside Spotify's full artist string, which is never split on commas
     - the duration, within ±3s
     - the **Recording Qualifiers** (live, mix, demo, …), which must be the same on both sides
4. **Review**:
   - Every Source Track is shown next to its Match.
   - **Untransferable Tracks** are shown with their reason.
   - **Unmatched Tracks** are listed separately.
   - The person can untick any track, and pick from the other candidates for Uncertain or Unmatched ones.
   - The Destination Playlist name defaults to the source name and can be edited.
5. **Apple sign-in**: MusicKit JS v3 opens Apple's popup and gives the page a Music User Token, which stays in the browser.
6. **Save**:
   - Creates the **Destination Playlist** with a description crediting the Spotify playlist and its owner. No artwork.
   - Adds tracks in batches, one after another, keeping order and duplicates.
   - The API can't delete playlists, so a save that fails partway offers "Retry remaining".

It is a one-shot **Transfer**: re-running creates another playlist, and nothing stays in sync. Nothing is stored on our side.

## Stack

- Svelte 5 + Vite + TypeScript, built as a static single-page app.
- Hosted at `playlist.domfarr.com`: an S3 bucket behind CloudFront, with two origins:
  - the S3 bucket
  - `open.spotify.com`, for `/embed/playlist/*` only
- Apple developer token:
  - signed in CI
  - valid for about 30 days
  - restricted to `https://playlist.domfarr.com`
  - renewed by a scheduled redeploy

## Delivery

- **Spike first**, then throw it away: prove the CloudFront proxy, embed parsing and Apple search queries. Join the Apple Developer Program ($99 a year) only after the spike works.
- **V1 onward**, following minimumcd.org:
  - Work directly on `main` (trunk-based).
  - GitHub Actions runs on every push, and the checks gate the deploy.
  - Only the pipeline deploys, one immutable artifact per release.
  - Public repo: `dominicfarr/playlist-transfer`.
- **Pre-commit hook** (pre-commit framework; npm tools run as local hooks with versions from `package-lock.json`, and the non-npm tools gitleaks, actionlint and cfn-lint are pinned by `rev` in `.pre-commit-config.yaml`):
  - ESLint `--fix`
  - Prettier
  - `svelte-check`
  - `cfn-lint`
  - `actionlint`
  - `gitleaks`
  - `vitest related --run`
  - `commitlint` at the `commit-msg` stage, enforcing the [CONTRIBUTING.md](CONTRIBUTING.md) types and scopes

  Any failure or modified file stops the commit. CI runs `pre-commit run --all-files` first, and also lints the commit messages of each push.

- **Tests**:
  - Unit tests: embed parsing (against a saved copy of the real page), query building, Match Confidence.
  - A daily scheduled job checks the live embed page still parses.
  - The Apple flow is tested by hand for V1.

## Infrastructure (ADR 0002)

- `domfarr.com` DNS moves to one Route 53 hosted zone, created once by CLI from the cleaned GoDaddy export. GoDaddy stays the registrar.
  - Existing CNAMEs are copied unchanged.
  - `_domainconnect` is dropped.
  - DNSSEC is off.
  - Zone `Z03722621B6AEUR5NOSKX` was created 2026-11-03, and all 11 record sets were verified identical to GoDaddy. Nameservers were switched at GoDaddy the same day, and the `.com` registry plus Cloudflare, Google and Quad9 resolvers all point to Route 53. **Migration done.** Nameservers: `ns-562.awsdns-06.net`, `ns-241.awsdns-30.com`, `ns-1129.awsdns-13.org`, `ns-1887.awsdns-43.co.uk`.
- `playlist.domfarr.com` is one CloudFormation stack, deployed by GitHub Actions through OIDC:
  - S3 bucket
  - ACM certificate, DNS-validated against the zone
  - CloudFront distribution
  - Route 53 records

  This is the pattern for future subdomain apps.

- `.gitignore` keeps secrets (`*.p8`, `*.pem`, `.env*`) and DNS working files (`domfarr.com.txt`, `route53-*.json`) out of the public repo.
