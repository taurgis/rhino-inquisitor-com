# RHI-091 Live Fill Command Checklist

## Change summary

This document provides an operator-ready command checklist for the live RHI-091 fill-in step. It covers the clean RC v3 freeze, final workflow run capture, WS-H report regeneration, rollback drill evidence capture, and the final artifact fill-in handoff.

## Why this changed

RHI-091 now has the required evidence scaffolds, but the remaining work still required the operator to infer the exact execution order from multiple files. This checklist consolidates the live steps into one sequence so the final evidence run can be executed with minimal manual decision-making.

## Behavior details

### Previous behavior

- The repository had a clean-rerun plan, draft closeout templates, and support scaffolds.
- The exact operator command order still had to be reconstructed from the deploy workflow, `scripts/phase-7/run-all-gates.sh`, and the Phase 7 rollback runbook.
- That increased the risk of mixing production-build evidence, rehearsal-host evidence, and rollback-drill evidence.

### New behavior

- This checklist defines one execution order for the live fill-in step.
- It distinguishes four evidence layers clearly:
  - local clean production-build evidence
  - CI workflow run and Pages deployment evidence
  - live rehearsal-host WS-H evidence
  - rollback-drill evidence for the previous WordPress stack
- It tells the operator exactly which commands to run, which outputs to record, and when to stop if a blocker appears.

## Operator checklist

### 0. Set session variables

Run this once in a clean shell from the repository root.

```bash
export REPO_ROOT="$PWD"
export RC_TAG="phase-8-rc-v3"
export RC_BRANCH="$(git branch --show-current)"
export PREVIEW_BASE_URL="https://taurgis.github.io/rhino-inquisitor-com/"
export WORDPRESS_URL="PENDING_WORDPRESS_URL"
export RHI091_TMP_DIR="$REPO_ROOT/tmp/rhi-091-live-fill"
mkdir -p "$RHI091_TMP_DIR"
```

### 1. Preflight and clean-state checks

Stop here if any command shows an unexpected diff or missing dependency.

```bash
git fetch --tags origin
git status --short
git diff --stat phase-8-rc-v2..HEAD | tee "$RHI091_TMP_DIR/phase-8-rc-v2-diff-stat.txt"
command -v git
command -v node
command -v npm
command -v hugo
command -v gh
node -v | tee "$RHI091_TMP_DIR/node-version.txt"
hugo version | tee "$RHI091_TMP_DIR/hugo-version.txt"
npm ls @lhci/cli @axe-core/playwright html-validate --depth=0 | tee "$RHI091_TMP_DIR/toolchain-packages.txt"
```

Preflight pass criteria:

- `git status --short` is empty before the final tag is created.
- The diff from `phase-8-rc-v2` contains only the intended WS-H and documentation updates.
- `git`, `node`, `npm`, `hugo`, and `gh` all resolve successfully.

### 2. Create the clean RC v3 snapshot

Commit only when the workspace is ready.

```bash
git add package.json \
  scripts/phase-8/check-preview-launch-readiness.js \
  scripts/phase-8/check-production-validation-build.js \
  validation/README.md \
  validation/preview-launch-readiness-report.json \
  validation/production-host-smoke-report.json \
  migration/phase-8-smoke-test-results.md \
  migration/phase-8-exception-register.md \
  migration/phase-8-approver-roster.md \
  migration/phase-8-rollback-drill-result.md \
  migration/phase-8-rc-v3-record.md \
  migration/phase-8-go-nogo-decision.md \
  LAUNCH-GATE-PASS-SUMMARY.md \
  CUTOVER-VERIFICATION-CHECKLIST.md \
  analysis/documentation/phase-8/rhi-091-operational-readiness-evidence-2026-03-21.md \
  analysis/documentation/phase-8/rhi-091-clean-rerun-closeout-plan-2026-03-21.md \
  analysis/documentation/phase-8/rhi-091-live-fill-command-checklist-2026-03-21.md \
  analysis/tickets/phase-8/INDEX.md \
  analysis/tickets/phase-8/RHI-091-operational-readiness-go-nogo.md

git commit -m "Add Phase 8 WS-H closeout scaffolding"
git tag -a "$RC_TAG" -m "Phase 8 RC v3: WS-H operational readiness evidence"
git show --stat "$RC_TAG" --no-patch | tee "$RHI091_TMP_DIR/${RC_TAG}-tag-summary.txt"
git rev-parse "$RC_TAG" | tee "$RHI091_TMP_DIR/${RC_TAG}-sha.txt"
git push origin "$RC_BRANCH"
git push origin "$RC_TAG"
```

Record these values for `migration/phase-8-rc-v3-record.md`:

```bash
git rev-parse "$RC_TAG"
git rev-parse --short "$RC_TAG"
date -u +"%Y-%m-%dT%H:%M:%SZ"
```

### 3. Run the local production-validation pass

This stage creates the production-build evidence and the archived production artifact.

```bash
npm ci
npx playwright install --with-deps chromium
npm run gates:local -- --preview-base-url "$PREVIEW_BASE_URL" | tee "$RHI091_TMP_DIR/gates-local.log"
```

Record these additional values for the RC v3 record:

```bash
shasum -a 256 validation/expected-url-outcomes.json | tee "$RHI091_TMP_DIR/expected-url-outcomes.sha256"
shasum -a 256 validation/sample-matrix.json | tee "$RHI091_TMP_DIR/sample-matrix.sha256"
shasum -a 256 validation/priority-routes.json | tee "$RHI091_TMP_DIR/priority-routes.sha256"
du -sh tmp/ci-prod-public | tee "$RHI091_TMP_DIR/ci-prod-public-size.txt"
```

Local pass criteria:

- `npm run gates:local` exits `0`.
- `tmp/ci-prod-public/` exists after the run.
- All three dataset checksum files are captured.

### 4. Trigger the final Pages workflow run

Use the GitHub CLI when available. If `gh` is unavailable, run the same workflow manually in the Actions UI and record the exact run URL after it is created.

```bash
gh workflow run deploy-pages.yml --ref "$RC_BRANCH"
sleep 5
gh run list --workflow deploy-pages.yml --branch "$RC_BRANCH" --limit 1 --json databaseId,url,headSha,headBranch,status,conclusion,displayTitle | tee "$RHI091_TMP_DIR/deploy-pages-run.json"
gh run watch "$(node -e 'const fs=require("fs"); const runs=JSON.parse(fs.readFileSync(process.argv[1], "utf8")); process.stdout.write(String(runs[0].databaseId));' "$RHI091_TMP_DIR/deploy-pages-run.json")" --exit-status
gh run view "$(node -e 'const fs=require("fs"); const runs=JSON.parse(fs.readFileSync(process.argv[1], "utf8")); process.stdout.write(String(runs[0].databaseId));' "$RHI091_TMP_DIR/deploy-pages-run.json")" --json url,headSha,headBranch,displayTitle,status,conclusion,jobs | tee "$RHI091_TMP_DIR/deploy-pages-run-view.json"
```

Capture for final artifacts:

- workflow run URL
- selected branch or ref
- final head SHA
- build job conclusion
- deploy job conclusion
- artifact names shown on the run page
- `github-pages` environment deployment URL if GitHub displays it

### 5. Regenerate the WS-H reports on the clean evidence basis

These commands must run only after the workflow run is complete and the rehearsal host is reachable.

```bash
npm run check:production-validation-build -- --public-dir tmp/ci-prod-public --report validation/production-host-smoke-report.json | tee "$RHI091_TMP_DIR/production-host-smoke.log"
npm run check:preview-launch-readiness -- --base-url "$PREVIEW_BASE_URL" --report validation/preview-launch-readiness-report.json --markdown migration/phase-8-smoke-test-results.md | tee "$RHI091_TMP_DIR/preview-launch-readiness.log"
```

Verify the provenance blocker is cleared:

```bash
rg -n 'provenanceStatus|workspaceDirty|matchesDatasetRc' validation/preview-launch-readiness-report.json validation/production-host-smoke-report.json
```

WS-H pass criteria:

- Both WS-H commands exit `0`.
- Neither report remains `branch-state`.
- `workspaceDirty` is `false` in both final reports.

### 6. Execute the rollback drill and capture evidence

Follow `migration/phase-7-staging-rollback-runbook.md` step by step. Use the commands below to capture timestamps and WordPress accessibility evidence while you execute the runbook.

```bash
export DRILL_TRIGGER_TIMESTAMP_UTC="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
printf '%s\n' "$DRILL_TRIGGER_TIMESTAMP_UTC" | tee "$RHI091_TMP_DIR/drill-trigger-timestamp.txt"

curl -sSI "$WORDPRESS_URL" | tee "$RHI091_TMP_DIR/wordpress-head.txt"
curl -sL "$WORDPRESS_URL" | sed -n '1,40p' | tee "$RHI091_TMP_DIR/wordpress-body-head.txt"

curl -sSI "$WORDPRESS_URL/robots.txt" | tee "$RHI091_TMP_DIR/wordpress-robots-head.txt"
curl -sSI "$WORDPRESS_URL/sitemap.xml" | tee "$RHI091_TMP_DIR/wordpress-sitemap-head.txt"

export DRILL_CONFIRMED_TIMESTAMP_UTC="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
printf '%s\n' "$DRILL_CONFIRMED_TIMESTAMP_UTC" | tee "$RHI091_TMP_DIR/drill-confirmed-timestamp.txt"

node -e 'const start=Date.parse(process.argv[1]); const end=Date.parse(process.argv[2]); console.log(Math.round((end-start)/60000));' "$DRILL_TRIGGER_TIMESTAMP_UTC" "$DRILL_CONFIRMED_TIMESTAMP_UTC" | tee "$RHI091_TMP_DIR/drill-mttr-minutes.txt"
```

If DNS was actually modified during the drill, capture resolver evidence too:

```bash
dig @1.1.1.1 staging.rhino-inquisitor.com CNAME +short | tee "$RHI091_TMP_DIR/dig-1.1.1.1-staging-cname.txt"
dig @8.8.8.8 staging.rhino-inquisitor.com CNAME +short | tee "$RHI091_TMP_DIR/dig-8.8.8.8-staging-cname.txt"
```

Rollback-drill pass criteria:

- WordPress is confirmed accessible.
- MTTR is recorded.
- Any failure or over-target time is explicitly noted as `blocking` or `accepted` in the drill result file.

### 7. Fill the pending evidence files

Populate these files from the captured outputs:

- `migration/phase-8-rc-v3-record.md`
- `migration/phase-8-rollback-drill-result.md`
- `validation/preview-launch-readiness-report.json`
- `validation/production-host-smoke-report.json`
- `migration/phase-8-smoke-test-results.md`
- `LAUNCH-GATE-PASS-SUMMARY.md`
- `CUTOVER-VERIFICATION-CHECKLIST.md`
- `migration/phase-8-go-nogo-decision.md`

Before signing anything, verify there are no unresolved placeholders left in the final evidence package:

```bash
rg -n 'PENDING_' \
  migration/phase-8-rc-v3-record.md \
  migration/phase-8-rollback-drill-result.md \
  LAUNCH-GATE-PASS-SUMMARY.md \
  CUTOVER-VERIFICATION-CHECKLIST.md \
  migration/phase-8-go-nogo-decision.md
```

### 8. Final blocker check before go or no-go

```bash
rg -n 'blocking.*Open|`blocking` \| Open|PENDING_' \
  migration/phase-8-exception-register.md \
  migration/phase-8-go-nogo-decision.md \
  LAUNCH-GATE-PASS-SUMMARY.md \
  CUTOVER-VERIFICATION-CHECKLIST.md \
  migration/phase-8-rollback-drill-result.md \
  migration/phase-8-rc-v3-record.md
```

Only proceed to the final decision record when:

- the exception register has no open `blocking` entries
- the two WS-H reports are no longer `branch-state`
- the rollback drill result is filled with real values
- the launch gate summary and cutover checklist are fully populated

## Impact

- The owner now has one command-driven path to complete the remaining RHI-091 evidence work.
- The checklist reduces the chance of mixing RC v3 freeze evidence, live Pages evidence, and rollback-drill evidence.
- Final sign-off can now be prepared from captured command output rather than reconstructed terminal history.

## Verification

Use the checklist in one live execution session on the final RC v3 branch.

Minimum validation of the checklist itself:

1. Preflight commands resolve the required tooling and confirm a clean workspace.
2. `npm run gates:local` exits `0` and leaves `tmp/ci-prod-public/` available.
3. The final workflow run is recorded with a real run URL.
4. Both WS-H reports are regenerated and no longer show `branch-state` provenance.
5. The rollback drill output produces a real MTTR value.
6. The final evidence files no longer contain `PENDING_` placeholders.

## Related files

- `.github/workflows/deploy-pages.yml`
- `scripts/phase-7/run-all-gates.sh`
- `package.json`
- `analysis/documentation/phase-8/rhi-091-clean-rerun-closeout-plan-2026-03-21.md`
- `migration/phase-8-rc-v3-record.md`
- `migration/phase-8-rollback-drill-result.md`
- `migration/phase-8-go-nogo-decision.md`
- `LAUNCH-GATE-PASS-SUMMARY.md`
- `CUTOVER-VERIFICATION-CHECKLIST.md`
- `analysis/tickets/phase-8/RHI-091-operational-readiness-go-nogo.md`