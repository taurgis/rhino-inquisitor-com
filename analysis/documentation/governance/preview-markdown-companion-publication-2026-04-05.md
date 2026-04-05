# Preview Markdown Companion Publication - 2026-04-05

## Change summary

Updated the preview build path to retain Markdown companion endpoints for noindex preview pages and added a preview-side LLM artifact validation gate.

## Why this changed

The staging host advertised page Markdown companion URLs such as `/archive/index.md`, but the preview build pipeline removed those files because the post-build LLM artifact generator deleted companions for any page whose HTML emitted `noindex`. That left staging with broken Markdown companion endpoints even though the corresponding HTML pages and alternate-link tags were present.

## Behavior details

Old behavior:

- Preview builds generated Markdown companions and then deleted them when the matching HTML page had a `noindex` robots directive.
- Staging HTML pages still advertised Markdown companion alternates, which produced broken `.md` URLs on the preview host.
- Phase 7 validated LLM artifacts only on the production-validation build, not on the final preview rehearsal artifact.

New behavior:

- Preview builds now retain Markdown companion files even when the preview HTML page is `noindex`.
- `npm run build:staging` now keeps preview Markdown companions for QA and staging parity checks.
- Phase 7 now runs a dedicated preview LLM artifact validation step after the preview rehearsal build.

## Impact

- Staging Markdown companion URLs such as `/archive/index.md` remain reachable for QA and preview verification.
- The preview host keeps its HTML `noindex, nofollow` posture while preserving machine-readable companion endpoints.
- Future regressions where preview rebuilds silently drop Markdown companions should fail in the rehearsal gate instead of surfacing only after deploy.

## Verification

- Run `npm run build:prod` and confirm production still generates valid Markdown companions.
- Run `npm run check:llm-artifacts` after the production build and confirm the validator passes.
- Run `npm run build:staging` and confirm `public/archive/index.md` exists in the preview artifact.
- Run `node scripts/seo/check-llm-artifacts.js --report tmp/phase-7-preview-llm-artifact-quality-report.json` after the preview build and confirm it passes.

## Related files

- `scripts/seo/generate-llm-artifacts.js`
- `package.json`
- `scripts/phase-7/run-all-gates.sh`
- `scripts/seo/check-llm-artifacts.js`