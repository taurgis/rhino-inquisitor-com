# Security Audit — Hugo Setup (July 2026)

Full-stack security review of the rhino-inquisitor.com Hugo setup: templates,
client-side JavaScript, Hugo configuration, the GitHub Actions deploy
pipeline, npm dependencies, repository secrets hygiene, and the live site's
HTTP response headers. Findings are mapped to the OWASP Top 10 where a
category applies to a static site.

**Verdict: no exploitable security holes found.** The setup is hardened well
beyond a typical Hugo blog. Four improvement items were identified, none of
which is an active vulnerability (details in "Findings").

## Scope and method

- `hugo.toml`, all templates and partials under `src/layouts/`, all
  first-party scripts under `src/static/scripts/`
- `.github/workflows/deploy-pages.yml`, `.github/actions/setup-node-env/`,
  `.githooks/`
- `package.json` / `package-lock.json` via `npm audit`
- Repo-wide secret-pattern scan (GitHub PATs, Google API keys, AWS keys,
  private key blocks)
- Live header inspection of `https://rhino-inquisitor.com/`,
  `https://www.rhino-inquisitor.com/`, and `http://rhino-inquisitor.com/`

## What is already solid (verified, not assumed)

| Area | Verified state |
| ---- | -------------- |
| Markdown rendering | No `[markup]` override in `hugo.toml`, so Goldmark's default `unsafe = false` holds — raw HTML in content markdown is not rendered (blocks content-borne XSS). |
| JSON-LD | Every structured-data block (`src/layouts/partials/seo/json-ld-*.html`, `src/layouts/shortcodes/local-video.html`) pipes through `jsonify \| safeJS` per the coding standard. |
| Client-side search | `src/static/scripts/archive-search.js` escapes **every** interpolated value (query, titles, URLs, labels) through `escapeHtml()` before the single `innerHTML` sink — no DOM XSS. `code-copy.js` only injects static SVG constants. |
| Third-party code | Zero third-party scripts, analytics, or CDN assets. All JS is first-party from `/scripts/`. Site CSS is loaded with SRI (`integrity` + `crossorigin="anonymous"`). |
| External links / embeds | All `target="_blank"` anchors carry `rel="noopener noreferrer"`. YouTube embeds use `youtube-nocookie.com` with `referrerpolicy="strict-origin-when-cross-origin"` (lite-youtube facade). |
| Workflow permissions | Top-level `permissions: contents: read`; only the deploy job elevates to `pages: write` + `id-token: write` with `environment: github-pages` OIDC scoping. No secrets referenced anywhere. |
| Workflow injection surface | Triggers are `push` to `main` and `workflow_dispatch` only — no `pull_request_target`, no fork input. The only `${{ }}` values interpolated into shell are GitHub-controlled SHAs/event names and internally generated matrix values. |
| Dependency install | `npm ci` against the committed lockfile — no floating installs in CI. |
| Existing CI security gates | The `security` gate group runs `check:https-security` (DNS/TLS/redirect/header checks), `check:mixed-content`, `check:host-protocol`, and `check:redirect-security` — the latter scans built output for GitHub/Google/AWS token patterns. |
| Transport | Live: HSTS `max-age=31536000; includeSubDomains; preload`, `http://` → 301 → `https://`, `www` → 301 → apex, `x-content-type-options: nosniff`. |
| Secrets hygiene | No credentials, tokens, or private keys in tracked files; the only regex-style matches are the secret-detection patterns inside `scripts/gates/check-redirect-security.js` itself. |
| Disclosure process | `SECURITY.md` present with private vulnerability reporting instructions. |

## OWASP Top 10 mapping

Most categories (injection, broken auth, SSRF, insecure deserialization…)
require server-side code and do not apply to a static site. The applicable
ones:

- **A03 Injection / XSS** — mitigated (Goldmark safe mode, `jsonify` for
  JSON-LD, escaped search rendering, no `unsafe` template pipes on
  reader-controllable data).
- **A02 Cryptographic failures / transport** — mitigated (HSTS + preload,
  forced HTTPS, mixed-content CI gate).
- **A05 Security misconfiguration** — mostly mitigated; missing response
  headers noted as Finding 3.
- **A06 Vulnerable & outdated components** — Finding 1 and 2.
- **A08 Software & data integrity failures** — CSS SRI in place; Hugo binary
  checksum noted as Finding 4; lockfile-pinned npm installs.

## Findings

### 1. Vulnerable pinned `undici` in production dependencies (moderate)

`package.json` pins `undici` at `7.22.0`, which carries four advisories
(3 high, 1 moderate): WebSocket DoS (GHSA-vxpw-j846-p89q), HTTP response
queue poisoning (GHSA-35p6-xmwp-9g52), Set-Cookie SameSite downgrade
(GHSA-g8m3-5g58-fq7m), and shared-cache information disclosure
(GHSA-pr7r-676h-xcf6). The dev tree adds ~39 more advisories, mostly in the
Lighthouse/pa11y toolchains (`ws`, `uuid`).

**Real-world impact is limited**: these packages run only at build/gate time
in CI and are never shipped to the site. The most relevant exposure is the
link checker fetching arbitrary external URLs from article content through a
vulnerable HTTP client. Still, they should not linger.

**Fix**: bump `undici` to `7.28.0` (semver-compatible), run
`npm audit fix` for the dev-tree items, and re-run the gate suite.

### 2. No automated dependency updates (moderate, process)

There is no `.github/dependabot.yml` (or Renovate config), so advisories like
Finding 1 accumulate silently between manual audits.

**Fix**: add Dependabot for the `npm` and `github-actions` ecosystems
(weekly is plenty for this repo), and confirm GitHub's Dependabot alerts +
secret scanning are enabled in repository settings.

### 3. Missing hardening response headers (low)

The live site sends HSTS and `nosniff` but no `Content-Security-Policy`,
`Referrer-Policy`, `Permissions-Policy`, or `X-Frame-Options` /
`frame-ancestors`. GitHub Pages cannot set custom headers, **but the site is
fronted by Cloudflare** (confirmed via live response headers), so headers can
be added with a Cloudflare Transform Rule / Snippet at no cost.

Because the site has zero third-party scripts, an unusually tight CSP is
feasible, e.g.:

```text
Content-Security-Policy: default-src 'self'; script-src 'self';
  style-src 'self' 'unsafe-inline'; img-src 'self' https://i.ytimg.com data:;
  frame-src https://www.youtube-nocookie.com; object-src 'none';
  base-uri 'self'; frame-ancestors 'self'; form-action 'self';
  upgrade-insecure-requests
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Notes: `style-src 'unsafe-inline'` is required by the inlined critical CSS
(`partials/site/stylesheet.html`); the JSON-LD/speculation-rules `<script>`
blocks are data blocks and are not blocked by `script-src`. Validate against
a preview before enforcing — start with `Content-Security-Policy-Report-Only`.

### 4. Hugo binary downloaded without checksum verification (low, supply chain)

`deploy-pages.yml` pins `HUGO_VERSION: 0.157.0` (good) but downloads the
release tarball from GitHub without verifying it, and the extracted binary is
cached and reused across runs.

**Fix**: fetch `checksums.txt` from the same release and verify before
extraction:

```bash
curl -fsSL -o "$RUNNER_TEMP/checksums.txt" \
  "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_${HUGO_VERSION}_checksums.txt"
(cd "$RUNNER_TEMP" && grep "hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz\$" checksums.txt | sha256sum -c -)
```

Optional further hardening in the same spirit: pin third-party-adjacent
actions to commit SHAs instead of major tags. All actions in use are
official `actions/*`, which the repo's CI standard explicitly allows at
verified version tags, so this is discretionary.

## Non-findings (checked, no action needed)

- `access-control-allow-origin: *` on responses — harmless for fully public
  static content; nothing sensitive is served.
- Git hook bypass variables (`SKIP_SPELLING`, `SKIP_PREFLIGHT`) — local
  convenience only; CI gates still block on push to `main`.
- `alias.html` meta-refresh redirects — target is Hugo's `.Permalink`
  (build-time, site-controlled), not reflected input; no open-redirect risk.
- `report-to` / `nel` headers — standard Cloudflare network error logging.

## Verification

- Re-run the audit baseline: `npm audit --omit=dev` (expect 0 after
  Finding 1 is fixed) and `npm run gates:local -- --group security` against a
  production build.
- Header changes (Finding 3) verify with
  `curl -sI https://rhino-inquisitor.com/` and the existing
  `check:https-security` gate.

## Related files

- `.github/workflows/deploy-pages.yml` — Findings 2, 4
- `package.json`, `package-lock.json` — Finding 1
- Cloudflare zone configuration (outside this repo) — Finding 3
- `scripts/gates/check-https-security.js`,
  `scripts/gates/check-redirect-security.js`,
  `scripts/gates/mixed-content-helpers.js` — existing gate coverage referenced
  throughout
