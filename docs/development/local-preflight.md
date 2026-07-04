# Local pre-push preflight

## Change summary

PRs are disabled for this repository, so the first validation a commit ever
saw was the post-push deploy pipeline — which is how a broken hand-edit of a
generated file reached `main` and blocked deploys for two days (see
`docs/publishing/deploy-gate-matrix.md`, "perf gate failures on main"). A
fast local preflight now runs automatically before every `git push`.

Alongside it, `package.json` `engines.node` was raised from `>=20.18.1` to
`>=22.11.0` so local environments match CI, which runs Node 22 (`NODE_VERSION`
in `.github/workflows/deploy-pages.yml`).

## Old vs new behavior

| Aspect | Old | New |
|--------|-----|-----|
| Pre-push validation | None — first feedback came from the deploy pipeline ~10 minutes after push | `git push` runs `scripts/preflight.sh` via a committed pre-push hook |
| Hook installation | n/a | `npm install` / `npm ci` runs the `prepare` script, which sets `git config core.hooksPath .githooks` (guarded to no-op outside a git repo) |
| Node floor | `>=20.18.1` | `>=22.11.0` |

## What preflight runs

All fast, repo-local checks (~5–10 seconds total; no Hugo build required):

1. `npm run validate:frontmatter`
2. `npm run check:local-video-shortcodes`
3. `npm run test:url-parity`
4. `markdownlint-cli2` on Markdown files changed vs the merge-base with
   `origin/main` (skipped when `origin/main` is unavailable)

Build-dependent gates (URL parity against `public/`, SEO artifact checks,
critical-CSS sync, perf) intentionally stay in the deploy pipeline — the
pipeline also self-heals critical-CSS drift, so preflight does not need to.

## Usage

- Automatic: just `git push` — the hook runs preflight and blocks the push on
  failure.
- Manual: `npm run preflight`.
- Emergency bypass: `SKIP_PREFLIGHT=1 git push` (the deploy pipeline still
  gates the actual publish, so a bypassed push cannot deploy a broken site).

## Impact and verification

- Impacted components: developer push workflow only; no CI behavior changes.
  CI runners execute `prepare` harmlessly (hooks are never invoked there).
- Verify: run `npm install` once, then `git config core.hooksPath` must print
  `.githooks`; `npm run preflight` must end with `preflight OK`; a push with a
  front-matter error must be rejected by the hook.

## Related files

- `.githooks/pre-push`
- `scripts/preflight.sh`
- `package.json` (`preflight` + `prepare` scripts, `engines.node`)
- `README.md`, `AGENTS.md` (usage notes)
