# RHI-068 Redirect Security Controls

## Change summary

RHI-068 now has a dedicated Phase 6 redirect-security gate, a committed security review section in the shared Phase 6 URL policy, and a machine-readable report that proves the current alias and redirect surfaces stay same-site, avoid HTTP downgrade, and do not expose credential-like or PII-like patterns in Phase 6 scripts or reports.

## Why this changed

The repository already had redirect-quality and host/protocol checks in place, but RHI-068 still lacked the ticket-specific security control named in the acceptance criteria:

1. there was no dedicated `check:redirect-security` command in `package.json`,
2. there was no validator that combined source alias review, `url-map` HTTP-target review, built alias-page destination review, and Phase 6 artifact hygiene checks,
3. `migration/phase-6-url-policy.md` still reserved the security section as a future addition rather than an active control.

Without a ticket-specific gate, Phase 6 could prove redirect correctness, but not redirect abuse resistance.

## Behavior details

Old behavior:

1. `scripts/phase-6/validate-alias-pages.js` verified merge-target correctness for pages-static redirect rows, but it did not enforce same-site HTTPS-only policy across every reviewed redirect surface.
2. `scripts/phase-6/check-host-protocol.js` validated canonical host integrity for indexable pages, sitemap output, and robots directives, but it did not act as a redirect-security gate for alias helper pages.
3. The Phase 6 URL policy documented host/protocol and retirement rules, but the security section was still pending.

New behavior:

1. `npm run check:redirect-security` now:
   - audits all committed `aliases` front matter values under `src/content/**`,
   - fails on empty, absolute, or malformed alias values,
   - audits `migration/url-map.csv` and fails on any `http://` target URL,
   - parses built redirect helper pages in `public/` and fails on off-site, HTTP, self-referencing, missing, or mismatched canonical/meta-refresh destinations,
   - scans Phase 6 scripts and reports for credential-like and PII-like patterns,
   - writes `migration/reports/phase-6-redirect-security.csv` as the ticket evidence file.
2. `migration/phase-6-url-policy.md` now contains the active redirect-security policy, the allowlisted feed-helper boundary, and the RHI-068 checklist plus sign-off record.
3. The feed compatibility helper pages remain explicitly scoped as a separate static compatibility surface. They are allowlisted only for same-site `/index.xml` resolution and are not treated as generic alias-template exceptions.

## Impact

1. Maintainers now have a single Phase 6 command that converts redirect-security expectations into a blocking validator.
2. The current repository state proves zero absolute alias URLs in `src/content/**`, zero HTTP target URLs in `migration/url-map.csv`, and same-site redirect destinations across the reviewed built alias pages.
3. RHI-070 can now reference an implemented `check:redirect-security` command instead of a planned future gate.
4. The engineering-owner sign-off is now recorded in `migration/phase-6-url-policy.md`, so RHI-068 can be treated as complete and can unblock downstream Phase 6 work.

## Verification

1. Build a clean production artifact:

```bash
npm run build:prod
```

2. Run the redirect-security gate:

```bash
npm run check:redirect-security
```

3. Cross-check the adjacent redirect surfaces:

```bash
npm run phase6:validate-alias-pages
npm run check:host-protocol
```

Verified on 2026-03-14:

1. `npm run build:prod` completed successfully with `Pages 205`, `Aliases 17`, and zero build errors.
2. `npm run check:redirect-security` passed with `50` pass rows and `0` fail rows in `migration/reports/phase-6-redirect-security.csv`.
3. The redirect-security report captured:
   - `15` valid content alias values,
   - `338` reviewed `url-map` target URLs,
   - `18` pages-static merge rows,
   - `17` Phase 6 script/report files scanned for credential-like and PII-like patterns.
4. `npm run phase6:validate-alias-pages` passed for `18` alias-backed redirect rows.
5. `npm run check:host-protocol` passed with metadata, sitemap, and crawl-control reports written under `tmp/phase-6-host-protocol/`.

## Related files

1. `scripts/phase-6/check-redirect-security.js`
2. `package.json`
3. `migration/phase-6-url-policy.md`
4. `migration/reports/phase-6-redirect-security.csv`
5. `analysis/tickets/phase-6/RHI-068-security-privacy-redirect-controls.md`