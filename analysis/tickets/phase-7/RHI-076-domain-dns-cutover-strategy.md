## RHI-076 · Workstream C — Domain and DNS Cutover Strategy

**Status:** Open  
**Priority:** Critical  
**Estimate:** L  
**Phase:** 7  
**Assigned to:** Engineering Owner  
**Target date:** 2026-05-23  
**Created:** 2026-03-07  
**Updated:** 2026-03-09

---

### Goal

Define and execute the DNS cutover strategy that points `www.rhino-inquisitor.com` and the apex domain at GitHub Pages, preserving the canonical `www` host, minimizing propagation uncertainty, and providing a clear, tested rollback path. Under the preview-first model, this strategy is finalized only after preview-host rehearsal validation passes on `https://taurgis.github.io/rhino-inquisitor-com/`.

The strategy must be designed, documented, and **dry-run validated before any DNS record is changed in production**. DNS changes are executed in Workstream G (RHI-080) during the launch window — this workstream produces the runbook that WS-G will follow.

---

### Acceptance Criteria

- [ ] `migration/phase-7-dns-cutover-plan.md` is committed and contains:
  - [ ] Current DNS record inventory (from bootstrap DNS snapshot — RHI-073)
  - [ ] Exact target DNS record set for cutover:
    - [ ] `www.rhino-inquisitor.com` CNAME pointing to `<owner>.github.io` (verify the exact owner host at execution time)
    - [ ] Apex `rhino-inquisitor.com` A records pointing to GitHub Pages IP addresses (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153)
    - [ ] Apex `rhino-inquisitor.com` AAAA records pointing to GitHub Pages IPv6 addresses
    - [ ] No conflicting wildcard records or stale A records for `www`
    - [ ] Domain verification TXT record `_github-pages-challenge-<owner>` in place
  - [ ] TTL reduction plan (lower TTL to 300 seconds or lowest provider-supported value at least 24 hours before cutover)
  - [ ] Exact `dig` commands to validate each record post-change
  - [ ] DNS rollback record set (the state to restore if DNS must be reverted)
  - [ ] Estimated propagation window based on lowered TTL
  - [ ] Two independent public resolver checks are defined explicitly using Cloudflare (`@1.1.1.1`) and Google (`@8.8.8.8`)
- [ ] GitHub Pages settings are prepared before any DNS change:
  - [ ] Preview-host rehearsal validation and Phase 8 sign-off are listed as blocking preconditions before this cutover plan can be executed
  - [ ] Custom domain `www.rhino-inquisitor.com` is entered in repository Settings → Pages
  - [ ] Pages settings show no blocking custom-domain validation errors before cutover
  - [ ] Domain verification TXT record is confirmed in place in the DNS zone
- [ ] DNS rollback snapshot is committed to `migration/phase-7-dns-snapshot.md` (from RHI-073 bootstrap or updated here)
- [ ] T-24-hour pre-cutover checklist is documented in `migration/phase-7-dns-cutover-plan.md`:
  - [ ] Lower DNS TTL on all affected records
  - [ ] Confirm preview-host rehearsal validation is complete and approved
  - [ ] Re-run release candidate CI to confirm all gates pass on final content snapshot
  - [ ] Confirm custom domain is set in Pages settings and no blocking validation errors are present
  - [ ] Confirm domain verification TXT is in place
  - [ ] Confirm Pages deployment workflow is ready and tested (RHI-074 Done)
  - [ ] Confirm incident commander, deployment operator, and DNS operator are available
- [ ] Validation commands are included in the cutover plan and have been tested against the current DNS state (to confirm they work before cutover day):
  - [ ] `dig @1.1.1.1 www.rhino-inquisitor.com CNAME +short`
  - [ ] `dig @8.8.8.8 www.rhino-inquisitor.com CNAME +short`
  - [ ] `dig @1.1.1.1 rhino-inquisitor.com A +short`
  - [ ] `dig @8.8.8.8 rhino-inquisitor.com A +short`
  - [ ] `dig @1.1.1.1 rhino-inquisitor.com AAAA +short`
  - [ ] `dig @8.8.8.8 rhino-inquisitor.com AAAA +short`
  - [ ] `dig _github-pages-challenge-<owner>.rhino-inquisitor.com TXT +short`
  - [ ] `curl -s -o /dev/null -w "%{http_code} %{redirect_url}" https://www.rhino-inquisitor.com/`

---

### Tasks

- [ ] Research and confirm the correct GitHub Pages DNS targets:
  - [ ] Verify current GitHub Pages IP addresses (A records) from official documentation
  - [ ] Verify current GitHub Pages IPv6 addresses (AAAA records) from official documentation
  - [ ] Confirm `<owner>.github.io` target from GitHub Pages settings; current expected value is `taurgis.github.io`
- [ ] Configure custom domain in GitHub Pages settings (must be done before DNS records point to Pages):
  - [ ] Open repository Settings → Pages
  - [ ] Enter `www.rhino-inquisitor.com` as the custom domain
  - [ ] Wait for Pages to display the DNS check result
  - [ ] Record the domain verification TXT record name (`_github-pages-challenge-<owner>`) from the Pages settings UI
  - [ ] Log Pages settings state in Progress Log
- [ ] Verify domain verification TXT record is in DNS:
  - [ ] Run `dig _github-pages-challenge-<owner>.rhino-inquisitor.com TXT +short`
  - [ ] If missing, add it to the DNS zone now (it does not affect traffic, only domain security)
  - [ ] Confirm it is in place before proceeding
- [ ] Draft `migration/phase-7-dns-cutover-plan.md`:
  - [ ] Section: Current DNS state (from `migration/phase-7-dns-snapshot.md`)
  - [ ] Section: Target DNS record set with exact values (A, AAAA, CNAME, TXT)
  - [ ] Section: TTL reduction plan — record current TTLs and target TTL (≤300s)
  - [ ] Section: Cutover step-by-step (exact DNS changes in provider UI or API)
  - [ ] Section: Validation commands (exact `dig` and `curl` invocations)
  - [ ] Section: Propagation monitoring — what to watch for, how long to wait
  - [ ] Section: DNS rollback procedure (exact steps to restore previous records)
  - [ ] Section: T-24-hour pre-cutover checklist
  - [ ] Section: Preview-host rehearsal preconditions and required sign-off evidence
  - [ ] Section: Go/no-go criteria for proceeding with cutover
- [ ] Lower DNS TTL (execute this task 24+ hours before the cutover window):
  - [ ] Update TTL for `www` and apex records to ≤300 seconds in DNS provider
  - [ ] Log the change with timestamp and previous TTL values in Progress Log
- [ ] Remove any conflicting or stale DNS records:
  - [ ] Check for wildcard `*` CNAME or A records that would shadow the new Pages records
  - [ ] Check for any existing `www` A records that would conflict with the CNAME
  - [ ] Document any records removed and their previous values in Progress Log
- [ ] Test validation commands against current DNS state to confirm they work as expected
- [ ] Commit `migration/phase-7-dns-cutover-plan.md`
- [ ] Have SEO owner and engineering owner review the cutover plan before signing off

---

### Out of Scope

- Executing the live DNS record changes for cutover (this workstream prepares and validates the plan; execution is in WS-G, RHI-080)
- HTTPS enforcement and certificate monitoring (WS-D: RHI-077)
- CDN or edge layer configuration changes
- Email MX or other non-website DNS records

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-073 Done — Phase 7 Bootstrap complete; DNS snapshot committed | Ticket | Pending |
| RHI-074 Done — Deployment workflow architecture complete; Pages deployment working | Ticket | Pending |
| GitHub Pages settings access (custom domain configuration) | Access | Pending |
| DNS provider admin access for DNS operator | Access | Pending |
| GitHub Pages owner hostname (`<owner>.github.io`) confirmed from current repository/account settings | Tool | Pending |
| GitHub Pages IP addresses verified from official GitHub documentation | Tool | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Custom domain is configured in DNS before being entered in Pages settings, creating a domain takeover window | Low | High | The plan must state: configure Pages settings first, then change DNS records. Never set DNS before Pages settings are ready. | Engineering Owner |
| DNS provider does not support lowering TTL below 300 seconds, increasing propagation risk | Medium | Medium | Check TTL limits at bootstrap (RHI-073); if minimum TTL is 3600 seconds, increase lead time for TTL reduction to 48 hours | Engineering Owner |
| Conflicting wildcard DNS record shadows `www` CNAME and prevents Pages serving | Medium | High | Audit entire DNS zone for wildcards at bootstrap; remove conflicting records before the cutover plan is finalized | Engineering Owner |
| DNS propagation takes longer than the TTL reduction period, creating a window of mixed traffic | Medium | Medium | Use two independent resolvers to verify propagation; document propagation wait threshold in cutover plan; do not declare cutover complete until both resolvers return correct values | Engineering Owner |
| `www` CNAME inadvertently pointed at the apex domain rather than `<owner>.github.io` (creates a CNAME loop) | Low | High | Use exactly `<owner>.github.io` as the CNAME target (current expected value: `taurgis.github.io`), not `rhino-inquisitor.com` | Engineering Owner |

---

### Definition of Done

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- `migration/phase-7-dns-cutover-plan.md` — complete DNS cutover plan and rollback procedure
- `migration/phase-7-dns-snapshot.md` — DNS zone state before cutover (updated if needed)
- GitHub Pages settings showing custom domain configured and domain verification TXT in place
- Progress Log entry confirming TTL reduction timestamp and previous TTL values

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- **Always configure the custom domain in GitHub Pages settings before changing DNS records.** If DNS points to Pages before the custom domain is configured, any GitHub user could temporarily claim the domain by creating a repository with the same custom domain. The domain verification TXT record reduces but does not eliminate this window.
- This ticket assumes the GitHub Pages project-site preview is already live and validated. It does not replace preview rehearsal; it turns that rehearsal result into an executable production cutover strategy.
- The correct `www` CNAME target is the account/organization `<owner>.github.io` hostname, NOT a repository-specific URL. Do not include the repository name in the CNAME target.
- Do not point `www` CNAME at the apex domain (`rhino-inquisitor.com`). Always point the CNAME directly at `<owner>.github.io`. Pointing `www` at the apex creates a CNAME loop if the apex also resolves through CNAME.
- The domain verification TXT record (`_github-pages-challenge-<owner>`) must stay in the DNS zone indefinitely after domain verification. Removing it revokes GitHub's claim on the domain and opens a takeover window.
- Reference: `analysis/plan/details/phase-7.md` §Workstream C: Domain and DNS Cutover Strategy; GitHub custom domain docs: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
