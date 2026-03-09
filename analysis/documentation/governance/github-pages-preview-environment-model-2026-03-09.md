# GitHub Pages Preview Environment Model Adjustment

## Change summary
The migration plan now treats `https://taurgis.github.io/rhino-inquisitor-com/` as the public GitHub Pages rehearsal host before final cutover to `https://www.rhino-inquisitor.com/`.

## Why this changed
The project needs a real prelaunch environment on GitHub Pages so build, path-prefix, asset, sitemap, feed, canonical, and redirect-helper behavior can be validated before the custom domain and DNS are switched.

## Behavior details
Old behavior:
- The plan implied one primary Pages deployment flow directly toward the production custom domain.
- Preview or staging behavior was mentioned generically, without locking the GitHub Pages project URL into the phase contracts.

New behavior:
- The GitHub Pages project URL is an explicit public rehearsal host.
- Preview-host pages stay crawlable with `noindex` and must validate the `/rhino-inquisitor-com/` path prefix.
- Preview and production are treated as separate artifact modes.
- Production cutover now happens only after preview-host validation passes and the production artifact is revalidated for zero preview-host leakage and zero accidental `noindex`.

## Impact
- Planning and validation now use a two-host model: preview rehearsal first, custom-domain cutover second.
- Phase 1 through Phase 9 now distinguish preview-host safety from production-host correctness.
- Cutover runbooks and launch gates must include both preview-host rehearsal evidence and production-host revalidation evidence.

## Verification
1. Confirm the phase plans define `https://taurgis.github.io/rhino-inquisitor-com/` as the preview rehearsal host.
2. Confirm preview-host requirements include crawlable `noindex` and repository path-prefix validation.
3. Confirm production-host requirements include zero preview-host leakage and zero accidental `noindex`.
4. Confirm cutover sequencing now places preview validation before custom-domain configuration and DNS changes.

## Related files
- `analysis/main-plan.MD`
- `analysis/plan/details/phase-1.md`
- `analysis/plan/details/phase-2.md`
- `analysis/plan/details/phase-3.md`
- `analysis/plan/details/phase-4.md`
- `analysis/plan/details/phase-5.md`
- `analysis/plan/details/phase-6.md`
- `analysis/plan/details/phase-7.md`
- `analysis/plan/details/phase-8.md`
- `analysis/plan/details/phase-9.md`