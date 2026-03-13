# Phase 5 Pages Constraints Report

Generated: 2026-03-13T12:32:30.084Z

## Artifact summary

| Metric | Value | Notes |
| --- | --- | --- |
| Public output path | public | Production build artifact inspected by the gate |
| Source static path | src/static | Source of truth for static passthrough assets |
| URL manifest path | migration/url-manifest.json | Alias-growth baseline source |
| Public output size | 85.59 MB | 8.36% of the 1 GB GitHub Pages published-site limit |
| Gate threshold | 800.00 MB | 10.70% of the configured gate budget currently used |
| Headroom to gate | 714.41 MB | Remaining space before the CI gate fails |
| Headroom to 1 GB Pages limit | 938.41 MB | Remaining space before the GitHub Pages hard limit |
| Artifact file count | 1870 | Regular files in public/ |
| Artifact directory count | 239 | Directories in public/ excluding root |
| Production build duration | 5.91 s | Reported when supplied by the caller or CI workflow |

## Artifact structure conformance

| Check | Status | Details |
| --- | --- | --- |
| Top-level index.html present | Pass | public/index.html is present. |
| Published size below threshold | Pass | 85.59 MB used vs 800.00 MB configured gate. |
| No symbolic links in public/ | Pass | No symbolic links detected. |
| No hard links in public/ | Pass | No hard links detected. |
| Only files and directories in public/ | Pass | No unsupported special file types detected. |

## Alias redirect growth

| Metric | Value | Notes |
| --- | --- | --- |
| Manifest merge records | 140 | All legacy routes currently classified as merge in migration/url-manifest.json |
| Pages-static merge records | 124 | Routes expected to publish as static redirect helpers |
| Edge redirect merge records | 16 | Routes already designated for edge handling |
| Redirect helper pages detected in public/ | 7 | HTML files in public/ with Hugo redirect-helper behavior |
| Redirect helper total size | 0.00 MB | Aggregate footprint of generated redirect helpers |
| Average redirect helper size | 355 bytes | Observed average HTML redirect-helper size |
| Estimated size per 100 aliases | 0.03 MB | Based on observed redirect helper pages in public/ |
| Alias warning threshold | 500 pages-static merge records | Threshold not exceeded. |

## Domain and Pages readiness snapshot

| Check | Status |
| --- | --- |
| src/static/.nojekyll present | Yes |
| Public DNS www.rhino-inquisitor.com CNAME | Current DNS still points at the legacy production stack; GitHub Pages cutover deferred to Phase 9 |
| Observed www target detail | GitHub Pages CNAME not yet published for www.rhino-inquisitor.com by owner-approved timing |
| GitHub Pages custom-domain setting | Deferred to Phase 9 by owner approval; repository settings remain the source of truth |
| GitHub Pages HTTPS status | Deferred to Phase 9 by owner approval; current production host serves HTTPS on the legacy stack |
| GitHub domain verification status | Deferred to Phase 9 by owner approval |

## Notes

- GitHub Pages custom-workflow deployments must upload a single gzip archive containing a single tar file; the tar must contain only files and directories and must not contain symbolic or hard links.
- The published site should stay under 1 GB; this repository uses an 800 MB gate to keep operational headroom before the hard limit and deployment timeout risk.
- Official GitHub guidance says .nojekyll is not required for Actions-based Pages artifacts. This repository keeps a source-controlled marker so local and CI artifacts stay aligned.
- The domain and HTTPS checks above are informational. They are captured here for Phase 7 cutover readiness but are not used as deploy-time pass/fail signals inside this script.
