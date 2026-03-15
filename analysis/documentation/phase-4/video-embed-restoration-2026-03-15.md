# Video Embed Restoration

## Change summary

The Hugo site now restores inline YouTube embeds on pages where the live WordPress site visibly renders an inline video player, instead of leaving those pages as raw YouTube links or empty migrated bodies.

## Why this changed

Old behavior:

1. Several migrated pages preserved only bare YouTube URLs, so Hugo rendered plain links instead of inline players.
2. Three page descriptions still started with YouTube URLs, which polluted page intros and related-content summaries.
3. The `connecting-the-clouds-wedding-or-funeral` page had lost its migrated body entirely even though the live site still showed both an embed and article copy.

New behavior:

1. A reusable `video-embed` shortcode renders privacy-enhanced YouTube embeds with lazy loading, an accessible title, and a fallback watch link.
2. Confirmed inline-video pages now use that shortcode directly in content so only intended pages render embeds.
3. Explicit page-level video metadata now emits `VideoObject` schema for the restored watch surfaces so the SEO validation gate recognizes the new embeds.
4. Polluted descriptions on the dedicated video pages were cleaned so summaries and related cards no longer begin with raw URLs.
5. The missing `connecting-the-clouds-wedding-or-funeral` body content was restored from the live page text alongside its embed.

## Behavior details

Confirmed live inline-video pages restored in Hugo:

1. `/headless/`
2. `/life-with-goldie/`
3. `/the-path-to-being-an-architect/`
4. `/inside-the-ohana/`
5. `/me-myself-and-headless-a-composable-commerce-cloud-story/`
6. `/connecting-the-clouds-wedding-or-funeral/`
7. `/sfcc-introduction/`
8. `/salesforce-b2c-commerce-cloud-22-9-release/`

Pages that remain plain-link references because the current live site does not visibly render an inline player:

1. `/sitegenesis-vs-sfra-vs-pwa/`
2. `/events-and-the-golden-hoodie/`
3. `/community-salesforce-events-and-commerce-cloud/`

## Impact

1. Readers on the Hugo site now get the same in-article watch experience that the live site already exposes on the confirmed video pages.
2. The change is content-driven, so unrelated YouTube links elsewhere in the archive remain normal links.
3. The restored watch surfaces now satisfy the repository's structured-data gate by emitting `VideoObject` schema.
4. Related-content cards and page descriptions for the dedicated video pages no longer surface raw YouTube URLs as summary text.

## Verification

Run the following checks after the content update:

```bash
npm run build:prod
npm run check:schema
```

Manual validation:

1. Open each confirmed page above in the local Hugo build and verify an inline iframe renders above the article copy.
2. Confirm the negative-control pages listed above still show plain links only.
3. Confirm the restored page body on `/connecting-the-clouds-wedding-or-funeral/` includes both the video and the three explanatory paragraphs.
4. Confirm the dedicated page summaries no longer begin with a YouTube URL.

## Related files

1. `src/layouts/shortcodes/video-embed.html`
2. `src/assets/styles/site.css`
3. `src/content/pages/headless/index.md`
4. `src/content/pages/life-with-goldie/index.md`
5. `src/content/pages/the-path-to-being-an-architect/index.md`
6. `src/content/pages/inside-the-ohana/index.md`
7. `src/content/pages/me-myself-and-headless-a-composable-commerce-cloud-story/index.md`
8. `src/content/pages/connecting-the-clouds-wedding-or-funeral/index.md`
9. `src/content/posts/sfcc-introduction/index.md`
10. `src/content/posts/salesforce-b2c-commerce-cloud-22-9-release/index.md`