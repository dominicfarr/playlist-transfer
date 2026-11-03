# Contributing

These rules apply to humans and agents alike. Use the terms in [GLOSSARY.md](GLOSSARY.md), and read the decisions in [docs/adr/](docs/adr/) before changing anything they cover.

## Workflow

- **Trunk-based.** Commit small, working changes directly to `main`. No long-lived branches.
- **One-time setup:** follow [Development setup](README.md#development-setup) in the README. `npm run hooks:install` installs the `pre-commit` and `commit-msg` hooks. Keep shellcheck on your PATH: actionlint only checks workflow shell scripts when it is there, and CI always has it. Non-npm tools (gitleaks, actionlint, cfn-lint) are pinned in `.pre-commit-config.yaml`, and pre-commit downloads them on first use.
- **Every commit must pass the pre-commit hook.** If a hook fails or changes files, fix the problem, `git add -u`, and commit again. Never use `--no-verify`. CI runs the same checks and will fail anyway.
- **Only the pipeline deploys.** Don't deploy from a laptop.
- **The SonarQube Cloud quality gate is a separate signal from CI.** The Sonar workflow analyses every push to `main` and reports to its own badge, so a gate failure never shows as failing tests or blocks a deploy. Treat a red gate like a red build anyway: fix real issues, and record a reviewed false positive as a scoped ignore in `sonar-project.properties` with a comment explaining why. Pin every GitHub Action to a commit SHA, with the version as a comment (Sonar S7637).

## Commit messages

We follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

- **description**: imperative mood, lower case, no full stop, 72 characters or fewer for the whole first line. Examples: "add", "fix", "remove". Not "added" or "adds".
- **body**: optional. Explain _why_ the change was made, not what changed; the diff shows what. Wrap at 72 characters and leave a blank line after the first line.
- **footers**: `BREAKING CHANGE: <what breaks and how to migrate>`, `Refs: #<issue>`, `Co-Authored-By: <name> <email>`.
- **Breaking changes**: put `!` after the type or scope (`feat(review)!: ...`) _and_ add a `BREAKING CHANGE:` footer.
- **One logical change per commit.** If the description needs "and", split the commit.

### Types

| Type       | Use for                                                          |
| ---------- | ---------------------------------------------------------------- |
| `feat`     | A new capability the person using the app can see                |
| `fix`      | A bug fix the person using the app can see                       |
| `refactor` | A code change with no change in behaviour                        |
| `perf`     | A performance improvement                                        |
| `test`     | Adding or changing tests only                                    |
| `docs`     | Docs only: README, GLOSSARY, ADRs, this file                     |
| `build`    | Build tooling, dependencies, Vite and TypeScript config          |
| `ci`       | GitHub Actions workflows, the pre-commit config                  |
| `chore`    | Anything else that doesn't touch `src/` or tests                 |
| `revert`   | Reverting an earlier commit. The body should say `Reverts <sha>` |

### Scopes

The scope is optional but encouraged. Use a domain term from the glossary where one fits:

| Scope      | Covers                                                                 |
| ---------- | ---------------------------------------------------------------------- |
| `source`   | Reading the Source Playlist from the Spotify embed page                |
| `matching` | Searching the Storefront, Matches and Match Confidence                 |
| `review`   | The Review screen                                                      |
| `apple`    | MusicKit sign-in, the developer token, saving the Destination Playlist |
| `infra`    | CloudFormation, CloudFront, S3, Route 53                               |
| `deps`     | Dependency bumps (with `build`)                                        |
| `adr`      | Architecture decision records (with `docs`)                            |

The allowed types and scopes are enforced by commitlint (`commitlint.config.js`). Change both files together.

### Examples

```
feat(matching): mark matches Uncertain when durations differ by more than 3s
```

```
fix(source): handle artist names containing commas

The embed page joins artists into one string, so "Tyler, The Creator"
was split into two artists and never matched.
```

```
feat(apple)!: sign developer tokens in CI with 30-day expiry

BREAKING CHANGE: the APPLE_DEVELOPER_TOKEN build variable is gone;
CI now needs the APPLE_MUSICKIT_KEY, APPLE_KEY_ID and APPLE_TEAM_ID
secrets.
```

```
docs(adr): record CloudFront proxy for the Spotify embed page
```
