# robots.txt: named crawler entries considered and rejected

**Date:** 2026-07-14
**Trigger:** A third-party AI fetcher (ChatGPT) reported a `400` error retrieving
this site's Markdown companion (`.../index.md`). Direct verification (`curl`,
varied user-agents, `HEAD`/`GET`, cookie/redirect checks) found the site's own
behavior fully correct — clean `200`s, correct `Content-Type`, no WAF/UA-based
divergence, no redirect loop. That investigation prompted a broader "audit
`robots.txt` for SEO and GEO" pass, which is what this note records.

## What was tried, and why it was reverted

An earlier pass added nine explicit `User-agent: <bot> / Allow: /` blocks
(OpenAI's `OAI-SearchBot`/`GPTBot`/`ChatGPT-User`, Anthropic's
`ClaudeBot`/`Claude-User`/`Claude-SearchBot`, Google's `Google-Extended`,
Perplexity's `PerplexityBot`/`Perplexity-User`) below the existing wildcard
block, on the theory that naming the answer-engine crawlers this site's
Markdown/`llms.txt` companions target would make coverage more auditable.

A follow-up SEO/GEO audit concluded this should **not** be committed, and it
was reverted (`git checkout -- src/layouts/robots.txt`) before ever reaching a
commit:

- **Zero functional effect.** `User-agent: * / Allow: /` already grants every
  one of those nine bots full access. No vendor documentation (OpenAI,
  Anthropic, Google, Perplexity — all checked directly) suggests explicit
  per-bot `Allow` blocks improve crawl priority, training inclusion, or
  citation frequency over the default-permissive wildcard.
- **Maintenance/staleness risk.** Vendors add, rename, and deprecate crawler
  tokens (OpenAI alone also ships `OAI-AdsBot`, not in the list that was
  added). A hand-maintained allowlist drifts out of date for a file whose
  only reason to include it was "redundant with the wildcard" in the first
  place.
- **False-allowlist signal.** A named block with `Allow: /` reads to a human
  or automated reviewer as "we deliberately vetted and permitted this
  specific crawler," implying an *unlisted* bot isn't welcome — which is
  false here, since the wildcard already allows everyone. That's a real
  governance risk: a future reviewer could use an incomplete named list to
  justify blocking an unlisted AI crawler under a mistaken assumption of
  intent.
- **Didn't address the actual trigger.** The original ChatGPT `400` report
  was proven, by direct testing, to be unrelated to `robots.txt` or any
  server-side behavior at all. Adding named blocks doesn't fix a defect that
  doesn't exist in this file.

## What the audit confirmed is already correct (no changes made)

- **`Content-Signal: ai-train=yes, search=yes, ai-input=yes`** — this is
  Cloudflare's [Content Signals Policy](https://contentsignals.org/)
  (announced Sept 2025, CC0), a *different, incompatible* mechanism from the
  IETF AIPREF draft's `Content-Usage:` field
  ([draft-ietf-aipref-attach](https://datatracker.ietf.org/doc/draft-ietf-aipref-attach/)).
  The line matches Cloudflare's own generator syntax exactly, and the
  all-`yes` values correctly express this site's intent (it actively wants AI
  training/citation, per its Markdown-companion and `llms.txt` investment).
  Caveat found during research: no crawler is currently known to act on this
  header — Google's John Mueller has stated on the record it has "no effects
  whatsoever for any crawler or LLM." Kept anyway since it's a costless,
  forward-looking declaration of intent, not a technical control.
- **Sitemap directive** — exactly one `Sitemap:` line, absolute HTTPS apex
  URL, matches `hugo.toml`'s `baseURL`.
- **Draft/staging/pagination handling** — correctly done outside
  `robots.txt` entirely: `buildDrafts = false` means draft content never
  reaches `public/`; staging uses `noindex, nofollow` meta
  (`partials/seo/resolve.html`, keyed on `hugo.Environment != "production"`),
  not a `robots.txt Disallow`; paginated pages self-canonicalize rather than
  being disallowed. This matches Google's own guidance that combining
  `Disallow` with `noindex` backfires — a disallowed URL is never crawled, so
  Googlebot never sees the `noindex` tag and the URL can still surface with
  no snippet. No `Disallow` lines were added.
- **Live vs. repo drift** — none; production `robots.txt` matched the
  last-committed state exactly throughout this investigation.

## Not done, and why

- **Adding CCBot, Applebot-Extended, Meta-ExternalAgent** — these were
  identified as arguably higher-leverage than several of the nine reverted
  entries (CCBot in particular, since many labs train on Common
  Crawl-derived corpora rather than crawling directly), but only matter if
  the named-bot pattern itself is adopted. Since it wasn't, these weren't
  added either — the wildcard already covers all three.
- **Explicit Bingbot/Copilot, Yandex entries** — no distinct AI-training
  token exists for either beyond their standard search crawler, already
  covered by the wildcard.

## Related files

- `src/layouts/robots.txt` — unchanged from its pre-audit committed state.
