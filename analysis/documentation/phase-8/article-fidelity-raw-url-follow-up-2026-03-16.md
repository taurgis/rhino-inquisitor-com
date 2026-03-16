# Article Fidelity Raw-URL Follow-up - 2026-03-16

## Change summary

Completed a rendered-text follow-up on the suspicious raw visible URL rows that remained open after the broader phase-8 article-fidelity rerun.

This follow-up produced:

- `migration/reports/phase-8-article-fidelity-raw-url-follow-up-2026-03-16.csv`
- `migration/reports/phase-8-article-fidelity-raw-url-follow-up-summary-2026-03-16.csv`

## Why this changed

The earlier rerun kept sixteen raw-URL rows open because automated comparison detected visible URL drift in the local article body.

That detector was intentionally broad. It could not distinguish between:

- readable technical reference URLs that also appear on the live page
- acceptable example URLs with only angle-bracket wrapping differences
- real reader-facing defects such as naked media-file URLs, malformed tokens, or literal markdown syntax leaking into the rendered body

This follow-up reclassified that queue using rendered live and local article-body text as the primary reader-facing evidence.

## Behavior details

### Review method

1. Compare rendered article-body text from live `.speachify-content` and local `section.article-body`.
2. Treat rendered text as the primary defect signal for reader-facing raw-URL decisions.
3. Close rows as accepted drift when the same reference URL is already visible on live or when the local difference is readable and copy-safe.
4. Keep rows open when local rendering leaks naked media-file URLs, malformed tokens, or literal markdown syntax that live does not expose.

### Current raw-URL follow-up outcome

- Focused rows reviewed: `16`
- Pass: `8`
- Needs review: `8`
- Fail: `0`
- Accepted drift rows: `8`
- Confirmed medium-severity presentation defects: `8`

### Accepted drift patterns

The following raw-URL patterns were closed as accepted drift:

- the same technical reference URL already appears on the live page
- a placeholder or example URL remains readable and copy-safe despite visible angle brackets
- a resource table intentionally shows full destination URLs on both live and local

Representative closed rows include:

- `/how-to-set-up-slas-for-the-composable-storefront/`
- `/how-to-setup-oauth-jwt-for-the-ocapi/`
- `/it-sure-has-been-quiet-on-this-blog/`
- `/salesforce-b2c-commerce-cloud-documentation/`
- `/the-createorders-api-in-sfcc/`
- `/the-sfcc-guide-to-finding-pod-numbers/`

### Confirmed raw-URL defects that remain open

1. `/b2c-commerce-cloud-campaign-erd/`
   Local body leaks a naked `.mov` media URL.
2. `/navigating-dates-calendars-in-sfcc/`
   Local body leaks a naked `.mov` media URL in the Storefront Toolkit section.
3. `/salesforce-b2c-commerce-cloud-22-10/`
   Local body renders malformed admin URL examples with concatenated hostnames.
4. `/salesforce-b2c-commerce-cloud-23-2/`
   Local body leaks a naked `.mov` media URL.
5. `/salesforce-b2c-commerce-cloud-the-22-7-release/`
   Local body exposes literal markdown link syntax for the Object.values example.
6. `/sfcc-url-cracking-the-code/`
   Local body contains malformed visible URL punctuation in the path example.
7. `/taming-the-beast-a-developers-deep-dive-into-sfcc-meta-tag-rules/`
   Local body exposes angle-bracketed output URLs and literal markdown link syntax in the PageMetaData example.
8. `/what-is-new-in-the-23-8-commerce-cloud-release/`
   Local body leaks a naked `.mp4` media URL.

## Impact

- The rerun tracker now distinguishes readable raw-link drift from genuine reader-facing raw-URL defects.
- The remaining raw-URL queue is much smaller and more actionable.
- The open rows now represent formatting or presentation defects that a reader can actually see and potentially copy incorrectly.

## Verification

1. Review `migration/reports/phase-8-article-fidelity-raw-url-follow-up-2026-03-16.csv` for per-row decisions.
2. Review `migration/reports/phase-8-article-fidelity-raw-url-follow-up-summary-2026-03-16.csv` for focused counts.
3. Confirm that open rows still reproduce in rendered local article bodies and are not merely source-only or serialization-only artifacts.
4. Reconcile the broader rerun summary after any future raw-URL fixes so the row-level and summary counts stay aligned.

## Related files

- `migration/reports/phase-8-article-fidelity-rerun-2026-03-16.csv`
- `migration/reports/phase-8-article-fidelity-rerun-summary-2026-03-16.csv`
- `migration/reports/phase-8-article-fidelity-raw-url-follow-up-2026-03-16.csv`
- `migration/reports/phase-8-article-fidelity-raw-url-follow-up-summary-2026-03-16.csv`
- `analysis/documentation/phase-8/article-fidelity-rerun-2026-03-16.md`
