## Plan: Migrate Rhino Inquisitor to GitHub Pages

Migrate the current WordPress-powered site to a static Markdown-authored site using Hugo and GitHub Pages deployment via GitHub Actions. This approach keeps authoring simple (Markdown), preserves existing URLs through explicit route fields, and supports strong SEO controls (canonical, sitemap, structured data, redirects) while remaining fully compatible with GitHub Pages.

**Steps**
1. Phase 1: Baseline and URL Inventory
1.1. Export the full live URL inventory from the current sitemaps (`post-sitemap.xml`, `page-sitemap.xml`, `category-sitemap.xml`, `video-sitemap.xml`, `e-landing-page-sitemap.xml`).
1.2. Build a canonical URL manifest with route types: `post`, `page`, `category`, `video`, `landing`, `system`.
1.3. Mark each URL as `keep`, `merge`, or `retire` and define target behavior.
1.4. Confirm URL invariants to preserve: trailing slash, lowercase slugs, `www` host.

2. Phase 2: Stack and Architecture Decision (*depends on 1*)
2.1. Use Hugo as the static site generator (Markdown-first, explicit `url` control, built-in `aliases` redirects, static HTML output).
2.2. Use GitHub Pages custom workflow deployment (build in Actions, deploy artifact) instead of native branch Jekyll build.
2.3. Add supporting libraries:
- `turndown` + `@joplin/turndown-plugin-gfm` for WordPress HTML-to-Markdown conversion.
- `fast-glob` for URL parity and content audits.
- `gray-matter` for front matter processing in migration scripts.
2.4. Define content model fields used in front matter: `title`, `description`, `date`, `lastmod`, `categories`, `tags`, `heroImage`, `url`, `aliases`, `canonical`, `draft`.

3. Phase 3: Repository Scaffolding (*depends on 2*)
3.1. Initialize Hugo project with `hugo.toml`, output folder (`public`), and clean URL generation.
3.2. Create content directories for posts/pages/categories and base layouts/partials.
3.3. Add reusable SEO partials for canonical, Open Graph, Twitter cards, and JSON-LD.
3.4. Add deterministic URL strategy so every migrated URL is explicit rather than auto-generated.

4. Phase 4: Content Migration Pipeline (*depends on 3, parallel with 5*)
4.1. Export WordPress content (WXR or REST) and normalize into a migration input dataset.
4.2. Convert post/page body HTML to Markdown while preserving code blocks, links, image captions, and tables.
4.3. Assign each migrated document an explicit `url` matching the current production URL path and use `aliases` for mapped legacy routes.
4.4. Download and relink media assets to local static paths (or a dedicated CDN strategy if preferred).
4.5. Generate per-item migration report: `source URL`, `new file`, `status`.

5. Phase 5: SEO and Discoverability (*depends on 3, parallel with 4*)
5.1. Generate `sitemap.xml` from built pages and keep it aligned with `robots.txt`.
5.2. Generate feed output (`rss.xml`) for article subscribers.
5.3. Ensure every page has unique title + meta description and canonical URL.
5.4. Emit JSON-LD (`BlogPosting` for articles, `WebSite` + optional `Person` for site-level).
5.5. Preserve crawlable archives (`/archive/`, category pages) where they currently carry organic traffic.

6. Phase 6: URL Preservation and Redirect Strategy (*depends on 1, 4, 5*)
6.1. Keep all currently indexed URLs by matching old slug paths exactly whenever possible.
6.2. For intentionally changed/retired URLs, generate redirect outputs through Hugo `aliases` and use canonical + meta refresh fallback when required by static hosting constraints.
6.3. Preserve key legacy endpoints explicitly: homepage, archive, privacy-policy, category routes, video routes, and any externally linked landing pages.
6.4. Build a URL parity checker that compares old sitemap URLs against final output + redirects.

7. Phase 7: GitHub Pages Deployment and Domain Cutover (*depends on 3, 4, 5, 6 for launch candidate*)
7.1. Create Pages workflow using `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages`.
7.2. Configure workflow permissions: `pages: write` and `id-token: write`.
7.3. Configure custom domain (`www.rhino-inquisitor.com`) in GitHub Pages settings/API (repository `CNAME` is optional and non-authoritative for Actions publishing).
7.4. Update DNS records to GitHub Pages targets and verify HTTPS issuance.
7.5. Add `.nojekyll` in publish artifact when needed to prevent unintended Jekyll processing.

8. Phase 8: Validation and Launch Readiness (*depends on 4, 5, 6, 7*)
8.1. Build validation in CI on every PR.
8.2. Run URL parity checks and fail CI on missing mapped URLs.
8.3. Run broken-link checks across the generated site.
8.4. Run targeted Lighthouse checks on homepage, article page, archive page, and a category page.
8.5. Manually validate robots, sitemap, canonical tags, schema markup, and social previews.

9. Phase 9: Cutover and Post-Launch Monitoring (*depends on 8*)
9.1. Execute DNS cutover during low-traffic window.
9.2. Submit sitemap to Google Search Console and request recrawls for critical templates.
9.3. Monitor 404s, crawl anomalies, and indexing coverage for 4-6 weeks.
9.4. Keep redirects active for at least 12 months for moved URLs.

**Relevant files**
- Planned document to create in repository root: `IMPLEMENTATION-PLAN.MD` (full migration plan for execution handoff).
- Planned migration URL source snapshot: `migration/url-manifest.json`.
- Planned Hugo config: `hugo.toml`.
- Planned article content root: `content/posts/`.
- Planned page content root: `content/pages/`.
- Planned layouts: `layouts/`.
- Planned SEO partials: `layouts/partials/seo.*`.
- Planned CI deploy workflow: `.github/workflows/deploy-pages.yml`.
- Planned build/test scripts and dependencies: `package.json`.
- Planned static utility files: `static/robots.txt`, `public/sitemap.xml` (generated), `static/CNAME`, `content/404.md`.
- Planned redirect output area: generated from front matter `aliases`.
- Tool-evaluation decision record: `plan/details/phase-2.md`.

**Verification**
1. Build correctness: run a production Hugo build and assert successful output artifact.
2. URL parity: compare old URL manifest against built output + redirects and report unmatched URLs as blocking failures.
3. SEO minimums: check canonical tags, page titles, meta descriptions, Open Graph, JSON-LD on representative templates.
4. Crawl readiness: validate `robots.txt` and `sitemap.xml` references and response codes after deploy.
5. Launch smoke tests: verify homepage, 3 recent posts, archive, 3 category pages, and privacy policy route on the production domain.

**Decisions**
- Recommended generator: Hugo over Eleventy/Jekyll/Astro/Next static export due to strongest route and redirect primitives for static-host migration (`url` + `aliases`) while remaining fully Pages-compatible via Actions.
- URL strategy: explicit per-document `url` to preserve current paths exactly where possible.
- SEO strategy: template-driven metadata + generated sitemap/feed + structured data.
- Redirect strategy: Hugo `aliases` generated redirects for unavoidable URL changes, with escalation to an edge redirect layer if URL churn exceeds 5 percent of indexed inventory or true 301/308 coverage is required.

**Further Considerations**
1. Domain topology recommendation: keep `www.rhino-inquisitor.com` as canonical and redirect apex to `www` at DNS/provider layer for consistency.
2. Category/video scope recommendation: preserve route URLs first, then decide content depth (full listing pages vs thin archive pages) based on Search Console performance.
3. Media strategy recommendation: start with local static assets for portability; move to CDN only if build times or asset volume become problematic.
