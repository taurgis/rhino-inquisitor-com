# Accessibility Scan Summary

## Scope

- Ticket: `RHI-040`
- Date: `2026-03-10`
- Corpus: staged Phase 4 Markdown under `migration/output/content/`
- Owner-approved thresholds:
  - blocking cap: `0`
  - weak-link warning cap: `5`
  - generic or filename-like alt text: `blocking`
  - empty alt text allowed only through explicit decorative-image exceptions

## Markdown gate

Command:

```bash
npm run check:a11y-content
```

Result:

- `171` staged Markdown files scanned
- `238` blocking findings
- `84` warnings
- `45` weak-link warnings against a cap of `5`
- Decorative exceptions loaded: `0`

Finding breakdown:

| Issue type | Count | Status |
|---|---:|---|
| `missing_alt_text` | 140 | blocking |
| `generic_alt_text` | 95 | blocking |
| `heading_level_skip` | 5 | warning |
| `weak_link_text` | 45 | warning |
| `table_empty_headers` | 3 | blocking |
| `table_missing_header_divider` | 34 | warning |

Highest-blocking staged files:

| File | Blocking findings | Notes |
|---|---:|---|
| `migration/output/content/posts/delta-exports-in-salesforce-b2c-commerce-cloud.md` | 6 | 6 missing-alt, 1 weak-link warning |
| `migration/output/content/posts/ai-as-an-architect-and-content-creator.md` | 6 | 5 generic-alt, 1 missing-alt |
| `migration/output/content/posts/how-to-change-the-code-compatibility-mode-in-salesforce-b2c-commerce-cloud.md` | 6 | 6 missing-alt |
| `migration/output/content/posts/sitegenesis-vs-sfra-vs-pwa.md` | 6 | 6 missing-alt |
| `migration/output/content/posts/what-is-commerce-on-core.md` | 6 | 6 missing-alt |

Artifact:

- `migration/reports/a11y-content-warnings.csv`

Status:

- Failing. The Markdown gate improved again after the second remediation slice, but the staged corpus still does not meet the approved threshold contract.

## Rendered sample gate

Build command:

```bash
hugo --minify --environment production --contentDir migration/output/content --destination tmp/rhi040-public
```

Rendered sample command:

```bash
CHECK_A11Y_PUBLIC_DIR=tmp/rhi040-public CHECK_A11Y_URLS='["/","/posts/","/category/","/category/release-notes/","/about/","/video/","/how-to-set-up-slas-for-the-composable-storefront/","/how-to-use-node-18-with-sfra/","/the-realm-split-field-guide-to-migrating-an-sfcc-site/","/what-can-i-use-chatgpt-for-when-working-with-salesforce/"]' npm run check:a11y
```

Sample routes:

1. `/`
2. `/posts/`
3. `/category/`
4. `/category/release-notes/`
5. `/about/`
6. `/video/`
7. `/how-to-set-up-slas-for-the-composable-storefront/`
8. `/how-to-use-node-18-with-sfra/`
9. `/the-realm-split-field-guide-to-migrating-an-sfcc-site/`
10. `/what-can-i-use-chatgpt-for-when-working-with-salesforce/`

Result:

- `10/10` routes passed

Status:

- Passing. The rendered sample is currently clean for the deterministic 10-page batch-check set.

## Manual keyboard review

Route reviewed:

- `/the-realm-split-field-guide-to-migrating-an-sfcc-site/`

Observed behavior:

- First `Tab` focused the `Skip to main content` link.
- Activating the skip link with `Enter` moved focus to `#main-content`.
- The next `Tab` moved focus into the article region and reached the breadcrumb link.
- The active breadcrumb link reported a visible focus style of `outline: 3px solid rgb(10, 132, 255)`.

Status:

- Passing for this representative article route.

## Exceptions

- Accepted exceptions: none
- Decorative image exceptions file: not present

## Conclusion

RHI-040 is implemented and the rendered 10-page sample now passes, but the ticket is not ready to close. The staged corpus still fails the Markdown gate due primarily to missing or placeholder alt text in migrated content outside the current remediation slice.
