# Phase 7 Staging Rollback Runbook

**Date:** 2026-03-19  
**Ticket:** RHI-081  
**Status:** Done

## Purpose

This runbook defines the rollback decision path for the Phase 7 staging-first cutover pattern and the shared GitHub Pages control plane that will later be reused for production cutover. It exists to remove improvisation when a staging-blocking or launch-blocking failure occurs.

The runbook answers five operator questions:

1. Which failures mandate rollback instead of continued observation?
2. Which rollback option is preferred for each failure class?
3. Who can authorize each option under the repository single-owner model?
4. What timing target applies to each option?
5. What evidence must exist before rollback is considered complete and before re-launch is attempted?

## Scope Boundary

In scope:

1. Objective rollback trigger definitions.
2. Rollback Option A: redeploy the last known-good GitHub Pages deployment path.
3. Rollback Option B: revert DNS to the pre-cutover host state captured in the Phase 7 DNS baseline.
4. Rollback Option C: apply a temporary crawl-sensitive hold for isolated defects.
5. Authorization matrix, MTTR objectives, notification template, and rollback deactivation criteria.

Out of scope:

1. Executing a rollback during a live incident.
2. Permanent SEO or template changes unrelated to incident containment.
3. External hosting-provider confirmations that cannot be proven from the repository alone.

## Current Evidence Status

| Area | Current evidence | Status |
|---|---|---|
| Known-good Pages deployment reference | Deploy to GitHub Pages run `#132` on commit `bbb183e`: `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23213150405` | Ready |
| Deploy workflow shape | `.github/workflows/deploy-pages.yml` with separate `build` and `deploy` jobs | Ready |
| DNS rollback baseline | `migration/phase-7-dns-snapshot.md` and `migration/phase-7-dns-cutover-plan.md` | Ready |
| Staging cutover handoff | `migration/phase-7-staging-launch-runbook.md` | Ready |
| Option A rehearse-and-verify path | Owner-confirmed on 2026-03-19 | Ready |
| WordPress rollback target remains available | Owner-confirmed on 2026-03-19 | Ready |
| DNS-provider non-destructive rehearsal | Owner-confirmed Option B rehearsal completed on 2026-03-19 | Ready |
| Runbook review | Owner review confirmed on 2026-03-19 | Reviewed |
| Formal owner sign-off | Recorded on 2026-03-19 under the repository single-owner governance model | Done |

## Priority Route Set For Trigger Evaluation

Use the same route set every time this runbook is exercised.

1. Homepage, privacy policy, `robots.txt`, `sitemap.xml`, and the active feed endpoint from `migration/phase-7-staging-launch-runbook.md`.
2. The deterministic post and category smoke sample from `migration/phase-7-staging-launch-runbook.md`.
3. Any route explicitly marked Priority-1 or Priority-2 in the active release-candidate validation set once Phase 8 freezes that dataset.

Until the Phase 8 dataset exists, the Phase 7 staging smoke matrix is the authoritative priority-route set.

## Owner Model And Authorization Matrix

The repository currently uses a single-owner model. Unless a delegation record is added before the launch window, Thomas Theunen holds all approval roles.

| Role | Name | Contact method | Responsibility |
|---|---|---|---|
| Migration Owner / Incident Commander | Thomas Theunen | GitHub `@taurgis` | Declares incident hold, authorizes Option A, records incident decisions, and sends stakeholder updates. |
| SEO Owner | Thomas Theunen | GitHub `@taurgis` | Confirms canonical, sitemap, crawl-state, and soft-404 symptoms; co-approves Option B; approves Option C intent. |
| Engineering Owner | Thomas Theunen | GitHub `@taurgis` | Executes deploy, DNS, or template hotfix steps and validates technical recovery evidence. |

| Option | Authorization rule | Current named owner |
|---|---|---|
| Option A — re-run known-good Pages deploy path | Migration Owner approval | Thomas Theunen |
| Option B — revert DNS to previous host state | Migration Owner plus SEO Owner concurrence | Thomas Theunen under the single-owner model |
| Option C — temporary crawl-sensitive hold | SEO Owner approval plus Incident Commander acknowledgment | Thomas Theunen under the single-owner model |

If any role is delegated before cutover, update this table and the ticket progress log before the window opens.

## Rollback Trigger Definitions

Treat the staging propagation window as closed after both are true:

1. The DNS operator has recorded provider-zone confirmation or stable resolver convergence.
2. At least `2 x TTL` has elapsed since the change was applied. With the current `300`-second TTL baseline, the initial decision window is `10` minutes.

| Trigger | Objective threshold | Measurement source | Mandatory action | Preferred option |
|---|---|---|---|---|
| Priority-route outage | Five or more priority routes return `404` or `5xx` after the propagation window closes | Live smoke sample, `curl`, browser check, or monitoring evidence | Open incident immediately and start rollback within the MTTR target unless a smaller isolated hotfix is proven faster | Option A first |
| HTTPS unavailable | `Enforce HTTPS` is still unavailable 60 minutes after propagation confirmation and the incident blocks safe continuation | GitHub Pages settings plus `curl -I http://...` and `curl -I https://...` | Hold launch and choose rollback or wait strategy explicitly | Option A first, Option B if host or DNS state is corrupt |
| Canonical or sitemap host leak | Any live production-domain response emits a canonical or sitemap `<loc>` on `github.io`, or any non-target host leaks into the active cutover domain | Page source, sitemap sample, structured data sample | Treat as release-blocking immediately | Option A first |
| Soft-404 on P1/P2 route | Any Priority-1 or Priority-2 URL resolves to the homepage or unrelated content instead of the mapped destination | Live route check against the approved URL intent | Treat as release-blocking immediately | Option A first |
| Pages platform unhealthy | `github-pages` deployment is failed, unresponsive, or the served site returns repeated timeout/`5xx` symptoms from multiple checks for 10 minutes | GitHub Actions run state, Pages environment URL, and live host checks | Escalate immediately and choose between Pages redeploy and DNS revert | Option B if Pages is the fault; otherwise Option A |

Option C is never the primary response to a systemic trigger. It is permitted only for isolated crawl-risk containment while a repair or a broader rollback is being executed.

## Option A — Redeploy Last Known-Good Pages Artifact Path

### When To Prefer Option A

Use Option A first when the active deployment is wrong, incomplete, or serving the wrong host-state, but the GitHub Pages control plane itself is still healthy.

Examples:

1. Canonical or sitemap output leaks the wrong host.
2. An isolated deploy served the wrong artifact.
3. Multiple priority routes fail after a deploy but the prior deployment is known good.

### Phase 7 Artifact Caveat

The current `.github/workflows/deploy-pages.yml` workflow deploys the preview-host rehearsal artifact and archives the production-validation build separately. A redeploy from the known-good Phase 7 run restores the Pages-served artifact for the active host mode; it does not restore the archived production-validation output directly.

### Identify The Last Known-Good Run

1. Open GitHub Actions and select `Deploy to GitHub Pages`.
2. Filter to completed successful runs on `main` or the equivalent validated dispatch run.
3. Record the run number, commit SHA, run URL, and deployment URL.
4. Confirm the `deploy` job succeeded and the run corresponds to a release candidate that passed the blocking gates.
5. Prefer the most recent successful run before the incident began.

Current known-good reference prepared for rehearsal:

| Run number | Commit | Run URL | Status |
|---|---|---|---|
| `#132` | `bbb183e` | `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23213150405` | Known-good reference identified |

### Execute Option A

1. Open the chosen workflow run in GitHub Actions.
2. Attempt to rerun the `deploy` job only from that known-good run.
3. If deploy-only rerun is unavailable or the Pages artifact has expired, rerun all jobs from the same known-good run.
4. If the same-run rerun path is unavailable, trigger `workflow_dispatch` on the same known-good commit SHA.
5. Do not rerun only the `build` job and assume the live Pages site changed.
6. Record the operator, timestamp, and selected fallback path in the incident log.

### Expected Recovery Time

1. Action start target: less than 30 minutes from rollback decision.
2. Deploy-only rerun budget: 10 to 20 minutes after action start, excluding GitHub queue delay.
3. Rerun-all or `workflow_dispatch` fallback budget: 20 to 40 minutes after action start, excluding GitHub queue delay.

### Verification After Redeploy

1. Confirm the rerun completed successfully and the `github-pages` environment reports a fresh deployment.
2. Check the active host homepage, one article, one category page, `robots.txt`, `sitemap.xml`, and the feed endpoint.
3. Confirm canonical, sitemap, feed, and robots host values align with the intended host state.
4. Recheck every failing priority route from the incident trigger list.
5. Record elapsed time from decision to verified recovery in the incident log.

### Dry-Run Status

| Requirement | Status | Evidence |
|---|---|---|
| Known-good run identified | Ready | Run `#132` on commit `bbb183e` |
| Deploy-only rerun rehearsed | Ready | Owner confirmed on 2026-03-19 that Option A was dry-run rehearsed successfully and the documented verification checks passed on the Pages-served URL |

## Option B — Revert DNS To Previous Host State

### When To Prefer Option B

Use Option B when the Pages platform or custom-domain state itself is the problem, or when Option A cannot restore a safe host state quickly enough.

Examples:

1. GitHub Pages environment is unhealthy or repeatedly unresponsive.
2. Custom-domain routing is corrupt even though the artifact is correct.
3. HTTPS issuance or host configuration failure makes the Pages site unsafe to expose.

### Exact DNS Changes To Execute

#### Staging Host Revert

Source of truth: `migration/phase-7-dns-cutover-plan.md`

| Host | Type | Restore action |
|---|---|---|
| `staging.rhino-inquisitor.com` | `CNAME` | Remove the GitHub Pages `taurgis.github.io` value or restore the pre-cutover value captured by the DNS operator |
| `_github-pages-challenge-taurgis.staging.rhino-inquisitor.com` | `TXT` | Keep in place to preserve GitHub domain verification protection |

#### Current Committed Pre-Cutover Public Baseline

Source of truth: `migration/phase-7-dns-snapshot.md`

| Host | Type | Value |
|---|---|---|
| `www.rhino-inquisitor.com` | `A` | `172.67.161.237` |
| `www.rhino-inquisitor.com` | `A` | `104.21.15.73` |
| `www.rhino-inquisitor.com` | `AAAA` | `2606:4700:3031::6815:f49` |
| `www.rhino-inquisitor.com` | `AAAA` | `2606:4700:3033::ac43:a1ed` |
| `rhino-inquisitor.com` | `A` | `104.21.15.73` |
| `rhino-inquisitor.com` | `A` | `172.67.161.237` |
| `rhino-inquisitor.com` | `AAAA` | `2606:4700:3033::ac43:a1ed` |
| `rhino-inquisitor.com` | `AAAA` | `2606:4700:3031::6815:f49` |

### Expected Propagation Time

1. Action start target: less than 30 minutes from rollback decision.
2. Resolver-convergence target with the current reduced TTL: approximately `2 x TTL` or 10 minutes for the first decision window.
3. Wider Internet propagation remains variable and can take significantly longer; track it separately from the action-start MTTR.

### Verification After DNS Revert

1. Re-run `dig` checks against `@1.1.1.1` and `@8.8.8.8`.
2. Confirm provider-zone state matches the recorded rollback action.
3. Validate the expected fallback host behavior with `curl` and a browser check.
4. Confirm HTTPS behavior is acceptable for the restored host state.
5. Record the rollback timestamp, operator, and first stable convergence time.

### Conditions Where Option B Is Preferred Over Option A

1. The Pages deployment environment is unhealthy or repeatedly failing.
2. DNS or custom-domain state is the fault, not the deployed artifact.
3. The prior Pages artifact is unavailable and a rebuild would take too long for the incident severity.

### WordPress Rollback-Readiness Record

The previous WordPress production stack is confirmed rollback-ready under the current staging-first Phase 7 contract.

| Requirement | Current status | Evidence |
|---|---|---|
| WordPress site confirmed operational at the current host | Ready | Owner confirmed on 2026-03-19 that the previous WordPress stack remains available as the rollback target during the stabilization window |
| Hosting hold in place for the stabilization window | Ready | Owner confirmed on 2026-03-19 that the previous WordPress stack remains rollback-ready and is not being decommissioned during the stabilization window |
| WordPress host configuration documented | Ready | The rollback target is the pre-cutover public host state captured in `migration/phase-7-dns-snapshot.md`; Option B restores those DNS values and removes the staging CNAME to GitHub Pages as documented above |

### Dry-Run Status

| Requirement | Status | Evidence |
|---|---|---|
| DNS revert procedure documented | Ready | `migration/phase-7-dns-cutover-plan.md` plus this runbook |
| Non-destructive DNS rehearsal executed | Ready | Owner confirmed on 2026-03-19 that Option B was dry-run rehearsed and verified outside production |

## Option C — Hold Crawl-Sensitive Endpoints

### When Option C Is Allowed

Option C is a temporary containment step for isolated crawl-risk defects. It is not a substitute for Option A or Option B when the incident is systemic.

Use it only when all are true:

1. The defect is isolated to a small set of URLs or one template class.
2. User-facing functionality remains broadly available.
3. A repair or broader rollback is already underway or scheduled immediately.

### Mode 1: Crawl-Throttle Hold

Use this only when the goal is reducing crawler traffic to affected paths.

1. Edit `src/layouts/robots.txt` and add temporary `Disallow:` directives only for the affected path set.
2. Commit the change to `main` and let `.github/workflows/deploy-pages.yml` deploy it.
3. Verify the live `robots.txt` output contains the temporary path blocks.
4. Timebox the hold and log the revert checkpoint in the incident record.

### Mode 2: De-Index Hold

Use this only when the goal is removing a crawlable page from search results.

1. Do not block the affected URL in `robots.txt` while Google still needs to read `noindex`.
2. Apply `noindex` to the affected pages through content front matter or template logic so the rendered page emits `<meta name="robots" content="noindex, nofollow">`.
3. In this repository, page-level robots output is resolved in `src/layouts/partials/seo/resolve.html`, and non-production builds already emit `noindex, nofollow` automatically.
4. Commit the change to `main`, deploy it, and verify the live HTML shows the intended robots meta tag.
5. If rapid search-result suppression is required, use the search-engine removal process in parallel with the durable `noindex` signal.

### Option C Constraints

1. Option C is appropriate only for isolated defects.
2. Option C must be treated as a temporary hold, not a permanent fix.
3. If the hold is still active after 4 hours, re-evaluate Option A or Option B explicitly.
4. Because GitHub Pages does not provide repository-controlled response headers for this stack, use page output and `robots.txt`, not assumed `X-Robots-Tag` headers.

## MTTR Objectives And Escalation

| Option | MTTR objective | Completion note |
|---|---|---|
| Option A | Action started in less than 30 minutes | Recovery verification depends on GitHub queue time and deployment duration |
| Option B | Action started in less than 30 minutes | DNS propagation is tracked separately and is not counted as completed MTTR |
| Option C | Action started in less than 30 minutes | Hold must be reverted or escalated within 4 hours |

Escalation rules:

1. If no rollback action has started within 30 minutes of the decision, escalate immediately to the Incident Commander and record the blocker.
2. If Option A is still not verified after 20 minutes of active execution, prepare Option B in parallel.
3. If Option B shows no resolver movement after `2 x TTL`, recheck provider-zone state and record whether the wider propagation wait is acceptable.
4. If Option C remains active beyond its timebox, treat the incident as unresolved and choose Option A or Option B explicitly.

## Stakeholder Notification Template

Send this within 15 minutes of the rollback decision:

```text
Phase 7 rollback update: <Option A | Option B | Option C> started.
Trigger: <objective threshold crossed>
Impact: <affected host/routes and whether crawl state or reachability is impacted>
Current action: <redeploy known-good run | revert DNS | temporary crawl-sensitive hold>
Next update / contact: Thomas Theunen (@taurgis) by <time>
```

## Rollback Deactivation Criteria

Do not reverse a rollback or attempt re-launch until all are true:

1. Root cause is identified and documented.
2. The corrected artifact, DNS state, or crawl-control state is validated outside the incident path.
3. All affected priority routes are green on the live host.
4. Canonical, sitemap, feed, and robots signals match the intended host state.
5. Required CI or smoke checks for the incident scope are green.
6. Migration, SEO, and engineering owner approval is recorded.
7. Stakeholders have been told the rollback is closed and re-launch planning is explicit.

## Dry-Run Evidence Log

| Date | Option | Status | Evidence |
|---|---|---|---|
| 2026-03-19 | Option A | Done | Owner confirmed a prior GitHub Pages deploy job was re-run successfully, the Pages-served URL returned the expected content, and the documented verification steps passed |
| 2026-03-19 | Option B | Done | Owner confirmed the non-production DNS revert rehearsal completed successfully, validated the documented restore procedure, and kept the pre-cutover WordPress rollback target available |

## Sign-Off Record

| Role | Status | Evidence |
|---|---|---|
| Migration Owner | Signed off | Formal sign-off recorded on 2026-03-19 under the repository single-owner governance model |
| SEO Owner | Signed off | Formal sign-off recorded on 2026-03-19 under the repository single-owner governance model |
| Engineering Owner | Signed off | Formal sign-off recorded on 2026-03-19 under the repository single-owner governance model |

## Related Files

1. `analysis/tickets/phase-7/RHI-081-incident-response-rollback.md`
2. `migration/phase-7-staging-launch-runbook.md`
3. `migration/phase-7-dns-cutover-plan.md`
4. `migration/phase-7-dns-snapshot.md`
5. `.github/workflows/deploy-pages.yml`
6. `src/layouts/robots.txt`
7. `src/layouts/partials/seo/resolve.html`