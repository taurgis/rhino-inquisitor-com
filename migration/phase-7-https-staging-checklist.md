# Phase 7 HTTPS Staging Checklist

**Date:** 2026-03-17  
**Prepared by:** Engineering Owner  
**Ticket:** RHI-077  
**Status:** Done (owner confirmed GitHub Pages certificate and HTTPS configuration are correct based on live staging HTTPS availability)

## Scope

This checklist records staging-only HTTPS issuance and mixed-content readiness for `staging.rhino-inquisitor.com`. Production `www.rhino-inquisitor.com` enforcement remains out of scope until the final production cutover ticket.

## Preconditions

- RHI-076 is complete and `migration/phase-7-dns-cutover-plan.md` is the source of truth for staging DNS sequencing.
- Existing account-level domain verification for `rhino-inquisitor.com` remains in place; add `_github-pages-challenge-taurgis.staging.rhino-inquisitor.com` only if GitHub Pages explicitly demands a staging-specific TXT challenge.
- The Pages custom domain for `staging.rhino-inquisitor.com` was owner-confirmed on 2026-03-17 during RHI-076 closeout.

## Acceptance Snapshot

| Control | Status | Evidence |
|---|---|---|
| CAA record audit complete | Pass | `dig rhino-inquisitor.com CAA +short` includes `0 issue "letsencrypt.org"` on 2026-03-17. |
| HTTP redirects to HTTPS | Pass | `curl -sI http://staging.rhino-inquisitor.com/` returned `HTTP/1.1 301 Moved Permanently` with `Location: https://staging.rhino-inquisitor.com/` on 2026-03-17. |
| HTTPS homepage and representative routes return 200 | Pass | `https://staging.rhino-inquisitor.com/`, `https://staging.rhino-inquisitor.com/how-to-use-ocapi-scapi-hooks/`, `https://staging.rhino-inquisitor.com/how-to-set-up-the-ecdn-in-sfcc-staging/`, and `https://staging.rhino-inquisitor.com/category/release-notes/` each returned `200` on 2026-03-17. |
| No mixed-content requests or warnings on representative pages | Pass | Browser automation on homepage, representative article, and category page reported zero `http://` network requests and zero console messages matching `mixed content` or `insecure` on 2026-03-17. |
| Generated artifact contains no `http://` resource references | Pass | `hugo --cleanDestinationDir --gc --minify --environment production && npm run check:mixed-content` passed on 2026-03-17 (`235` HTML files, `1` CSS file scanned). |
| GitHub Pages certificate status and Enforce HTTPS toggle confirmed in Settings/API | Pass | Owner confirmed on 2026-03-17 that the GitHub Pages certificate and HTTPS configuration are correct; live staging availability on HTTPS was accepted as the closeout evidence. |

## CAA Audit Result

Command run on 2026-03-17:

```text
dig rhino-inquisitor.com CAA +short
0 issue "comodoca.com"
0 issue "digicert.com; cansignhttpexchanges=yes"
0 issue "letsencrypt.org"
0 issue "pki.goog; cansignhttpexchanges=yes"
0 issue "ssl.com"
0 issuewild "comodoca.com"
0 issuewild "digicert.com; cansignhttpexchanges=yes"
0 issuewild "letsencrypt.org"
0 issuewild "pki.goog; cansignhttpexchanges=yes"
0 issuewild "ssl.com"
```

Assessment:

- `letsencrypt.org` is explicitly authorized.
- No CAA change is required before or after staging validation.
- Reuse this result for the production HTTPS ticket unless DNS CAA records change.

## Certificate Issuance Monitoring Log

| Timestamp (UTC) | Check | Result | Evidence / Notes |
|---|---|---|---|
| 2026-03-17 | Pages custom domain configured | Pass | Owner-confirmed during RHI-076 closeout. |
| 2026-03-17 | Certificate issuance visible in GitHub Pages settings/API | Pass | Owner confirmed certificate and HTTPS configuration are correct; accepted evidence is live staging HTTPS reachability. |
| 2026-03-17 | Enforce HTTPS toggle available | Pass | Owner confirmed GitHub Pages HTTPS configuration is correct. |
| 2026-03-17 | Enforce HTTPS toggle enabled | Pass | Owner confirmed GitHub Pages HTTPS configuration is correct; live staging HTTP->HTTPS behavior and HTTPS availability match that confirmation. |

## HTTPS Verification Log

Commands run on 2026-03-17:

```text
curl -sI http://staging.rhino-inquisitor.com/
HTTP/1.1 301 Moved Permanently
Location: https://staging.rhino-inquisitor.com/

curl -s -o /dev/null -w "%{http_code}\n" https://staging.rhino-inquisitor.com/
200

curl -s -o /dev/null -w "%{http_code}\n" https://staging.rhino-inquisitor.com/how-to-use-ocapi-scapi-hooks/
200

curl -s -o /dev/null -w "%{http_code}\n" https://staging.rhino-inquisitor.com/how-to-set-up-the-ecdn-in-sfcc-staging/
200

curl -s -o /dev/null -w "%{http_code}\n" https://staging.rhino-inquisitor.com/category/release-notes/
200
```

Representative route set:

- Homepage: `https://staging.rhino-inquisitor.com/`
- Article: `https://staging.rhino-inquisitor.com/how-to-use-ocapi-scapi-hooks/`
- Article: `https://staging.rhino-inquisitor.com/how-to-set-up-the-ecdn-in-sfcc-staging/`
- Category: `https://staging.rhino-inquisitor.com/category/release-notes/`

## Mixed-Content Audit Log

### Browser Audit

URLs checked on 2026-03-17:

- `https://staging.rhino-inquisitor.com/`
- `https://staging.rhino-inquisitor.com/how-to-use-ocapi-scapi-hooks/`
- `https://staging.rhino-inquisitor.com/category/release-notes/`

Observed results:

- Zero network requests starting with `http://`
- Zero console messages matching `mixed content` or `insecure`

### Generated Output Audit

Command run on 2026-03-17:

```text
hugo --cleanDestinationDir --gc --minify --environment production
npm run check:mixed-content
check:mixed-content passed (235 HTML files, 1 CSS files scanned)
```

Observed outcome:

- The script scans generated `public/**/*.html` and `public/**/*.css` output.
- The clean release-candidate artifact passed with zero `http://` resource findings.
- CI now runs this gate before artifact upload in `.github/workflows/deploy-pages.yml`.

## Monitoring Procedure

1. Confirm staging DNS propagation with `dig staging.rhino-inquisitor.com CNAME +short` and resolver A/AAAA checks from RHI-076.
2. Check GitHub Pages settings or Pages API for certificate issuance state.
3. Confirm the Enforce HTTPS toggle is available once the certificate is ready.
4. Enable Enforce HTTPS if it is not already enabled.
5. Verify `http://staging.rhino-inquisitor.com/` redirects to `https://staging.rhino-inquisitor.com/`.
6. Verify HTTPS `200` responses on homepage and representative routes.
7. Run the mixed-content browser check on homepage, article, and category templates.
8. Run `npm run build:prod && npm run check:mixed-content` on the release-candidate artifact.
9. Record final sign-off timestamp and operator once owner confirmation or Pages control-plane evidence is captured.

## Decision SLO And Escalation

- Internal SLO: if GitHub Pages still does not expose certificate-ready / Enforce HTTPS confirmation within 60 minutes after staging DNS propagation is confirmed, place staging sign-off on incident hold.
- GitHub documents longer platform timing windows for certificate and Enforce HTTPS availability, so the 60-minute threshold is an escalation checkpoint, not proof of platform failure.
- On incident hold:
  - Recheck DNS shape and TXT verification prerequisites.
  - Recheck Pages custom-domain health in the UI or Pages API.
  - Keep staging sign-off blocked until HTTPS readiness is explicitly confirmed.

## Sign-Off

- Final owner confirmation recorded on 2026-03-17.
- Owner statement: GitHub Pages certificate and HTTPS are configured correctly; accepted evidence is that the staging site is available over HTTPS.
- Engineering-owner sign-off timestamp: 2026-03-17.

## Related Files

- `analysis/tickets/phase-7/RHI-077-https-issuance-security-controls.md`
- `.github/workflows/deploy-pages.yml`
- `scripts/phase-7/check-mixed-content.js`
- `migration/phase-7-dns-cutover-plan.md`