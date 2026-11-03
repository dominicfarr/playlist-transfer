# Domain Docs

How the engineering skills should use this repo's domain documentation when exploring the codebase. This is a **single-context** repo.

## Before exploring, read these

- **`GLOSSARY.md`** at the repo root.
- **`docs/adr/`**: read the ADRs that touch the area you're about to work in.

If any of these files don't exist, **carry on without comment**. Don't flag that they're missing, and don't suggest creating them up front. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them when terms or decisions actually get settled.

## File structure

```
/
├── GLOSSARY.md
├── docs/adr/
│   ├── 0001-read-spotify-embed-page-via-cloudfront.md
│   └── 0002-route53-dns-and-cloudformation-per-subdomain.md
└── src/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal. Either you're inventing language the project doesn't use (reconsider), or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, say so explicitly rather than silently overriding it:

> _Contradicts ADR-0001 (read Spotify embed page via CloudFront), but worth reopening because…_
