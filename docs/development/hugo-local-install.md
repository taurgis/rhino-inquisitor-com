# Local Hugo Extended install

## Change summary

Local and agent-driven verification (for example `npm run build:prod` or
`npm run gates:local`) silently depended on Hugo Extended already being on
`PATH`. Fresh machines and remote agent sandboxes had no documented or
scripted way to install the pinned version, so build verification was
routinely skipped in those environments. A new script,
`scripts/install-hugo.sh`, installs the pinned Hugo Extended version using
the same version pin and cache layout as CI.

## Why this changed

Remote agent sessions repeatedly skipped local Hugo build verification
because Hugo was not installed and the GitHub release download is blocked
by the sandbox egress policy. The script encodes a working fallback so the
build gate can actually run before pushing.

## Behavior details

| Aspect | Old | New |
|--------|-----|-----|
| Hugo install | Manual, undocumented; version drift possible | `scripts/install-hugo.sh` reads `HUGO_VERSION` from `.github/workflows/deploy-pages.yml` so local always matches CI |
| Blocked-egress environments | No install path; verification skipped | Automatic fallback: `go install -tags extended` via the Go module proxy (`proxy.golang.org`), which sandbox policies typically allow |
| Binary location | Anywhere | `~/.cache/hugo/<version>/hugo` (same layout as the CI cache), symlinked into `/usr/local/bin` or `~/.local/bin` when writable |

Install strategies, tried in order:

1. **Prebuilt binary** from GitHub releases — fast path for normal machines.
2. **Source build** via `go install -tags extended github.com/gohugoio/hugo@v<version>` —
   used when the release download fails (for example a 403 from a policy
   proxy). Requires Go and a C/C++ toolchain (CGO) and takes several
   minutes. Module downloads go to `proxy.golang.org`, which is reachable
   even when `github.com` is not.

The script is idempotent: if the pinned version is already installed it
only re-verifies and re-links. Overriding the version
(`HUGO_VERSION=x.y.z scripts/install-hugo.sh`) is supported for deliberate
experiments only — the CI pin remains the source of truth.

## Impact

- **Maintainers / contributors**: one command to get the correct Hugo on a
  fresh machine.
- **Agent sessions (Claude Code and similar sandboxes)**: run
  `scripts/install-hugo.sh` before any task that needs `npm run build:prod`,
  `npm run dev`, or the build-dependent gates. `AGENTS.md` references this
  requirement.
- **CI**: unaffected — the deploy workflow keeps its own install step and
  cache; the script only mirrors its version pin and cache layout.

## Verification

1. Run `scripts/install-hugo.sh` on a machine without Hugo.
2. Confirm the output of `hugo version` reports the pinned version and
   `+extended` (the script exits non-zero otherwise).
3. Run `npm run build:prod` and confirm the Hugo build succeeds.

Verified 2026-07-06 in a remote agent sandbox where the GitHub release
download returns 403: the Go-module-proxy fallback built Hugo Extended
0.157.0, `hugo version` reported `v0.157.0+extended`, and the binary was
linked into `/usr/local/bin`.

## Related files

- `scripts/install-hugo.sh` — the install script.
- `.github/workflows/deploy-pages.yml` — source of the `HUGO_VERSION` pin
  and the CI cache layout the script mirrors.
- `AGENTS.md` — points agents at the script before build verification.
- `README.md` — Local Prerequisites section references the script.
