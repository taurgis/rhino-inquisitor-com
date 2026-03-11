# RHI-041 Security Data Hygiene Implementation

## Change summary

RHI-041 adds a migration-facing security content gate via `npm run check:security-content`, records the first clean release-candidate report at `migration/reports/security-content-scan.csv`, and documents the Phase 4 execution order plus GitHub Pages header-ownership boundaries for downstream cutover work.

## Why this changed

Phase 4 already had template-level security validation through `npm run check:security`, but it did not yet have a repository-owned gate for corrected staged migration content. That left a gap where script fragments, inline event handlers, `javascript:` links, WordPress auth artifacts, publication-state mismatches, or leaked source metadata could pass through the migration pipeline before batch review.

## Behavior details

Old behavior:

- No command scanned `migration/output/content/` for security issues after `npm run migrate:finalize-content`.
- `npm run check:security` only validated the Phase 3 scaffold build under `public/` and did not inspect the staged migration corpus.
- The Phase 4 runbook did not define an approved iframe allowlist or a security-gate command in the post-mapping batch sequence.

New behavior:

- `scripts/migration/check-security-content.js` scans all staged Markdown files in `migration/output/content/` and the rendered article-body HTML built from that same corrected state.
- `npm run check:security-content` now performs the full staged validation sequence by building `migration/output/content/` into `tmp/rhi041-public` and then running the scan script against both Markdown and rendered output.
- The gate blocks on:
  - raw `<script>` tags
  - inline `on*=` handlers
  - `javascript:` URIs
  - WordPress nonce or auth artifacts
  - `draft: false` when the mapped source status is not `publish`
  - source-system-only front matter keys or leaked local filesystem paths
- The gate warns on:
  - unapproved iframe hosts
  - WordPress admin or REST API URLs in content
  - `http://` image references
- Approved iframe sources are now documented as YouTube and Vimeo host variants only.
- GitHub Pages header ownership is now explicit in Phase 4 documentation: HTTPS enforcement remains the documented platform control, while stricter header policy stays assigned to a future edge/CDN layer.

## Impact

- Maintainers now have a deterministic security gate that runs on the Phase 4 staging corpus before pilot-batch approval.
- Phase 4 batch execution guidance now includes the security gate after `npm run migrate:finalize-content`.
- The repository documentation now distinguishes repository-owned content hygiene checks from edge-owned response-header policy.

## Verification

- `node --check scripts/migration/check-security-content.js`
- `npm run check:security-content`
- Confirm `migration/reports/security-content-scan.csv` is present and header-only for the current release-candidate corpus.
- Review the Hugo build output for `warning-goldmark-raw-html` warnings and keep them visible as evidence that Goldmark is omitting raw HTML instead of rendering it.
- Spot-audit 20 representative corrected Markdown files for script fragments, WordPress admin artifacts, source metadata leakage, and mixed-content image references before treating the gate as complete.

## Related files

- `scripts/migration/check-security-content.js`
- `package.json`
- `docs/migration/RUNBOOK.md`
- `docs/migration/SECURITY-CONTROLS.md`
- `migration/reports/security-content-scan.csv`
- `analysis/tickets/phase-4/RHI-041-security-data-hygiene.md`
