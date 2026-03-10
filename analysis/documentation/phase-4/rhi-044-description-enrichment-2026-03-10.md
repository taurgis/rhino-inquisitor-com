# RHI-044 Description Enrichment

## Change summary

This pass manually improved front matter `description` values for a focused high-value set of staged migrated pages and posts whose metadata had degraded into clipped, broken, or low-signal summaries.

## Why this changed

Phase 4 front matter mapping keeps `description` populated for SEO metadata, but fallback extraction can still produce poor search snippets on important pages. The highest-value URLs from the Phase 1 SEO baseline needed human-authored descriptions before broader batch work continues.

## Behavior details

Old behavior:

- Some staged migrated records used fallback or malformed descriptions that started mid-sentence, exposed update notices as metadata, or ended in visibly truncated phrasing.
- The description field remained technically present, but several high-value pages had weak search and sharing copy.

New behavior:

- The following staged migrated records now use manual metadata descriptions aligned to page intent:
  - `/swc-and-storybook-error-failed-to-load-native-binding/`
  - `/how-to-use-ocapi-scapi-hooks/`
  - `/in-the-ring-ocapi-versus-scapi/`
  - `/sitegenesis-vs-sfra-vs-pwa/`
  - `/creating-custom-ocapi-endpoints/`
  - `/understanding-sfcc-instances/`
  - `/how-to-get-a-salesforce-b2c-commerce-cloud-sandbox/`
  - `/how-to-set-up-slas-for-the-composable-storefront/`
  - `/how-to-use-node-18-with-sfra/`
  - `/the-realm-split-field-guide-to-migrating-an-sfcc-site/`
- These changes affect only front matter `description`; no URLs, aliases, body content, or template rules changed in this pass.

## Impact

- High-value migrated pages now present stronger meta descriptions for search, social cards, and internal card surfaces.
- Post pages still do not render `description` above the article body, so these metadata improvements do not reintroduce duplicated visible intros.

## Verification

- Build staged migration output with `hugo --minify --environment production --contentDir migration/output/content --destination tmp/rhi-preview-public`.
- Run `npm run check:seo-completeness -- --public-dir tmp/rhi-preview-public`.
- Confirm representative updated pages still emit non-empty meta, Open Graph, and Twitter descriptions.

## Related files

- `migration/output/content/pages/swc-and-storybook-error-failed-to-load-native-binding.md`
- `migration/output/content/posts/how-to-use-ocapi-scapi-hooks.md`
- `migration/output/content/posts/in-the-ring-ocapi-versus-scapi.md`
- `migration/output/content/posts/sitegenesis-vs-sfra-vs-pwa.md`
- `migration/output/content/posts/creating-custom-ocapi-endpoints.md`
- `migration/output/content/posts/understanding-sfcc-instances.md`
- `migration/output/content/posts/how-to-get-a-salesforce-b2c-commerce-cloud-sandbox.md`
- `migration/output/content/posts/how-to-set-up-slas-for-the-composable-storefront.md`
- `migration/output/content/posts/how-to-use-node-18-with-sfra.md`
- `migration/output/content/posts/the-realm-split-field-guide-to-migrating-an-sfcc-site.md`