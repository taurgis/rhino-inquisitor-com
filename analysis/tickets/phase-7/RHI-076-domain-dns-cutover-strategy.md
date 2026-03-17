## RHI-076 · Workstream C — Domain and DNS Cutover Strategy

**Status:** In Progress  
**Priority:** Critical  
**Estimate:** L  
**Phase:** 7  
**Assigned to:** Engineering Owner  
**Target date:** 2026-05-23  
**Created:** 2026-03-07  
**Updated:** 2026-03-17

---

### Goal

Define and execute the staging DNS cutover strategy that points `staging.rhino-inquisitor.com` at GitHub Pages to validate the DNS transition procedures before production cutover. This staging validation will prove the cutover runbook works, that team readiness is confirmed, and that resolver propagation behaves as expected. The strategy must be designed, documented, and **stage-validated with successful sign-off before the production www cutover is executed in Workstream G (RHI-080)**.

The strategy will establish a tested, repeatable cutover procedure that can be confidently executed against `www.rhino-inquisitor.com` and `rhino-inquisitor.com` during the production launch window.

---

### Acceptance Criteria

- [x] `migration/phase-7-dns-cutover-plan.md` is committed and contains:
  - [x] Staging-only DNS record strategy (staging subdomain pointing to GitHub Pages)
  - [x] Exact target DNS record set for staging cutover:
    - [x] `staging.rhino-inquisitor.com` CNAME pointing to `<owner>.github.io` (verify the exact owner host at execution time)
    - [x] Domain verification TXT host/value pattern is documented as `_github-pages-challenge-<owner>.staging.rhino-inquisitor.com` with value sourced from Pages UI at execution time
  - [x] TTL management plan for staging records
  - [x] Exact `dig` commands to validate staging records post-change
  - [x] DNS rollback record set (the state to restore if staging DNS must be reverted)
  - [x] Estimated propagation window based on staging TTL
  - [x] Two independent public resolver checks are defined explicitly using Cloudflare (`@1.1.1.1`) and Google (`@8.8.8.8`)
- [x] GitHub Pages settings are prepared for staging before any DNS change:
  - [x] Staging validation preconditions and go/no-go criteria are documented
  - [x] Custom domain `staging.rhino-inquisitor.com` is entered in Pages website configuration (owner-confirmed 2026-03-17)
  - [x] Pages settings show no blocking custom-domain validation errors before staging cutover (owner-confirmed 2026-03-17)
  - [x] Domain verification TXT prerequisite assessed: existing account-level domain verification for rhino-inquisitor.com satisfies ownership prerequisite; staging-specific TXT (_github-pages-challenge-taurgis.staging.rhino-inquisitor.com) required only if GitHub Pages UI explicitly demands it when staging custom domain is entered in Pages settings
- [x] DNS rollback snapshot baseline is established (staging is new; rollback is DNS record removal)
- [x] T-24-hour pre-cutover checklist is documented for staging validation:
  - [x] Configure Pages custom domain setting for staging.rhino-inquisitor.com
  - [x] Domain verification TXT assessed: account-level verification satisfies ownership prerequisite; add staging-specific TXT only if Pages UI explicitly demands it when custom domain is entered
  - [x] Prepare staging validation runbook with step-by-step sequence
  - [x] Validate all prerequisite gates are green
  - [x] Confirm staging operator availability and team readiness
- [x] Validation commands are included in the cutover plan and tested:
  - [x] `dig @1.1.1.1 staging.rhino-inquisitor.com CNAME +short`
  - [x] `dig @8.8.8.8 staging.rhino-inquisitor.com CNAME +short`
  - [x] `dig _github-pages-challenge-<owner>.staging.rhino-inquisitor.com TXT +short`
  - [x] `curl -s -o /dev/null -w "%{http_code} %{redirect_url}" https://staging.rhino-inquisitor.com/`

---

### Tasks

- [x] Research and confirm the correct GitHub Pages DNS targets (remain same for staging validation)
- [x] Configure staging custom domain in GitHub Pages settings (must be done before DNS records point staging subdomain to Pages):
  - [x] Open Pages website configuration for staging (separate from production settings)
  - [x] Enter `staging.rhino-inquisitor.com` as the custom domain
  - [x] Wait for Pages to display the DNS check result
  - [x] Check whether Pages UI shows a staging-specific TXT challenge; record host/value only if displayed (account-level verification may satisfy this without a new challenge)
  - [x] Log Pages settings state in Progress Log
- [x] Domain verification TXT assessed: existing account-level domain verification for rhino-inquisitor.com satisfies ownership prerequisite; add `_github-pages-challenge-taurgis.staging.rhino-inquisitor.com` TXT only if GitHub Pages UI explicitly demands it when staging custom domain is entered
- [x] Draft `migration/phase-7-dns-cutover-plan.md` (now focused on staging validation)
- [ ] Lower DNS TTL on staging records (execute this task prior to staging cutover window):
  - [ ] Update TTL for `staging` records to ≤300 seconds in DNS provider if applicable
  - [ ] Log the change with timestamp in Progress Log
- [ ] Set up staging CNAME record:
  - [ ] Create `staging.rhino-inquisitor.com` CNAME pointing to `taurgis.github.io`
  - [ ] Document record creation with timestamp in Progress Log
- [x] Test validation commands against expected staging state
- [x] Commit `migration/phase-7-dns-cutover-plan.md`
- [ ] Execute staging cutover (apply CNAME record; apply TXT only if Pages UI demanded it):
  - [x] Confirm Pages custom domain configuration is complete and verified
  - [ ] Apply staging CNAME record
  - [ ] Re-run resolver checks until both Cloudflare and Google return target values
- [ ] Validate staging host behavior post-cutover:
  - [x] Confirm `https://staging.rhino-inquisitor.com/` serves correct content
  - [x] Verify canonical and metadata signals are correct
  - [ ] Run SEO validation gates against staging host
- [ ] Have engineering owner review and sign off on staging validation before production cutover

---

### Out of Scope

- Executing the production `www.rhino-inquisitor.com` and apex DNS record changes (this workstream validates staging first; production execution is in WS-G, RHI-080)
- HTTPS enforcement and certificate monitoring (WS-D: RHI-077)
- CDN or edge layer configuration changes
- Email MX or other non-website DNS records

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-073 Done — Phase 7 Bootstrap complete; DNS baseline established | Ticket | Done |
| RHI-074 Done — Deployment workflow architecture complete; Pages deployment working | Ticket | Done |
| RHI-075 Done — Artifact integrity gate operational for staging validation | Ticket | Done |
| GitHub Pages staging configuration complete (owner-confirmed) | Control-plane | Done |
| Existing GitHub Pages domain verification for `rhino-inquisitor.com` accepted for staging | Control-plane | Done |
| DNS provider admin access for staging DNS operator | Access | Pending |
| GitHub Pages owner hostname (`<owner>.github.io`) confirmed from current repository/account settings | Tool | Pending |
| GitHub Pages IP addresses verified from official GitHub documentation (for production reference) | Tool | Done |
| Staging validation completes before RHI-080 production cutover | Blockage | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Custom domain is configured in DNS before being entered in Pages settings, creating a domain takeover window | Low | High | The plan must state: configure Pages settings first, then change DNS records. Never set DNS before Pages settings are ready. | Engineering Owner |
| DNS provider does not support lowering TTL below 300 seconds, increasing propagation risk | Medium | Medium | Check TTL limits at bootstrap (RHI-073); if minimum TTL is 3600 seconds, increase lead time for TTL reduction to 48 hours | Engineering Owner |
| Conflicting wildcard DNS record shadows `staging` host records and prevents Pages serving | Medium | High | Audit DNS zone for wildcards before staging cutover; remove conflicting records that affect `staging.rhino-inquisitor.com` | Engineering Owner |
| DNS propagation takes longer than the TTL reduction period, creating a window of mixed traffic | Medium | Medium | Use two independent resolvers to verify propagation; document propagation wait threshold in cutover plan; do not declare cutover complete until both resolvers return correct values | Engineering Owner |
| `staging` CNAME is pointed at the wrong target instead of `<owner>.github.io` | Low | High | Use exactly `<owner>.github.io` as the staging CNAME target (current expected value: `taurgis.github.io`), and verify with dual-resolver checks plus provider-zone confirmation when flattened | Engineering Owner |

---

### Definition of Done

- [ ] All acceptance criteria are satisfied and verified
- [ ] Staging DNS cutover has been executed successfully
- [ ] Both Cloudflare and Google resolvers return staging answers consistent with target configuration (direct CNAME or provider-flattened A/AAAA with provider-zone confirmation)
- [ ] Staging host is serving correct content with proper canonical signals
- [ ] SEO validation gates pass against staging host
- [ ] Team sign-off confirms staging validation is complete and production cutover is safe
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Minimal Closeout Checklist

The items below are the remaining actions required before RHI-076 can move from `In Progress` to `Done`.

- [ ] **Provider-zone confirmation**: record DNS provider evidence that `staging.rhino-inquisitor.com` points to `taurgis.github.io` or to the provider-flattened A/AAAA answers derived from that target.
- [ ] **Dual-resolver final snapshot**: capture final Cloudflare and Google resolver outputs in the Progress Log for `staging.rhino-inquisitor.com` and confirm they are consistent with the configured target.
- [ ] **Formal staging SEO validation**: run the staging validation checks required by Workstream E and record the result in the Progress Log.
- [ ] **Intentional staging crawl-state acknowledgement**: record that staging `robots.txt` returning `Disallow: /` and staging-host sitemap URLs are expected pre-production behavior, not defects.
- [ ] **Engineering owner sign-off**: add a named, timestamped sign-off entry confirming staging DNS validation is complete and RHI-080 may proceed.

**Closure rule:** move RHI-076 to `Done` only after all five closeout items above are evidenced in the Progress Log.

---

### Outcomes

RHI-076 is in progress. Planning artifacts, Pages configuration, and ownership-prerequisite confirmation are complete; provider-zone confirmation for flattened staging DNS plus final validation/sign-off remain open.

**Delivered artefacts (in progress):**

- `migration/phase-7-dns-cutover-plan.md` — DNS cutover plan with target records, rollback procedure, and go/no-go criteria
- `migration/phase-7-dns-snapshot.md` — rollback baseline reference from RHI-073
- `analysis/documentation/phase-7/rhi-076-domain-dns-cutover-strategy-2026-03-17.md` — implementation record and verification trace
- Progress Log entry capturing command pre-test evidence from two resolvers and current TXT status

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-17 | In Progress | Created `migration/phase-7-dns-cutover-plan.md` focused on staging-first validation (staging.rhino-inquisitor.com), added Phase 7 implementation documentation, validated required `dig`/`curl` command pack scope for staging, verified GitHub Pages targets from official docs, and confirmed external blockers remain for Pages settings staging custom-domain confirmation, staging TXT record creation, and staging DNS provider setup. Scope adjusted from production `www` cutover to staging validation as prerequisite for RHI-080 production approval. |
| 2026-03-17 | In Progress | Revalidated staging resolver behavior with owner-based TXT host format (`_github-pages-challenge-taurgis.staging.rhino-inquisitor.com`), confirmed staging A/AAAA answers from both Cloudflare and Google resolvers, confirmed HTTPS response `200` from `https://staging.rhino-inquisitor.com/`, and captured current canonical signal showing staging host. This was the pre-owner-confirmation evidence snapshot; later owner confirmation closed the Pages/TXT prerequisite questions. |
| 2026-03-17 | In Progress | Attempted to access GitHub Pages settings for `taurgis/rhino-inquisitor-com` to verify staging custom-domain state; access was blocked by GitHub authentication/permissions in current session. This check was later superseded by owner confirmation that Pages staging configuration is complete. |
| 2026-03-17 | In Progress | Owner confirmed: existing account-level GitHub Pages domain verification for rhino-inquisitor.com satisfies ownership prerequisite; staging-specific TXT is no longer a blocker and is required only if GitHub Pages UI explicitly demands it when staging custom domain is entered in Pages settings. |
| 2026-03-17 | In Progress | Owner confirmed GitHub Pages staging configuration is complete. Live staging checks continue to show HTTP `200`, canonical `https://staging.rhino-inquisitor.com/`, `og:url` on the staging host, `robots.txt` with `Disallow: /`, and sitemap loc values on `https://staging.rhino-inquisitor.com/`. Remaining gap is provider-zone confirmation for flattened staging DNS target plus final validation/sign-off. |

---

### Notes

- **Staging-first validation pattern:** This ticket proves the DNS cutover procedures on `staging.rhino-inquisitor.com` before production cutover. Once staging validation signs off, the same procedures can be applied with confidence to `www.rhino-inquisitor.com` and the apex domain in RHI-080.
- **Production cutover blocked on this sign-off:** Production DNS changes (RHI-080) cannot proceed until staging validation is complete and approved.
- **Always configure the custom domain in GitHub Pages settings before changing DNS records.** If DNS points to Pages before the custom domain is configured, any GitHub user could temporarily claim the domain by creating a repository with the same custom domain. The domain verification TXT record reduces but does not eliminate this window.
- This ticket assumes the GitHub Pages project-site preview is already live and validated. It does not replace preview rehearsal; it validates the staging-to-production cutover procedures.
- The correct CNAME target is the account/organization `<owner>.github.io` hostname, NOT a repository-specific URL. Do not include the repository name in the CNAME target.
- The domain verification TXT record (`_github-pages-challenge-<owner>.staging.rhino-inquisitor.com`) must stay in the DNS zone indefinitely after domain verification. Removing it revokes GitHub's claim on the domain and opens a takeover window.
- Reference: `analysis/plan/details/phase-7.md` §Workstream C: Domain and DNS Cutover Strategy; GitHub custom domain docs: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
