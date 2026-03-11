# Accessibility Scan Summary

## Scope

- Ticket: `RHI-040`
- Date: `2026-03-11`
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
- `0` blocking findings
- `0` warnings
- `0` weak-link warnings against a cap of `5`
- Decorative exceptions loaded: `0`

Finding breakdown:

| Issue type | Count | Status |
|---|---:|---|
| none | 0 | clean pass |

Artifact:

- `migration/reports/a11y-content-warnings.csv`
- Artifact state: header-only CSV after the clean pass

Status:

- Passing. The staged Markdown corpus now meets the approved threshold contract.

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
- A clean top-of-page tab traversal reached `51` unique interactive elements before wrapping back to `Skip to main content`.
- The first ten focus targets covered the skip link, site home link, search, mobile-navigation close control, primary navigation links, and reading/search CTAs.
- The final five focus targets before wrap covered privacy and social links, then returned to the skip link.

Status:

- Passing for this representative article route.

## Exceptions

- Accepted exceptions: none
- Decorative image exceptions file: not present

## Conclusion

RHI-040 is ready to close. The staged Markdown gate is clean, the deterministic 10-page rendered sample passes, the representative article route passes the manual keyboard check, and no accessibility exceptions were accepted for this batch.
