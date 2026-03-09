# Phase 1 Staging and Indexing Guardrails Plan

Date: 2026-03-09
Ticket: analysis/tickets/phase-1/RHI-007-staging-indexing-guardrails.md

## Change Summary

This document defines the approved Phase 1 guardrails for staging index control and DNS TTL readiness ahead of Phase 7 cutover.

## Owner Decisions

- Staging will be used during migration.
- Staging host approach: GitHub Pages preview or separate staging site.
- Planned production cutover date: 2026-04-15.

## Staging Noindex Strategy

Primary control:
- Every staging HTML page must emit `<meta name="robots" content="noindex, nofollow">`.

Secondary backstop:
- Staging robots file should set `Disallow: /`.
- This is defensive only and does not replace page-level noindex.

Implementation pattern for Hugo:
- Centralize noindex logic in one shared SEO head partial that is included by all page templates.
- Gate it by environment and an explicit staging flag.

Reference implementation pattern:

```go-html-template
{{ $stagingNoindexFlag := .Site.Params.staging_noindex | default false }}
{{ $isStaging := eq hugo.Environment "staging" }}
{{ $emitNoindex := and $isStaging (not hugo.IsProduction) $stagingNoindexFlag }}
{{ if $emitNoindex }}
<meta name="robots" content="noindex, nofollow">
{{ end }}
```

Production leakage prevention:
- CI must fail if noindex appears in a production build artifact.
- CI must fail if noindex is missing from staging sample URLs.

## Search Console Guardrail

Definition:
- No staging URL should appear in the production Search Console property.

Verification method (when staging is live):
1. Use URL Inspection live test on representative staging URLs.
2. Validate indexed-state in the production property for staging host patterns.
3. Save screenshots or exports as launch evidence.

Note:
- This verification is blocked until staging is deployed in Phase 3.

## Launch Unblock Checklist (Pre-Production)

1. Disable staging noindex logic for production environment only.
2. Confirm production robots policy allows crawl and indexing where intended.
3. Build production artifact and verify no noindex tags remain.
4. Deploy production.
5. Run Search Console URL Inspection and index-state checks on representative production URLs.

## DNS Baseline Snapshot (Rollback Reference)

Capture date: 2026-03-09

Nameservers:
- apollo.ns.cloudflare.com
- may.ns.cloudflare.com

www host records:
- www.rhino-inquisitor.com A 104.21.15.73 (TTL 300 at 1.1.1.1 and 8.8.8.8)
- www.rhino-inquisitor.com A 172.67.161.237 (TTL 300 at 1.1.1.1 and 8.8.8.8)

apex host records:
- rhino-inquisitor.com A 104.21.15.73 (TTL 300 at 1.1.1.1 and 8.8.8.8)
- rhino-inquisitor.com A 172.67.161.237 (TTL 300 at 1.1.1.1 and 8.8.8.8)
- rhino-inquisitor.com AAAA 2606:4700:3031::6815:f49 (TTL 300 at 1.1.1.1 and 8.8.8.8)
- rhino-inquisitor.com AAAA 2606:4700:3033::ac43:a1ed (TTL 300 at 1.1.1.1 and 8.8.8.8)

## DNS TTL Reduction Plan

Current observed TTL:
- 300 seconds on www and apex records.

Target TTL:
- 300 seconds or lower.

Schedule:
- TTL reduction date: 2026-04-08 (at least 7 days before cutover).
- Cutover date: 2026-04-15.
- Post-cutover stability check window: 48 hours.
- TTL restore-to-normal date (if desired): 2026-04-17.

Execution note:
- Since TTL is already 300, validate that values remain at 300 on 2026-04-08 and record confirmation in cutover logs.

## Approvals

- Migration owner approval: User (ticket owner), confirmed 2026-03-09.
- SEO owner approval: User (ticket owner), confirmed 2026-03-09.

## Official References

- Google robots meta and X-Robots-Tag guidance: https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
- Google block indexing guidance: https://developers.google.com/search/docs/crawling-indexing/block-indexing
- GitHub Pages custom domains: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- GitHub Pages HTTPS guidance: https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
