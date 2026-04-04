# LLM Discovery and GEO Support Update

## Change summary

Added Hugo-generated `llms.txt` and `llms-full.txt` outputs at the site root, Markdown companion outputs for indexable regular pages, a post-build normalization step that rewrites those companions from rendered HTML into cleaner Markdown, an artifact-backed Markdown companion quality report, explicit production-only AI crawler directives in `robots.txt`, and an explicit discovery-friendly snippet policy for indexable HTML pages. Updated the shared SEO head partial so the homepage advertises the new LLM discovery files and eligible regular pages advertise their Markdown companion output.

## Why this changed

The repository already exposed canonical HTML, RSS, sitemap, and a JSON search index, but it did not publish a dedicated LLM-oriented discovery surface or machine-friendly article endpoints. It also treated all crawlers the same in `robots.txt`, which made it impossible to keep official AI search visibility while blocking officially documented training-oriented controls. This change adds the emerging `llms.txt` convention, cleaner Markdown alternates, and a vendor-specific training-bot policy without changing canonical HTML behavior or over-claiming search engine requirements.

## Behavior details

### Old behavior

- Canonical HTML pages were available through normal Hugo routes.
- Root machine-readable discovery was limited to `sitemap.xml`, `robots.txt`, RSS, and `index.json`.
- No dedicated `llms.txt` file or per-page Markdown companion routes were published.
- `robots.txt` used only a wildcard crawler group, so AI vendor training controls could not be expressed separately.
- Markdown companion files were emitted directly from Hugo templates and could leak raw shortcode syntax on shortcode-heavy pages.

### New behavior

- `/llms.txt` now lists the site's key discovery routes plus Markdown companion links for indexable posts and regular pages.
- `/llms-full.txt` now provides a combined Markdown corpus rebuilt from cleaned Markdown companion output after each build.
- Regular pages continue to emit a Markdown companion output at their alternate output path, typically `/path/index.md`, but the build pipeline now rewrites those files from rendered article HTML so shortcode-heavy pages no longer leak raw Hugo shortcode syntax.
- Content-backed 404 routes remain HTML-only so the authoritative `404.html` error document is preserved and noindex behavior is unchanged.
- Homepage HTML now advertises the `llms.txt` and `llms-full.txt` alternates, and eligible regular pages advertise their Markdown alternate with `rel="alternate"`.
- Canonical tags, sitemap entries, and robots behavior remain anchored to the HTML routes.
- Production `robots.txt` now blocks `Google-Extended`, `GPTBot`, and `ClaudeBot`, while explicitly allowing `PerplexityBot`, `Bingbot`, `OAI-SearchBot`, `Claude-SearchBot`, and `Claude-User` under the same system-route disallows used by the wildcard group. Preview and staging builds still block the whole site.
- `npm run check:llm-artifacts` now writes `validation/llm-artifact-quality-report.json`, which records per-file quality findings plus deterministic complexity samples for the cleaned Markdown companions.
- Indexable production HTML pages now emit an explicit discovery-friendly snippet policy through `meta[name="robots"]`: `index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1`. Restrictive controls such as `nosnippet`, `noarchive`, and `nocache` remain available as per-page overrides instead of global defaults.
- Taxonomy descriptions are now resolved more specifically for category archives and category term pages to reduce duplicate-description warning debt, and the previously duplicated release-note and idea-page descriptions were rewritten to be route-specific.

## Impact

- Large language model crawlers and retrieval systems can discover canonical site structure through `llms.txt` and fetch article text from cleaner Markdown companion outputs.
- GEO support remains grounded in standard crawlability, canonical consistency, and structured data rather than assuming special AI-only ranking switches.
- Existing HTML-first SEO behavior stays intact because the new outputs are additive and are not promoted as canonical replacements.
- Site owners now have an explicit named-bot policy for officially documented Google, Perplexity, Microsoft/Bing, OpenAI, and Anthropic controls instead of relying on one wildcard rule for every bot.
- User-triggered fetchers remain outside full robots-based enforcement, so the published policy is advisory to compliant bots rather than a hard access-control layer.
- CI now stores a durable Markdown companion quality report artifact, which makes GEO-oriented content quality checks reviewable without making them a separate manual audit.
- The LLM artifact quality report now counts headings, blockquotes, and list items correctly across multiline Markdown bodies, so its structure metrics are useful for trend monitoring rather than just presence checks.

## Verification

- Run `npm run build:prod` and confirm the build completes successfully.
- Confirm root outputs exist: `public/llms.txt` and `public/llms-full.txt`.
- Confirm at least one regular page emits `index.md` beside its HTML output and that the file does not contain raw Hugo shortcode delimiters such as `{{<` or `{{%`.
- Run `npm run check:sitemap`, `npm run check:crawl-controls`, `npm run check:llm-artifacts`, and `npm run check:seo:artifact` to confirm canonical crawl surfaces still pass existing checks, the named AI bot policy is present, and the Markdown quality report is generated.
- Spot check a rendered page head to confirm the Markdown `rel="alternate"` link is present.
- Inspect `public/robots.txt` to confirm targeted disallow rules exist only for the intended AI training controls while `PerplexityBot`, `Bingbot`, and the existing search-oriented named groups remain crawlable in production.
- Confirm `validation/llm-artifact-quality-report.json` is uploaded by both PR and deploy workflows.
- Spot check an indexable HTML route to confirm `meta[name="robots"]` includes `max-snippet:-1`, `max-image-preview:large`, and `max-video-preview:-1`, while `404` and other noindex routes remain `noindex, nofollow` only.
- Run `npm run check:metadata` and confirm the duplicate-description warnings are cleared for the previously duplicated category, release-note, and idea-page routes.

## Related files

- `hugo.toml`
- `src/layouts/home.llms.txt`
- `src/layouts/home.llmsfull.txt`
- `src/layouts/robots.txt`
- `src/layouts/_default/single.markdown.md`
- `src/layouts/partials/seo/head-meta.html`
- `scripts/seo/generate-llm-artifacts.js`
- `scripts/seo/check-llm-artifacts.js`
- `scripts/seo/check-crawl-controls.js`
- `scripts/seo/check-metadata.js`
- `scripts/check-seo.js`
- `scripts/phase-7/run-all-gates.sh`
- `.github/workflows/build-pr.yml`
- `.github/workflows/deploy-pages.yml`
- `src/content/posts/salesforce-b2c-commerce-cloud-22-8/index.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-22-9-release/index.md`
- `src/content/pages/page-designer-add-ability-to-copy-paste-components/index.md`
- `src/content/pages/page-designer-dynamic-pages-optional-subcategories/index.md`