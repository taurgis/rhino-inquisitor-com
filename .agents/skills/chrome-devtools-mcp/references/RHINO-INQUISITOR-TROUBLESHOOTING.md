# Rhino Inquisitor Chrome DevTools MCP Troubleshooting

Use this reference when a browser-validation task in this workspace fails because the wrong host, wrong build mode, or wrong validation surface was chosen.

## Which host should I open?

| Situation | Start with | Why |
|-----------|------------|-----|
| Iterating on current workspace changes | `http://localhost:1313/` after `npm run dev` | Fastest feedback loop for template, content, and CSS checks. |
| Reproducing production-style HTML locally | Build with `npm run build:prod` and serve the generated `public/` output | Matches production environment rules more closely than staging. |
| Rehearsing preview-host behavior | `https://staging.rhino-inquisitor.com/` | The preview environment is intentionally non-indexable and uses preview-mode output. |
| Validating a GitHub Pages preview entrypoint | The preview URL produced by the Pages run | It can redirect into staging, and that redirect chain is part of the evidence. |

## Problem: the GitHub Pages preview URL lands on staging

Expected behavior in this repository. Preview entrypoints can redirect into `https://staging.rhino-inquisitor.com/` and that redirect chain must be preserved in the report.

What to do:

1. Record the requested URL and final URL separately.
2. Include each redirect hop and status code in your result.
3. Treat an intact redirect chain as evidence, not as an automatic failure.

## Problem: staging returns `noindex,nofollow`

Usually not a bug. Preview and staging surfaces are intentionally blocked from indexing.

What to do:

1. Confirm you are on `https://staging.rhino-inquisitor.com/` or another preview-host surface.
2. Report `noindex,nofollow` as expected preview behavior unless the task explicitly says otherwise.
3. Escalate only if the same route should be production-indexable and you are validating a production build instead.

## Problem: the page looks wrong on staging but correct on localhost

Likely causes:

- You are comparing development output against preview-mode output.
- The current branch changes are not deployed to the hosted rehearsal surface.
- A base URL, canonical, or preview-host assumption differs between local and hosted builds.

What to do:

1. Use `npm run dev` for interactive local checks.
2. Use `npm run build:staging` when you need to reason about preview-host output.
3. Compare the canonical URL, robots meta, and route path before concluding there is a rendering defect.

## Problem: a Rich Results or structured-data live check fails on staging

This repository does not treat live staging-host Rich Results fetch failures as blockers, because staging is intentionally blocked from indexing.

What to do instead:

1. Build a clean production artifact with `npm run build:prod`.
2. Serve the generated production output locally.
3. Use code-mode validation against the local production HTML when the workflow requires Rich Results evidence.

## Problem: preview or staging findings look stale

Likely causes:

- The local server is still serving old content.
- The hosted rehearsal surface has not been rebuilt from the current branch.
- Generated artifacts in `public/` do not match the environment you think you are testing.

What to do:

1. Restart the local server if you are using `npm run dev`.
2. Rebuild with the environment that matches the task: `npm run build:local`, `npm run build:staging`, or `npm run build:prod`.
3. Re-run the relevant repo checks if the task is about release safety, especially `npm run check:preview-launch-readiness`, `npm run check:crawl-controls`, or `npm run check:seo-safe-deploy`.

## Problem: route behavior differs between preview entrypoint and final host

Do not normalize the evidence too early.

What to do:

1. Capture the redirect chain first.
2. Compare the requested preview entrypoint, final host, canonical URL, and robots directives separately.
3. Report whether the behavior difference is caused by redirection, page markup, or environment policy.

## Suggested Stable Routes

Use stable route families that already appear in the repository validation set when you need durable prompt examples:

- `/`
- `/archive/`
- `/posts/`
- `/category/ai/`
- `/category/architecture/`
- `/real-time-inventory-checks-in-sfcc/`
- `/a-dev-guide-to-combating-fraud-on-sfcc/`

## Repo Commands Worth Naming In Prompts

- `npm run dev` for local Hugo preview at `http://localhost:1313/`
- `npm run build:staging` for preview-mode hosted output assumptions
- `npm run build:preview-pages` when reproducing a Pages preview build with `PREVIEW_BASE_URL`
- `npm run build:prod` for production-style HTML checks and structured-data evidence
- `npm run check:preview-launch-readiness` for preview-host smoke validation
- `npm run check:crawl-controls` for crawl-blocking and robots policy validation
- `npm run check:seo-safe-deploy` for broader preview safety validation

## Evidence Checklist

- [ ] Host matches the validation goal
- [ ] Requested URL and final URL are both recorded when redirects occur
- [ ] `noindex` findings are classified as expected or unexpected based on environment
- [ ] Production-only validation is not inferred from staging behavior
- [ ] Repo command names match `package.json`
