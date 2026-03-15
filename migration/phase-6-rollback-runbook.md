# Phase 6 Rollback Runbook

Date: 2026-03-15
Ticket: `analysis/tickets/phase-6/RHI-071-cutover-readiness-rollback-design.md`
Status: In Progress

## Purpose

This runbook defines the rollback decision path for the approved Model A launch posture: Hugo aliases published to GitHub Pages with no edge-rule override layer available.

It exists to answer four questions under pressure:

1. When is rollback required instead of continued observation?
2. Who is authorized to decide?
3. Which rollback option is realistic on this stack?
4. What evidence proves the repaired route is actually fixed?

## Model A rollback boundary

1. Hugo aliases are static helper pages. They do not support arbitrary server-side per-path status overrides from repository config.
2. GitHub Pages deployment is the only committed recovery path in-repo. There is no edge override or CDN rule layer available under the current architecture.
3. Previous-site recovery is only a real option if the legacy site, domain controls, and operator access are still available at cutover time.
4. Because `.github/workflows/deploy-pages.yml` uses `cancel-in-progress: false`, do not queue overlapping hotfix deploys during an incident.

## Rollback authority and communication path

| Role | Named owner | Responsibility |
|---|---|---|
| Migration Owner | Thomas Theunen | Authorizes rollback or patch decision, owns incident communications, and records deviations |
| SEO Owner | Thomas Theunen | Confirms traffic, redirect, canonical, and Search Console symptoms |
| Engineering Owner | Thomas Theunen | Executes the patch or recovery path and validates the repair |

Communication order for an active incident:

1. Engineering Owner identifies and confirms the symptom.
2. SEO Owner confirms whether the issue affects priority routes, canonical behavior, or Search Console signals.
3. Migration Owner chooses patch versus rollback and records the decision.
4. Phase 7 and Phase 8 stakeholders are notified after the chosen path is underway.

## Rollback trigger thresholds

| Trigger | Threshold | Action |
|---|---|---|
| Priority-route failure count | More than 5 priority URLs fail in the first 24 hours | Open incident immediately and prepare rollback option decision |
| Priority-route sample failure rate | More than 2 percent of the priority-route sample fails in the first 24 hours | Open incident immediately and prepare rollback option decision |
| Critical route-class failure | Homepage, privacy policy, sitemap, robots, feed, or category route class fails on the canonical host | Treat as release-blocking and do not continue normal monitoring |
| Canonical mismatch | Any confirmed canonical mismatch on a priority production URL | Treat as release-blocking until repaired or explicitly waived by the owner |
| Redirect-chain, off-site, or downgrade defect | Any confirmed chain, loop, off-site target, or HTTP downgrade | Freeze changes and repair before resuming |

## Rollback decision tree

1. Confirm the symptom on the live canonical host.
2. Re-run the repository checks that match the symptom against a clean production build.
3. If the issue is isolated to a small set of alias or target defects and the content model is otherwise stable, choose Option 2: emergency Hugo patch.
4. If the issue is systemic and the previous site is still operationally recoverable inside the acceptable outage window, choose Option 1: previous-site recovery.
5. Do not choose Option 3 unless the architecture has changed from Model A to Model B before the incident.

## Option matrix

| Option | When to use | Status under Model A | Estimated execution time | Evidence required |
|---|---|---|---|---|
| Option 1: previous-site recovery | Systemic failure where a small alias or content patch is not enough and the old site is still warm and reversible | Conditional, operator-dependent | Unknown until owner confirms old-site readiness; plan for 30 to 90 minutes if viable | Old site availability check, domain or Pages reversal path, live smoke confirmation |
| Option 2: emergency Hugo patch | One or more priority routes fail because of alias, target, or content-route defects that can be repaired in-repo | Primary committed rollback path | Local artifact repair was proven in 2 seconds after the fix; budget 10 to 20 minutes end to end for edit, clean build, push, CI, and Pages propagation | Clean build output, `check:redirect-chains`, `check:redirect-targets`, live route recheck |
| Option 3: edge override rules | Only relevant if an edge redirect layer exists | Unavailable under current Model A posture | Not applicable | Architecture change required before use |

## Option 1 execution steps

Use this only if all prerequisites below are true:

1. The previous site is still deployable and content-complete.
2. The custom-domain or DNS reversal path is documented and accessible.
3. The owner explicitly chooses recovery over an in-repo patch.

Execution steps:

1. Freeze all new content and migration changes.
2. Confirm the old site deployment target and rollback controls.
3. Restore the previous site or previous-domain routing.
4. Verify homepage, one article, one category, `robots.txt`, and `sitemap` behavior.
5. Record the exact rollback timestamp and operator.

## Option 2 execution steps

1. Confirm the failing URLs and the expected outcomes from the frozen redirect map.
2. Create a hotfix branch from the freeze tag or the production `main` head.
3. Apply the smallest content, alias, or route patch needed to repair the failing priority set.
4. Delete `public/` or build into a clean destination before validating the fix. A non-clean build can preserve stale alias helper files and hide the defect.
5. Run the minimal repair bundle:

```bash
rm -rf public && hugo --minify --environment production && npm run check:redirect-chains && npm run check:redirect-targets
```

6. If the symptom also affects canonical or sitemap behavior, re-run the broader Phase 6 gate bundle before push.
7. Merge or push the hotfix to the production branch and monitor `.github/workflows/deploy-pages.yml` until deploy completes.
8. Re-run live smoke checks on the repaired priority URLs and the affected route class.
9. Record the incident, the fix, and the repair time in the Progress Log.

## Option 3 status

Edge override rollback is not executable for this repository today. Keep it documented as unavailable unless a later architecture change introduces a real edge redirect layer and updates Phase 6 policy, Phase 7 deployment, and this runbook together.

## Drill record

### Scenario

Simulated priority-route failure on the high-link legacy article route `/how-to-set-up-the-ecdn-for-staging-in-salesforce-b2c-commerce-cloud/`, which consolidates to `/how-to-set-up-the-ecdn-in-sfcc-staging/` through a Hugo alias.

### Drill steps executed on 2026-03-15

1. Removed the alias from `src/content/posts/how-to-set-up-the-ecdn-in-sfcc-staging.md` to simulate a broken priority route.
2. Ran a normal `npm run build:prod` and observed that the build reported `Aliases 16`, but the old alias helper still existed in `public/`, so `npm run check:redirect-chains` incorrectly passed.
3. Re-ran the failure simulation from a clean destination build using `rm -rf public && hugo --minify --environment production && npm run check:redirect-chains`.
4. Confirmed the expected failure:

```text
Redirect chain validation failed:
- /how-to-set-up-the-ecdn-for-staging-in-salesforce-b2c-commerce-cloud/ [missing-alias-page] Expected a built alias helper page for this pages-static redirect record.
```

5. Restored the alias and re-ran the clean build plus `npm run check:redirect-chains && npm run check:redirect-targets`.
6. Confirmed the repair returned the route to green.

### Drill outcome

| Date | Scenario | Failure detection | Repair proof | Time to local green | Blockers and lessons |
|---|---|---|---|---:|---|
| 2026-03-15 | Missing alias helper on `/how-to-set-up-the-ecdn-for-staging-in-salesforce-b2c-commerce-cloud/` | Clean build plus `check:redirect-chains` failed with `missing-alias-page` in 1 second | Clean build plus `check:redirect-chains` and `check:redirect-targets` passed after alias restore | 2 seconds after the repair was applied | A non-clean build can mask alias-removal defects because stale helper files remain in `public/`. All emergency alias validation must use a clean destination build or CI artifact. |

## Evidence checklist for incident closure

Before closing a rollback or emergency patch incident, capture all of the following:

1. Failing URL list and route class.
2. Trigger threshold crossed.
3. Decision made and decision owner.
4. Commands run locally or in CI.
5. Git commit SHA or deploy reference used for the fix.
6. Live smoke confirmation after the deploy.
7. Phase 7 and Phase 8 notification record if the incident occurred during launch.