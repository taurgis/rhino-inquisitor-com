# Article Fidelity Audit - 2026-03-15

## Change summary

Expanded the article-fidelity audit package with a fifteenth and final batch, closing the remaining backlog while comparing current live WordPress article pages against the local Hugo render.

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
- Total reviewed on 2026-03-15 so far: `151`
- Batch 1 focus: code-heavy, long-form, and release-note-heavy posts where rendering drift was most likely to break reader trust or technical correctness
- Batch 2 focus: remaining code-heavy posts with fenced code, inline HTML-like literals, placeholder-heavy command blocks, and technical identifier examples
- Batch 3 focus: additional code-heavy posts that still exposed inline placeholder URLs, script examples, and API/authentication setup content
- Batch 4 focus: remaining technical posts with authentication snippets, API response payloads, inline identifier tokens, and release-note examples that could hide source corruption behind otherwise healthy body parity
- Batch 5 focus: the next remaining code-heavy posts with JWT, WebDAV, locale, PDF, caching, and release-note error examples where source corruption could still hide behind strong body similarity
- Batch 6 focus: the next remaining code-heavy posts with cartridge-path tokens, endpoint identifiers, sitemap filenames, release-note component names, and baseline-sensitive examples that needed stricter defect-confirmation rules
- Batch 7 focus: the next remaining code-heavy posts with missing XSD snippets, malformed mailto examples, operational placeholder URLs, and technically dense longform posts that still carried copy-paste risk
- Batch 8 focus: the final remaining code-heavy posts, which mostly reduced to title or presentation drift with one last malformed prose-embedded contact example
- Batch 9 focus: the first non-code-heavy wave, covering operational prose pages, release recaps, and community/editorial posts where the main risks shifted toward title rewrites and framing changes rather than source corruption
- Batch 10 focus: the next non-code-heavy wave, concentrating on operational prose and release recaps where editorial drift remained common but hidden identifier corruption still appeared in some inline examples
- Batch 11 focus: the next release-and-architecture-heavy wave, where recap framing still dominated but escaped-underscore corruption continued to break reader-facing permission and SLAS tokens
- Batch 12 focus: the next certification, community, and product-overview wave, where most pages reduced to clean parity and only isolated title or presentation drift remained
- Batch 13 focus: the next AI, certification, community, and go-live wave, where most pages passed cleanly and the only review items were shorter H1 rewrites on a few prose-heavy articles
- Batch 14 focus: the next technical-reference and onboarding wave, where ERD and architecture posts mostly passed cleanly and the remaining issues narrowed further to title shortening plus one raw-URL presentation case
- Batch 15 focus: the final reflective, community, career, and scaffold-fixture wave, where most pages reduced to clean parity, isolated H1 shortening, or one explicit no-baseline scope exception rather than technical corruption

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

#### Pattern 5: later batches separate harmless code-node exposure from confirmed source corruption

The fourth and fifth batches showed that some pages only expose extra inline code nodes or shorter H1s, while others still carry source-level defects that require repair.

Examples:

- `salesforce-b2c-commerce-cloud-22-10` surfaces extra inline admin URLs as code nodes locally, but the technical content remains intact and readable.
- `slas-in-sfra-or-sitegenesis` keeps its technical body, but one inline token is rendered as `plugin_ slas` instead of `plugin_slas`.
- `getting-to-know-the-sfcc-24-4-release` corrupts both a tenant placeholder and the `sfdc_customization_error` response-header token, which is a confirmed technical defect rather than harmless drift.

#### Pattern 6: live baseline anomalies must not be mistaken for Hugo-only regressions

The sixth batch found that some suspicious technical drift cannot be classified as a migration defect until the original source is checked, because the live WordPress baseline can already contain broken or third-party-transformed tokens.

Examples:

- `what-is-new-in-sfcc-24-6` already renders `@openssh.com` algorithm entries on the live page as obfuscated email-protection links, while the Hugo source carries a different malformed version of the same tokens.
- `kickstart-guide-for-new-sfcc-developers`, `salesforce-b2c-commerce-cloud-22-9-release`, `what-is-new-in-the-23-8-commerce-cloud-release`, and `mastering-sitemaps-in-sfcc` remain confirmed local defects because the live page preserves the intended cartridge, endpoint, or sitemap identifiers while the migrated markdown does not.

#### Pattern 7: prose-embedded operational examples can fail just as hard as fenced code blocks

The seventh batch showed that reader-visible corruption is not limited to fenced code samples.

Examples:

- `how-to-get-a-salesforce-b2c-commerce-cloud-sandbox` renders a visibly mangled struck-through trial email block in the Hugo page.
- `the-sfcc-guide-to-finding-pod-numbers` contains broken placeholder and legacy endpoint examples such as `<https://pod>` where the live article still preserves readable operational examples.
- `b2c-commerce-cloud-campaign-erd` loses the import XSD snippet that the surrounding prose says is available.

#### Pattern 8: the end of the code-heavy queue shifts the remaining signal toward editorial and media-presentation drift

The eighth batch closed the remaining code-heavy queue and showed a much lower hard-defect rate.

Examples:

- `your-definitive-mobile-app-checklist` keeps its SCAPI and SLAS examples intact, but the Hugo page uses a much shorter H1 than the live article.
- `community-salesforce-events-and-commerce-cloud` surfaces raw YouTube URLs inline in the local body flow, which is a presentation-drift issue rather than technical corruption.
- `a-new-commerce-cloud-community-in-town` remains a real defect because the reader-facing contact email is malformed in source.

#### Pattern 9: the first non-code-heavy wave is dominated by title drift and recap framing changes

The ninth batch confirms that once the code-heavy tranche is closed, most remaining findings collapse into medium-severity editorial review rather than fresh technical failures.

Examples:

- `a-dev-guide-to-combating-fraud-on-sfcc` preserves its body and technical identifiers, but the Hugo page uses a much shorter H1 than the live article.
- `a-look-at-the-23-9-commerce-cloud-release` and `getting-secured-with-the-24-5-salesforce-b2c-commerce-cloud-release` preserve the release substance while shortening titles and making previous-release references more explicit.
- `20-years-of-dreamforce`, `a-new-day-for-commerce-recap`, and `salesforce-connections-2024-and-sfcc` all passed without new hard defects.

#### Pattern 10: prose-heavy pages can still conceal reader-visible identifier corruption

The tenth batch confirms that the non-code-heavy backlog is not free of hard defects. Some prose-driven articles still contain broken inline identifiers even when their overall structure looks healthy.

Examples:

- `understanding-locale-fallback-in-sfcc` corrupts locale examples such as `en_US` and `fr_FR` into broken variants like `en _US` and `fr\_ FR`.
- `salesforce-b2c-commerce-cloud-23-3-release` corrupts reader-facing plugin identifiers such as `plugin_slas` and `plugin_passwordless`.
- Other pages in the same wave, including `storefront-protection-in-the-pwa-kit` and `what-is-the-sfcc-managed-runtime`, still passed cleanly, which reinforces that fail status should remain tied to exact token evidence rather than broad article type.

#### Pattern 11: release-note prose remains vulnerable to escaped-underscore corruption

The eleventh batch confirms that release recaps with inline permission names, grant types, and cartridge identifiers can still degrade into reader-visible corruption even when the surrounding prose looks healthy.

Examples:

- `a-look-at-the-salesforce-b2c-commerce-cloud-23-6-release` corrupts SLAS parameter values such as `grant_type=authorization_code` into `grant_type=authorization_ code`.
- `salesforce-b2c-commerce-cloud-october-updates` corrupts permission and cartridge identifiers such as `Login_On_Behalf` and `plugin_reorder_demo` into broken spaced variants.
- Other pages in the same wave, including `in-the-ring-ocapi-versus-scapi` and `what-is-commerce-on-core`, still passed cleanly, which confirms that fail status should remain tied to exact token evidence rather than article category alone.

#### Pattern 12: the remaining backlog is now skewing toward clean parity with isolated editorial drift

The twelfth batch is the cleanest non-code-heavy wave so far. Certification, community, and product-overview pages mostly preserve their live body content with only occasional title shortening or label-presentation drift.

Examples:

- `salesforce-b2c-commerce-the-22-6-release`, `pdf-and-salesforce-commerce-cloud-b2c`, and `salesforce-commerce-cloud-products` all passed without new reader-facing token defects.
- `ai-wont-steal-your-sfcc-job-but-a-developer-using-ai-will` remains a medium review item because the Hugo page uses a much shorter H1 and adds an extra opening note.
- `the-b2c-commerce-architect-certification` remains a medium review item because the Hugo page shortens the H1 and surfaces repeated `The Official List` labels more prominently.

#### Pattern 13: late-stage AI, certification, and go-live pages mostly collapse to pass-or-title-review outcomes

The thirteenth batch confirmed that the lower-risk prose backlog stayed free of new hard defects. AI, certification, and operational go-live pages mostly preserved their body content, with the remaining differences concentrated in shorter H1 rewrites.

Examples:

- `ai-automation-to-augmentation-at-work`, `ai-einstein-in-salesforce-b2c-commerce-cloud`, `lets-go-live-customer-migration`, and `lets-go-live-seo` all passed without new reader-facing token defects.
- `ai-as-an-architect-and-content-creator`, `chasing-clouds-catching-up-with-the-commercecrew-at-dreamforce-2023`, and `non-technical-sfcc-certifications` remained medium review items because the Hugo page shortens the H1 while keeping the body intact.
- This wave reinforced that the residual queue was shifting away from source corruption and toward editorial-review cleanup.

#### Pattern 14: technical-reference pages are no longer the main source of hard defects

The fourteenth batch confirms that the remaining technical-reference backlog is substantially cleaner than the earlier waves. ERD, architecture, and onboarding pages mostly preserve their live body content, with the remaining differences concentrated in shorter H1s and one presentation-only raw-link case.

Examples:

- `salesforce-b2c-commerce-cloud-catalog-erd`, `salesforce-b2c-commerce-cloud-content-erd`, `salesforce-b2c-commerce-cloud-customer-erd`, and `sfcc-basket-order-erd` all passed without new reader-facing token defects.
- `sfcc-introduction` remains a medium review item because the Hugo page shortens the H1 and exposes a raw YouTube URL plus AI-summary framing at the top of the article.
- `the-importance-of-origin-shielding`, `the-move-from-sitegenesis-and-sfra-to-the-composable-storefront-as-a-developer`, and `where-to-start-when-you-are-new-to-salesforce-b2c-commerce-cloud-development` remain medium review items because the Hugo page shortens the H1 while preserving the body guidance.

#### Pattern 15: the final closeout wave mostly resolves to pass, title review, or scope exception

The fifteenth batch confirms that the last remaining backlog items are not introducing fresh hard defects. The closeout queue is now limited to clean prose parity, a small number of shorter H1 rewrites, and one local scaffold route that has no live WordPress article baseline.

Examples:

- `office-hours-for-salesforce-b2c-commerce-cloud`, `the-journey-from-developer-to-architect`, `the-move-from-on-site-to-remote`, `the-state-of-ohana-for-salesforce-commerce-cloud`, `the-sunsetting-of-arc300-architect-b2c-commerce-solutions`, `trailblazerdx-2022-for-b2c-commerce`, and `what-can-i-use-chatgpt-for-when-working-with-salesforce` all passed without new reader-facing token defects.
- `reflecting-on-2-years-of-blogging` and `what-skills-do-i-need-as-a-sfcc-architect` remain medium review items because the Hugo page shortens the H1 while preserving the body.
- `phase-3-performance-baseline` is not a live migrated WordPress article at all; it remains a medium scope-review item because the local fixture route renders, but the live site returns a 404 baseline instead of a comparable article.

## Findings summary

### Progress

- Reviewed: `151 / 151` posts
- Remaining: `0 / 151` posts
- Pass: `65`
- Needs review: `62`
- Fail: `24`

### Severity summary

- High: `24`
- Medium: `62`
- Low: `0`

### Key conclusions

- Body-content preservation is mostly strong when the article does not depend on HTML-like code samples or placeholder-heavy command snippets.
- The most serious current risk is technical-code corruption in migrated markdown, not general prose fidelity.
- Title rewrites and inserted warning or update callouts are common enough that they should be treated as an explicit editorial policy decision instead of incidental drift.
- The second batch suggests the corruption pattern also affects technical identifiers and field names, not just HTML-like or JSX-like examples.
- The third batch confirms the problem extends to missing illustrative examples and malformed placeholder URLs, so the remaining queue should keep favoring posts that teach through snippets rather than prose alone.
- The fourth and fifth batches show that many remaining code-heavy posts are structurally sound, so the tracker now needs stronger rules for separating harmless code-node exposure from true source corruption before marking a row as `fail`.
- The sixth batch confirms that `fail` status should require both local corruption and a trustworthy baseline. When the live page already mangles a token, the row should stay `needs-review` until the original export or upstream source confirms the intended text.
- The seventh batch confirms that prose-embedded operational examples such as mailto links, placeholder URLs, and promised import snippets need the same scrutiny as fenced code blocks because they can still become reader-visible defects.
- The eighth batch closes the remaining code-heavy tranche and suggests the residual backlog is likely to produce fewer hard technical defects and more editorial or media-presentation review items.
- The ninth batch confirms that the non-code-heavy backlog is presently dominated by title rewrites, explicit recap-link wording, and other medium-severity editorial drift rather than new technical corruption.
- The tenth batch shows that prose-heavy pages can still hide hard failures when inline locale or plugin identifiers are corrupted, so non-code-heavy status alone is not a safe proxy for pass likelihood.
- The eleventh batch confirms that escaped underscores in inline permission names, grant types, and cartridge identifiers remain an active defect pattern inside release-note prose, not just in code-heavy articles.
- The twelfth batch suggests the residual backlog is now much cleaner, with most remaining differences likely to be editorial or presentation drift rather than fresh hard technical defects.
- The thirteenth batch reinforced that trend across late-stage AI, certification, and go-live content: new defects stayed out of the fail bucket and mostly collapsed into title-review cleanup.
- The fourteenth batch reinforces it again for the technical-reference remainder: new defects are increasingly limited to title or presentation review rather than source corruption.
- The fifteenth batch closes the audit with the same boundary intact: prose-heavy pages can pass cleanly, material H1 rewrites stay medium needs-review, missing live baselines stay scope-review, and fail remains reserved for reproducible reader-facing token corruption.

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
- Closeout remediation should preserve the existing severity boundary: fix confirmed fail rows first, route title and framing drift through owner review, and make an explicit scope decision for scaffold fixtures that have no live WordPress baseline.

## Senior QA recommendations for closeout

- Validate both CSV files after every append by parsing them, asserting the header schema is unchanged, and reconciling cumulative summary counts against the article-level tracker.
- Treat row completeness as mandatory: every row should have `batch_tag`, `source_file`, `signals`, `audit_status`, `overall_result`, `severity`, `issue_categories`, all three fidelity columns, `notes`, `recommended_action`, and `evidence`. Use `none` instead of leaving severity or category fields blank when no issue exists.
- Require unique `audit_id` and `article_url` values in the article tracker so later waves cannot silently duplicate or overwrite evidence.
- Confirm a `fail` only when the technical drift is reproducible in the migrated markdown source or rendered Hugo output, not just when the live/local code-node counts differ.
- If the live baseline itself is malformed or third-party transformed, keep the row at `needs-review` and require either the original export or the upstream vendor source before calling it a Hugo defect.
- Treat title rewrites, punctuation normalization, extra inline code-node exposure, and media-link presentation changes as harmless formatting drift or `needs-review` unless they change reader comprehension or copy-paste safety.
- Treat placeholder loss, malformed identifiers, broken cartridge names, truncated error examples, or malformed contact examples as source corruption when the live article preserves the correct token and the local source or render does not.
- Use a matched-example check before escalating severity: capture the exact live token and the local token in the `evidence` field so the CSV distinguishes confirmed corruption from stylistic drift.

## Verification

Manual and scripted checks used in this audit:

1. Live/local article-body extraction using the live `.speachify-content` wrapper and Hugo `section.article-body` wrapper.
2. Body similarity checks using heading, paragraph, image, list, and code-node comparisons.
3. Manual browser review on representative article routes.
4. Source-file validation for code-related failures in migrated markdown.
5. CSV parse-and-reconcile checks to confirm row completeness, uniqueness, and cumulative summary accuracy after each audit append.

## Related files

Audit artifacts:

- `migration/reports/phase-8-article-fidelity-audit-summary.csv`
- `migration/reports/phase-8-article-fidelity-audit.csv`

Implementation and evidence files inspected during the audit included:

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
- `src/content/posts/the-deprecation-of-the-uuid-token-for-api-clients/index.md`
- `src/content/posts/caching-rest-apis-in-sfcc/index.md`
- `src/content/posts/how-to-setup-oauth-jwt-for-the-ocapi/index.md`
- `src/content/posts/a-beginners-guide-to-webdav-in-sfcc/index.md`
- `src/content/posts/custom-preferences-in-sfcc/index.md`
- `src/content/posts/fetching-data-in-a-locale-with-sfcc/index.md`
- `src/content/posts/custom-ttf-fonts-in-pdf-for-sfcc/index.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-22-10/index.md`
- `src/content/posts/slas-in-sfra-or-sitegenesis/index.md`
- `src/content/posts/getting-to-know-the-sfcc-24-4-release/index.md`
- `src/content/posts/sending-emails-from-sfcc/index.md`
- `src/content/posts/migrate-magento-passwords-using-argon2/index.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-23-2/index.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-22-8/index.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-23-1/index.md`
- `src/content/posts/local-vs-shared-variation-attributes-sfcc/index.md`
- `src/content/posts/how-to-change-the-code-compatibility-mode-in-salesforce-b2c-commerce-cloud/index.md`
- `src/content/posts/how-to-load-client-side-javascript-and-css-in-sfra/index.md`
- `src/content/posts/secure-coding-in-salesforce-b2c-commerce-cloud/index.md`
- `src/content/posts/why-circumventing-sfcc-quota-limits-is-a-bad-idea/index.md`
- `src/content/posts/kickstart-guide-for-new-sfcc-developers/index.md`
- `src/content/posts/server-side-performance-in-sfcc/index.md`
- `src/content/posts/taming-the-beast-a-developers-deep-dive-into-sfcc-meta-tag-rules/index.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-22-9-release/index.md`
- `src/content/posts/sitegenesis-vs-sfra-vs-pwa/index.md`
- `src/content/posts/what-is-new-in-sfcc-24-6/index.md`
- `src/content/posts/what-is-new-in-the-23-8-commerce-cloud-release/index.md`
- `src/content/posts/everything-new-in-sfcc-23-4/index.md`
- `src/content/posts/a-look-back-at-origin-shielding/index.md`
- `src/content/posts/mastering-sitemaps-in-sfcc/index.md`
- `src/content/posts/b2c-commerce-cloud-campaign-erd/index.md`
- `src/content/posts/salesforce-payments-experience-explained/index.md`
- `src/content/posts/helpful-salesforce-b2c-commerce-cloud-cartridges/index.md`
- `src/content/posts/the-latest-in-sfcc-version-24-7/index.md`
- `src/content/posts/how-to-get-a-salesforce-b2c-commerce-cloud-sandbox/index.md`
- `src/content/posts/the-sfcc-guide-to-finding-pod-numbers/index.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-november-2022-updates/index.md`
- `src/content/posts/the-realm-split-field-guide-to-migrating-an-sfcc-site/index.md`
- `src/content/posts/the-salesforce-b2c-commerce-cloud-environment/index.md`
- `src/content/posts/three-things-to-secure-sfcc/index.md`
- `src/content/posts/events-and-the-golden-hoodie/index.md`
- `src/content/posts/your-definitive-mobile-app-checklist/index.md`
- `src/content/posts/a-new-commerce-cloud-community-in-town/index.md`
- `src/content/posts/community-salesforce-events-and-commerce-cloud/index.md`
- `src/content/posts/it-sure-has-been-quiet-on-this-blog/index.md`
- `src/content/posts/preparing-for-the-b2c-commerce-developer-certification/index.md`
- `src/content/posts/a-dev-guide-to-combating-fraud-on-sfcc/index.md`
- `src/content/posts/delta-exports-in-salesforce-b2c-commerce-cloud/index.md`
- `src/content/posts/understanding-sfcc-instances/index.md`
- `src/content/posts/what-is-oci-omnichannel-inventory/index.md`
- `src/content/posts/where-is-the-new-sfcc-documentation/index.md`
- `src/content/posts/a-deep-dive-into-the-23-7-sfcc-release/index.md`
- `src/content/posts/a-look-at-the-23-9-commerce-cloud-release/index.md`
- `src/content/posts/getting-secured-with-the-24-5-salesforce-b2c-commerce-cloud-release/index.md`
- `src/content/posts/sfcc-24-1-release-a-new-year-update/index.md`
- `src/content/posts/20-years-of-dreamforce/index.md`
- `src/content/posts/a-new-day-for-commerce-recap/index.md`
- `src/content/posts/salesforce-connections-2024-and-sfcc/index.md`
- `src/content/posts/real-time-inventory-checks-in-sfcc/index.md`
- `src/content/posts/should-i-use-sfra-rest-endpoints-in-a-composable-storefront/index.md`
- `src/content/posts/storefront-protection-in-the-pwa-kit/index.md`
- `src/content/posts/third-party-api-caching-in-commerce-cloud/index.md`
- `src/content/posts/understanding-locale-fallback-in-sfcc/index.md`
- `src/content/posts/what-is-the-sfcc-managed-runtime/index.md`
- `src/content/posts/b2c-commerce-whats-new-in-22-4/index.md`
- `src/content/posts/b2c-commerce-whats-new-in-the-22-3-release/index.md`
- `src/content/posts/digging-into-the-b2c-commerce-cloud-24-3-release/index.md`
- `src/content/posts/new-apis-and-features-for-a-headless-sfcc/index.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-23-10-release-a-comprehensive-overview/index.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-23-3-release/index.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-the-22-7-release/index.md`
- `src/content/posts/a-look-at-the-salesforce-b2c-commerce-cloud-23-6-release/index.md`
- `src/content/posts/a-look-at-the-sfcc-23-5-release/index.md`
- `src/content/posts/salesforce-b2c-commerce-the-22-5-release/index.md`
- `src/content/posts/getting-to-know-sfra-as-a-developer/index.md`
- `src/content/posts/in-the-ring-ocapi-versus-scapi/index.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-october-updates/index.md`
- `src/content/posts/the-attribute-fallback-system-in-sfcc/index.md`
- `src/content/posts/what-does-the-composable-storefront-mean-for-sfcc-developers/index.md`
- `src/content/posts/what-is-commerce-on-core/index.md`
- `src/content/posts/salesforce-b2c-commerce-the-22-6-release/index.md`
- `src/content/posts/ai-wont-steal-your-sfcc-job-but-a-developer-using-ai-will/index.md`
- `src/content/posts/pdf-and-salesforce-commerce-cloud-b2c/index.md`
- `src/content/posts/certifications-for-salesforce-b2c-commerce-cloud/index.md`
- `src/content/posts/commerce-cloud-t-shirts-on-shirtforce/index.md`
- `src/content/posts/get-connected-at-salesforce-connections-2022/index.md`
- `src/content/posts/podcasts-for-salesforce-b2c-commerce-cloud/index.md`
- `src/content/posts/salesforce-commerce-cloud-products/index.md`
- `src/content/posts/should-i-get-javascript-developer-i-certified/index.md`
- `src/content/posts/the-b2c-commerce-architect-certification/index.md`
- `src/content/posts/ai-as-an-architect-and-content-creator/index.md`
- `src/content/posts/ai-automation-to-augmentation-at-work/index.md`
- `src/content/posts/ai-einstein-in-salesforce-b2c-commerce-cloud/index.md`
- `src/content/posts/chasing-clouds-catching-up-with-the-commercecrew-at-dreamforce-2023/index.md`
- `src/content/posts/how-to-get-salesforce-certification-vouchers/index.md`
- `src/content/posts/is-salesforce-certification-worth-it/index.md`
- `src/content/posts/lets-go-live-customer-migration/index.md`
- `src/content/posts/lets-go-live-seo/index.md`
- `src/content/posts/life-is-about-choices/index.md`
- `src/content/posts/non-technical-sfcc-certifications/index.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-catalog-erd/index.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-content-erd/index.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-customer-erd/index.md`
- `src/content/posts/sfcc-basket-order-erd/index.md`
- `src/content/posts/simplifying-the-salesforce-order-of-execution/index.md`
- `src/content/posts/sfcc-introduction/index.md`
- `src/content/posts/slicing-versus-variation-groups-in-sfcc/index.md`
- `src/content/posts/the-importance-of-origin-shielding/index.md`
- `src/content/posts/the-move-from-sitegenesis-and-sfra-to-the-composable-storefront-as-a-developer/index.md`
- `src/content/posts/where-to-start-when-you-are-new-to-salesforce-b2c-commerce-cloud-development/index.md`
- `analysis/tickets/phase-3/RHI-105-article-readability-contextual-navigation.md`

## Recommended next step

Move from batching to closeout. Use the completed tracker to separate true remediation candidates from editorial owner-review items, then decide whether scaffold fixtures such as `phase-3-performance-baseline` should be excluded from the migrated-post audit denominator or signed off separately.

## Business Analyst recommendations for final-wave consistency

- Treat title drift as `needs-review` only when the H1 materially shortens, reframes, or drops notable terms from the live title; capitalization, punctuation normalization, and other non-meaningful cleanup should stay `pass`.
- Treat framing changes as `needs-review` when new intro notes, recap CTAs, or advisory text change editorial emphasis; keep them medium unless the new framing changes instructions, facts, or reader decisions.
- Treat presentation-only differences as `pass` when the reader still receives the same information without raw-link exposure, broken labels, or disrupted reading flow; if the migrated page surfaces raw URLs or obvious scaffold-only copy in the article body, keep it at medium review rather than escalating to fail.
- Treat prose-heavy pages as `pass` when the opening paragraphs, section structure, and reader-facing nouns or examples remain intact even if paragraph grouping shifts; prose-heavy status alone is not a reason to downgrade or upgrade severity.
- Preserve the stricter identifier-corruption rule across all article types: any reproducible breakage in reader-facing tokens such as locale codes, plugin names, grant types, URLs, email addresses, or placeholder identifiers remains `fail` and `high` when the live baseline preserves the correct token.
- Treat routes without a trustworthy live article baseline as `needs-review`, not `pass`; scope exceptions need an explicit owner decision instead of being silently folded into migration parity.

## 2026-03-15 Addendum: Batch 13

### Change summary

Added a thirteenth append-only audit batch covering the next AI, certification, community, and go-live wave in the remaining non-code-heavy backlog.

### Batch 13 scope

- Batch 13 reviewed 10 additional posts.
- Cumulative progress is now 131 reviewed of 151 total, with 20 remaining.
- Batch 13 stayed in the lower-risk tranche and focused on prose-heavy pages where the main likely outcomes were clean parity or medium editorial drift rather than token corruption.

### Batch 13 findings

- Batch 13 results: 7 pass, 3 needs-review, 0 fail.
- No new reproducible token-level corruption was confirmed in this wave.
- The only substantive drift in this batch was H1 shortening on ai-as-an-architect-and-content-creator, chasing-clouds-catching-up-with-the-commercecrew-at-dreamforce-2023, and non-technical-sfcc-certifications.
- The remaining 20-post backlog is now skewing even further toward lower-risk reflective, community, and reference content, but identifier-dense pages should still be prioritised first where possible.

### Updated cumulative totals

- Reviewed: 131 / 151
- Remaining: 20 / 151
- Pass: 52
- Needs review: 55
- Fail: 24
- High severity: 24
- Medium severity: 55
- Low severity: 0

### Senior QA recommendations

- Enforce uniqueness on every append by rejecting any duplicate audit_id or article_url before accepting a new batch.
- Treat row completeness as mandatory: each row must carry batch_tag, source_file, signals, audit_status, overall_result, severity, issue_categories, all three fidelity columns, notes, recommended_action, and evidence, using none instead of blanks.
- Reconcile cumulative summary math after each append by recalculating reviewed, remaining, pass, needs-review, fail, and severity totals directly from the article tracker.
- Reserve fail and high for reproducible token-level corruption in migrated source or rendered Hugo output; title drift, paragraph regrouping, and other prose-only differences should stay needs-review or pass unless they change reader comprehension.
- If the live baseline is already malformed or third-party transformed, hold the row at needs-review until the original export or upstream source confirms the intended token.

### Related files

- migration/reports/phase-8-article-fidelity-audit.csv
- migration/reports/phase-8-article-fidelity-audit-summary.csv
- src/content/posts/ai-as-an-architect-and-content-creator/index.md
- src/content/posts/ai-automation-to-augmentation-at-work/index.md
- src/content/posts/ai-einstein-in-salesforce-b2c-commerce-cloud/index.md
- src/content/posts/chasing-clouds-catching-up-with-the-commercecrew-at-dreamforce-2023/index.md
- src/content/posts/how-to-get-salesforce-certification-vouchers/index.md
- src/content/posts/is-salesforce-certification-worth-it/index.md
- src/content/posts/lets-go-live-customer-migration/index.md
- src/content/posts/lets-go-live-seo/index.md
- src/content/posts/life-is-about-choices/index.md
- src/content/posts/non-technical-sfcc-certifications/index.md

## 2026-03-15 Addendum: Batch 14

### Change summary

Added a fourteenth append-only audit batch covering the next technical-reference and onboarding wave in the remaining backlog.

### Batch 14 scope

- Batch 14 reviewed 10 additional posts.
- Cumulative progress is now 141 reviewed of 151 total, with 10 remaining.
- Batch 14 focused on ERD, architecture, and onboarding pages where the main likely outcomes were clean parity or medium title/presentation drift rather than token corruption.

### Batch 14 findings

- Batch 14 results: 6 pass, 4 needs-review, 0 fail.
- No new reproducible token-level corruption was confirmed in this wave.
- The main drift in this batch was shorter H1 wording on `sfcc-introduction`, `the-importance-of-origin-shielding`, `the-move-from-sitegenesis-and-sfra-to-the-composable-storefront-as-a-developer`, and `where-to-start-when-you-are-new-to-salesforce-b2c-commerce-cloud-development`.
- `sfcc-introduction` also remains a presentation-review item because the Hugo page exposes a raw YouTube URL and AI-summary framing before the article body.

### Updated cumulative totals

- Reviewed: 141 / 151
- Remaining: 10 / 151
- Pass: 58
- Needs review: 59
- Fail: 24
- High severity: 24
- Medium severity: 59
- Low severity: 0

### Senior QA recommendations

- Enforce uniqueness on every append by rejecting any duplicate `audit_id` or `article_url` before accepting a new batch.
- Treat row completeness as mandatory: each row must carry `batch_tag`, `source_file`, `signals`, `audit_status`, `overall_result`, `severity`, `issue_categories`, all three fidelity columns, `notes`, `recommended_action`, and `evidence`, using `none` instead of blanks.
- Reconcile cumulative summary math after each append by recalculating reviewed, remaining, pass, needs-review, fail, and severity totals directly from the article tracker.
- Reserve `fail` and `high` for reproducible token-level corruption in migrated source or rendered Hugo output; title drift, paragraph regrouping, and other prose-only differences should stay `needs-review` or `pass` unless they change reader comprehension.
- If the live baseline is already malformed or third-party transformed, hold the row at `needs-review` until the original export or upstream source confirms the intended token.

### Related files

- migration/reports/phase-8-article-fidelity-audit.csv
- migration/reports/phase-8-article-fidelity-audit-summary.csv
- src/content/posts/salesforce-b2c-commerce-cloud-catalog-erd/index.md
- src/content/posts/salesforce-b2c-commerce-cloud-content-erd/index.md
- src/content/posts/salesforce-b2c-commerce-cloud-customer-erd/index.md
- src/content/posts/sfcc-basket-order-erd/index.md
- src/content/posts/simplifying-the-salesforce-order-of-execution/index.md
- src/content/posts/sfcc-introduction/index.md
- src/content/posts/slicing-versus-variation-groups-in-sfcc/index.md
- src/content/posts/the-importance-of-origin-shielding/index.md
- src/content/posts/the-move-from-sitegenesis-and-sfra-to-the-composable-storefront-as-a-developer/index.md
- src/content/posts/where-to-start-when-you-are-new-to-salesforce-b2c-commerce-cloud-development/index.md


## 2026-03-15 Addendum: Batch 15

### Change summary

Added a fifteenth and final append-only audit batch covering the remaining reflective, community, career, and scaffold-fixture posts.

### Batch 15 scope

- Batch 15 reviewed the final 10 posts.
- Cumulative progress is now 151 reviewed of 151 total, with 0 remaining.
- Batch 15 focused on the lowest-risk remainder, where the likely outcomes were clean prose parity, isolated H1 shortening, or one explicit scope-review exception rather than token corruption.

### Batch 15 findings

- Batch 15 results: 7 pass, 3 needs-review, 0 fail.
- No new reproducible token-level corruption was confirmed in this wave.
- The only editorial review items in this batch were shorter H1 rewrites on `reflecting-on-2-years-of-blogging` and `what-skills-do-i-need-as-a-sfcc-architect`.
- `phase-3-performance-baseline` remains a medium review item because it is a local scaffold fixture with no comparable live WordPress article baseline.

### Updated cumulative totals

- Reviewed: 151 / 151
- Remaining: 0 / 151
- Pass: 65
- Needs review: 62
- Fail: 24
- High severity: 24
- Medium severity: 62
- Low severity: 0

### Senior QA recommendations

- Keep the existing severity boundary intact during remediation triage: only reproducible reader-facing token corruption qualifies for `fail` and `high`.
- Treat title drift, intro framing changes, and presentation-only differences as owner-review items unless they alter instructions or break comprehension.
- Do not silently count scaffold fixtures as migration passes; require an explicit closeout decision on whether they stay in scope or move to a separate fixture checklist.
- Re-run the CSV uniqueness and summary-reconciliation checks after any future remediation edits so closeout math stays append-safe and reproducible.

### Related files

- migration/reports/phase-8-article-fidelity-audit.csv
- migration/reports/phase-8-article-fidelity-audit-summary.csv
- src/content/posts/office-hours-for-salesforce-b2c-commerce-cloud/index.md
- src/content/posts/phase-3-performance-baseline/index.md
- src/content/posts/reflecting-on-2-years-of-blogging/index.md
- src/content/posts/the-journey-from-developer-to-architect/index.md
- src/content/posts/the-move-from-on-site-to-remote/index.md
- src/content/posts/the-state-of-ohana-for-salesforce-commerce-cloud/index.md
- src/content/posts/the-sunsetting-of-arc300-architect-b2c-commerce-solutions/index.md
- src/content/posts/trailblazerdx-2022-for-b2c-commerce/index.md
- src/content/posts/what-can-i-use-chatgpt-for-when-working-with-salesforce/index.md
- src/content/posts/what-skills-do-i-need-as-a-sfcc-architect/index.md
