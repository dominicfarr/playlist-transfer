#!/usr/bin/env bash
# Post-deploy smoke check for the live site (ticket #4 acceptance criteria).
# Usage: infra/smoke.sh [https://playlist.domfarr.com]
# Retries each check for a while: a first deploy waits on DNS and edge rollout.
set -euo pipefail

SITE="${1:-https://playlist.domfarr.com}"
BUCKET_URL="https://s3.us-east-1.amazonaws.com/playlist.domfarr.com/index.html"
PLAYLIST="4KN5k0MupIBcAX41GKLk51"
# Spotify gets the viewer's User-Agent forwarded; look like a browser.
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
ATTEMPTS="${SMOKE_ATTEMPTS:-30}"
DELAY="${SMOKE_DELAY:-20}"

body="$(mktemp)"
trap 'rm -f "$body"' EXIT
failures=0

# check <name> <url> <expected status> [<text the body must contain>]
check() {
  local name="$1" url="$2" want="$3" text="${4:-}" got=""
  for ((i = 1; i <= ATTEMPTS; i++)); do
    got="$(curl -sS -o "$body" -w '%{http_code}' -A "$UA" "$url" || true)"
    if [[ "$got" == "$want" ]] && { [[ -z "$text" ]] || grep -qF "$text" "$body"; }; then
      echo "ok   $name ($got)"
      return 0
    fi
    sleep "$DELAY"
  done
  echo "FAIL $name: wanted $want${text:+ containing '$text'}, last got $got"
  failures=$((failures + 1))
}

check "site serves the app over HTTPS" "$SITE/" 200 '<div id="app">'
check "embed path proxies Spotify" "$SITE/embed/playlist/$PLAYLIST" 200 '__NEXT_DATA__'
check "other Spotify paths are 404" "$SITE/embed/track/4uLU6hMCjMI75M1A2tKUQC" 404
check "unknown app routes get the SPA index" "$SITE/no/such/route" 200 '<div id="app">'
check "bucket is not publicly readable" "$BUCKET_URL" 403

exit "$failures"
