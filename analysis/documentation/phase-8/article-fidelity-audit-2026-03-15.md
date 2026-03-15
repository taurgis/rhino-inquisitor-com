# Article Fidelity Audit - 2026-03-15

## Change summary

Expanded the article-fidelity audit package with a second batch of remaining code-heavy posts, continuing the comparison between current live WordPress article pages and the local Hugo render.

This audit produced:

- `migration/reports/phase-8-article-fidelity-audit-summary.csv` for overall progress and severity counts
- `migration/reports/phase-8-article-fidelity-audit.csv` for article-level findings and next actions

## Why this changed

The current migration state needed a reader-facing audit, not just URL and SEO validation.

The user asked for a critical review of:

- how article text is shown
- whether code examples still render correctly
- whether article content stayed intact
- a durable CSV tracker to show audit progress

## Scope and method

### Audit scope

- Total migrated posts in scope: `151`
- Total reviewed on 2026-03-15 so far: `31`
- Batch 1 focus: code-heavy, long-form, and release-note-heavy posts where rendering drift was most likely to break reader trust or technical correctness
- Batch 2 focus: remaining code-heavy posts with fenced code, inline HTML-like literals, placeholder-heavy command blocks, and technical identifier examples
- Batch 3 focus: additional code-heavy posts that still exposed inline placeholder URLs, script examples, and API/authentication setup content

### Comparison method

1. Compare the live WordPress article body against the local Hugo article body, not full-page chrome.
2. Use the live WordPress body wrapper `.speachify-content` as the baseline article-body selector.
3. Use the Hugo article body wrapper `section.article-body` as the migrated selector.
4. Check:
   - body text fidelity
   - heading structure
   - code example integrity
   - inserted update or warning copy
   - title and H1 drift
5. When the rendered code looked suspicious, verify whether the issue exists in the migrated markdown source or only in the rendered HTML.

### Audit interpretation rules

- Exact HTML parity is not required when Hugo behavior is spec-compliant.
- Semantic or instructional drift is a defect when it changes what a reader can understand or copy.
- Code examples are treated as high-risk when placeholders, tags, or query parameters are lost.

## Behavior details

### Old behavior

The live WordPress site remains the editorial baseline for body copy, headings, and code examples.

### New behavior observed in Hugo

The Hugo site generally preserves article body structure well, but the first batch exposed two important drift patterns.

#### Pattern 1: code-example corruption in migrated technical posts

High-severity failures were found where technical samples are no longer copy-paste safe or semantically correct.

Examples:

- `guide-to-the-getprops-method-in-sfcc` strips JSX markup from a code block so `<h1>{name}</h1>` becomes `{name}`.
- `mail-attachments-in-b2c-commerce-cloud` drops the `<iscontent>` tag from a MIME template example.
- `sfcc-url-cracking-the-code` corrupts query parameters so `&param2` becomes `¶m2`.
- `lets-go-live-ecdn` contains a malformed naked-domain example: `<https://mybrand.com**>`.
- `how-to-set-up-the-ecdn-in-sfcc-staging` loses important placeholder tokens in curl examples and contains a malformed JSON payload example.

#### Pattern 2: editorial drift that needs owner confirmation

Several pages retain the original body but change the visible title or prepend new warning or update text.

Examples:

- `how-to-use-ocapi-scapi-hooks` now leads with a 2025 update note and uses a shorter H1.
- `a-survival-guide-to-sfcc-platform-limits` keeps near-exact body parity but shortens the H1 substantially.
- `a-look-at-the-salesforce-b2c-commerce-cloud-24-2-release` adds warning-oriented callout copy ahead of the original release-note body.
- `creating-custom-ocapi-endpoints` prepends a deprecation warning and Custom APIs link ahead of the original OCAPI workaround article.
- `how-to-use-node-18-with-sfra` shortens the live title and adds compatibility guidance near the top of the article.

#### Pattern 3: source-level token corruption still appears in technical field and identifier examples

The second batch confirmed that the corruption risk is not limited to HTML-like snippets.

Example:

- `unravelling-the-mystery-of-dates-in-the-ocapi` changes field names such as `creation_date`, `valid_from`, and `to_value` into broken variants like `creation _date`, `valid _ from`, and `to _ value`.

#### Pattern 4: some migrated sources are missing or mangling illustrative examples rather than just reformatting them

The third batch found two stronger forms of source degradation:

- `how-to-extend-active-data-in-salesforce-b2c-commerce-cloud` drops a live client-side script example down to a placeholder comment.
- `how-to-set-up-slas-for-the-composable-storefront` contains a malformed placeholder URL for the SLAS Admin login endpoint.

## Findings summary

### Progress

- Reviewed: `31 / 151` posts
- Remaining: `120 / 151` posts
- Pass: `10`
- Needs review: `13`
- Fail: `8`

### Severity summary

- High: `8`
- Medium: `13`
- Low: `0`

### Key conclusions

- Body-content preservation is mostly strong when the article does not depend on HTML-like code samples or placeholder-heavy command snippets.
- The most serious current risk is technical-code corruption in migrated markdown, not general prose fidelity.
- Title rewrites and inserted warning or update callouts are common enough that they should be treated as an explicit editorial policy decision instead of incidental drift.
- The second batch suggests the corruption pattern also affects technical identifiers and field names, not just HTML-like or JSX-like examples.
- The third batch confirms the problem extends to missing illustrative examples and malformed placeholder URLs, so the remaining queue should keep favoring posts that teach through snippets rather than prose alone.

### Live-site baseline observation

During the audit, the live `helpful-salesforce-b2c-commerce-cloud-cli-tools` page surfaced a current WordPress asset issue: the page-specific Elementor stylesheet URL returned HTML and triggered a strict MIME rejection in the browser.

This is not a Hugo regression, but it matters when judging visual parity because the live baseline is not fully clean.

## Impact

### Reader impact

- Broken code samples can mislead technical readers and waste implementation time.
- Corrupted placeholders and query parameters can make examples unusable.
- Untracked H1 rewrites and inserted warnings can change the editorial contract of a migrated post.

### Workflow impact

- Code-heavy posts should move to the front of the remaining audit queue.
- Future migration QA should distinguish between source-conversion defects and Hugo-rendering defects.
- Retitled or materially amended articles need explicit owner sign-off so parity audits are evaluating against the right editorial target.
- Remaining audit work should keep prioritizing posts with fenced code, inline placeholders, and identifier-heavy API examples before broader prose-only content.

## Verification

Manual and scripted checks used in this audit:

1. Live/local article-body extraction using the live `.speachify-content` wrapper and Hugo `section.article-body` wrapper.
2. Body similarity checks using heading, paragraph, image, list, and code-node comparisons.
3. Manual browser review on representative article routes.
4. Source-file validation for code-related failures in migrated markdown.

## Related files

Audit artifacts:

- `migration/reports/phase-8-article-fidelity-audit-summary.csv`
- `migration/reports/phase-8-article-fidelity-audit.csv`

Implementation and evidence files inspected during the audit:

- `src/layouts/_default/single.html`
- `src/content/posts/how-to-set-up-the-ecdn-in-sfcc-staging/index.md`
- `src/content/posts/how-to-use-ocapi-scapi-hooks/index.md`
- `src/content/posts/mail-attachments-in-b2c-commerce-cloud/index.md`
- `src/content/posts/guide-to-the-getprops-method-in-sfcc/index.md`
- `src/content/posts/sfcc-url-cracking-the-code/index.md`
- `src/content/posts/lets-go-live-ecdn/index.md`
- `src/content/posts/navigating-dates-calendars-in-sfcc/index.md`
- `src/content/posts/what-is-the-ocapi-session-bridge/index.md`
- `src/content/posts/an-overview-of-sfcc-global-functions/index.md`
- `src/content/posts/how-to-use-node-18-with-sfra/index.md`
- `src/content/posts/how-to-filter-jsdoc-in-storybook-autodocs/index.md`
- `src/content/posts/creating-custom-ocapi-endpoints/index.md`
- `src/content/posts/where-to-hook-into-an-sfra-controller/index.md`
- `src/content/posts/unravelling-the-mystery-of-dates-in-the-ocapi/index.md`
- `src/content/posts/submitting-a-file-to-a-third-party-service-in-sfcc/index.md`
- `src/content/posts/leveraging-generic-mappings-in-sfcc/index.md`
- `src/content/posts/image-ine-sfcc-dis-for-developers/index.md`
- `src/content/posts/the-request-body-in-an-sfcc-controller/index.md`
- `src/content/posts/submit-multipart-form-data-to-a-third-party-service-in-sfcc/index.md`
- `src/content/posts/how-to-extend-active-data-in-salesforce-b2c-commerce-cloud/index.md`
- `src/content/posts/the-createorders-api-in-sfcc/index.md`
- `src/content/posts/how-to-set-up-slas-for-the-composable-storefront/index.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-governance-and-quotas/index.md`
- `src/content/posts/caching-in-the-sfcc-composable-storefront/index.md`
- `analysis/tickets/phase-3/RHI-105-article-readability-contextual-navigation.md`

## Recommended next step

Continue with the remaining unaudited code-heavy posts, prioritizing pages that contain fenced code blocks plus inline HTML-like literals, placeholder tokens, or API field-name examples before shifting to prose-only articles.
