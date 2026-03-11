# RHI-044 Markdown Structure Normalization

## Change summary

Extended the staged-content correction pass so Batch 2 generated Markdown is normalized for repository markdownlint rules before synced files are reviewed or committed.

## Why this changed

The durable metadata fix in RHI-044 regenerated staged and synced Markdown that still contained converter-style structural artifacts. The PR build then failed on changed Markdown files with markdownlint violations such as list-marker spacing, ordered-list prefixes, hard tabs, unlabeled fenced code blocks, trailing punctuation in headings, nested-list indentation, spaced emphasis markers, bare URLs, and malformed multiline tables.

## Behavior details

### Old behavior

- `scripts/migration/apply-content-corrections.js` handled content-shape cleanup such as fenced-code indentation, image paragraph normalization, inline callouts, malformed empty-header tables, alt overrides, and link-text overrides.
- The correction pass did not normalize several markdownlint-sensitive structures emitted by conversion or downstream rewrites.
- As a result, regenerated files under `migration/output/content/**` and the synced subset under `src/content/**` could fail the PR job `Lint changed Markdown files` even when SEO and migration-specific checks passed.

### New behavior

- `scripts/migration/apply-content-corrections.js` now also normalizes markdownlint-sensitive structure in staged Markdown by:
  - expanding hard tabs
  - assigning a fallback language to unlabeled fenced code blocks
  - collapsing repeated list markers left by conversion artifacts
  - normalizing unordered and ordered list spacing
  - normalizing ordered-list prefixes to the repository lint style
  - reducing 4-space list nesting emitted by conversion to the 2-space indentation expected by the repo lint rules
  - removing trailing punctuation from ATX headings when it is only structural punctuation
  - repairing spaced single-underscore emphasis artifacts
  - wrapping bare prose URLs in autolink syntax
  - flattening multiline pipe-table rows into valid single-line markdown table rows
  - inserting blank lines around normalized table blocks so following headings remain lint-safe
- The correction pass remains deterministic and rerunnable on the staged corpus.

## Impact

- Maintainers can rerun `npm run migrate:finalize-content` or `npm run migrate:apply-corrections` without having to hand-edit generated Markdown for repository lint compliance.
- The PR build no longer depends on local one-off markdown cleanup for the RHI-044 changed-file set.
- Existing downstream checks for front matter, staged SEO, noindex, and accessibility-content remain compatible with the normalized output.

## Verification

1. Regenerated staged content with the updated correction pass:
   - `npm run migrate:finalize-content`
   - `npm run migrate:apply-corrections`
2. Resynced the in-PR `src/content/**` subset from corrected staged output.
3. Reproduced the CI markdown lint scope locally on the union of PR markdown files plus current worktree markdown changes:
   - `markdown_files=$( { git diff --name-only origin/main...HEAD; git diff --name-only; } | grep -E '\.md$' | sort -u )`
   - `printf '%s\n' "$markdown_files" | xargs npx markdownlint-cli2`
   - result: `0` errors
4. Revalidated downstream content checks:
   - `npm run validate:frontmatter -- --content-dir migration/output/content`
   - `npm run validate:frontmatter`
   - `hugo --minify --environment production --contentDir migration/output/content --destination tmp/rhi044-lintfix-public`
   - `npm run check:seo-completeness -- --content-dir migration/output/content --public-dir tmp/rhi044-lintfix-public`
   - `CHECK_NOINDEX_PUBLIC_DIR=tmp/rhi044-lintfix-public npm run check:noindex`
   - `npm run check:a11y-content -- --content-dir migration/output/content`

## Related files

- `scripts/migration/apply-content-corrections.js`
- `docs/migration/RUNBOOK.md`
- `migration/output/content/**`
- `src/content/posts/custom-ttf-fonts-in-pdf-for-sfcc.md`
- `src/content/posts/field-guide-to-custom-caches-in-sfcc.md`
- `src/content/posts/how-to-extend-active-data-in-salesforce-b2c-commerce-cloud.md`
- `src/content/posts/how-to-set-up-the-ecdn-in-sfcc-staging.md`
- `src/content/posts/kickstart-guide-for-new-sfcc-developers.md`
- `src/content/posts/lag-to-riches-a-pwa-kit-developers-guide.md`
- `src/content/posts/mail-attachments-in-b2c-commerce-cloud.md`
- `src/content/posts/mastering-sitemaps-in-sfcc.md`
- `src/content/posts/sending-emails-from-sfcc.md`
- `src/content/posts/slas-in-sfra-or-sitegenesis.md`
- `src/content/posts/the-b2c-commerce-architect-certification.md`
- `src/content/posts/the-sfcc-guide-to-finding-pod-numbers.md`
- `src/content/posts/third-party-api-caching-in-commerce-cloud.md`
