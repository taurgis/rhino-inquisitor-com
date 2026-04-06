# Phase 5 Pages Constraints Report

Generated: 2026-04-06T06:55:15.569Z

## Artifact summary

| Metric | Value | Notes |
| --- | --- | --- |
| Public output path | public | Production build artifact inspected by the gate |
| Source static path | src/static | Source of truth for static passthrough assets |
| URL manifest path | migration/url-manifest.json | Alias-growth baseline source |
| Public output size | 618.31 MB | 60.38% of the 1 GB GitHub Pages published-site limit |
| Gate threshold | 800.00 MB | 77.29% of the configured gate budget currently used |
| Headroom to gate | 181.69 MB | Remaining space before the CI gate fails |
| Headroom to 1 GB Pages limit | 405.69 MB | Remaining space before the GitHub Pages hard limit |
| Artifact file count | 2181 | Regular files in public/ |
| Artifact directory count | 420 | Directories in public/ excluding root |
| Production build duration | 4.16 s | Reported when supplied by the caller or CI workflow |

## Artifact structure conformance

| Check | Status | Details |
| --- | --- | --- |
| Top-level index.html present | Pass | public/index.html is present. |
| Published size below threshold | Pass | 618.31 MB used vs 800.00 MB configured gate. |
| No symbolic links in public/ | Pass | No symbolic links detected. |
| No hard links in public/ | Pass | No hard links detected. |
| Only files and directories in public/ | Pass | No unsupported special file types detected. |

## Alias redirect growth

| Metric | Value | Notes |
| --- | --- | --- |
| Manifest merge records | 141 | All legacy routes currently classified as merge in migration/url-manifest.json |
| Pages-static merge records | 18 | Routes expected to publish as static redirect helpers |
| Edge redirect merge records | 0 | Routes already designated for edge handling |
| Redirect helper pages detected in public/ | 21 | HTML files in public/ with Hugo redirect-helper behavior |
| Redirect helper total size | 0.01 MB | Aggregate footprint of generated redirect helpers |
| Average redirect helper size | 368 bytes | Observed average HTML redirect-helper size |
| Estimated size per 100 aliases | 0.04 MB | Based on observed redirect helper pages in public/ |
| Alias warning threshold | 500 pages-static merge records | Threshold not exceeded. |

## Domain and Pages readiness snapshot

| Check | Status |
| --- | --- |
| src/static/.nojekyll present | Yes |
| Public DNS www.rhino-inquisitor.com CNAME | Pending manual verification |
| Observed www target detail | Pending manual verification |
| GitHub Pages custom-domain setting | Pending repository settings verification |
| GitHub Pages HTTPS status | Pending repository settings verification |
| GitHub domain verification status | Pending repository settings verification |

## Notes

- GitHub Pages custom-workflow deployments must upload a single gzip archive containing a single tar file; the tar must contain only files and directories and must not contain symbolic or hard links.
- The published site should stay under 1 GB; this repository uses an 800 MB gate to keep operational headroom before the hard limit and deployment timeout risk.
- Official GitHub guidance says .nojekyll is not required for Actions-based Pages artifacts. This repository keeps a source-controlled marker so local and CI artifacts stay aligned.
- The domain and HTTPS checks above are informational. They are captured here for Phase 7 cutover readiness but are not used as deploy-time pass/fail signals inside this script.
