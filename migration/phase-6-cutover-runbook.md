# Phase 6 Cutover Runbook

Date: 2026-03-15
Ticket: `analysis/tickets/phase-6/RHI-071-cutover-readiness-rollback-design.md`
Status: In Progress

Closeout type: Owner-accepted deviation closeout for RHI-071

## Purpose

This runbook turns the completed Phase 6 validators into a launch-window execution script for the approved Model A stack: Hugo content and alias helpers published through the GitHub Pages Actions workflow.

It is written for a non-author operator under time pressure. Every step below names the owner, the evidence to capture, and the exact boundary between repository-proofed behavior and live production checks that still require the custom domain, GitHub Pages settings, DNS, and Search Console.

## Current readiness snapshot

| Area | Current state | Evidence | Status |
|---|---|---|---|
| Repository build and Phase 6 gates | Local production build and all mandatory Phase 6 gate commands passed on commit `3f29de0ccfb587956ea405813dd27426edf98f61` on 2026-03-15. | `npm run build:prod`, `npm run validate:url-inventory`, `npm run check:url-parity`, `npm run check:redirect-targets`, `npm run check:redirect-chains`, `npm run check:canonical-alignment`, `npm run check:retirement-policy`, `npm run check:host-protocol`, `npm run check:redirect-security` | Ready |
| Redirect-map freeze tag | Redirect-map freeze tag `phase-6-redirect-map-v1` now points to the verified `main` commit `3f29de0ccfb587956ea405813dd27426edf98f61` and was pushed to `origin` on 2026-03-15. | `git show --no-patch --decorate phase-6-redirect-map-v1`, `git ls-remote --tags origin phase-6-redirect-map-v1` | Ready |
| Manual verification sample sources | The Phase 1 baseline provides a durable 90-day traffic ranking and a top-linked-page export, but the full Search Console export folder is not present in the current workspace. | `migration/phase-1-seo-baseline.md`, `migration/phase-5-monitoring-runbook.md` | Partial |
| Search Console continuity plan | DNS TXT continuity, domain-property ownership, sitemap submission procedure, and old-sitemap retention guidance are documented, and the owner confirmed on 2026-03-15 that Search Console is ready and validated for cutover. | `migration/phase-1-seo-baseline.md`, `migration/phase-5-monitoring-runbook.md`, owner confirmation 2026-03-15 | Ready |
| Rollback drill | A local emergency alias repair drill succeeded on 2026-03-15 and exposed the clean-build requirement documented below. | `migration/phase-6-rollback-runbook.md` | Ready |
| Internal-link readiness | Link audits report `0` blocking findings and `20` warnings. The remaining warnings are legacy asset links and IA depth warnings, not redirect-source page links. | `npm run check:links`, `npm run check:internal-links`, `migration/reports/phase-5-internal-links-audit.csv` | Partial |
| Phase 7 and Phase 8 handoff | Owner-approved advisory handoff is recorded for downstream use. Formal confirmed-readiness handoff is deferred by owner decision to the live cutover verification window. | This runbook, RHI-071 Progress Log | Owner-accepted deviation |

## RHI-071 owner-accepted closeout record

RHI-071 closes on 2026-03-15 as an owner-accepted deviation closeout.

Deferred evidence for this ticket:

1. The final production four-variant host/protocol matrix was not executed within RHI-071.
2. The formal confirmed-readiness handoff to Phase 7 and Phase 8 was not executed within RHI-071.

Controls that remain in place:

1. The exact production 17-check verification pass below remains mandatory for the live cutover checkpoint.
2. Any failed production row keeps runtime readiness unconfirmed and triggers incident handling or rollback evaluation.
3. Advisory handoff is recorded, but it must not be interpreted as formal confirmed readiness.

## Owner model

The repository uses a single-owner operating model. The same named owner is accountable across Migration, SEO, and Engineering roles unless explicitly delegated during cutover.

| Role | Named owner | Primary responsibility |
|---|---|---|
| Migration Owner | Thomas Theunen | Freeze approval, rollback authorization, launch-window communications, and Phase 7/8 handoff |
| SEO Owner | Thomas Theunen | Priority sample approval, Search Console continuity, sitemap submission, and canonical anomaly review |
| Engineering Owner | Thomas Theunen | Build verification, GitHub Pages deploy execution, alias hotfixes, and live smoke checks |

## Model A operational boundary

1. Hugo aliases on GitHub Pages are static helper pages that return HTML with an immediate `meta refresh` and canonical tag. They are not first-class HTTP `301` or `308` rules.
2. GitHub Pages host consolidation and HTTPS enforcement depend on correct custom-domain and DNS configuration. They must be revalidated on the live custom domain during the cutover window.
3. Repository checks prove artifact correctness, canonical alignment, sitemap composition, and policy coverage before launch, but they do not prove live Search Console access, DNS propagation, or runtime host behavior.
4. Old WordPress sitemap retention is allowed during the transition period for monitoring, but the production sitemap submission target after cutover is `https://www.rhino-inquisitor.com/sitemap.xml` only.
5. Edge override rollback is unavailable under the current Model A posture. Rollback planning is limited to previous-site recovery if operationally available, or a Hugo hotfix and redeploy.
6. Alias-removal drills must use a clean destination build. A normal `npm run build:prod` can leave stale alias helper files in `public/` and mask a missing alias defect.

## Freeze candidate log

| Field | Value |
|---|---|
| Freeze candidate commit under current local verification | `3f29de0ccfb587956ea405813dd27426edf98f61` (`3f29de0`) |
| Latest local repository verification date | 2026-03-15 |
| Latest successful main Actions run URL | `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23091859154` for commit `3f29de0ccfb587956ea405813dd27426edf98f61` |
| Redirect-map freeze tag | `phase-6-redirect-map-v1` -> `3f29de0ccfb587956ea405813dd27426edf98f61` |
| Primary Phase 6 reports | `migration/reports/phase-6-redirect-targets.csv`, `migration/reports/phase-6-chains-loops.csv`, `migration/reports/phase-6-canonical-alignment.csv`, `migration/reports/phase-6-retired-url-audit.csv`, `migration/reports/phase-6-redirect-security.csv`, `migration/url-parity-report.csv`, `tmp/phase-6-host-protocol/` |
| Live custom-domain verification evidence | Pending launch window |

## Live runtime evidence snapshot

Observed on 2026-03-15 against the currently live public domain:

| Check | Result | Interpretation |
|---|---|---|
| `http://rhino-inquisitor.com/` | Final URL `https://rhino-inquisitor.com/`, HTTP `200` | Fails the target cutover expectation because apex does not consolidate to `www`. |
| `https://rhino-inquisitor.com/` | Final URL `https://rhino-inquisitor.com/`, HTTP `200` | Fails the target cutover expectation because apex still serves directly. |
| `http://www.rhino-inquisitor.com/` | Final URL `https://www.rhino-inquisitor.com/`, HTTP `200` | Meets the protocol-upgrade expectation on the canonical host. |
| `https://www.rhino-inquisitor.com/` | Final URL `https://www.rhino-inquisitor.com/`, HTTP `200` | Canonical `www` host responds successfully. |
| Homepage canonical | `https://www.rhino-inquisitor.com/` | Homepage canonical on the `www` host is correct. |
| Article canonical: `/how-to-use-ocapi-scapi-hooks/` | `https://www.rhino-inquisitor.com/how-to-use-ocapi-scapi-hooks/` | Representative article canonical on the `www` host is correct. |
| Category canonical: `/category/release-notes/` | `https://www.rhino-inquisitor.com/category/salesforce-commerce-cloud/release-notes/` | Live runtime still reflects the legacy nested category canonical rather than the flattened Hugo target. |
| `/privacy-policy/` | HTTP `200` on `https://www.rhino-inquisitor.com/privacy-policy/` | Critical legal route is live on `www`. |
| `/feed/` | HTTP `200` on `https://www.rhino-inquisitor.com/feed/` | Feed endpoint is live on `www`. |
| `/robots.txt` | HTTP `200` on `https://www.rhino-inquisitor.com/robots.txt` | Live robots route is reachable. |
| `/sitemap.xml` | Final URL `https://www.rhino-inquisitor.com/sitemap_index.xml`, HTTP `200` | Live site is still serving the legacy sitemap index, not the final Hugo `sitemap.xml` target. |
| `/404/` | HTTP `200` on `https://www.rhino-inquisitor.com/404/` | Custom not-found route is reachable on `www`. |

Current conclusion:

1. The live public host is not yet in the final Phase 6 cutover state.
2. Repository-controlled readiness is complete, but the remaining live verification criteria must stay open until the public runtime reflects the Hugo deployment.
3. RHI-071 closes by owner-accepted deviation despite that remaining runtime evidence gap; the formal confirmed-readiness handoff still must not be sent until the runtime matrix above is re-run against the cutover candidate and passes.

## Staging manual verification section

Observed on 2026-03-15 against `https://staging.rhino-inquisitor.com`:

| Check | Result | Interpretation |
|---|---|---|
| `http://staging.rhino-inquisitor.com/` | Final URL `https://staging.rhino-inquisitor.com/`, HTTP `200` | Expected protocol upgrade on the staging host. |
| `https://staging.rhino-inquisitor.com/` | Final URL `https://staging.rhino-inquisitor.com/`, HTTP `200` | Staging host responds directly over HTTPS. |
| `http://www.staging.rhino-inquisitor.com/` | DNS resolution failure | Staging cannot satisfy the full four-variant host/protocol matrix because the `www` staging host is not provisioned. |
| `https://www.staging.rhino-inquisitor.com/` | DNS resolution failure | Same limitation as above. |
| Homepage metadata | Canonical `https://staging.rhino-inquisitor.com/`, robots `noindex, nofollow` | Expected non-production staging behavior. |
| Privacy policy metadata | Canonical `https://staging.rhino-inquisitor.com/privacy-policy/`, robots `noindex, nofollow` | Expected non-production staging behavior. |
| Article metadata: `/how-to-use-ocapi-scapi-hooks/` | Canonical `https://staging.rhino-inquisitor.com/how-to-use-ocapi-scapi-hooks/`, robots `noindex, nofollow` | Representative article route is correct on staging. |
| Flattened category metadata: `/category/release-notes/` | Canonical `https://staging.rhino-inquisitor.com/category/release-notes/`, robots `noindex, nofollow` | Flattened category route is correct on staging. |
| Legacy article alias path | Browser navigation from `/how-to-set-up-the-ecdn-for-staging-in-salesforce-b2c-commerce-cloud/` lands on `https://staging.rhino-inquisitor.com/how-to-set-up-the-ecdn-in-sfcc-staging/` | Alias-backed legacy article path resolves to the expected current route. |
| Legacy nested category path | Browser navigation from `/category/salesforce-commerce-cloud/release-notes/` lands on `https://staging.rhino-inquisitor.com/category/release-notes/` | Nested category path resolves to the flattened category target. |
| Top 50 traffic sample | `50/50` pass via HTTP tool | Strong staging rehearsal result for the traffic sample. |
| Owner-approved top linked sample | `19` direct passes plus `1` alias-backed nested category path resolving to the flattened category target | Effective `20/20` pass for staging rehearsal. |
| `/privacy-policy/` | HTTP `200` | Critical legal route is reachable on staging. |
| `/feed/` | HTTP `200`, helper canonical `/index.xml`, robots `noindex, nofollow`, refresh `/index.xml` | Expected feed-helper behavior on staging. |
| `/robots.txt` | HTTP `200`, contains `Sitemap: https://staging.rhino-inquisitor.com/sitemap.xml` | Expected staging robots host behavior. |
| `/sitemap.xml` | HTTP `200`, XML output with staging-host `<loc>` values | Expected staging sitemap host behavior. |
| `/404/` | HTTP `200` | Custom not-found route is reachable on staging. |
| Unknown route control | `/this-route-should-not-exist-rhi-071/` returned HTTP `404` | Staging unknown-route behavior is correct. |

Staging conclusion:

1. The staging candidate passed a meaningful manual-verification rehearsal for priority routes, critical routes, alias-backed legacy paths, and preview metadata behavior.
2. Staging evidence is valid as a pre-cutover rehearsal, not as final production acceptance for canonical production host or full four-variant host/protocol behavior.
3. Re-run the same verification set on the final production cutover candidate before closing the remaining RHI-071 manual-verification acceptance criteria.
4. This section is the documented staging manual-verification record for RHI-071. The separate production verification log template below remains reserved for T0 and post-cutover evidence.

## Advisory handoff record

Owner-approved advisory handoff recorded on 2026-03-15:

1. Phase 7 and Phase 8 may proceed using the repository-controlled RHI-071 package and the frozen redirect-map tag `phase-6-redirect-map-v1`.
2. Formal confirmed-readiness handoff remains blocked until the live host/protocol matrix, live sitemap behavior, and manual priority-route verification pass against the cutover candidate.

## Repo-controlled prerequisite verification

Run this command bundle against the freeze candidate before tagging the redirect map:

```bash
npm run build:prod && npm run validate:url-inventory && npm run check:url-parity && npm run check:redirect-targets && npm run check:redirect-chains && npm run check:canonical-alignment && npm run check:retirement-policy && npm run check:host-protocol && npm run check:redirect-security
```

Verified locally on 2026-03-15:

1. `npm run build:prod` completed successfully with `Pages 206` and `Aliases 17`.
2. `npm run validate:url-inventory` passed for `1223` manifest rows.
3. `npm run check:url-parity` passed with `1223` pass rows and `0` fail rows.
4. `npm run check:redirect-targets` passed with `141` reviewed merge rows and `0` failures.
5. `npm run check:redirect-chains` passed with `18` alias-backed redirect rows, `0` chain defects, and `0` loop defects.
6. `npm run check:canonical-alignment` passed with `215` canonical rows and `0` mismatch rows.
7. `npm run check:retirement-policy` passed for `885` retired URL rows.
8. `npm run check:host-protocol` passed for the production artifact and wrote reports under `tmp/phase-6-host-protocol`.
9. `npm run check:redirect-security` passed with `50` pass rows and `0` failures.

Run the link-audit bundle before cutover finalization:

```bash
npm run check:links && npm run check:internal-links
```

Verified locally on 2026-03-15:

1. Both commands reported `0` blocking findings.
2. The current warning load is `20`, all documented in the internal-link plan below.

## Priority verification sample sources

Use two source buckets for manual verification. Do not treat the seeded table below as a substitute for the full top-50 export when the owner-held export is available.

1. Traffic bucket: the Phase 1 90-day Search Console pages export contains `709` URLs. Use the top 50 rows from the owner-held export at T-3, and keep the seeded URLs below as the minimum no-skip subset.
2. Link-equity bucket: the committed Phase 1 baseline currently preserves only the top 20 linked target pages from Search Console. The owner accepted that committed top-20 sample as the current backlink verification exception on 2026-03-15, so use that set unless a larger export is supplied later.

### Seeded minimum sample set

| URL | Bucket | Expected outcome | Source |
|---|---|---|---|
| `/swc-and-storybook-error-failed-to-load-native-binding/` | Traffic | Direct `200` on canonical route | Phase 1 top clicks |
| `/how-to-use-ocapi-scapi-hooks/` | Traffic + links | Direct `200` on canonical route | Phase 1 top clicks, links |
| `/in-the-ring-ocapi-versus-scapi/` | Traffic | Direct `200` on canonical route | Phase 1 top clicks |
| `/mastering-chunk-oriented-job-steps-in-salesforce-b2c-commerce-cloud/` | Traffic + links | Direct `200` on canonical route | Phase 1 top clicks, links |
| `/a-beginners-guide-to-webdav-in-sfcc/` | Traffic | Direct `200` on canonical route | Phase 1 top clicks |
| `/` | Traffic + links | Direct `200` on canonical route | Phase 1 top clicks, links |
| `/sitegenesis-vs-sfra-vs-pwa/` | Traffic + links | Direct `200` on canonical route | Phase 1 top clicks, links |
| `/creating-custom-ocapi-endpoints/` | Traffic | Direct `200` on canonical route | Phase 1 top clicks |
| `/understanding-sfcc-instances/` | Traffic | Direct `200` on canonical route | Phase 1 top clicks |
| `/how-to-get-a-salesforce-b2c-commerce-cloud-sandbox/` | Traffic + links | Direct `200` on canonical route | Phase 1 top clicks, links |
| `/how-to-set-up-the-ecdn-in-sfcc-staging/` | Links | Direct `200` on canonical route | Phase 1 top linked pages |
| `/lets-go-live-ecdn/` | Links | Direct `200` on canonical route | Phase 1 top linked pages |
| `/mail-attachments-in-b2c-commerce-cloud/` | Links | Direct `200` on canonical route | Phase 1 top linked pages |
| `/how-to-get-salesforce-certification-vouchers/` | Links | Direct `200` on canonical route | Phase 1 top linked pages |
| `/privacy-policy/` | Critical system | Direct `200` on canonical route | Ticket acceptance criteria |
| `/about/` | Critical system | Direct `200` on canonical route | Current site route |
| `/feed/` | Critical system | Canonical feed endpoint responds on production host | Ticket acceptance criteria |
| `/robots.txt` | Critical system | Canonical robots file references only production sitemap | Ticket acceptance criteria |
| `/sitemap.xml` | Critical system | Production sitemap lists final canonical URLs only | Ticket acceptance criteria |
| `/404/` | Critical system | Human-friendly not-found route renders on canonical host | Ticket acceptance criteria |

### Host and protocol verification matrix

Use these route classes against all four entry variants during T0 validation:

| Entry variant | Homepage sample | Article sample | Category sample | Expected outcome |
|---|---|---|---|---|
| `http://rhino-inquisitor.com` | `/` | `/how-to-use-ocapi-scapi-hooks/` | `/category/release-notes/` | Ends at `https://www.rhino-inquisitor.com/...` with canonical `https://www.rhino-inquisitor.com/...` |
| `https://rhino-inquisitor.com` | `/` | `/how-to-use-ocapi-scapi-hooks/` | `/category/release-notes/` | Ends at `https://www.rhino-inquisitor.com/...` with canonical `https://www.rhino-inquisitor.com/...` |
| `http://www.rhino-inquisitor.com` | `/` | `/how-to-use-ocapi-scapi-hooks/` | `/category/release-notes/` | Ends at `https://www.rhino-inquisitor.com/...` with canonical `https://www.rhino-inquisitor.com/...` |
| `https://www.rhino-inquisitor.com` | `/` | `/how-to-use-ocapi-scapi-hooks/` | `/category/release-notes/` | Serves canonical production route directly |

## Production verification command pack

Run this exact pack against the live cutover candidate after the deploy completes and after a short propagation buffer. Use UTC timestamps in the log.

### Preconditions

1. Wait 10 minutes after the successful Pages deploy before the first production verification pass.
2. If any host/protocol row fails on the first pass, wait 5 minutes and retry once.
3. If any row still fails after the retry, keep RHI-071 open and treat the result as release-blocking until the incident path or rollback decision is recorded.

### Production matrix command

Use this command bundle to verify the 12 host/protocol and route-class combinations:

```bash
variants=(
	"http://rhino-inquisitor.com"
	"https://rhino-inquisitor.com"
	"http://www.rhino-inquisitor.com"
	"https://www.rhino-inquisitor.com"
)
paths=(
	"/"
	"/how-to-use-ocapi-scapi-hooks/"
	"/category/release-notes/"
)

for variant in "${variants[@]}"; do
	for path in "${paths[@]}"; do
		url="${variant}${path}"
		printf 'CHECK %s\n' "$url"
		curl -sS -L -o /dev/null -w 'final=%{url_effective} code=%{http_code}\n' "$url"
	done
done
```

Expected outcome for all 12 rows:

1. Final URL is `https://www.rhino-inquisitor.com` plus the tested path.
2. Final status is `200` on the destination page.
3. Homepage, article, and category HTML each emit canonical `https://www.rhino-inquisitor.com` plus the same path.

### Canonical and robots command

Use this command bundle on the canonical production host for the representative template paths:

```bash
for path in "/" "/how-to-use-ocapi-scapi-hooks/" "/category/release-notes/"; do
	printf 'META %s\n' "https://www.rhino-inquisitor.com${path}"
	curl -sS "https://www.rhino-inquisitor.com${path}" | rg -n 'rel="canonical"|name="robots"'
done
```

Expected outcome:

1. `rel="canonical"` matches the canonical production URL for the route.
2. Production indexable pages do not emit `noindex`.

### Critical routes command

Use this command bundle for the 5 critical route checks:

```bash
curl -sS -L -o /dev/null -w 'privacy final=%{url_effective} code=%{http_code}\n' "https://www.rhino-inquisitor.com/privacy-policy/"
curl -sS -L -o /dev/null -w 'feed final=%{url_effective} code=%{http_code}\n' "https://www.rhino-inquisitor.com/feed/"
curl -sS "https://www.rhino-inquisitor.com/robots.txt"
curl -sS -L -o /dev/null -w 'sitemap final=%{url_effective} code=%{http_code}\n' "https://www.rhino-inquisitor.com/sitemap.xml"
curl -sS -L -o /dev/null -w '404 final=%{url_effective} code=%{http_code}\n' "https://www.rhino-inquisitor.com/404/"
```

Expected outcome:

1. `/privacy-policy/`, `/feed/`, and `/404/` resolve on the canonical production host.
2. `/robots.txt` includes exactly `Sitemap: https://www.rhino-inquisitor.com/sitemap.xml`.
3. `/sitemap.xml` remains the final URL and serves production canonical URLs only.

### Optional artifact re-check after hotfix

If any hotfix is applied during T0, re-run these artifact-level checks against the rebuilt production artifact before re-running the live matrix:

```bash
npm run check:host-protocol
npm run check:canonical-alignment
npm run check:redirect-chains
```

### Exit criterion

RHI-071 production verification passes only when all 17 checks succeed:

1. 12 host/protocol and route-class rows pass.
2. 5 critical route rows pass.
3. Any failed row keeps the ticket open and blocks formal confirmed-readiness handoff to Phase 7 and Phase 8.

## T-7 to T-3 checklist

| Step | Owner | Action | Expected result | Evidence |
|---|---|---|---|---|
| Freeze candidate validation | Engineering Owner | Re-run the Phase 6 gate bundle on the chosen freeze commit. | All gates green on the exact freeze candidate. | CLI output or Actions run URL plus archived reports |
| Redirect-map freeze review | Migration Owner | Confirm `migration/url-manifest.json` and `migration/url-map.csv` are the final launch-window versions. | No unresolved mapping changes remain. | Review note in Progress Log |
| Tag the freeze commit | Migration Owner | Create `phase-6-redirect-map-v1` on the approved commit. | Immutable redirect-map reference exists. | `git tag --list 'phase-6-redirect-map-v1'` plus SHA |
| Manual sample finalization | SEO Owner | Attach the top-50 traffic export and the available backlink sample to the operator checklist. | Final sample list is explicit and auditable. | Sample table completed in this runbook |
| Internal-link deviation review | Engineering Owner | Classify each remaining link-audit warning as accepted deviation or must-fix. | No unknown warning remains. | Deviation table below |
| Search Console continuity precheck | SEO Owner | Reconfirm owner access, DNS TXT verification, and the property to use on cutover day. | Search Console operator path is ready. | Evidence note in Progress Log |
| Previous-site availability check | Migration Owner | Confirm whether the previous site can still be re-enabled during the launch window. | Rollback option 1 is either confirmed or marked unavailable. | Rollback runbook updated |

## T-2 to T-1 checklist

| Step | Owner | Action | Expected result | Evidence |
|---|---|---|---|---|
| Runbook finalization | Migration Owner | Review this cutover runbook and the rollback runbook for accuracy and named owners. | Operator-ready runbooks are committed. | Git commit SHA |
| Hotfix branch readiness | Engineering Owner | Prepare a hotfix branch from the freeze tag or current `main` head and confirm deploy permissions. | Emergency patch path is ready before T0. | Branch name recorded locally |
| Workflow readiness | Engineering Owner | Confirm `.github/workflows/deploy-pages.yml` remains the active deploy path and that no overlapping deploy is running. | Cutover uses one active Pages deployment path only. | GitHub Actions UI check |
| Phase 7 and Phase 8 pre-handoff | Migration Owner | Send the prelaunch readiness summary with explicit pending live checks. | Downstream owners know what remains for T0 and T+14. | Notification record in Progress Log |

## T0 cutover steps

1. Migration Owner: confirm the freeze tag, the deploy candidate commit, and the rollback authority for the window.
2. Engineering Owner: confirm there is no active overlapping Pages deploy. The workflow uses `cancel-in-progress: false`, so do not stack hotfix deploys.
3. Engineering Owner: deploy the approved candidate on `main` using the standard GitHub Pages workflow.
4. Engineering Owner: wait for the build and deploy jobs to complete, then capture the deployed URL and completion time.
5. Engineering Owner: run the production verification command pack above. Stop and open an incident if any host/protocol, canonical, robots, or sitemap row fails after the allowed retry.
6. Engineering Owner and SEO Owner: execute the seeded priority sample and complete the production verification log below.
7. SEO Owner: submit `https://www.rhino-inquisitor.com/sitemap.xml` in Search Console after confirming the live canonical host and HTTPS are correct.
8. SEO Owner: retain the old WordPress sitemap in Search Console during the transition period. Redirect warnings on that retained sitemap are expected and are not blockers by themselves.
9. Migration Owner: declare launch stable only after the host/protocol checks, priority sample, and sitemap submission are all recorded.

## Day-0 smoke checks

Run these checks immediately after production cutover and before declaring the launch stable:

1. Verify the latest production artifact was built from the approved freeze candidate.
2. Run `npm run phase6:generate-coverage-report` against the production artifact and confirm 100 percent verified outcomes.
3. Run `npm run check:redirect-chains` and confirm zero chain, loop, missing-target, and cross-host anomalies.
4. Run `npm run check:canonical-alignment` and confirm zero mismatch rows.
5. Run `npm run check:host-protocol`, `npm run check:retirement-policy`, and `npm run check:redirect-security` against the same production artifact.
6. Smoke-test the live production host for homepage, one article, one category, `/feed/`, `/robots.txt`, `/sitemap.xml`, and the custom `404` route.

## Search Console continuity and sitemap transition

1. Keep DNS TXT verification active throughout the cutover window.
2. Use the production domain property or the owner-approved covering property for launch-day submission. Do not submit preview-host URLs or preview-host sitemap or feed outputs.
3. Submit `https://www.rhino-inquisitor.com/sitemap.xml` after confirming the custom domain and HTTPS path are live.
4. Retain the legacy WordPress sitemap submission during the transition period for monitoring. Redirect warnings on the retained old sitemap are expected under Google's site-move guidance.
5. Use URL Inspection only for the priority sample, not as a bulk substitute for direct HTTP validation.

## Internal-link update plan

The current internal-link audit is release-safe but not fully clean.

| Warning class | Count | Affected pages | Plan |
|---|---:|---|---|
| `wp-content-path+broken-link` | 8 warnings across 7 pages | `/b2c-commerce-cloud-campaign-erd/`, `/everything-new-in-sfcc-23-4/`, `/it-sure-has-been-quiet-on-this-blog/`, `/navigating-dates-calendars-in-sfcc/`, `/new-apis-and-features-for-a-headless-sfcc/`, `/salesforce-b2c-commerce-cloud-23-2/`, `/what-is-new-in-the-23-8-commerce-cloud-release/` | Treat these as legacy media-link deviations. Resolve before sign-off if replacement media or a retained compatibility path becomes available; otherwise keep them documented as non-page redirect warnings and monitor for 404 fallout after launch. |
| `page-warning` | 12 warnings across 12 pages | The 7 pages above plus `/ideas/`, `/ideas/page-designer-add-ability-to-copy-paste-components/`, `/ideas/page-designer-dynamic-pages-optional-subcategories/`, `/versioning-of-content-assets/`, `/video/` | These are page-level wrappers around the media warnings above or click-depth warnings. They are not blocking redirect-source page links. Keep them documented and do not let new redirect-source page URLs appear in content before launch. |

Current conclusion:

1. The audit reports `0` blocking internal-link findings.
2. No known page-level internal links to legacy redirect-source URLs are currently blocking cutover.
3. The residual warning load must remain visible in the launch log so post-launch 404 review can distinguish known asset issues from new cutover regressions.

## Production verification log template

Complete this table during T0 and the first 24 hours after cutover.

| Scope | URL or variant | Expected final URL | Expected canonical | Actual final URL | Actual canonical | Result summary | Status | Checked by | UTC time | Evidence ref |
|---|---|---|---|---|---|---|---|---|---|---|
| Host/protocol | `http://rhino-inquisitor.com/` | `https://www.rhino-inquisitor.com/` | `https://www.rhino-inquisitor.com/` | Pending | Pending | Pending | Pending |  |  |  |
| Host/protocol | `https://rhino-inquisitor.com/` | `https://www.rhino-inquisitor.com/` | `https://www.rhino-inquisitor.com/` | Pending | Pending | Pending | Pending |  |  |  |
| Host/protocol | `http://www.rhino-inquisitor.com/` | `https://www.rhino-inquisitor.com/` | `https://www.rhino-inquisitor.com/` | Pending | Pending | Pending | Pending |  |  |  |
| Host/protocol | `https://www.rhino-inquisitor.com/` | `https://www.rhino-inquisitor.com/` | `https://www.rhino-inquisitor.com/` | Pending | Pending | Pending | Pending |  |  |  |
| Host/protocol | `http://rhino-inquisitor.com/how-to-use-ocapi-scapi-hooks/` | `https://www.rhino-inquisitor.com/how-to-use-ocapi-scapi-hooks/` | `https://www.rhino-inquisitor.com/how-to-use-ocapi-scapi-hooks/` | Pending | Pending | Pending | Pending |  |  |  |
| Host/protocol | `https://rhino-inquisitor.com/how-to-use-ocapi-scapi-hooks/` | `https://www.rhino-inquisitor.com/how-to-use-ocapi-scapi-hooks/` | `https://www.rhino-inquisitor.com/how-to-use-ocapi-scapi-hooks/` | Pending | Pending | Pending | Pending |  |  |  |
| Host/protocol | `http://www.rhino-inquisitor.com/how-to-use-ocapi-scapi-hooks/` | `https://www.rhino-inquisitor.com/how-to-use-ocapi-scapi-hooks/` | `https://www.rhino-inquisitor.com/how-to-use-ocapi-scapi-hooks/` | Pending | Pending | Pending | Pending |  |  |  |
| Host/protocol | `https://www.rhino-inquisitor.com/how-to-use-ocapi-scapi-hooks/` | `https://www.rhino-inquisitor.com/how-to-use-ocapi-scapi-hooks/` | `https://www.rhino-inquisitor.com/how-to-use-ocapi-scapi-hooks/` | Pending | Pending | Pending | Pending |  |  |  |
| Host/protocol | `http://rhino-inquisitor.com/category/release-notes/` | `https://www.rhino-inquisitor.com/category/release-notes/` | `https://www.rhino-inquisitor.com/category/release-notes/` | Pending | Pending | Pending | Pending |  |  |  |
| Host/protocol | `https://rhino-inquisitor.com/category/release-notes/` | `https://www.rhino-inquisitor.com/category/release-notes/` | `https://www.rhino-inquisitor.com/category/release-notes/` | Pending | Pending | Pending | Pending |  |  |  |
| Host/protocol | `http://www.rhino-inquisitor.com/category/release-notes/` | `https://www.rhino-inquisitor.com/category/release-notes/` | `https://www.rhino-inquisitor.com/category/release-notes/` | Pending | Pending | Pending | Pending |  |  |  |
| Host/protocol | `https://www.rhino-inquisitor.com/category/release-notes/` | `https://www.rhino-inquisitor.com/category/release-notes/` | `https://www.rhino-inquisitor.com/category/release-notes/` | Pending | Pending | Pending | Pending |  |  |  |
| Critical route | `/privacy-policy/` | `https://www.rhino-inquisitor.com/privacy-policy/` | `https://www.rhino-inquisitor.com/privacy-policy/` | Pending | Pending | Pending | Pending |  |  |  |
| Critical route | `/feed/` | `https://www.rhino-inquisitor.com/feed/` | `/index.xml` helper or canonical feed target per live output | Pending | Pending | Pending | Pending |  |  |  |
| Critical route | `/robots.txt` | `https://www.rhino-inquisitor.com/robots.txt` | Not applicable | Pending | Not applicable | Pending | Pending |  |  |  |
| Critical route | `/sitemap.xml` | `https://www.rhino-inquisitor.com/sitemap.xml` | Not applicable | Pending | Not applicable | Pending | Pending |  |  |  |
| Critical route | `/404/` | `https://www.rhino-inquisitor.com/404/` | `https://www.rhino-inquisitor.com/404/` | Pending | Pending | Pending | Pending |  |  |  |

## T+1 to T+14 review cadence

| Window | Cadence | Required checks | Owner |
|---|---|---|---|
| T0 to T+1 | Every 4 hours during the first 24 hours | Priority legacy URL smoke sample, host/protocol spot check, canonical spot check, redirect-chain regression check | Engineering Owner |
| T+2 to T+7 | Daily | 404 and soft-404 review, canonical mismatch sample review, sitemap submission health, Search Console Page indexing trend review | SEO Owner + Engineering Owner |
| T+8 to T+14 | Every other day unless an incident is open | Priority route spot check, Search Console redirect and canonical status review, legacy-vs-canonical sitemap trend review | SEO Owner |

## Incident trigger thresholds

| Trigger type | Threshold | Owner | Escalation path |
|---|---|---|---|
| High-value URL failure | More than 5 priority URLs fail, or more than 2 percent of the priority-route sample fails, in the first 24 hours | Engineering Owner | Open incident immediately, notify SEO Owner, then notify Migration Owner if the threshold persists after the first verification rerun |
| Redirect chain or loop | Any confirmed chain, loop, missing target, off-site target, or HTTP downgrade in the production redirect sample | Engineering Owner | Immediate incident; freeze further content changes until corrected |
| Canonical mismatch | Any confirmed canonical mismatch on a production indexable URL | SEO Owner | Immediate SEO escalation and engineering validation; treat as release-blocking until resolved or explicitly waived by the user-owner |
| 404 or soft-404 anomaly | More than 5 new priority-route 404 or soft-404 cases in a day, or repeated failures on the same priority route across two review windows | SEO Owner | Escalate to Engineering Owner for route-level diagnosis and to Migration Owner if the issue remains open after one remediation cycle |
| Search Console redirect or canonical regression | Any new `Redirect error`, `Soft 404`, or `Duplicate, Google chose different canonical than user` issue affecting a priority URL sample | SEO Owner | Review within the same business day; escalate to Engineering Owner if confirmed in direct HTTP or artifact checks |

## Monitoring workflow

1. Start with direct HTTP validation on the live canonical host for the priority URL sample.
2. Re-run the artifact-level Phase 6 commands when the runtime symptom matches an artifact contract violation.
3. Use Search Console Page indexing and URL Inspection as secondary evidence only; do not wait for Search Console before opening an incident when direct checks already fail.
4. Record every threshold breach with the failing URLs, timestamp, verification command, and owner action.

## Escalation ownership

1. Engineering Owner handles redirect helper defects, missing targets, host/protocol drift, and chain or loop regressions.
2. SEO Owner handles canonical mismatch triage, Search Console signal review, and soft-404 classification.
3. Migration Owner decides whether a sustained production incident requires rollback or a launch-window communication update.