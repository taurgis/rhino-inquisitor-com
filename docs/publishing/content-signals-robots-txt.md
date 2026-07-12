# Content Signals in `robots.txt`

Declares this site's AI/search usage preferences in the production
`robots.txt` via the `Content-Signal` directive, per
[Content Signals](https://contentsignals.org/) (Cloudflare's proposed
mechanism, submitted to the IETF as
[draft-romm-aipref-contentsignals](https://datatracker.ietf.org/doc/draft-romm-aipref-contentsignals/),
which has since expired without further action — the mechanism itself is
unaffected and remains in active use via contentsignals.org).

## Change summary

- `src/layouts/robots.txt` gained a `Content-Signal` line inside the
  `User-agent: *` block:

  ```text
  User-agent: *
  Content-Signal: ai-train=no, search=yes, ai-input=no
  Allow: /
  Sitemap: {{ "sitemap.xml" | absURL }}
  ```

- This is a content (not header) directive, so unlike the agent-discovery
  `Link` header (`docs/publishing/agent-discovery-link-header.md`), it can be
  set directly in the Hugo-generated `robots.txt` — no Cloudflare-side
  Transform Rule is required for this change.

## Old vs new behavior

- **Old**: `robots.txt` only carried `Allow: /` and `Sitemap:` — no
  declared preference for AI training, search indexing, or AI input use of
  the site's content.
- **New**: crawlers that honor Content Signals see an explicit,
  per-category preference: search indexing allowed (`search=yes`), AI
  training disallowed (`ai-train=no`), and real-time AI input/RAG use
  disallowed (`ai-input=no`).

## Why these values

- `search=yes` — preserves existing SEO visibility; this site's
  `robots.txt` policy (`.agents/skills/seo/SKILL.md`) already treats
  `Allow: /` as the baseline and Content Signals must not silently
  contradict that.
  `ai-train=no` / `ai-input=no` — declines AI training and real-time AI
  input (RAG/grounding) use, per the site owner's stated preference.

## Impact and verification

- Impacted: `src/layouts/robots.txt` (Hugo template), and the crawl-control
  gates that parse `public/robots.txt` (`scripts/gates/check-robots-sitemap.js`,
  `scripts/seo/check-crawl-controls.js`) — both ignore unrecognized
  directives (they only special-case `user-agent`, `allow`/`disallow`, and
  `sitemap`), so `Content-Signal` passes through without changing gate
  results.
- Verify the template renders correctly:

  ```bash
  npm run build:local:fast
  cat public/robots.txt
  ```

  Expect the `Content-Signal` line directly under `User-agent: *`, before
  `Allow: /`.
- Run the existing robots/crawl-control gates to confirm no regression:

  ```bash
  npm run check:robots-sitemap
  npm run check:crawl-controls
  ```

- External validation, per the originating request, via
  [isitagentready.com](https://isitagentready.com):

  ```bash
  curl -sX POST https://isitagentready.com/api/scan \
    -H 'Content-Type: application/json' \
    -d '{"url":"https://rhino-inquisitor.com"}'
  ```

  Check that `checks.botAccessControl.contentSignals.status` is `"pass"`.

## Cloudflare AI Crawl Control (optional, out of repo)

This site is fronted by Cloudflare (see
`docs/publishing/agent-discovery-link-header.md`). Cloudflare's
[AI Crawl Control](https://developers.cloudflare.com/ai-crawl-control/)
dashboard can also manage Content Signals and per-bot crawl permissions at
the zone level. That configuration lives outside this repository (no
Hugo/GitHub Pages equivalent) and is not required for the `robots.txt`
directive above to take effect — it is a separate, complementary control
surface for teams that want per-bot enforcement in addition to the
declared preference.

## Related files

- `src/layouts/robots.txt` — source of the `Content-Signal` directive.
- `.agents/skills/seo/SKILL.md` (robots.txt Rules) — updated to document
  the directive alongside existing `Allow`/`Disallow`/`Sitemap` guidance.
- `scripts/gates/check-robots-sitemap.js`,
  `scripts/gates/seo-gate-helpers.js`,
  `scripts/seo/check-crawl-controls.js` — robots.txt parsers that a future
  change adding `Content-Signal` assertions would extend.
