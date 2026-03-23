# Article Fidelity Audit Summary - 2026-03-23 (Restart)

## Audit Scope

- Date: 2026-03-23
- Comparison: live `https://www.rhino-inquisitor.com` vs local `http://localhost:1313`
- Method: manual side-by-side browser audit only
- Target universe: 150 local article routes under `src/content/posts/`
- Batch sizing: fixed 10-route batches for this restart
- This run is independent of prior March 22 and March 23 audit artifacts
- Expected non-blocking drift: H1 copy changes, URL or breadcrumb presentation drift, and additive local modules such as key takeaways, TOC blocks, related content, and figure captions when body fidelity is intact

## Audit Method

Each route in this restart is reviewed manually in live and local browser tabs using the same decision rules:

1. Both routes load and render a readable article body.
2. Reader-facing text fidelity is intact with no missing core sections or paragraphs.
3. Heading structure remains coherent even when local adds TOC support.
4. Code examples remain present and readable on technical routes.
5. Media remains present and useful where the article depends on it.
6. Link spot-checks are performed where a section depends on key references.
7. Only confirmed reader-facing regressions move a row to `HOLD` or `FAIL`.

## Batch 1 Results (10/10)

| Audit ID | Article URL | H1 drift | Code integrity | Status |
|---|---|---|---|---|
| BATCH-1-001 | `/20-years-of-dreamforce/` | SAME | NO-CODE | PASS |
| BATCH-1-002 | `/a-beginners-guide-to-webdav-in-sfcc/` | CHANGED (expected) | INTACT | PASS |
| BATCH-1-003 | `/a-deep-dive-into-the-23-7-sfcc-release/` | SAME | INTACT | PASS |
| BATCH-1-004 | `/a-dev-guide-to-combating-fraud-on-sfcc/` | CHANGED (expected) | INTACT | PASS |
| BATCH-1-005 | `/a-look-at-the-23-9-commerce-cloud-release/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-1-006 | `/a-look-at-the-salesforce-b2c-commerce-cloud-23-6-release/` | SAME | NO-CODE | PASS |
| BATCH-1-007 | `/a-look-at-the-salesforce-b2c-commerce-cloud-24-2-release/` | SAME | INTACT | PASS |
| BATCH-1-008 | `/a-look-at-the-sfcc-23-5-release/` | SAME | NO-CODE | PASS |
| BATCH-1-009 | `/a-look-back-at-origin-shielding/` | SAME | NO-CODE | PASS |
| BATCH-1-010 | `/a-new-commerce-cloud-community-in-town/` | SAME | NO-CODE | PASS |

## Batch 1 Findings

- No critical, high, or medium reader-facing regressions were found in the restart batch.
- The dominant pattern was expected modernization drift: condensed H1 copy on a minority of routes plus additive local key takeaways, TOC blocks, and figure captions.
- Technical routes in this batch preserved their meaningful examples and configuration details. The WebDAV guide, the 23.7 release article, the fraud article, and the 24.2 release article all retained the technical substance needed to follow the content.
- Older live articles sometimes render alerts, captions, or figure wrappers differently than local, but in this batch those differences did not remove meaning or break the reading flow.

## Batch 2 Results (10/10)

| Audit ID | Article URL | H1 drift | Code integrity | Status |
|---|---|---|---|---|
| BATCH-2-001 | `/a-new-day-for-commerce-recap/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-2-002 | `/a-survival-guide-to-sfcc-platform-limits/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-2-003 | `/ai-as-an-architect-and-content-creator/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-2-004 | `/ai-automation-to-augmentation-at-work/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-2-005 | `/ai-einstein-in-salesforce-b2c-commerce-cloud/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-2-006 | `/ai-wont-steal-your-sfcc-job-but-a-developer-using-ai-will/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-2-007 | `/an-overview-of-sfcc-global-functions/` | CHANGED (expected) | INTACT | PASS |
| BATCH-2-008 | `/b2c-commerce-cloud-campaign-erd/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-2-009 | `/b2c-commerce-whats-new-in-22-4/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-2-010 | `/b2c-commerce-whats-new-in-the-22-3-release/` | CHANGED (expected) | NO-CODE | PASS |

## Batch 2 Findings

- No critical, high, or medium reader-facing regressions were found in Batch 2.
- This slice is dominated by expected headline normalization on local, not body-content loss.
- The only code-bearing route in this batch, `/an-overview-of-sfcc-global-functions/`, retained readable and materially intact examples.
- Diagram- and release-note-heavy routes in this slice remained structurally sound, with additive local modules and normalized chrome not affecting article comprehension.

## Batch 3 Results (10/10)

| Audit ID | Article URL | H1 drift | Code integrity | Status |
|---|---|---|---|---|
| BATCH-3-001 | `/caching-in-the-sfcc-composable-storefront/` | SAME | INTACT | PASS |
| BATCH-3-002 | `/caching-rest-apis-in-sfcc/` | CHANGED (expected) | INTACT | PASS |
| BATCH-3-003 | `/certifications-for-salesforce-b2c-commerce-cloud/` | SAME | NO-CODE | PASS |
| BATCH-3-004 | `/chasing-clouds-catching-up-with-the-commercecrew-at-dreamforce-2023/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-3-005 | `/commerce-cloud-t-shirts-on-shirtforce/` | SAME | NO-CODE | PASS |
| BATCH-3-006 | `/community-salesforce-events-and-commerce-cloud/` | SAME | NO-CODE | PASS |
| BATCH-3-007 | `/creating-custom-ocapi-endpoints/` | SAME | INTACT | PASS |
| BATCH-3-008 | `/custom-preferences-in-sfcc/` | CHANGED (expected) | INTACT | PASS |
| BATCH-3-009 | `/custom-ttf-fonts-in-pdf-for-sfcc/` | SAME | INTACT | PASS |
| BATCH-3-010 | `/delta-exports-in-salesforce-b2c-commerce-cloud/` | SAME | NO-CODE | PASS |

## Batch 3 Findings

- No critical, high, or medium reader-facing regressions were found in Batch 3.
- Code-heavy routes in this slice preserved their meaningful guidance and reviewed snippets, including the composable caching article, REST API caching article, custom OCAPI endpoint walkthrough, custom preferences article, and PDF font article.
- Community and event routes remained structurally intact. The community-events article includes additive local session-recording links for several event entries, which improves utility without changing the underlying article meaning.
- H1 drift was limited to expected normalization on a minority of routes and did not correlate with body-content loss.

## Batch 4 Results (10/10)

| Audit ID | Article URL | H1 drift | Code integrity | Status |
|---|---|---|---|---|
| BATCH-4-001 | `/digging-into-the-b2c-commerce-cloud-24-3-release/` | SAME | NO-CODE | PASS |
| BATCH-4-002 | `/events-and-the-golden-hoodie/` | SAME | NO-CODE | PASS |
| BATCH-4-003 | `/everything-new-in-sfcc-23-4/` | SAME | NO-CODE | PASS |
| BATCH-4-004 | `/fetching-data-in-a-locale-with-sfcc/` | CHANGED (expected) | INTACT | PASS |
| BATCH-4-005 | `/field-guide-to-custom-caches-in-sfcc/` | SAME | INTACT | PASS |
| BATCH-4-006 | `/get-connected-at-salesforce-connections-2022/` | SAME | NO-CODE | PASS |
| BATCH-4-007 | `/getting-secured-with-the-24-5-salesforce-b2c-commerce-cloud-release/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-4-008 | `/getting-to-know-sfra-as-a-developer/` | SAME | NO-CODE | PASS |
| BATCH-4-009 | `/getting-to-know-the-sfcc-24-4-release/` | SAME | INTACT | PASS |
| BATCH-4-010 | `/guide-to-the-getprops-method-in-sfcc/` | SAME | INTACT | PASS |

## Batch 4 Findings

- No critical, high, or medium reader-facing regressions were found in Batch 4.
- Technical routes in this slice preserved their meaningful code and implementation guidance, especially the locale article, custom cache field guide, 24.4 release article, and getProps walkthrough.
- Event and community routes remained intact. The Golden Hoodie route includes additive local recording links that improve utility without changing reader meaning.
- H1 drift was limited to expected normalization on two routes and did not correlate with body-content loss.

## Batch 5 Results (10/10)

| Audit ID | Article URL | H1 drift | Code integrity | Status |
|---|---|---|---|---|
| BATCH-5-001 | `/helpful-salesforce-b2c-commerce-cloud-cartridges/` | SAME | NO-CODE | PASS |
| BATCH-5-002 | `/helpful-salesforce-b2c-commerce-cloud-cli-tools/` | SAME | NO-CODE | PASS |
| BATCH-5-003 | `/how-to-change-the-code-compatibility-mode-in-salesforce-b2c-commerce-cloud/` | CHANGED (expected) | INTACT | PASS |
| BATCH-5-004 | `/how-to-extend-active-data-in-salesforce-b2c-commerce-cloud/` | SAME | INTACT | PASS |
| BATCH-5-005 | `/how-to-filter-jsdoc-in-storybook-autodocs/` | SAME | INTACT | PASS |
| BATCH-5-006 | `/how-to-get-a-salesforce-b2c-commerce-cloud-sandbox/` | SAME | NO-CODE | PASS |
| BATCH-5-007 | `/how-to-get-salesforce-certification-vouchers/` | SAME | NO-CODE | PASS |
| BATCH-5-008 | `/how-to-load-client-side-javascript-and-css-in-sfra/` | SAME | INTACT | PASS |
| BATCH-5-009 | `/how-to-set-up-slas-for-the-composable-storefront/` | SAME | INTACT | PASS |
| BATCH-5-010 | `/how-to-set-up-the-ecdn-in-sfcc-staging/` | SAME | INTACT | PASS |

## Batch 5 Findings

- No critical, high, or medium reader-facing regressions were found in Batch 5.
- The five technical walkthroughs in this slice preserved their reviewed code and setup guidance, including compatibility mode, Active Data, Storybook autodocs, SFRA asset loading, SLAS setup, and the legacy eCDN staging flow.
- Resource and guidance routes remained structurally intact, with repository links, scenario explanations, and image-backed sections preserved.
- H1 drift was limited to expected normalization on the compatibility-mode route and did not correlate with body-content loss.

## Batch 6 Results (10/10)

| Audit ID | Article URL | H1 drift | Code integrity | Status |
|---|---|---|---|---|
| BATCH-6-001 | `/how-to-setup-oauth-jwt-for-the-ocapi/` | SAME | INTACT | PASS |
| BATCH-6-002 | `/how-to-use-node-18-with-sfra/` | CHANGED (expected) | INTACT | PASS |
| BATCH-6-003 | `/how-to-use-ocapi-scapi-hooks/` | CHANGED (expected) | INTACT | PASS |
| BATCH-6-004 | `/image-ine-sfcc-dis-for-developers/` | SAME | INTACT | PASS |
| BATCH-6-005 | `/in-the-ring-ocapi-versus-scapi/` | SAME | NO-CODE | PASS |
| BATCH-6-006 | `/is-salesforce-certification-worth-it/` | SAME | NO-CODE | PASS |
| BATCH-6-007 | `/it-sure-has-been-quiet-on-this-blog/` | SAME | NO-CODE | PASS |
| BATCH-6-008 | `/kickstart-guide-for-new-sfcc-developers/` | SAME | NO-CODE | PASS |
| BATCH-6-009 | `/lag-to-riches-a-pwa-kit-developers-guide/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-6-010 | `/lets-go-live-customer-migration/` | SAME | NO-CODE | PASS |

## Batch 6 Findings

- No critical, high, or medium reader-facing regressions were found in Batch 6.
- The most complex technical routes in this slice preserved their reviewed code and setup guidance, including OAuth JWT, Node 18 with SFRA, and the OCAPI/SCAPI hooks deep dive.
- Image-sensitive and long-form guidance routes remained intact, including the DIS article, the storefront-speed guide, and the kickstart guide for new SFCC developers.
- H1 drift was limited to expected normalization on three routes and did not correlate with body-content loss.

## Batch 7 Results (10/10)

| Audit ID | Article URL | H1 drift | Code integrity | Status |
|---|---|---|---|---|
| BATCH-7-001 | `/lets-go-live-ecdn/` | SAME | INTACT | PASS |
| BATCH-7-002 | `/lets-go-live-seo/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-7-003 | `/leveraging-generic-mappings-in-sfcc/` | SAME | INTACT | PASS |
| BATCH-7-004 | `/life-is-about-choices/` | SAME | NO-CODE | PASS |
| BATCH-7-005 | `/local-vs-shared-variation-attributes-sfcc/` | SAME | INTACT | PASS |
| BATCH-7-006 | `/mail-attachments-in-b2c-commerce-cloud/` | SAME | INTACT | PASS |
| BATCH-7-007 | `/mastering-chunk-oriented-job-steps-in-salesforce-b2c-commerce-cloud/` | CHANGED (expected) | INTACT | PASS |
| BATCH-7-008 | `/mastering-sitemaps-in-sfcc/` | SAME | NO-CODE | PASS |
| BATCH-7-009 | `/migrate-magento-passwords-using-argon2/` | SAME | INTACT | PASS |
| BATCH-7-010 | `/navigating-dates-calendars-in-sfcc/` | CHANGED (expected) | INTACT | PASS |

## Batch 7 Findings

- The earlier local code-sample regression on `/mail-attachments-in-b2c-commerce-cloud/` has been remediated and rechecked; Batch 7 is now fully passing.
- The batch preserved the most technical routes in this slice, including the generic-mapping walkthrough, the variation-attribute XML article, the Argon2 migration script article, and the long-form dates/calendar/timezone guide.
- H1 drift was limited to expected normalization or shortening on three routes and did not correlate with body-content loss.

## Batch 8 Results (10/10)

| Audit ID | Article URL | H1 drift | Code integrity | Status |
|---|---|---|---|---|
| BATCH-8-001 | `/new-apis-and-features-for-a-headless-sfcc/` | SAME | NO-CODE | PASS |
| BATCH-8-002 | `/non-technical-sfcc-certifications/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-8-003 | `/office-hours-for-salesforce-b2c-commerce-cloud/` | SAME | NO-CODE | PASS |
| BATCH-8-004 | `/pdf-and-salesforce-commerce-cloud-b2c/` | SAME | NO-CODE | PASS |
| BATCH-8-005 | `/podcasts-for-salesforce-b2c-commerce-cloud/` | SAME | NO-CODE | PASS |
| BATCH-8-006 | `/preparing-for-the-b2c-commerce-developer-certification/` | SAME | NO-CODE | PASS |
| BATCH-8-007 | `/real-time-inventory-checks-in-sfcc/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-8-008 | `/reflecting-on-2-years-of-blogging/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-8-009 | `/salesforce-b2c-commerce-cloud-22-10/` | SAME | INTACT | PASS |
| BATCH-8-010 | `/salesforce-b2c-commerce-cloud-22-8/` | SAME | INTACT | PASS |

## Batch 8 Findings

- No critical, high, or medium reader-facing regressions were found in Batch 8.
- The slice held across both technical and editorial content, including headless architecture coverage, certification guidance, release-note pages, and community roundup articles.
- Code-bearing release-note routes remained intact, including the 22.10 and 22.8 articles with readable inline examples and XML/API snippets on local.
- H1 drift was limited to expected normalization or shortening on three routes and did not correlate with body-content loss.

## Batch 9 Results (10/10)

| Audit ID | Article URL | H1 drift | Code integrity | Status |
|---|---|---|---|---|
| BATCH-9-001 | `/salesforce-b2c-commerce-cloud-22-9-release/` | SAME | NO-CODE | PASS |
| BATCH-9-002 | `/salesforce-b2c-commerce-cloud-23-1/` | SAME | INTACT | PASS |
| BATCH-9-003 | `/salesforce-b2c-commerce-cloud-23-10-release-a-comprehensive-overview/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-9-004 | `/salesforce-b2c-commerce-cloud-23-2/` | SAME | NO-CODE | PASS |
| BATCH-9-005 | `/salesforce-b2c-commerce-cloud-23-3-release/` | SAME | NO-CODE | PASS |
| BATCH-9-006 | `/salesforce-b2c-commerce-cloud-catalog-erd/` | SAME | NO-CODE | PASS |
| BATCH-9-007 | `/salesforce-b2c-commerce-cloud-content-erd/` | SAME | NO-CODE | PASS |
| BATCH-9-008 | `/salesforce-b2c-commerce-cloud-customer-erd/` | SAME | NO-CODE | PASS |
| BATCH-9-009 | `/salesforce-b2c-commerce-cloud-documentation/` | SAME | NO-CODE | PASS |
| BATCH-9-010 | `/salesforce-b2c-commerce-cloud-governance-and-quotas/` | SAME | INTACT | PASS |

## Batch 9 Findings

- No critical, high, or medium reader-facing regressions were found in Batch 9.
- The release-note half of the slice held across both prose-led and technical content, including intact URL/API examples in the 23.1 article and preserved quota- and SCAPI-oriented details in the 23.2, 23.3, and 23.10 articles.
- The ERD/reference half also held: the catalog, content, and customer diagrams all rendered locally, and the documentation field guide preserved its relocation map, resource taxonomy, and long-form strategic guidance.
- The governance-and-quotas article retained all extracted log and JavaScript code snippets on local, closing the slice without any repeat of the earlier Batch 7 code-sample regression.
- H1 drift was limited to the expected shortened local title on the 23.10 release article and did not correlate with body-content loss.

## Batch 10 Results (10/10)

| Audit ID | Article URL | H1 drift | Code integrity | Status |
|---|---|---|---|---|
| BATCH-10-001 | `/salesforce-b2c-commerce-cloud-november-2022-updates/` | SAME | NO-CODE | PASS |
| BATCH-10-002 | `/salesforce-b2c-commerce-cloud-october-updates/` | SAME | INTACT | PASS |
| BATCH-10-003 | `/salesforce-b2c-commerce-cloud-the-22-7-release/` | SAME | INTACT | PASS |
| BATCH-10-004 | `/salesforce-b2c-commerce-the-22-5-release/` | SAME | NO-CODE | PASS |
| BATCH-10-005 | `/salesforce-b2c-commerce-the-22-6-release/` | SAME | INTACT | PASS |
| BATCH-10-006 | `/salesforce-commerce-cloud-products/` | SAME | NO-CODE | PASS |
| BATCH-10-007 | `/salesforce-connections-2024-and-sfcc/` | SAME | NO-CODE | PASS |
| BATCH-10-008 | `/salesforce-payments-experience-explained/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-10-009 | `/secure-coding-in-salesforce-b2c-commerce-cloud/` | SAME | INTACT | PASS |
| BATCH-10-010 | `/sending-emails-from-sfcc/` | CHANGED (expected) | INTACT | PASS |

## Batch 10 Findings

- No critical, high, or medium reader-facing regressions were found in Batch 10.
- The technical pages held cleanly: the secure-coding article retained its SFRA header-config sample, the email article preserved both mail-sending snippets and the test-endpoint example, and the older release-note pages kept their technical identifiers and API-oriented guidance readable on local.
- The release-note cluster for October 2022, November 2022, 22.5, 22.6, and 22.7 remained intact across both hosts, including the trusted-agent permissions, Rhino Engine feature names, Einstein dashboard sections, OCAPI access-key notes, and SCAPI/SLAS coverage.
- The narrative and portfolio routes also held: the Commerce Cloud products overview, Connections 2024 agenda guide, and Salesforce Payments explainer all preserved their reader-facing structure and supporting references.
- H1 drift was limited to the expected local shortening on the Salesforce Payments explainer and the sending-emails article and did not correlate with body-content loss.

## Batch 11 Results (10/10)

| Audit ID | Article URL | H1 drift | Code integrity | Status |
|---|---|---|---|---|
| BATCH-11-001 | `/server-side-performance-in-sfcc/` | CHANGED (expected) | INTACT | PASS |
| BATCH-11-002 | `/sfcc-24-1-release-a-new-year-update/` | SAME | NO-CODE | PASS |
| BATCH-11-003 | `/sfcc-basket-order-erd/` | SAME | NO-CODE | PASS |
| BATCH-11-004 | `/sfcc-introduction/` | CHANGED (expected) | INTACT | PASS |
| BATCH-11-005 | `/sfcc-url-cracking-the-code/` | SAME | INTACT | PASS |
| BATCH-11-006 | `/should-i-get-javascript-developer-i-certified/` | SAME | NO-CODE | PASS |
| BATCH-11-007 | `/should-i-use-sfra-rest-endpoints-in-a-composable-storefront/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-11-008 | `/simplifying-the-salesforce-order-of-execution/` | SAME | NO-CODE | PASS |
| BATCH-11-009 | `/sitegenesis-vs-sfra-vs-pwa/` | SAME | NO-CODE | PASS |
| BATCH-11-010 | `/slas-in-sfra-or-sitegenesis/` | CHANGED (expected) | INTACT | PASS |

## Batch 11 Findings

- No critical, high, or medium reader-facing regressions were found in Batch 11.
- The architecture-heavy routes stayed intact: the SiteGenesis/SFRA/PWA comparison, the SFRA REST endpoint guidance, and the newer SLAS session-sync article all preserved their argument structure, platform trade-offs, and integration terminology across both hosts.
- The technical-reference routes also held: the URL article retained its SFRA/PWA code examples, the performance article preserved its profiler and caching walkthroughs, and the B2C introduction article kept its local setup command and API overview readable on local.
- The ERD and certification content remained stable, including the basket-order diagram and draw.io link, the JavaScript certification prep/resource sections, and the simplified order-of-execution diagram plus retirement caveats.
- H1 drift was limited to expected local shortening on the performance, introduction, composable-endpoints, and SLAS session-sync articles and did not correlate with body-content loss.

## Batch 12 Results (10/10)

| Audit ID | Article URL | H1 drift | Code integrity | Status |
|---|---|---|---|---|
| BATCH-12-001 | `/slicing-versus-variation-groups-in-sfcc/` | SAME | NO-CODE | PASS |
| BATCH-12-002 | `/storefront-protection-in-the-pwa-kit/` | SAME | NO-CODE | PASS |
| BATCH-12-003 | `/submit-multipart-form-data-to-a-third-party-service-in-sfcc/` | CHANGED (expected) | INTACT | PASS |
| BATCH-12-004 | `/submitting-a-file-to-a-third-party-service-in-sfcc/` | SAME | INTACT | PASS |
| BATCH-12-005 | `/taming-the-beast-a-developers-deep-dive-into-sfcc-meta-tag-rules/` | CHANGED (expected) | INTACT | PASS |
| BATCH-12-006 | `/the-attribute-fallback-system-in-sfcc/` | CHANGED (expected) | INTACT | PASS |
| BATCH-12-007 | `/the-b2c-commerce-architect-certification/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-12-008 | `/the-createorders-api-in-sfcc/` | CHANGED (expected) | INTACT | PASS |
| BATCH-12-009 | `/the-deprecation-of-the-uuid-token-for-api-clients/` | SAME | INTACT | PASS |
| BATCH-12-010 | `/the-importance-of-origin-shielding/` | CHANGED (expected) | NO-CODE | PASS |

## Batch 12 Findings

- No critical, high, or medium reader-facing regressions remain open in Batch 12.
- The earlier CreateOrders token regression has been remediated and rechecked: localhost now renders the custom shopper scope exactly as `sfcc.ts_ext_on_behalf_of`, matching live and restoring copy-safe authentication guidance.
- The remaining technical routes held: both file-upload articles preserved their LocalServiceRegistry examples, the UUID-token article kept its token-response and JWT payload examples intact, and the meta-tag-rules article preserved its DSL, syntax, and inheritance guidance.
- The non-code and architecture routes also remained stable, including the slicing-versus-variation-groups comparison, storefront-protection guidance, attribute-fallback explanation, architect-certification prep guide, and origin-shielding operational checklist.
- H1 drift in this batch was limited to expected local shortening on the multipart upload, meta-tag rules, attribute fallback, architect certification, CreateOrders, and origin-shielding articles.

## Current Totals (Restart Batches 1-12)

- Rows completed: `120`
- Remaining routes: `30`
- PASS: `120`
- HOLD: `0`
- FAIL: `0`
- Critical issues: `0`
- High issues: `0`
- Medium issues: `0`
- Low issues: `0`

## Batch 13 Results (10/10)

| Audit ID | Article URL | H1 drift | Code integrity | Status |
|---|---|---|---|---|
| BATCH-13-001 | `/the-journey-from-developer-to-architect/` | SAME | NO-CODE | PASS |
| BATCH-13-002 | `/the-latest-in-sfcc-version-24-7/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-13-003 | `/the-move-from-on-site-to-remote/` | SAME | NO-CODE | PASS |
| BATCH-13-004 | `/the-move-from-sitegenesis-and-sfra-to-the-composable-storefront-as-a-developer/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-13-005 | `/the-realm-split-field-guide-to-migrating-an-sfcc-site/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-13-006 | `/the-request-body-in-an-sfcc-controller/` | CHANGED (expected) | INTACT | PASS |
| BATCH-13-007 | `/the-salesforce-b2c-commerce-cloud-environment/` | SAME | NO-CODE | PASS |
| BATCH-13-008 | `/the-sfcc-guide-to-finding-pod-numbers/` | SAME | NO-CODE | PASS |
| BATCH-13-009 | `/the-state-of-ohana-for-salesforce-commerce-cloud/` | SAME | NO-CODE | PASS |
| BATCH-13-010 | `/the-sunsetting-of-arc300-architect-b2c-commerce-solutions/` | SAME | NO-CODE | PASS |

## Batch 13 Findings

- No critical, high, or medium reader-facing regressions were found in Batch 13.
- The technical and architecture-heavy routes held cleanly: the request-body controller article preserved all key examples, the realm-split guide kept its phased migration blueprint and checklist table readable, and the SFCC environment article retained its diagrams and layered-environment explanation.
- The release and platform-transition content also remained intact, including the 24.7 release notes article, the SiteGenesis/SFRA to composable storefront transition guide, and the POD-number explainer with its UI methods and Hyperforce context.
- The narrative and community routes held without reader-facing loss: the developer-to-architect article, the on-site-to-remote reflection, the Ohana community retrospective, and the ARC300 sunset article all preserved their argument structure and supporting references.
- H1 drift was limited to expected local shortening on the 24.7 release, composable storefront transition, realm split, and request-body articles and did not correlate with body-content loss.

## Current Totals (Restart Batches 1-13)

- Rows completed: `130`
- Remaining routes: `20`
- PASS: `130`
- HOLD: `0`
- FAIL: `0`
- Critical issues: `0`
- High issues: `0`
- Medium issues: `0`
- Low issues: `0`

## Batch 14 Results (10/10)

| Audit ID | Article URL | H1 drift | Code integrity | Status |
|---|---|---|---|---|
| BATCH-14-001 | `/third-party-api-caching-in-commerce-cloud/` | SAME | INTACT | PASS |
| BATCH-14-002 | `/three-things-to-secure-sfcc/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-14-003 | `/trailblazerdx-2022-for-b2c-commerce/` | SAME | NO-CODE | PASS |
| BATCH-14-004 | `/understanding-locale-fallback-in-sfcc/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-14-005 | `/understanding-sfcc-instances/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-14-006 | `/unravelling-the-mystery-of-dates-in-the-ocapi/` | SAME | INTACT | PASS |
| BATCH-14-007 | `/what-can-i-use-chatgpt-for-when-working-with-salesforce/` | SAME | INTACT | PASS |
| BATCH-14-008 | `/what-does-the-composable-storefront-mean-for-sfcc-developers/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-14-009 | `/what-is-commerce-on-core/` | SAME | NO-CODE | PASS |
| BATCH-14-010 | `/what-is-new-in-sfcc-24-6/` | SAME | NO-CODE | PASS |

## Batch 14 Findings

- No critical, high, or medium reader-facing regressions were found in Batch 14.
- The technical routes held cleanly: the third-party API caching article preserved its LocalServiceRegistry example and caveats, the OCAPI dates article kept its query examples copy-safe, and the ChatGPT article retained its screenshots, warning flow, and prompt example.
- The architecture and platform-guidance routes also remained intact, including locale fallback, SFCC instances, composable storefront implications, and Commerce on Core. Differences were limited to expected local H1 shortening, additive figure treatment, and flattened alerts or callouts.
- The TrailblazerDX schedule article preserved its B2C-specific curation and both event-day session notes without reader-facing loss.
- The 24.6 release article preserved all release sections. Local auto-linked a few `@openssh.com` algorithm tokens in the SFTP algorithm list, but the token strings remained readable and no implementation guidance was lost, so this remained a non-blocking PASS.

## Current Totals (Restart Batches 1-14)

- Rows completed: `140`
- Remaining routes: `10`
- PASS: `140`
- HOLD: `0`
- FAIL: `0`
- Critical issues: `0`
- High issues: `0`
- Medium issues: `0`
- Low issues: `0`

## Batch 15 Results (10/10)

| Audit ID | Article URL | H1 drift | Code integrity | Status |
|---|---|---|---|---|
| BATCH-15-001 | `/what-is-new-in-the-23-8-commerce-cloud-release/` | SAME | NO-CODE | PASS |
| BATCH-15-002 | `/what-is-oci-omnichannel-inventory/` | SAME | NO-CODE | PASS |
| BATCH-15-003 | `/what-is-the-ocapi-session-bridge/` | SAME | INTACT | PASS |
| BATCH-15-004 | `/what-is-the-sfcc-managed-runtime/` | SAME | NO-CODE | PASS |
| BATCH-15-005 | `/what-skills-do-i-need-as-a-sfcc-architect/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-15-006 | `/where-is-the-new-sfcc-documentation/` | SAME | NO-CODE | PASS |
| BATCH-15-007 | `/where-to-hook-into-an-sfra-controller/` | SAME | INTACT | PASS |
| BATCH-15-008 | `/where-to-start-when-you-are-new-to-salesforce-b2c-commerce-cloud-development/` | CHANGED (expected) | NO-CODE | PASS |
| BATCH-15-009 | `/why-circumventing-sfcc-quota-limits-is-a-bad-idea/` | CHANGED (expected) | INTACT | PASS |
| BATCH-15-010 | `/your-definitive-mobile-app-checklist/` | CHANGED (expected) | INTACT | PASS |

## Batch 15 Findings

- No critical, high, or medium reader-facing regressions were found in Batch 15.
- The technical and governance-heavy routes held cleanly: the 23.8 release article preserved its operational guidance, the OCAPI session bridge article kept all request-flow examples readable, the SFRA controller-hook article retained its extension examples, and the mobile app checklist preserved its long-form SCAPI and SLAS launch guidance.
- Narrative and guidance-heavy routes also remained intact, including the architect-skills article, the documentation-migration article, the newcomer-starting-point article, and the quota-limit cautionary article. Differences were limited to expected H1 shortening, local key takeaways, TOC blocks, additive figure treatment, and flattened alerts or callouts.
- One source defect was found and corrected during the batch: the local OCI article had lost two introductory paragraphs under the included-license section. The source content was restored and the local render was rechecked before the route was marked PASS.

## Current Totals (Restart Batches 1-15)

- Rows completed: `150`
- Remaining routes: `0`
- PASS: `150`
- HOLD: `0`
- FAIL: `0`
- Critical issues: `0`
- High issues: `0`
- Medium issues: `0`
- Low issues: `0`

## PASS, HOLD, FAIL Rules

### PASS

A row is `PASS` when all of the following are true:

1. Live and local routes both render successfully.
2. The same reader-facing article is present on both hosts.
3. Core body sections and key paragraphs are intact.
4. On technical routes, code examples remain readable and materially complete.
5. Any differences are expected or additive, not destructive.

### HOLD

A row is `HOLD` when review is incomplete or inconclusive:

1. One host is temporarily unavailable.
2. Evidence is insufficient to classify a route confidently.
3. A possible regression needs a focused re-check before final disposition.

### FAIL

A row is `FAIL` only for confirmed blocking fidelity loss:

1. Wrong article or unreadable route.
2. Missing core section or materially altered body meaning.
3. Missing or corrupted technical example that changes implementation guidance.
4. Broken essential media or rendering that prevents normal reading.

## Notes for This Restart

- This restart intentionally begins from scratch and does not inherit prior dispositions.
- The fresh ledger for this run is `validation/article-audit-2026-03-23-restart.csv`.
- The restart audit is complete at 150 reviewed routes with no remaining HOLD or FAIL rows.

## Related Files

- `validation/article-audit-2026-03-23-restart.csv`
- `validation/ARTICLE-AUDIT-SUMMARY-2026-03-23-RESTART.md`
- `src/content/posts/what-is-oci-omnichannel-inventory/index.md`
