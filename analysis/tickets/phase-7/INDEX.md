# Phase 7 Ticket Index

## Project: Rhino Inquisitor — WordPress to Hugo Migration

**Phase:** 7 — GitHub Pages Preview Deployment and Domain Cutover Readiness  
**Goal:** Harden the GitHub Pages workflow around the public rehearsal host `https://taurgis.github.io/rhino-inquisitor-com/`, validate preview-host behavior and production-artifact readiness, and finish the DNS, HTTPS, SEO-safety, runbook, and rollback preparation needed before Phase 9 executes the live production cutover to `www.rhino-inquisitor.com`.  
**Timeline:** 8–10 working days  
**Phase detail:** [`analysis/plan/details/phase-7.md`](../../analysis/plan/details/phase-7.md)

---

## Ticket Summary

| Ticket ID | Title | Workstream | Priority | Status | Estimate | Target Date | Depends On |
|-----------|-------|------------|----------|--------|----------|-------------|------------|
| [RHI-073](RHI-073-phase-7-bootstrap.md) | Phase 7 Bootstrap: Kickoff and Deployment Environment Setup | Setup | Critical | Open | S | 2026-05-20 | RHI-072 |
| [RHI-074](RHI-074-deployment-workflow-architecture.md) | Workstream A — Deployment Workflow Architecture | WS-A | Critical | Open | M | 2026-05-21 | RHI-073 |
| [RHI-075](RHI-075-artifact-integrity-build-limits.md) | Workstream B — Artifact Integrity and Build Limits | WS-B | High | Open | M | 2026-05-22 | RHI-073 |
| [RHI-076](RHI-076-domain-dns-cutover-strategy.md) | Workstream C — Domain and DNS Cutover Strategy | WS-C | Critical | Open | L | 2026-05-23 | RHI-074 |
| [RHI-077](RHI-077-https-issuance-security-controls.md) | Workstream D — HTTPS Issuance and Security Controls | WS-D | High | Open | M | 2026-05-26 | RHI-076 |
| [RHI-078](RHI-078-seo-safe-deployment-host-consolidation.md) | Workstream E — SEO-Safe Deployment and Host Consolidation | WS-E | Critical | Open | M | 2026-05-27 | RHI-074 |
| [RHI-079](RHI-079-deployment-quality-gates-tooling.md) | Workstream F — Deployment Quality Gates and Tooling | WS-F | Critical | Open | M | 2026-05-28 | RHI-074, RHI-075, RHI-078 |
| [RHI-080](RHI-080-launch-window-execution-runbook.md) | Workstream G — Production Cutover Execution Runbook | WS-G | Critical | Open | M | 2026-05-29 | RHI-076, RHI-077, RHI-079 |
| [RHI-081](RHI-081-incident-response-rollback.md) | Workstream H — Incident Response and Rollback | WS-H | Critical | Open | M | 2026-05-30 | RHI-080 |
| [RHI-082](RHI-082-phase-7-signoff.md) | Phase 7 Sign-off and Handover to Phase 8/9 | Sign-off | Critical | Open | S | 2026-06-02 | RHI-073 through RHI-081 |

---

## Dependency Graph

```
RHI-072 (Phase 6 Sign-off)
    └── RHI-073 (Phase 7 Bootstrap)
            ├── RHI-074 (WS-A: Deployment Workflow Architecture)
            │       ├── RHI-076 (WS-C: Domain and DNS Cutover Strategy)
            │       │       └── RHI-077 (WS-D: HTTPS Issuance and Security Controls)
            │       │               └── RHI-080 (WS-G: Launch Window Runbook) ◄─── also needs WS-C, WS-F
            │       │
            │       ├── RHI-078 (WS-E: SEO-Safe Deployment and Host Consolidation)
            │       │       └── RHI-079 (WS-F: Quality Gates) ◄─── also needs WS-A, WS-B
            │       │
            │       └── RHI-079 (WS-F: Deployment Quality Gates and Tooling) ◄─── needs WS-A, WS-B, WS-E
            │               └── RHI-080 (WS-G: Launch Window Runbook) ◄─── also needs WS-C, WS-D
            │
            ├── RHI-075 (WS-B: Artifact Integrity and Build Limits) ◄─── parallel with WS-A
            │       └── RHI-079 (WS-F: Quality Gates)
            │
            └── [RHI-073 through RHI-081 all Done] ────────────────► RHI-082 (Sign-off)

[WS-G Done] ────────────────────────────────────────────────────────► RHI-081 (WS-H: Incident Response)
[WS-H Done] ────────────────────────────────────────────────────────► RHI-082 (Sign-off)
```

> **Reading the graph:** RHI-073 is the hard entry gate for Phase 7. WS-A (workflow) and WS-B (artifact integrity) run in parallel from Day 1 after bootstrap. WS-C (DNS strategy) and WS-E (SEO safety) both require WS-A done. WS-D (HTTPS) requires WS-C done. WS-F (quality gates) is the integration workstream requiring WS-A, WS-B, and WS-E all complete. WS-G (launch runbook) requires WS-C, WS-D, and WS-F done. WS-H (incident response) requires WS-G done. Sign-off requires all workstreams.

---

## Phase 7 Workstream Map

| Workstream | Ticket | Focus Area | Timeline (Days) |
|------------|--------|------------|-----------------|
| Setup | RHI-073 | Bootstrap and environment readiness | Day 1 |
| WS-A | RHI-074 | Deployment workflow architecture | Day 2 |
| WS-B | RHI-075 | Artifact integrity and build limits | Day 2–3 |
| WS-C | RHI-076 | Domain and DNS cutover strategy | Day 3–4 |
| WS-E | RHI-078 | SEO-safe deployment and host consolidation | Day 3–4 |
| WS-D | RHI-077 | HTTPS issuance and security controls | Day 4–5 |
| WS-F | RHI-079 | Deployment quality gates and tooling | Day 5–6 |
| WS-G | RHI-080 | Production cutover execution runbook | Day 6–7 |
| WS-H | RHI-081 | Incident response and rollback | Day 7–8 |
| Sign-off | RHI-082 | Phase 7 sign-off and Phase 8/9 handover | Day 9–10 |

---

## Key Deliverables

| Deliverable | Ticket | File Path |
|-------------|--------|-----------|
| Production deployment workflow | RHI-074 | `.github/workflows/deploy-pages.yml` |
| PR build validation workflow | RHI-074 | `.github/workflows/build-pr.yml` |
| Artifact integrity validation script | RHI-075 | `scripts/phase-7/validate-artifact.js` |
| DNS cutover plan and rollback record set | RHI-076 | `migration/phase-7-dns-cutover-plan.md` |
| DNS zone snapshot | RHI-073 | `migration/phase-7-dns-snapshot.md` |
| Mixed-content checker script | RHI-077 | `scripts/phase-7/check-mixed-content.js` |
| HTTPS monitoring checklist | RHI-077 | `migration/phase-7-https-checklist.md` |
| SEO safety checker script | RHI-078 | `scripts/phase-7/check-seo-safe-deploy.js` |
| SEO safety sign-off report | RHI-078 | `migration/phase-7-seo-safety-report.md` |
| Local gate runner convenience script | RHI-079 | `scripts/phase-7/run-all-gates.sh` |
| Gate summary CSV schema | RHI-079 | `migration/reports/phase-7-gate-summary.csv` |
| Lighthouse CI configuration | RHI-079 | `lighthouserc.js` |
| Production cutover execution runbook | RHI-080 | `migration/phase-7-launch-runbook.md` |
| Rollback runbook | RHI-081 | `migration/phase-7-rollback-runbook.md` |
| Incident log template | RHI-081 | `migration/phase-7-incident-log.md` |
| Phase 7 sign-off document | RHI-082 | `migration/phase-7-signoff.md` |
| Deployment runbook (updated) | RHI-074 | `docs/migration/RUNBOOK.md` |

---

## Phase 7 CI Gate Reference

All gates run as blocking pre-deploy steps. Failure of any gate prevents artifact upload and deployment.

| Gate | Script / Command | Blocking? | Zero-Tolerance? |
|------|-----------------|-----------|-----------------|
| Hugo production build | `hugo --gc --minify --environment production` | Yes | Yes |
| Front matter validation | `npm run validate:frontmatter` | Yes | Yes |
| URL parity check | `npm run check:url-parity` | Yes | Yes |
| Redirect chain detection | `npm run check:redirect-chains` | Yes | Yes (any chain or loop) |
| Canonical alignment check | `npm run check:canonical-alignment` | Yes | Yes (any mismatch) |
| Mixed-content check | `npm run check:mixed-content` | Yes | Yes (any HTTP reference) |
| SEO-safe deploy check | `npm run check:seo-safe-deploy` | Yes | Yes (github.io or noindex leak) |
| Broken link check | `npm run check:links` | Yes | Yes |
| Artifact integrity and size | `npm run validate:artifact` | Yes | Yes (symlinks, structure violations) |
| Lighthouse (advisory) | `npm run lhci:run` | No (advisory) | No (no thresholds set until Phase 8) |

---

## Phase 7 Definition of Done

All items below must be complete before Phase 8 validation and Phase 9 monitoring can finalize their assessments:

- [ ] RHI-073 Done — Phase 7 Bootstrap; Phase 6 contracts confirmed; team and cutover window established
- [ ] RHI-074 Done — Deployment workflow hardened; preview-host deploy and production-artifact validation path tested; Pages environment protected
- [ ] RHI-075 Done — Artifact integrity gate operational; size budget validated
- [ ] RHI-076 Done — DNS cutover plan complete; preview-rehearsal preconditions defined; custom-domain and domain-verification steps ready for execution
- [ ] RHI-077 Done — CAA records audited; mixed-content gate operational; HTTPS monitoring checklist committed
- [ ] RHI-078 Done — Preview-host `noindex` and path-prefix checks plus production-host leakage checks passing; SEO safety report committed
- [ ] RHI-079 Done — All quality gates integrated and passing on release candidate; gate reports archived
- [ ] RHI-080 Done — Production cutover runbook committed; preview prerequisites and dry-run validated; smoke test checklist defined
- [ ] RHI-081 Done — Rollback runbook committed and dry-run validated; WordPress stack confirmed rollback-ready; incident log template committed
- [ ] RHI-082 Done — Preview-host rehearsal evidence archived; production cutover strategy accepted; stakeholder sign-off recorded; Phase 8/9 handover acknowledged

---

## Non-Negotiable Phase 7 Constraints

These constraints are hard requirements from `analysis/plan/details/phase-7.md` — they are not optional and cannot be deferred:

1. Pages publishing source is **GitHub Actions** — not branch-based Jekyll publishing.
2. Deploy job permissions include **at least** `pages: write` and `id-token: write` — nothing broader.
3. Build artifact contains **top-level `index.html`** and is Pages-compatible (no symlinks).
4. Canonical production host is **locked before cutover** and reflected in build outputs.
5. **Preview-host rehearsal deployment and validation evidence must exist before custom-domain cutover work is approved.**
6. **Custom domain must be configured in Pages settings before DNS records are changed.**
7. HTTPS is **available and enforceable** before declaring launch complete.
8. URL parity and redirect gates from Phase 6 **pass on the release candidate**.
9. **Rollback procedure is validated** and owners are assigned before DNS cutover.
10. Deploy job must depend on **successful build and gate completion** (`needs` dependency).
11. `github-pages` environment protections are configured for **approved refs and actors only**.

---

## Non-Negotiable Constraint Traceability

| Constraint | Primary Verification Ticket(s) | Evidence Required |
|------------|-------------------------------|-------------------|
| Pages publishing source is GitHub Actions | RHI-074, RHI-079 | Workflow YAML and successful `workflow_dispatch` run URL |
| Deploy permissions include `pages: write` and `id-token: write` | RHI-074 | Workflow permissions review checklist + run URL |
| Artifact contains top-level `index.html` and no unsupported links/files | RHI-075 | `validate:artifact` output attached to CI artifact |
| Canonical production host is locked before cutover | RHI-078, RHI-082 | SEO safety report + live-domain canonical sample checks |
| Custom domain is configured in Pages settings before DNS changes | RHI-076, RHI-080 | Pages settings evidence + cutover runbook timestamps |
| HTTPS is available and enforceable before launch complete | RHI-077, RHI-080, RHI-082 | HTTPS checklist + HTTP-to-HTTPS curl evidence |
| Phase 6 URL parity and redirect gates pass on release candidate | RHI-073, RHI-079, RHI-082 | Gate outputs + release-candidate run URL |
| Rollback procedure is validated with assigned owners before DNS cutover | RHI-081 | Rollback dry-run evidence + authorization matrix |
| Deploy depends on successful build and validation sequence (`needs`) | RHI-074, RHI-079 | Negative test proving deploy does not run on failed build/gate |
| `github-pages` environment protections are configured for approved refs/actors | RHI-074 | Environment protection settings log + verification run |

## Cross-Phase Dependencies

| This Phase Consumes | From Phase Tickets | Required By |
|---------------------|--------------------|-------------|
| Phase 6 sign-off and redirect architecture | RHI-072, RHI-062 (Phase 6) | RHI-073, RHI-074 |
| Frozen URL manifest and redirect map | RHI-063 (Phase 6) | RHI-078, RHI-082 |
| Phase 6 CI gate suite (url-parity, redirect-chains, canonical-alignment) | RHI-070 (Phase 6) | RHI-079 |
| Cutover and rollback runbooks (Phase 6) | RHI-071 (Phase 6) | RHI-080, RHI-081 |
| Hugo scaffold and `hugo.toml` config | RHI-021, RHI-029 (Phase 3) | RHI-074 |
| SEO partials (canonical, sitemap, robots.txt templates) | RHI-024 (Phase 3) | RHI-078 |
| URL parity baseline script | RHI-025 (Phase 3) | RHI-079 |
| Front matter validation script | RHI-022 (Phase 3) | RHI-079 |
| Migrated content with `url:` and `aliases:` front matter | RHI-035, RHI-036 (Phase 4) | RHI-078 |
| Internal link rewrites | RHI-038 (Phase 4) | RHI-078 |
| Canonical and metadata policy | RHI-048, RHI-049 (Phase 5) | RHI-078 |
| Crawlability and indexing controls (robots.txt, noindex policy) | RHI-050 (Phase 5) | RHI-078 |

---

## Decision Ownership Reference

| Decision Area | Owner | Tickets |
|---------------|-------|---------|
| Deployment workflow design and permissions | Engineering Owner | RHI-074 |
| Artifact size budget enforcement | Engineering Owner | RHI-075 |
| DNS cutover sequencing and record values | Engineering Owner | RHI-076 |
| CAA record configuration for HTTPS issuance | Engineering Owner | RHI-077 |
| Canonical host compliance and SEO safety sign-off | SEO Owner | RHI-078 |
| Quality gate integration and pass/fail thresholds | Engineering Owner | RHI-079 |
| Launch window timing and go/no-go approval | Migration Owner | RHI-080 |
| Rollback trigger authorization | Migration Owner (A), Migration Owner + SEO Owner (B) | RHI-081 |
| Phase 7 sign-off | Migration Owner, SEO Owner, Engineering Owner | RHI-082 |

---

## Search Tags

`phase-7` `github-pages` `deployment` `deploy-pages` `workflow` `ci-cd` `github-actions` `pages-workflow` `artifact` `artifact-integrity` `build-limits` `symlinks` `dns` `dns-cutover` `cname` `a-record` `aaaa-record` `ttl` `domain-verification` `custom-domain` `https` `tls` `certificate` `lets-encrypt` `enforce-https` `caa-records` `mixed-content` `seo-safe-deploy` `canonical` `sitemap` `robots-txt` `noindex` `host-consolidation` `quality-gates` `url-parity` `redirect-chains` `broken-links` `lighthouse` `lhci` `launch-runbook` `smoke-tests` `go-no-go` `incident-response` `rollback` `rollback-runbook` `rollback-drill` `mttr` `wordpress-rollback` `stabilization-window` `cutover` `launch-window` `search-console` `github-pages-limits`
