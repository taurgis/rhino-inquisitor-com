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
- `sfcc-introduction` closed after the raw YouTube URL was normalized into a labeled link while preserving the original AI-summary framing.
- `the-importance-of-origin-shielding`, `the-move-from-sitegenesis-and-sfra-to-the-composable-storefront-as-a-developer`, and `where-to-start-when-you-are-new-to-salesforce-b2c-commerce-cloud-development` ultimately closed under the owner-approved global title policy because the body guidance already matched live and raw-export evidence.

#### Pattern 15: the final closeout wave mostly resolves to pass, title review, or scope exception

The fifteenth batch confirms that the last remaining backlog items are not introducing fresh hard defects. The closeout queue is now limited to clean prose parity, a small number of shorter H1 rewrites, and one local scaffold route that has no live WordPress article baseline.

Examples:

- `office-hours-for-salesforce-b2c-commerce-cloud`, `the-journey-from-developer-to-architect`, `the-move-from-on-site-to-remote`, `the-state-of-ohana-for-salesforce-commerce-cloud`, `the-sunsetting-of-arc300-architect-b2c-commerce-solutions`, `trailblazerdx-2022-for-b2c-commerce`, and `what-can-i-use-chatgpt-for-when-working-with-salesforce` all passed without new reader-facing token defects.
- `reflecting-on-2-years-of-blogging` and `what-skills-do-i-need-as-a-sfcc-architect` ultimately closed under the owner-approved global title policy because live WordPress and raw-export evidence confirmed the body parity and showed the only remaining variance was the intentionally shorter Hugo H1.
- `phase-3-performance-baseline` closed as an accepted non-migration scaffold-fixture exception because the source explicitly marks it with `scaffoldFixture: true` and the live WordPress route returns a 404 rather than a comparable article baseline.

## Findings summary

### Progress

- Reviewed: `151 / 151` posts
- Remaining: `0 / 151` posts
- Pass: `151`
- Needs review: `0`
- Fail: `0`

### Severity summary

- High: `0`
- Medium: `0`
- Low: `0`

### Key conclusions

- Body-content preservation is mostly strong when the article does not depend on HTML-like code samples or placeholder-heavy command snippets.
- The most serious current risk is technical-code corruption in migrated markdown, not general prose fidelity.
- Title rewrites and inserted warning or update callouts are common enough that they should be treated as an explicit editorial policy decision instead of incidental drift.
- The remaining queue is now smaller and cleaner after resolving the baseline-sensitive OCAPI identifier-spacing row against the raw WordPress export instead of leaving it in indefinite owner review.
- The third batch confirms the problem extends to missing illustrative examples and malformed placeholder URLs, so the remaining queue should keep favoring posts that teach through snippets rather than prose alone.
- The fourth and fifth batches show that many remaining code-heavy posts are structurally sound, so the tracker now needs stronger rules for separating harmless code-node exposure from true source corruption before marking a row as `fail`.
- The sixth batch confirms that `fail` status should require both local corruption and a trustworthy baseline. When the live page already mangles a token, the row should stay `needs-review` until the original export or upstream source confirms the intended text.
- The seventh batch confirms that prose-embedded operational examples such as mailto links, placeholder URLs, and promised import snippets need the same scrutiny as fenced code blocks because they can still become reader-visible defects.
- The eighth batch closes the remaining code-heavy tranche and suggests the residual backlog is likely to produce fewer hard technical defects and more editorial or media-presentation review items.
- Independent browser verification also showed that some nominally clean rows still expose literal markdown links or raw media URLs in the local article body, so visible link or media presentation drift should not remain `pass` without checking the rendered page.
- The ninth batch confirms that the non-code-heavy backlog is presently dominated by title rewrites, explicit recap-link wording, and other medium-severity editorial drift rather than new technical corruption.
- The tenth batch shows that prose-heavy pages can still hide hard failures when inline locale or plugin identifiers are corrupted, so non-code-heavy status alone is not a safe proxy for pass likelihood.
- The eleventh batch confirms that escaped underscores in inline permission names, grant types, and cartridge identifiers remain an active defect pattern inside release-note prose, not just in code-heavy articles.
- The twelfth batch suggests the residual backlog is now much cleaner, with most remaining differences likely to be editorial or presentation drift rather than fresh hard technical defects.
- The thirteenth batch reinforced that trend across late-stage AI, certification, and go-live content: new defects stayed out of the fail bucket and mostly collapsed into title-review cleanup.
- The fourteenth batch reinforces it again for the technical-reference remainder: new defects are increasingly limited to title or presentation review rather than source corruption.
- The fifteenth-batch closeout confirms the final exception rules: title-only drift can close under the owner-approved global H1 policy when live and raw-export body parity is intact, scaffold fixtures can close as accepted non-migration exceptions when `scaffoldFixture: true` and live 404 evidence are explicit, and official Salesforce docs remain reserved for platform-defined identifier disputes that WordPress evidence cannot resolve.

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
- Closeout remediation is now complete. Future audits should preserve the same boundary: fix confirmed fail rows first, close title-only drift under the established global H1 policy when body parity is intact, and treat scaffold fixtures with no live WordPress baseline as explicit non-migration scope exceptions.

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
- Pass: 95
- Needs review: 36
- Fail: 0
- High severity: 0
- Medium severity: 36
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
- Pass: 101
- Needs review: 40
- Fail: 0
- High severity: 0
- Medium severity: 40
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
- Pass: 108
- Needs review: 43
- Fail: 0
- High severity: 0
- Medium severity: 43
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


## 2026-03-15 Correction Addendum: Classification Reconciliation

### Change summary

Reclassified one previously marked fail/high row to needs-review/medium after targeted evidence checks showed mixed signals and no confirmed executable-example breakage.

### Why this changed

The row-level evidence standard requires fail only when reader-facing technical tokens are reproducibly broken against a trustworthy baseline. Follow-up verification found one OCAPI row where canonical identifiers remained present in code examples, while spaced variants appeared in prose context.

### Behavior details

- Old behavior: RHI-AUD-021 was classified as fail/high with code_fidelity: fail.
- New behavior: RHI-AUD-021 is now needs-review/medium with code_fidelity: pass and text_presentation: needs-review pending raw-export confirmation.

### Impact

- Cumulative totals changed to: Pass 60, Needs review 68, Fail 23, High 23, Medium 68, Low 0.
- Severity boundary is unchanged: fail/high remains reserved for reproducible reader-facing token corruption.
- Remediation sequencing impact: this row now routes through owner/source verification instead of immediate defect repair.

### Verification

1. Re-ran live-vs-local token checks for the candidate misclassification set.
2. Verified mixed evidence in src/content/posts/unravelling-the-mystery-of-dates-in-the-ocapi/index.md:
   - prose lines contain spaced variants (creation _date, valid _ from, valid _ to),
   - code examples still preserve canonical fields (creation_date, valid_from, valid_to, to_value).
3. Reconciled summary math from Batch 2 onward after reclassification.

### Related files

- migration/reports/phase-8-article-fidelity-audit.csv
- migration/reports/phase-8-article-fidelity-audit-summary.csv
- analysis/documentation/phase-8/article-fidelity-audit-2026-03-15.md


## 2026-03-15 Medium Review Addendum: Three-Article Slice 5

### Change summary

Processed the next three-article medium-review slice at RHI-AUD-046, RHI-AUD-047, and RHI-AUD-050. Two rows moved to pass under the owner-approved global H1 policy for title-only medium rows, and the mixed SLAS row moved to pass after normalizing the broken `plugin_ slas` token in source.

### Why this changed

This slice contained two more title-only rows plus one row with a real local token defect. The title-only rows could be closed under the already approved H1 policy, while the SLAS row needed a direct source correction before it could close.

### Behavior details

- Old behavior: RHI-AUD-046 and RHI-AUD-047 remained needs-review solely because of shorter Hugo H1 values. RHI-AUD-050 remained needs-review because of the shorter H1 plus one rendered `plugin_ slas` token in the refresh-token paragraph.
- New behavior: RHI-AUD-046 and RHI-AUD-047 are pass under the owner-approved global title policy. RHI-AUD-050 is pass because the `plugin_ slas` token was normalized back to `plugin_slas`, and the remaining H1 delta is also covered by the same title policy.

### Impact

- Cumulative totals changed to: Pass 95, Needs review 56, Fail 0, High 0, Medium 56, Low 0.
- Batch 5 now has 38 pass and 13 needs-review rows.
- The next queue head is RHI-AUD-053.

### Verification

1. Re-fetched live and local `custom-preferences-in-sfcc` and confirmed intact body/script parity with only the shorter Hugo H1 differing.
2. Re-fetched live and local `fetching-data-in-a-locale-with-sfcc` and confirmed intact locale-switching examples and SCAPI placeholder URL parity with only the shorter Hugo H1 differing.
3. Re-fetched live and local `slas-in-sfra-or-sitegenesis` and confirmed the shorter H1 plus one local `plugin_ slas` token in the refresh-token paragraph.
4. Updated the SLAS source so the refresh-token paragraph now renders `plugin_slas`, matching the repeated live token form.
5. Reconciled the detail tracker and summary counts after closing all three rows.

### Related files

- migration/reports/phase-8-article-fidelity-audit.csv
- migration/reports/phase-8-article-fidelity-audit-summary.csv
- analysis/documentation/phase-8/article-fidelity-audit-2026-03-15.md
- src/content/posts/slas-in-sfra-or-sitegenesis/index.md


## 2026-03-15 Medium Review Addendum: Three-Article Slice 6

### Change summary

Processed the next three-article medium-review slice at RHI-AUD-053, RHI-AUD-054, and RHI-AUD-056. The performance article moved to pass after confirming the `<iscache>` text is visible on both live and local pages. The meta-tag rules article moved to pass after normalizing malformed emphasis markers in source. The SiteGenesis/SFRA/PWA comparison moved to pass after converting raw YouTube URLs into normal linked prose.

### Why this changed

This slice contained mixed presentation findings rather than simple title-only rows. Re-verification showed one false-positive inline-code finding and two small but real local presentation issues that could be fixed directly in source.

### Behavior details

- Old behavior: RHI-AUD-053 still treated `<iscache>` as a Hugo-only inline-code presentation issue, RHI-AUD-054 still contained malformed emphasis spacing such as `_what _` and `_ how_`, and RHI-AUD-056 still surfaced raw YouTube URLs inline where the live article did not expose those video links in normal reading flow.
- New behavior: RHI-AUD-053 is pass because `<iscache>` is visible on both live and local pages and the remaining H1 delta is covered by the global title policy. RHI-AUD-054 is pass because the malformed emphasis markers were normalized while the shorter H1 remains acceptable under the same title policy. RHI-AUD-056 is pass because the raw YouTube URLs now render as standard linked prose instead of bare URLs.

### Impact

- Cumulative totals changed to: Pass 98, Needs review 53, Fail 0, High 0, Medium 53, Low 0.
- Batch 6 now has 45 pass and 16 needs-review rows.
- The next queue head is RHI-AUD-057.

### Verification

1. Re-fetched live and local `server-side-performance-in-sfcc` and confirmed both pages expose the same `There are two ways: <iscache> tags SFRA Cache Middleware Functions` reading flow.
2. Verified the remaining 053 H1 delta is covered by the owner-approved global title policy.
3. Normalized the malformed `_what _` and `_ how_` emphasis fragments in `taming-the-beast-a-developers-deep-dive-into-sfcc-meta-tag-rules`.
4. Re-rendered the local `sitegenesis-vs-sfra-vs-pwa` page and confirmed the raw YouTube URLs no longer appear inline in reading flow.
5. Reconciled the detail tracker and summary counts after closing all three rows.

### Related files

- migration/reports/phase-8-article-fidelity-audit.csv
- migration/reports/phase-8-article-fidelity-audit-summary.csv
- analysis/documentation/phase-8/article-fidelity-audit-2026-03-15.md
- src/content/posts/taming-the-beast-a-developers-deep-dive-into-sfcc-meta-tag-rules/index.md
- src/content/posts/sitegenesis-vs-sfra-vs-pwa/index.md


## 2026-03-15 Medium Review Addendum: First 10-Row Continuation Batch

### Change summary

Switched continuation cadence from three rows to ten rows per batch at your request and processed the first 10-row tranche: RHI-AUD-057, RHI-AUD-059, RHI-AUD-061, RHI-AUD-063, RHI-AUD-065, RHI-AUD-069, RHI-AUD-071, RHI-AUD-072, RHI-AUD-073, and RHI-AUD-075. All ten rows moved to pass.

### Why this changed

The remaining queue had enough repeated title-only and small presentation defects that a wider batch became more efficient. This batch combined one official-source technical repair, several low-risk media/formatting cleanups, and multiple title-policy closures.

### Behavior details

- Old behavior: the 24.6 release article still contained malformed SFTP algorithm identifiers, several mixed rows still exposed raw media URLs or malformed formatting in normal reading flow, and five rows remained blocked on shorter Hugo H1 values or stale mixed-drift classifications.
- New behavior: the 24.6 algorithm block now matches official Salesforce naming, raw media URLs now render as standard links or prose instead of bare URLs, malformed note/emphasis formatting is normalized, and the residual title-only rows close under the owner-approved global H1 policy.

### Impact

- Cumulative totals changed to: Pass 108, Needs review 43, Fail 0, High 0, Medium 43, Low 0.
- Batch 6 now has 48 pass and 13 needs-review rows.
- Batch 7 now has 58 pass and 13 needs-review rows.
- Batch 8 now has 63 pass and 14 needs-review rows.
- The next unresolved row in the current post-056 continuation tranche is RHI-AUD-076.
- The global unresolved medium queue at the end of this first continuation batch still started earlier, at RHI-AUD-003.

## 2026-03-15 Medium Review Addendum: Second 10-Row Global Queue Batch

### Change summary

Processed the next 10-row slice from the global unresolved medium queue: RHI-AUD-003, RHI-AUD-006, RHI-AUD-007, RHI-AUD-008, RHI-AUD-014, RHI-AUD-016, RHI-AUD-017, RHI-AUD-021, RHI-AUD-025, and RHI-AUD-026. All ten rows moved to pass.

### Why this changed

After the first continuation batch, the remaining global queue still contained earlier title-only rows plus two technically resolvable holds. This batch cleared that carryover by combining H1-policy closures with source-backed remediation for the two non-title rows.

### Behavior details

- Old behavior: eight early technical articles remained blocked only by shorter Hugo H1 values, the dates/time-zones article exposed a local-only documentation note absent from the live baseline, and the OCAPI dates article still showed spaced prose identifiers such as `creation _date` and `to _ value` despite clean code blocks.
- New behavior: the eight title-only rows close under the existing global H1 policy, the local-only documentation note in the dates/time-zones article has been removed, and the OCAPI dates prose now matches the raw WordPress source identifiers `creation_date`, `valid_from`, `valid_to`, and `to_value`.

### Impact

- Cumulative totals changed to: Pass 118, Needs review 33, Fail 0, High 0, Medium 33, Low 0.
- Batch 1 is now fully cleared at 13 pass and 0 needs-review.
- Batch 2 is now fully cleared at 23 pass and 0 needs-review.
- Batch 3 now sits at 30 pass and 1 needs-review.
- The global unresolved medium queue now starts at RHI-AUD-028.

## 2026-03-15 Medium Review Addendum: Third 10-Row Global Queue Batch

### Change summary

Processed the next 10-row slice from the global unresolved medium queue: RHI-AUD-028, RHI-AUD-032, RHI-AUD-038, RHI-AUD-076, RHI-AUD-078, RHI-AUD-080, RHI-AUD-083, RHI-AUD-084, RHI-AUD-085, and RHI-AUD-086. All ten rows moved to pass.

### Why this changed

This slice looked partially blocked at first because it mixed title-only rows, one media-link exposure row, and several release-note recap rows previously tagged as content insertions. Follow-up evidence checks showed the remaining non-title drift was narrower than the tracker suggested, so the batch could be closed with direct parity fixes instead of owner escalation.

### Behavior details

- Old behavior: four early rows remained open solely because of shorter Hugo H1 values, the reflective August 2024 blog post exposed a raw `.mov` URL inline, and four release-note recaps rewrote the original WordPress `Click here!` CTA into more explicit linked copy. The 24.1 row was also carrying a suspected `PIG Only` insertion.
- New behavior: the title-only rows close under the existing global H1 policy, the reflective post now uses a labeled media link instead of a bare `.mov` URL, the four release-note intros have been normalized back to the live `Click here!` CTA pattern, and browser checks confirmed the `PIG Only` note is also present on the live 24.1 article rather than being a Hugo-only insertion.

### Impact

- Cumulative totals changed to: Pass 128, Needs review 23, Fail 0, High 0, Medium 23, Low 0.
- Batch 3 is now fully cleared at 31 pass and 0 needs-review.
- Batch 4 is now fully cleared at 41 pass and 0 needs-review.
- Batch 8 is now fully cleared at 77 pass and 0 needs-review.
- Batch 9 is now fully cleared at 89 pass and 0 needs-review.
- The global unresolved medium queue now starts at RHI-AUD-090.

### Verification

1. Recomputed the global unresolved medium queue and locked the next 10-row boundary before RHI-AUD-090.
2. Verified that RHI-AUD-028, RHI-AUD-032, RHI-AUD-038, RHI-AUD-078, and RHI-AUD-080 were title-only closures once browser checks confirmed the `POD, Realm, Instances, and Domains` label is visible on both live and local for RHI-AUD-080.
3. Compared live and local render for `it-sure-has-been-quiet-on-this-blog` and confirmed the live page does not expose `fastforward-business-manager-accelerator.mov` as visible body text while the local page did.
4. Replaced the bare `.mov` URL with a labeled markdown link and verified the raw URL no longer appears in the local render.
5. Compared live and local render for the 23.7, 23.9, 24.5, and 24.1 release recap intros using a browser user agent.
6. Confirmed the live WordPress pages use the generic `Click here!` CTA pattern for the previous-release links in all four cases.
7. Confirmed the 23.9 live page already includes the same `Custom SCAPI endpoints in 23.9` and `game-changer` opening framing as the local page, so that row reduced to CTA normalization plus accepted H1 drift.
8. Confirmed the 24.1 live page also surfaces the `PIG Only` note near the DKIM discussion, so that note is not a Hugo-only insertion defect.
9. Normalized the four local release-note intros back to the live `Click here!` CTA pattern and verified the descriptive CTA text no longer appears in the local render.
10. Reconciled the detail tracker to 128 pass / 23 needs-review / 0 fail and confirmed RHI-AUD-090 as the next global queue head.

### Related files

- migration/reports/phase-8-article-fidelity-audit.csv
- migration/reports/phase-8-article-fidelity-audit-summary.csv
- analysis/documentation/phase-8/article-fidelity-audit-2026-03-15.md
- src/content/posts/it-sure-has-been-quiet-on-this-blog/index.md
- src/content/posts/a-deep-dive-into-the-23-7-sfcc-release/index.md
- src/content/posts/a-look-at-the-23-9-commerce-cloud-release/index.md
- src/content/posts/getting-secured-with-the-24-5-salesforce-b2c-commerce-cloud-release/index.md
- src/content/posts/sfcc-24-1-release-a-new-year-update/index.md

## 2026-03-15 Medium Review Addendum: Fourth 10-Row Global Queue Batch

### Change summary

Processed the next 10-row slice from the global unresolved medium queue: RHI-AUD-090, RHI-AUD-091, RHI-AUD-098, RHI-AUD-099, RHI-AUD-100, RHI-AUD-102, RHI-AUD-104, RHI-AUD-105, RHI-AUD-106, and RHI-AUD-109. All ten rows moved to pass.

### Why this changed

This slice initially looked like a mix of title-drift, recap-link drift, and possible intro insertions. Follow-up browser checks and raw WordPress-export checks showed that most of the disputed framing was already present on the live pages, leaving only four recap CTA rewrites and one real media-presentation issue to normalize in source.

### Behavior details

- Old behavior: two architecture rows and one 23.10 release-note row remained blocked on shorter H1 values plus suspected intro framing drift, four release-note recaps used explicit `Read the X release notes!` CTAs instead of the live `Click here!` pattern, the headless recap exposed raw video asset URLs inline, and one SFRA onboarding row still carried a false-positive content-insertions flag.
- New behavior: the title-only rows close under the existing global H1 policy after browser checks confirmed the disputed framing is already present on the live pages, the four release-note intros have been normalized back to the live `Click here!` CTA pattern, the headless recap now renders both hosted videos as labeled links instead of bare URLs, and the SFRA onboarding row closes after confirming the prerequisite framing is on the live page too.

### Impact

- Cumulative totals changed to: Pass 138, Needs review 13, Fail 0, High 0, Medium 13, Low 0.
- Batch 10 is now fully cleared at 101 pass and 0 needs-review.
- Batch 11 is now reduced to 105 pass and 6 needs-review.
- The global unresolved medium queue now starts at RHI-AUD-110.

### Verification

1. Recomputed the global unresolved medium queue and locked the next 10-row boundary beginning at RHI-AUD-090.
2. Compared live and local render for RHI-AUD-090, RHI-AUD-091, RHI-AUD-100, and RHI-AUD-109 using a browser user agent.
3. Confirmed the disputed framing on RHI-AUD-090 and RHI-AUD-091 already appears on the live pages, reducing both rows to accepted title-only closures.
4. Confirmed RHI-AUD-100 already matches the live recap framing and `Click here!` CTA pattern, leaving only the shorter H1 as accepted title drift.
5. Confirmed RHI-AUD-109 already shares the same top-of-article framing line `An attempt at visualising the fallback system` as the live page, reducing it to accepted title-only drift.
6. Compared live, local, and raw WordPress-export evidence for RHI-AUD-098, RHI-AUD-102, RHI-AUD-104, and RHI-AUD-105.
7. Verified all four rows use the live `Click here!` CTA pattern in WordPress and that the supposedly extra explanatory sentences were already present in both live WordPress and the raw export.
8. Normalized those four local release-note intros back to the live CTA pattern and verified the explicit `Read the X release notes!` text no longer appears in the local render.
9. Compared live and local render for RHI-AUD-099 and confirmed the migrated page surfaced raw `storefront-preview-demo.mp4` and `runtime-admin-changes.mov` URLs inline while the live page did not expose them equivalently in body flow.
10. Verified in the raw WordPress export that `runtime-admin-changes.mov` was stored as a hosted video widget, then replaced both bare URLs with labeled links and confirmed the raw asset URLs no longer appear in the local render.
11. Re-checked RHI-AUD-106 with targeted browser snippets and confirmed the disputed prerequisite framing is visible on both live and local pages, collapsing that row to pass.
12. Reconciled the detail tracker to 138 pass / 13 needs-review / 0 fail and confirmed RHI-AUD-110 as the next global queue head.

### Related files

- migration/reports/phase-8-article-fidelity-audit.csv
- migration/reports/phase-8-article-fidelity-audit-summary.csv
- analysis/documentation/phase-8/article-fidelity-audit-2026-03-15.md
- src/content/posts/digging-into-the-b2c-commerce-cloud-24-3-release/index.md
- src/content/posts/new-apis-and-features-for-a-headless-sfcc/index.md
- src/content/posts/salesforce-b2c-commerce-cloud-the-22-7-release/index.md
- src/content/posts/a-look-at-the-sfcc-23-5-release/index.md
- src/content/posts/salesforce-b2c-commerce-the-22-5-release/index.md

## 2026-03-15 Medium Review Addendum: Fifth 10-Row Global Queue Batch

### Change summary

Processed the next 10-row slice from the global unresolved medium queue: RHI-AUD-110, RHI-AUD-113, RHI-AUD-121, RHI-AUD-122, RHI-AUD-125, RHI-AUD-131, RHI-AUD-137, RHI-AUD-139, RHI-AUD-140, and RHI-AUD-141. All ten rows moved to pass.

### Why this changed

This late-stage slice looked like a mix of intro-framing drift, label-presentation drift, and one remaining raw-URL issue. Follow-up browser and raw WordPress-export checks showed that nine rows had already preserved the disputed framing in the original article, leaving only one real source-side presentation fix: a raw YouTube URL exposed inline at the start of the SFCC introduction article.

### Behavior details

- Old behavior: nine rows remained open because shorter Hugo H1 values were coupled with suspected intro or presentation drift, and the SFCC introduction article surfaced a raw YouTube URL inline before the AI-summary block.
- New behavior: the disputed intro and label text for nine rows was verified as already present in live WordPress or the raw export, so those rows reduce to accepted title-only drift under the owner-approved global policy. The SFCC introduction now renders a labeled session-recording link instead of a bare YouTube URL, which removes the remaining real presentation defect in this slice.

### Impact

- Cumulative totals changed to: Pass 148, Needs review 3, Fail 0, High 0, Medium 3, Low 0.
- Batch 11 is now fully cleared at 111 pass and 0 needs-review.
- Batch 12 is now fully cleared at 121 pass and 0 needs-review.
- Batch 13 is now fully cleared at 131 pass and 0 needs-review.
- Batch 14 is now fully cleared at 141 pass and 0 needs-review.
- The global unresolved medium queue now starts at RHI-AUD-143.

### Verification

1. Recomputed the global unresolved medium queue and locked the next 10-row boundary beginning at RHI-AUD-110.
2. Compared live and local render for RHI-AUD-110, RHI-AUD-113, RHI-AUD-121, RHI-AUD-122, RHI-AUD-125, RHI-AUD-131, RHI-AUD-139, RHI-AUD-140, and RHI-AUD-141 using a browser user agent.
3. Confirmed the disputed intro or label framing for those rows already appears on the live pages, including `Salesforce has introduced a solution to meet this demand`, `The Rhino Inquisitor I went all \"Rhino\" up in this place`, `The Official List`, and the original onboarding intros.
4. Confirmed in the raw WordPress export that the same disputed framing is preserved for those rows, including the Elementor alert widget for the AI-career intro and the certification label text.
5. Compared live, local, and raw WordPress-export evidence for RHI-AUD-137.
6. Verified that the original WordPress article already included the `AI Summary` alert and intro summary text, but the migrated markdown exposed a raw `https://www.youtube.com/watch?v=qeyqm19m820` URL inline before that block.
7. Replaced the bare YouTube URL with a labeled markdown link and confirmed the raw URL no longer appears in the local render while `AI Summary` still does.
8. Reconciled the detail tracker to 148 pass / 3 needs-review / 0 fail and confirmed the residual unresolved queue is now only RHI-AUD-143, RHI-AUD-144, and RHI-AUD-151.

### Related files

- migration/reports/phase-8-article-fidelity-audit.csv
- migration/reports/phase-8-article-fidelity-audit-summary.csv
- analysis/documentation/phase-8/article-fidelity-audit-2026-03-15.md
- src/content/posts/sfcc-introduction/index.md

## 2026-03-15 Final Closeout Addendum

### Change summary

Closed the final three unresolved phase-8 article-fidelity rows and moved the tracker from `148 pass / 3 needs-review / 0 fail` to `151 pass / 0 needs-review / 0 fail`.

### Why this changed

The remaining rows were no longer blocked by missing body evidence. They were blocked by classification only: one scaffold-fixture scope exception and two title-only editorial-shortening cases.

### Behavior details

- Old behavior: `RHI-AUD-143` remained open because the local scaffold route had no comparable live WordPress article baseline, and `RHI-AUD-144` plus `RHI-AUD-151` remained open because the Hugo H1 was shorter than the live title even though the body content already aligned.
- New behavior: `RHI-AUD-143` is pass as an accepted non-migration scaffold fixture, while `RHI-AUD-144` and `RHI-AUD-151` are pass under the owner-approved global title policy because live WordPress and the raw WordPress export confirm intact body parity and original long titles.

### Official-source guidance

- Salesforce official docs were not needed for `RHI-AUD-143`, `RHI-AUD-144`, or `RHI-AUD-151` because these rows turn on editorial-baseline evidence, not platform behavior.
- Live WordPress plus the raw WordPress export are sufficient when the unresolved difference is only H1/title wording or when the route is a repository-owned scaffold fixture with no production article baseline.
- Official Salesforce docs are only needed for exception cases where the disputed content is a platform-defined identifier, release-note token, API name, or framework behavior that live WordPress and the raw export cannot disambiguate. The repository already used that exception path earlier when validating SFRA/platform behavior and baseline-sensitive technical identifiers against official SFCC documentation.

### Impact

- The append-only phase-8 tracker is now fully closed with no remaining unresolved rows.
- The final exception pattern is explicit for future fidelity audits: title-only drift can close on WordPress evidence, scaffold fixtures can close on repository scope evidence, and official Salesforce docs are a fallback only for platform-defined technical ambiguity.

### Verification

1. Fetched the live WordPress pages for `/reflecting-on-2-years-of-blogging/`, `/what-skills-do-i-need-as-a-sfcc-architect/`, and `/phase-3-performance-baseline/` and confirmed two long live H1 values plus one live `404 Error` fixture route.
2. Verified the migrated sources keep intact body content for the two editorial rows and explicitly mark `/phase-3-performance-baseline/` with `scaffoldFixture: true`.
3. Verified the raw WordPress export preserves the original WordPress titles `Reflecting on Two Years of Blogging: My Journey in the SFCC Ecosystem` and `What skills do I need as a Salesforce Commerce Cloud Architect?` for the two title-only rows.
4. Verified repository parity tooling already excludes scaffold fixtures from migration-owned content counts, which makes the final fixture closure consistent with existing scope rules.
5. Reconciled the article tracker, summary CSV, and this phase-8 documentation update to the final closed state of `151 pass / 0 needs-review / 0 fail`.

### Related files

- migration/reports/phase-8-article-fidelity-audit.csv
- migration/reports/phase-8-article-fidelity-audit-summary.csv
- analysis/documentation/phase-8/article-fidelity-audit-2026-03-15.md
- src/content/posts/phase-3-performance-baseline/index.md
- src/content/posts/reflecting-on-2-years-of-blogging/index.md
- src/content/posts/what-skills-do-i-need-as-a-sfcc-architect/index.md
- scripts/check-url-parity.js

### Verification

1. Recomputed the global unresolved medium queue and locked the next 10-row boundary before RHI-AUD-028.
2. Verified that eight rows in the slice were title-only medium items with `content_fidelity = pass` and `code_fidelity = pass`, making them eligible for closure under the 2026-03-15 global H1 policy.
3. Compared live and local render for `navigating-dates-calendars-in-sfcc` and confirmed the `Documentation:` note block was local-only.
4. Removed that local-only note block from the migrated markdown and verified the Hugo reading flow no longer surfaces it.
5. Compared live, local, and raw WordPress-export evidence for `unravelling-the-mystery-of-dates-in-the-ocapi`.
6. Verified in `tmp/wordpress-database.sql` that the original WordPress source uses `creation_date`, `valid_from`, `valid_to`, and `to_value`, confirming the spaced local prose variants were a migration defect.
7. Normalized the prose identifiers in the local markdown and verified the broken spaced variants no longer appear in the local render.
8. Reconciled the detail tracker to 118 pass / 33 needs-review / 0 fail and confirmed RHI-AUD-028 as the next global queue head.

### Related files

- migration/reports/phase-8-article-fidelity-audit.csv
- migration/reports/phase-8-article-fidelity-audit-summary.csv
- analysis/documentation/phase-8/article-fidelity-audit-2026-03-15.md
- src/content/posts/navigating-dates-calendars-in-sfcc/index.md
- src/content/posts/unravelling-the-mystery-of-dates-in-the-ocapi/index.md

### Verification

1. Queried live and local render for the full 10-row batch using the actual `article_url` values from the audit CSV.
2. Validated the 24.6 SFTP algorithm names against the official Salesforce Help article `commerce.b2c_rn_service_framework_upgrade`, which confirmed `curve25519-sha256@libssh.org`, `aes128-gcm@openssh.com`, `aes256-gcm@openssh.com`, and the `hmac-*-etm@openssh.com` entries.
3. Normalized the 23.4 release-note concatenated MP4 URLs into separate markdown links.
4. Normalized the Origin Shielding intro note and dotted-host presentation.
5. Replaced the inline `.mov` insertion in the Salesforce Payments article with linked prose.
6. Confirmed the 24.7 WAFv2 explanatory framing is present on both live and local pages, so that row reduces to title-only drift.
7. Replaced raw YouTube URLs in the community-event articles with standard markdown links.
8. Reconciled the detail tracker and summary counts after closing all ten rows.

### Related files

- migration/reports/phase-8-article-fidelity-audit.csv
- migration/reports/phase-8-article-fidelity-audit-summary.csv
- analysis/documentation/phase-8/article-fidelity-audit-2026-03-15.md
- src/content/posts/what-is-new-in-sfcc-24-6/index.md
- src/content/posts/everything-new-in-sfcc-23-4/index.md
- src/content/posts/a-look-back-at-origin-shielding/index.md
- src/content/posts/salesforce-payments-experience-explained/index.md
- src/content/posts/events-and-the-golden-hoodie/index.md
- src/content/posts/community-salesforce-events-and-commerce-cloud/index.md


## 2026-03-15 Medium Review Addendum: Three-Article Slice 4

### Change summary

Processed the next three-article medium-review slice at RHI-AUD-041, RHI-AUD-043, and RHI-AUD-045. All three rows moved to pass after you explicitly approved a global policy accepting shorter H1 rewrites when body and code parity are intact.

### Why this changed

This slice surfaced a repeated owner-intent blocker rather than a technical defect. All three rows re-verified as title-only drift with intact body and code content, so a global title-policy decision was required to avoid burning future slices on identical H1-only questions.

### Behavior details

- Old behavior: RHI-AUD-041, RHI-AUD-043, and RHI-AUD-045 all remained needs-review because their shorter Hugo H1 values were treated as unresolved editorial drift despite intact body/code parity.
- New behavior: Those rows are now pass because the owner-approved global title policy on 2026-03-15 accepts shorter H1 rewrites for title-only medium rows when body and code fidelity remain intact.

### Impact

- Cumulative totals changed to: Pass 92, Needs review 59, Fail 0, High 0, Medium 59, Low 0.
- Batch 4 now has 28 pass and 13 needs-review rows.
- Batch 5 now has 35 pass and 16 needs-review rows.
- The next queue head is RHI-AUD-046.

### Verification

1. Re-fetched live and local `why-circumventing-sfcc-quota-limits-is-a-bad-idea` and confirmed matching body/code content with only the shorter Hugo H1 differing.
2. Re-fetched live and local `caching-rest-apis-in-sfcc` and confirmed matching opening body flow and cache examples with only the shorter Hugo H1 differing.
3. Re-fetched live and local `a-beginners-guide-to-webdav-in-sfcc` and confirmed matching opening body flow and WebDAV guidance with only the shorter Hugo H1 differing.
4. Recorded the owner decision to accept shorter H1 rewrites globally for title-only medium rows.
5. Reconciled the detail tracker and summary counts after moving those three rows to pass under the approved policy.

### Related files

- migration/reports/phase-8-article-fidelity-audit.csv
- migration/reports/phase-8-article-fidelity-audit-summary.csv
- analysis/documentation/phase-8/article-fidelity-audit-2026-03-15.md


## 2026-03-15 Medium Review Addendum: Three-Article Slice 3

### Change summary

Processed the next three-article medium-review slice at RHI-AUD-034, RHI-AUD-036, and RHI-AUD-038. The two release-note rows moved to pass after current live/local verification showed their previously flagged framing/commentary items are already present on the live baseline. The code-compatibility article remains title-only review.

### Why this changed

The next three queued medium rows needed re-verification under the three-article cadence to remove stale release-note insertion findings and keep the remaining backlog focused on genuine unresolved editorial drift.

### Behavior details

- Old behavior: RHI-AUD-034 still treated the 23.2 related-link phrasing and Page Designer image-caption text as Hugo-only additions, and RHI-AUD-036 still treated the migration-tool commentary and Slack feedback note as local-only insertions. RHI-AUD-038 remained title-only review.
- New behavior: RHI-AUD-034 is pass because the caption text is present on both pages and the related-link wording difference is semantically equivalent rather than a migration defect. RHI-AUD-036 is pass because the migration-tool commentary and Slack note are present on both live and local pages. RHI-AUD-038 remains needs-review because only the shorter H1 is unresolved.

### Impact

- Cumulative totals changed to: Pass 89, Needs review 62, Fail 0, High 0, Medium 62, Low 0.
- Batch 4 now has 27 pass and 14 needs-review rows.
- The next queue head is RHI-AUD-041.

### Verification

1. Re-fetched live and local `salesforce-b2c-commerce-cloud-23-2` and confirmed the `Old Page Designer Structure` and `New Page Designer Structure` caption text appears on both pages.
2. Verified the only remaining 23.2 related-link difference is `Click here!` on live versus `Read the 23.1 release notes!` on Hugo, which is a semantically equivalent link-label change rather than a migration-only insertion defect.
3. Re-fetched live and local `salesforce-b2c-commerce-cloud-23-1` and confirmed `I am unable to test this tool out myself` plus `Feel free to poke me on Slack` appear on both pages.
4. Re-fetched live and local `how-to-change-the-code-compatibility-mode-in-salesforce-b2c-commerce-cloud` and confirmed the only remaining variance is the shorter Hugo H1.
5. Reconciled the detail tracker and summary counts after moving only RHI-AUD-034 and RHI-AUD-036 to pass.

### Related files

- migration/reports/phase-8-article-fidelity-audit.csv
- migration/reports/phase-8-article-fidelity-audit-summary.csv
- analysis/documentation/phase-8/article-fidelity-audit-2026-03-15.md
- src/content/posts/unravelling-the-mystery-of-dates-in-the-ocapi/index.md


## 2026-03-15 Correction Addendum: Presentation-Drift Reconciliation

### Change summary

Reclassified five previously marked `pass` rows to `needs-review` and `medium` after independent browser verification showed reader-visible presentation drift in the local article body.

### Why this changed

The earlier audit correctly prioritized token corruption, but a follow-up rendered-page check showed that several longform and editorial rows still surface literal markdown-link syntax or raw media URLs locally where the live article presents linked or embedded media more cleanly.

### Behavior details

- Old behavior: `RHI-AUD-012`, `RHI-AUD-056`, `RHI-AUD-059`, `RHI-AUD-072`, and `RHI-AUD-076` were classified as `pass` and `none`.
- New behavior: those rows are now `needs-review` and `medium` because the article body remains semantically close to live, but the rendered local page introduces visible link or media presentation drift that a reader can see.

### Impact

- Cumulative totals changed to: Pass 60, Needs review 68, Fail 23, High 23, Medium 68, Low 0.
- The severity boundary is unchanged: these rows do not show reproducible copy-paste-breaking token corruption, so they stay below `fail` and `high`.
- Closeout scope is broader than previously stated because residual review now includes raw media-link exposure and literal markdown rendering, not only title shortening and scaffold-fixture handling.

### Verification

1. Re-ran live-vs-local DOM extraction across the full audit set to flag `pass` rows with visible markdown-link syntax, YouTube URLs, or raw media-file URLs in `section.article-body`.
2. Confirmed in browser that the local render for `field-guide-to-custom-caches-in-sfcc` shows `[dw.system.CacheMgr](https://salesforcecommercecloud.github.io/...)` inline while the live page shows linked `dw.system.CacheMgr` text.
3. Confirmed in browser or DOM extraction that `sitegenesis-vs-sfra-vs-pwa`, `everything-new-in-sfcc-23-4`, `events-and-the-golden-hoodie`, and `it-sure-has-been-quiet-on-this-blog` expose raw YouTube or media URLs in visible body flow that are not surfaced the same way on the live site.
4. Reconciled the summary math after the five row reclassifications.

### Related files

- migration/reports/phase-8-article-fidelity-audit.csv
- migration/reports/phase-8-article-fidelity-audit-summary.csv
- analysis/documentation/phase-8/article-fidelity-audit-2026-03-15.md
- src/content/posts/field-guide-to-custom-caches-in-sfcc/index.md


## 2026-03-15 Medium Review Addendum: Three-Article Slice 1

### Change summary

Processed the first three-article medium-review slice at RHI-AUD-021, RHI-AUD-024, and RHI-AUD-025. Only the DIS article moved to pass after repairing the malformed inline parameter formatting. The OCAPI dates article remains baseline-sensitive review, and the request-body article remains title-only review.

### Why this changed

You requested smaller continuation slices of three articles at a time. The safest next step was to take the next three queued medium rows after the 86/65/0 checkpoint and clear only the defect that remained objectively reproducible.

### Behavior details

- Old behavior: RHI-AUD-024 still rendered DIS parameter names like `**scaleWidth**` and `**cropX**` as literal bold-marked tokens in body prose. RHI-AUD-021 still showed mixed prose evidence for spaced identifier variants while code blocks remained intact. RHI-AUD-025 still differed only by a shorter H1.
- New behavior: RHI-AUD-024 now renders the DIS parameter names as clean inline code and is pass. RHI-AUD-021 remains needs-review because the prose-level date-field spacing issue is still mixed and baseline-sensitive. RHI-AUD-025 remains needs-review because only the shortened H1 is unresolved.

### Impact

- Cumulative totals changed to: Pass 87, Needs review 64, Fail 0, High 0, Medium 64, Low 0.
- Batch 3 now has 20 pass and 11 needs-review rows.
- The next queue head is RHI-AUD-026.

### Verification

1. Re-fetched live and local `image-ine-sfcc-dis-for-developers` and confirmed the DIS/eCDN notice appears on both pages.
2. Normalized the malformed DIS parameter tokens in source and verified the Hugo render no longer exposes `**scaleWidth**`, `**scaleHeight**`, `**cropX**`, or related bold-marked parameter text in the explanatory prose.
3. Re-fetched live and local `unravelling-the-mystery-of-dates-in-the-ocapi` and confirmed the row still contains mixed evidence: canonical identifiers remain intact in code examples while spaced variants still appear in prose.
4. Re-fetched live and local `the-request-body-in-an-sfcc-controller` and confirmed the only remaining variance is the shorter Hugo H1.
5. Reconciled the detail tracker and summary counts after moving only RHI-AUD-024 to pass.

### Related files

- migration/reports/phase-8-article-fidelity-audit.csv
- migration/reports/phase-8-article-fidelity-audit-summary.csv
- analysis/documentation/phase-8/article-fidelity-audit-2026-03-15.md
- src/content/posts/image-ine-sfcc-dis-for-developers/index.md


## 2026-03-15 Medium Review Addendum: Three-Article Slice 2

### Change summary

Processed the next three-article medium-review slice at RHI-AUD-026, RHI-AUD-028, and RHI-AUD-032. This slice produced no count change. The multipart-upload row was narrowed to title-only review after current live/local verification showed the previously flagged advisory copy already exists on the live baseline. The createOrders and sending-emails rows remain title-only review items.

### Why this changed

The next three queued medium rows needed re-verification under the new three-article cadence to separate stale content-insertion findings from genuine unresolved editorial-title drift.

### Behavior details

- Old behavior: RHI-AUD-026 still treated the opening multipart-upload advisory sentence as a Hugo-only insertion, alongside a shorter H1. RHI-AUD-028 and RHI-AUD-032 were already tracked as title-only review items.
- New behavior: RHI-AUD-026 now remains needs-review for H1 drift only because the opening advisory copy matches the live article body. RHI-AUD-028 and RHI-AUD-032 remain unchanged as title-only review items.

### Impact

- Cumulative totals remain unchanged at: Pass 87, Needs review 64, Fail 0, High 0, Medium 64, Low 0.
- Batch 3 remains at 20 pass and 11 needs-review rows.
- The next queue head is RHI-AUD-034.

### Verification

1. Re-fetched live and local `submit-multipart-form-data-to-a-third-party-service-in-sfcc` and confirmed the opening multipart-upload advisory copy appears on both pages; only the H1 remains shorter locally.
2. Re-fetched live and local `the-createorders-api-in-sfcc` and confirmed the only remaining variance is the shorter Hugo H1.
3. Re-fetched live and local `sending-emails-from-sfcc` and confirmed the only remaining variance is the shorter Hugo H1.
4. Reconciled the tracker and confirmed this slice produced no status-count delta.

### Related files

- migration/reports/phase-8-article-fidelity-audit.csv
- migration/reports/phase-8-article-fidelity-audit-summary.csv
- analysis/documentation/phase-8/article-fidelity-audit-2026-03-15.md
- src/content/posts/sitegenesis-vs-sfra-vs-pwa/index.md
- src/content/posts/everything-new-in-sfcc-23-4/index.md
- src/content/posts/events-and-the-golden-hoodie/index.md
- src/content/posts/it-sure-has-been-quiet-on-this-blog/index.md


## 2026-03-15 Remediation Addendum: First Resolved Fail Batch

### Change summary

Resolved the first three high-severity article defects in source content and verified the repaired local pages directly against the current live site.

### Why this changed

These rows were the highest-confidence fail cases in the opening tranche: they involved broken code placeholders, a missing ISML declaration, and JSX examples that no longer matched the live instructional content.

### Behavior details

- Old behavior: `RHI-AUD-002`, `RHI-AUD-004`, and `RHI-AUD-005` were tracked as `fail` and `high` because the local articles dropped critical code tokens or changed example semantics.
- New behavior: all three rows are now `pass` and `none` because the local source and rendered pages were repaired to match the live title and code examples on the currently published site.

### Impact

- Cumulative totals changed to: Pass 65, Needs review 68, Fail 18, High 18, Medium 68, Low 0.
- The remaining hard-fail backlog is smaller and more concentrated in unresolved technical-token corruption rather than the first-wave tutorial examples.

### Verification

1. Re-fetched the live and local `how-to-set-up-the-ecdn-in-sfcc-staging` page and confirmed matching H1 plus restored `<tenantID>`, `<client-id>:<client-secret>`, and escaped `domainName` JSON placeholders.
2. Re-fetched the live and local `mail-attachments-in-b2c-commerce-cloud` page and confirmed the first template block now includes the leading `<iscontent type="multipart/mixed; boundary=001a113414f6401b8604f1451630" compact="false" charset="ISO-8859-1">` line.
3. Re-fetched the live and local `guide-to-the-getprops-method-in-sfcc` page and confirmed the restored live title plus the JSX examples `<h1>{name}</h1>` and `<h1>{name ?? 'My fallback'}</h1>`.
4. Reconciled the article tracker and summary rollups after marking the three rows resolved.

### Related files

- migration/reports/phase-8-article-fidelity-audit.csv
- migration/reports/phase-8-article-fidelity-audit-summary.csv
- analysis/documentation/phase-8/article-fidelity-audit-2026-03-15.md
- src/content/posts/how-to-set-up-the-ecdn-in-sfcc-staging/index.md
- src/content/posts/mail-attachments-in-b2c-commerce-cloud/index.md
- src/content/posts/guide-to-the-getprops-method-in-sfcc/index.md


## 2026-03-15 Remediation Addendum: Second Resolved Fail Batch

### Change summary

Resolved two more high-severity article defects in the original first batch and verified the repaired local pages directly against the current live site.

### Why this changed

These rows were straightforward copy-level corruption cases: one malformed naked-domain example and one pair of broken query-string samples. Both could be repaired directly from the live article without ambiguity.

### Behavior details

- Old behavior: `RHI-AUD-011` and `RHI-AUD-013` were tracked as `fail` and `high` because the local articles rendered broken URL examples.
- New behavior: both rows are now `pass` and `none` because the local source and rendered pages now match the live title and technical examples on the published site.

### Impact

- Cumulative totals changed to: Pass 65, Needs review 68, Fail 18, High 18, Medium 68, Low 0.
- Batch 1 now contains no remaining high-severity failures; the unresolved hard-fail queue begins later in the code-heavy backlog.

### Verification

1. Re-fetched the live and local `lets-go-live-ecdn` page and confirmed the restored sentence `With a naked domain we mean https://mybrand.com (without the www).` plus matching `Let’s GO-LIVE: eCDN` H1 punctuation.
2. Re-fetched the live and local `sfcc-url-cracking-the-code` page and confirmed both example URLs now contain `param1=value1&param2=value2`, with the broken `¶m2` form absent locally.
3. Reconciled the article tracker and summary rollups after marking the two rows resolved.

### Related files

- migration/reports/phase-8-article-fidelity-audit.csv
- migration/reports/phase-8-article-fidelity-audit-summary.csv
- analysis/documentation/phase-8/article-fidelity-audit-2026-03-15.md
- src/content/posts/lets-go-live-ecdn/index.md
- src/content/posts/sfcc-url-cracking-the-code/index.md


## 2026-03-15 Remediation Addendum: Third Resolved Fail Batch

### Change summary

Resolved two additional release-note token-corruption rows and verified the repaired local pages against the current live site.

### Why this changed

These rows were both token-level repairs with trustworthy live baselines: one SCAPI error/response-header example and one cartridge heading identifier.

### Behavior details

- Old behavior: `RHI-AUD-051` and `RHI-AUD-055` were tracked as `fail` and `high` because the local articles corrupted reader-visible identifiers in release-note examples.
- New behavior: both rows are now `pass` and `none` because the local source and rendered pages restore the live tokens without introducing further drift.

### Impact

- Cumulative totals changed to: Pass 67, Needs review 68, Fail 16, High 16, Medium 68, Low 0.
- The remaining fail queue is now smaller and more concentrated in content-loss rows and multi-token corruption rather than isolated single-token release-note defects.

### Verification

1. Re-fetched the live and local `getting-to-know-the-sfcc-24-4-release` page and confirmed the restored rogue-query example with `<value>` and `<GroupID>_<Instance>` plus the corrected `sfdc_customization_error` header token.
2. Re-fetched the live and local `salesforce-b2c-commerce-cloud-22-9-release` page and confirmed `link_beecloud_recaptcha (v2022.1.0)` with the broken spaced variant removed locally.
3. Reconciled the article tracker and summary rollups after marking the two rows resolved.

### Related files

- migration/reports/phase-8-article-fidelity-audit.csv
- migration/reports/phase-8-article-fidelity-audit-summary.csv
- analysis/documentation/phase-8/article-fidelity-audit-2026-03-15.md
- src/content/posts/getting-to-know-the-sfcc-24-4-release/index.md
- src/content/posts/salesforce-b2c-commerce-cloud-22-9-release/index.md


## 2026-03-15 Remediation Addendum: Fourth Resolved Fail Batch

### Change summary

Resolved the next three fail/high rows in queue order by restoring one missing storefront script example, one malformed placeholder URL, and one pair of flattened XML/XSD snippets.

### Why this changed

These rows were the next high-confidence fail cases in the code-heavy backlog and all had trustworthy live baselines that allowed direct restoration without owner-policy decisions.

### Behavior details

- Old behavior: `RHI-AUD-027`, `RHI-AUD-029`, and `RHI-AUD-035` were tracked as `fail` and `high` because the local articles either dropped technical examples entirely or rendered placeholder content that was no longer copy-safe.
- New behavior: all three rows are now `pass` and `none` because the local source and rendered pages restore the same technical examples shown on the live site.

### Impact

- Cumulative totals changed to: Pass 70, Needs review 68, Fail 13, High 13, Medium 68, Low 0.
- Batch 3 now has no remaining high-severity failures; the unresolved fail queue resumes later in batch 4 with the remaining XML and ISML content-loss rows.

### Verification

1. Re-fetched the live and local `how-to-extend-active-data-in-salesforce-b2c-commerce-cloud` page and confirmed the restored storefront script example containing `<script type="text/javascript">` and `dw.ac._capture({id: "5024501", type: "detail"});`.
2. Re-fetched the live and local `how-to-set-up-slas-for-the-composable-storefront` page and confirmed the Step 2 sentence now shows `https://{{Short_Code}}.api.commercecloud.salesforce.com/shopper/auth-admin/v1/sso/login`.
3. Re-fetched the live and local `salesforce-b2c-commerce-cloud-22-8` page and confirmed the restored `<xsd:element name="customer-payment-profiles" ...>` block plus the `complexType.CustomerPaymentProfile` block with `account-id`, `account-type`, and `account-customer-id` attributes.
4. Reconciled the article tracker and summary rollups after marking the three rows resolved.

### Related files

- migration/reports/phase-8-article-fidelity-audit.csv
- migration/reports/phase-8-article-fidelity-audit-summary.csv
- analysis/documentation/phase-8/article-fidelity-audit-2026-03-15.md
- src/content/posts/how-to-extend-active-data-in-salesforce-b2c-commerce-cloud/index.md
- src/content/posts/how-to-set-up-slas-for-the-composable-storefront/index.md
- src/content/posts/salesforce-b2c-commerce-cloud-22-8/index.md


## 2026-03-15 Remediation Addendum: Fifth Resolved Fail Batch

### Change summary

Resolved the next two fail/high rows in queue order by restoring the lost local/shared variation-attribute XML examples and the truncated SFRA asset-loading ISML examples.

### Why this changed

These were the remaining batch-4 hard-fail rows after the prior 22.8 XML repair. Both had trustworthy live baselines and were blocked by content loss rather than editorial ambiguity.

### Behavior details

- Old behavior: `RHI-AUD-037` and `RHI-AUD-039` were tracked as `fail` and `high` because the local articles either lost their XML examples almost entirely or kept only an isolated ISML fragment instead of the full instructional snippets.
- New behavior: both rows are now `pass` and `none` because the local source and rendered pages restore the same XML and ISML example families shown on the live site.

### Impact

- Cumulative totals changed to: Pass 72, Needs review 68, Fail 11, High 11, Medium 68, Low 0.
- Batch 4 now has no remaining high-severity failures; the unresolved fail queue begins later in the code-heavy backlog.

### Verification

1. Re-fetched the live and local `local-vs-shared-variation-attributes-sfcc` page and confirmed the restored local XML example beginning with `<?xml version="1.0" encoding="UTF-8"?>` plus the shared example containing `shared-variation-attribute` references and the final `custom-attribute attribute-id="size">18</custom-attribute>` mapping.
2. Re-fetched the live and local `how-to-load-client-side-javascript-and-css-in-sfra` page and confirmed the restored styles loop, `//common/scripts.isml` block, and final `<isdecorate template="common/layout/page">` example.
3. Reconciled the article tracker and summary rollups after marking the two rows resolved.
4. Stopped at the planned checkpoint boundary after `RHI-AUD-039`.

### Related files

- migration/reports/phase-8-article-fidelity-audit.csv
- migration/reports/phase-8-article-fidelity-audit-summary.csv
- analysis/documentation/phase-8/article-fidelity-audit-2026-03-15.md
- src/content/posts/local-vs-shared-variation-attributes-sfcc/index.md
- src/content/posts/how-to-load-client-side-javascript-and-css-in-sfra/index.md


## 2026-03-15 Remediation Addendum: Sixth Resolved Fail Batch

### Change summary

Resolved the first batch-6 fail/high cluster by restoring the cartridge-path examples in the SFCC developer kickstart guide, the 23.8 release-note API identifiers, and the sitemap filename examples in the sitemap guide.

### Why this changed

These three rows shared the same underlying failure mode: escaped underscores and stray spaces made reader-facing technical identifiers unsafe to copy. Two of the three rows also carried a shortened H1 that could be restored directly from the live baseline.

### Behavior details

- Old behavior: `RHI-AUD-052`, `RHI-AUD-058`, and `RHI-AUD-060` were tracked as `fail` and `high` because technical identifiers such as cartridge paths, API attributes, endpoint tokens, and sitemap filenames were corrupted, and the two mixed rows also shortened the live H1.
- New behavior: all three rows are now `pass` and `none` because the local source and rendered pages restore the live technical identifiers, and the mixed rows once again use the live H1 text.

### Impact

- Cumulative totals changed to: Pass 75, Needs review 68, Fail 8, High 8, Medium 68, Low 0.
- Batch 6 now has no remaining high-severity failures; the unresolved fail queue resumes in batch 7 with content-loss and mailto/URL placeholder defects.

### Verification

1. Re-fetched the live and local `kickstart-guide-for-new-sfcc-developers` page and confirmed `app_custom_mybrand:plugin_payment:app_storefront_base`, `app_custom_mybrand`, `app_storefront_base`, and the live H1 `The Kickstart Guide for New Salesforce B2C Commerce Developers`.
2. Re-fetched the live and local `what-is-new-in-the-23-8-commerce-cloud-release` page and confirmed `allow_cookies`, `projects_target_partial_update`, and `/product_inventory_records/{product_id}` in the affected release-note excerpts.
3. Re-fetched the live and local `mastering-sitemaps-in-sfcc` page and confirmed `sitemap_index.xml`, `sitemap_0.xml`, `pwa-custom.xml`, `/sitemap_index.xml`, and the live H1 `Mastering Sitemaps in Salesforce B2C Commerce: A Developer’s Guide`.
4. Fixed and revalidated a Hugo front matter regression caused by the colon in the restored sitemap title before closing the slice.
5. Reconciled the article tracker and summary rollups after marking the three rows resolved.

### Related files

- migration/reports/phase-8-article-fidelity-audit.csv
- migration/reports/phase-8-article-fidelity-audit-summary.csv
- analysis/documentation/phase-8/article-fidelity-audit-2026-03-15.md
- src/content/posts/kickstart-guide-for-new-sfcc-developers/index.md
- src/content/posts/what-is-new-in-the-23-8-commerce-cloud-release/index.md
- src/content/posts/mastering-sitemaps-in-sfcc/index.md


## 2026-03-15 Remediation Addendum: Seventh Resolved Fail Batch

### Change summary

Resolved the next five fail/high rows in queue order by restoring the missing Campaign ERD import snippet, the broken sandbox and community contact emails, the malformed POD placeholder URLs, and the locale fallback identifier examples.

### Why this changed

These rows were the next unresolved hard failures after the batch-6 token-repair checkpoint. They were all reader-facing fidelity defects with trustworthy live or raw-live-html baselines and no owner-policy ambiguity.

### Behavior details

- Old behavior: `RHI-AUD-062`, `RHI-AUD-066`, `RHI-AUD-067`, `RHI-AUD-074`, and `RHI-AUD-094` were tracked as `fail` and `high` because the migrated content either lost technical examples entirely or rendered reader-facing identifiers, URLs, and email examples in broken forms.
- New behavior: all five rows are now `pass` and `none` because the local source and rendered pages restore the live technical snippet families or the decoded live email/URL values needed for readers to copy and understand the examples safely.

### Impact

- Cumulative totals changed to: Pass 80, Needs review 68, Fail 3, High 3, Medium 68, Low 0.
- Batch 7 and batch 8 now have no remaining high-severity failures.
- The remaining fail/high queue now starts at `RHI-AUD-101` and is limited to three late non-code-heavy identifier-corruption rows.

### Verification

1. Re-fetched the live and local `b2c-commerce-cloud-campaign-erd` page and confirmed the restored XSD block beginning with `complexType.StoreGroup` plus the `stores`, `price-books`, `custom-attributes`, and `store-group-id` definitions.
2. Re-fetched the local `how-to-get-a-salesforce-b2c-commerce-cloud-sandbox` page and confirmed the historical struck-through address now renders as `sfcc-b2c-trial@salesforce.com`; live provenance was recovered from the page's Cloudflare-protected email payload.
3. Re-fetched the live and local `the-sfcc-guide-to-finding-pod-numbers` page and confirmed `https://pod185.production.demandware.net/...`, `https://account.demandware.com`, and `https://logcenter-<POD-No><Cylinder>-hippo.demandware.net/logcenter` render without broken placeholders.
4. Re-fetched the local `a-new-commerce-cloud-community-in-town` page and confirmed the speaker-contact address now renders as `thomas.theunen@trailblazercgl.com`; live provenance was recovered from the page's Cloudflare-protected email payload.
5. Re-fetched the live and local `understanding-locale-fallback-in-sfcc` page and confirmed locale tokens such as `en_US`, `fr_FR > FR > Default`, `fr_FR > fr_BE > Default`, `de_DE`, and `en_GB` no longer render in their broken spaced or escaped forms.
6. Reconciled the article tracker and summary rollups after marking the five rows resolved.
7. Stopped at the planned checkpoint boundary before `RHI-AUD-101`.

### Related files

- migration/reports/phase-8-article-fidelity-audit.csv
- migration/reports/phase-8-article-fidelity-audit-summary.csv
- analysis/documentation/phase-8/article-fidelity-audit-2026-03-15.md
- src/content/posts/b2c-commerce-cloud-campaign-erd/index.md
- src/content/posts/how-to-get-a-salesforce-b2c-commerce-cloud-sandbox/index.md
- src/content/posts/the-sfcc-guide-to-finding-pod-numbers/index.md
- src/content/posts/a-new-commerce-cloud-community-in-town/index.md
- src/content/posts/understanding-locale-fallback-in-sfcc/index.md


## 2026-03-15 Remediation Addendum: Final Fail Queue Closure

### Change summary

Resolved the final three fail/high rows in queue order by restoring the broken plugin identifiers in the 23.3 release note, the SLAS grant-type parameters in the 23.6 release note, and the trusted-agent permission plus reorder-plugin identifiers in the October updates article.

### Why this changed

These were the only remaining high-severity defects after the previous remediation checkpoint. All three were reader-facing identifier-corruption issues with clear live baselines and no owner-policy ambiguity.

### Behavior details

- Old behavior: `RHI-AUD-101`, `RHI-AUD-103`, and `RHI-AUD-108` remained `fail` and `high` because release-note identifiers such as plugin names, SLAS grant types, trusted-agent permission names, and reorder-plugin tokens rendered in broken spaced forms that were unsafe to copy.
- New behavior: all three rows are now `pass` and `none` because the local source and rendered pages now match the live identifier forms exactly.

### Impact

- Cumulative totals changed to: Pass 83, Needs review 68, Fail 0, High 0, Medium 68, Low 0.
- The phase-8 fail/high backlog is now fully closed.
- Any future continuation work starts in the medium-severity review backlog only.

### Verification

1. Re-fetched the live and local `salesforce-b2c-commerce-cloud-23-3-release` page and confirmed the README note now renders `plugin_slas` and `plugin_passwordless` without the broken spaced forms.
2. Re-fetched the live and local `a-look-at-the-salesforce-b2c-commerce-cloud-23-6-release` page and confirmed the SLAS excerpt now renders `grant_type=authorization_code` and `grant_type=authorization_code_pkce` without the broken spaced variants.
3. Re-fetched the live and local `salesforce-b2c-commerce-cloud-october-updates` page and confirmed the trusted-agent and cartridge section now renders `Login_On_Behalf`, `Create_Order_On_Behalf`, `plugin_reorder_demo`, and `plugin_commercepayments` without the broken spaced variants.
4. Reconciled the article tracker and summary rollups after marking the three rows resolved.
5. Stopped after `RHI-AUD-108`; no medium-severity rows were changed in this closeout pass.

### Related files

- migration/reports/phase-8-article-fidelity-audit.csv
- migration/reports/phase-8-article-fidelity-audit-summary.csv
- analysis/documentation/phase-8/article-fidelity-audit-2026-03-15.md
- src/content/posts/salesforce-b2c-commerce-cloud-23-3-release/index.md
- src/content/posts/a-look-at-the-salesforce-b2c-commerce-cloud-23-6-release/index.md
- src/content/posts/salesforce-b2c-commerce-cloud-october-updates/index.md


## 2026-03-15 Medium Review Addendum: First Bounded Slice

### Change summary

Processed the first bounded medium-review slice at RHI-AUD-003, RHI-AUD-006, RHI-AUD-007, RHI-AUD-008, and RHI-AUD-010. The 24.2 release row moved to pass after current live/local verification showed the previously flagged Partitioned Cookies callouts on both versions. The hooks, chunk-jobs, and PWA-speed rows were narrowed to title-only owner-review scope where stale medium findings were no longer reproducible.

### Why this changed

With the fail/high backlog closed, the next safest continuation step was to re-verify the earliest medium rows in queue order and separate reproducible migration drift from owner-intent editorial differences.

### Behavior details

- Old behavior: RHI-AUD-003 still carried a migration-only update-note finding, RHI-AUD-006 still carried a formatting-drift finding for `write-function`, RHI-AUD-008 still carried an inline-code-review finding, and RHI-AUD-010 remained needs-review because the release-note callouts were treated as Hugo-only insertions.
- New behavior: RHI-AUD-003 now remains needs-review for H1 drift only because the update note exists live too; RHI-AUD-006 now renders the `write-function` item cleanly and remains needs-review for H1 drift only; RHI-AUD-008 now remains needs-review for H1 drift only because the earlier inline-code concern was not reproduced; RHI-AUD-010 is now pass because the callout text and H1 match live.

### Impact

- Cumulative totals changed to: Pass 84, Needs review 67, Fail 0, High 0, Medium 67, Low 0.
- Batch 1 now has 8 pass and 5 needs-review rows.
- The next queued medium row remains RHI-AUD-012.

### Verification

1. Re-fetched live and local `how-to-use-ocapi-scapi-hooks` and confirmed the July 2025 update note appears on both pages; only the H1 remains materially different.
2. Re-fetched local `mastering-chunk-oriented-job-steps-in-salesforce-b2c-commerce-cloud`, normalized the malformed `write-function` list item in source, and confirmed the rendered list now reads cleanly.
3. Re-fetched live and local `lag-to-riches-a-pwa-kit-developers-guide` and confirmed the earlier inline-code concern was not reproduced in the current rendered comparison; only the H1 remains shorter locally.
4. Re-fetched live and local `a-look-at-the-salesforce-b2c-commerce-cloud-24-2-release` and confirmed the `On By Default` and `Affects Hybrid Deployments` callouts plus the H1 match the live article.
5. Reconciled the detail tracker and summary counts after moving only RHI-AUD-010 to pass.

### Related files

- migration/reports/phase-8-article-fidelity-audit.csv
- migration/reports/phase-8-article-fidelity-audit-summary.csv
- analysis/documentation/phase-8/article-fidelity-audit-2026-03-15.md
- src/content/posts/mastering-chunk-oriented-job-steps-in-salesforce-b2c-commerce-cloud/index.md


## 2026-03-15 Medium Review Addendum: Second Bounded Slice

### Change summary

Processed the next bounded medium-review slice at RHI-AUD-012, RHI-AUD-014, RHI-AUD-016, RHI-AUD-017, and RHI-AUD-019. The custom-caches article moved to pass after repairing a literal markdown-link rendering defect, and the custom-OCAPI article moved to pass after current live/local verification showed the deprecation warning and caution text are already present on both versions. The Node 18 row was narrowed to title-only review because the previously flagged compatibility note is also present live.

### Why this changed

With the first medium slice reconciled, the next safest continuation step was to process the next five rows in queue order and clear any stale medium findings that were no longer reproducible as migration-only drift.

### Behavior details

- Old behavior: RHI-AUD-012 still exposed literal markdown-link syntax for `dw.system.CacheMgr`; RHI-AUD-019 still treated the deprecation warning as a Hugo-only insertion; RHI-AUD-017 still treated the SFRA 6.2.0 compatibility note as local-only inserted framing.
- New behavior: RHI-AUD-012 now renders the `dw.system.CacheMgr` reference as a normal link and is pass; RHI-AUD-019 is pass because the deprecation warning and caution text exist on both live and local pages; RHI-AUD-017 remains needs-review for H1 drift only because the compatibility note exists live too.

### Impact

- Cumulative totals changed to: Pass 86, Needs review 65, Fail 0, High 0, Medium 65, Low 0.
- Batch 1 now has 9 pass and 4 needs-review rows.
- Batch 2 now has 15 pass and 8 needs-review rows.
- The next queued medium row remains RHI-AUD-021.

### Verification

1. Re-fetched live and local `field-guide-to-custom-caches-in-sfcc`, fixed the raw markdown-link rendering in source, and confirmed the `dw.system.CacheMgr` reference now renders as a normal link on the Hugo page.
2. Re-fetched live and local `creating-custom-ocapi-endpoints` and confirmed the same top-of-article `Deprecated` warning and `Warning!` caution text are present on both pages, so the prior content-insertion finding was stale.
3. Re-fetched live and local `how-to-use-node-18-with-sfra` and confirmed the `SFRA versions prior to 6.2.0` guidance exists on both pages; only the shorter H1 remains as review scope.
4. Re-verified `navigating-dates-calendars-in-sfcc` and `an-overview-of-sfcc-global-functions` remain title-only review items with no new migration-only defects reproduced.
5. Reconciled the detail tracker and summary counts after moving only RHI-AUD-012 and RHI-AUD-019 to pass.

### Related files

- migration/reports/phase-8-article-fidelity-audit.csv
- migration/reports/phase-8-article-fidelity-audit-summary.csv
- analysis/documentation/phase-8/article-fidelity-audit-2026-03-15.md
- src/content/posts/field-guide-to-custom-caches-in-sfcc/index.md
