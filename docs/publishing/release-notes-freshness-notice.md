# Release notes consolidation: category fix + forward-pointer notice

## Change summary

Google Search Console showed generic queries like `sfcc release notes`,
`salesforce commerce cloud release notes`, and `b2c commerce release notes`
ranking on page one with a 0% click-through rate: searchers were landing on
individual, superseded release posts instead of current information and
bouncing. Two fixes:

1. **Category fix.** `b2c-commerce-cloud-26-8-release` and
   `b2c-commerce-cloud-26-9-release` were missing the `Release Notes`
   category (they carried only `Salesforce Commerce Cloud, Technical`, the
   newer post-relaunch scheme). The `/category/release-notes/` taxonomy page
   already exists and lists every `Release Notes`-tagged post by date, so
   this was an unintentional gap that hid the two most recent releases from
   the one page built to surface "what's the latest release." Both posts now
   carry `Release Notes` as their first category, matching the convention
   every prior release post already used.
2. **Forward-pointer notice.** Every superseded release post (the 28
   2022–2024 posts plus `26-8`, 29 total) now carries a short `> [!NOTE]`
   callout after its intro paragraph, pointing to
   `/category/release-notes/`. The current latest post (`26-9`) does not
   carry the notice — it doesn't need to point anywhere else yet.

## Why this changed

The blog has 29+ version-specific release posts and, until now, no post
pointed forward to anything newer — only a handful had a manual "last
month's release notes" link added by the author at original publish time,
and that link only ever pointed backward one release. A reader arriving at
`/salesforce-b2c-commerce-cloud-22-8/` from a generic search had no path to
current information short of guessing a newer URL.

## Behavior details

| Situation | Old | New |
|-----------|-----|-----|
| `/category/release-notes/` hub | Missing the two most recent releases (26.8, 26.9) because of the category gap | Lists every release post, most recent first, including 26.8 and 26.9 |
| Reader lands on an old release post from search | No link forward; only an occasional manual "previous month" link | A `[!NOTE]` callout right after the intro links to the release notes archive |
| Publishing a new release post | No established step to update older posts | See "Ongoing process" below |

## Ongoing process for new release posts

1. Give every new release post the `Release Notes` category (first in the
   list, matching the established convention), alongside whatever other
   categories apply (e.g. `Technical`).
2. Add the same `[!NOTE]` callout, right after the intro paragraph, to the
   post that was previously the latest release — it's the one post that just
   lost its "current" status. Posts further back already carry the notice
   from this pass.

Notice text (used verbatim so no per-post edits go stale):

```md
> [!NOTE]
> A 2026 update: these notes are from an earlier release cycle. For what's shipped
> since, browse the [release notes archive](/category/release-notes/).
```

The notice points at the category hub, not at a specific "latest" post, so
it never needs updating again after it's added once.

## Impact and verification

- **Impacted**: 29 release posts (category fix on 2, notice added to all 29,
  `lastmod` bumped on all 29 since front matter or body changed).
- **Verification performed**:
  - `node scripts/gates/check-callouts.js --all` — passes (219 files use
    well-formed `[!NOTE]`/`[!TIP]`/`[!WARNING]` callouts).
  - `npm run validate:frontmatter` — passes (211 files).
  - `npm run check:spelling` — passes (211 files).
  - `npm run build:prod` — builds clean; no new warnings introduced (the
    pre-existing `when-published` warnings are unrelated draft targets).
  - `node scripts/seo/check-internal-links.js` — 0 blocking findings.
  - Manually confirmed in `public/category/release-notes/index.html` that
    both `26-8` and `26-9` are now listed, with `26-9` first, and confirmed
    the rendered callout in `public/salesforce-b2c-commerce-cloud-22-8/index.html`.

## Related files

- `src/content/posts/b2c-commerce-cloud-26-8-release/index.md` — category fix
  and notice.
- `src/content/posts/b2c-commerce-cloud-26-9-release/index.md` — category fix
  only (current latest, no notice).
- 27 other release posts from `b2c-commerce-whats-new-in-the-22-3-release`
  through `the-latest-in-sfcc-version-24-7` — notice added.
- `src/layouts/_default/_markup/render-blockquote.html` — renders the
  `[!NOTE]` callout (unchanged, existing behavior).
- `src/layouts/_default/taxonomy.html` — renders the `/category/release-notes/`
  hub (unchanged, existing behavior).
