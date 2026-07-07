# Custom OCAPI endpoints article — July 2026 refresh

## Change summary

`src/content/posts/creating-custom-ocapi-endpoints/index.md` was refreshed for
the 2026 platform state. The article's 2022 premise — "officially there is no
way to define custom OCAPI endpoints, but here's a custom-object + GET-hook
workaround" — became obsolete twice over: SCAPI Custom APIs went GA in the
24.2 release, and the OCAPI itself was deprecated in April 2026. The refresh
follows the same playbook as the earlier OCAPI-versus-SCAPI, eCDN, and
origin-shielding refreshes on this branch: lead with the current state,
preserve the original content in a clearly labelled archive section.

## Old vs new behavior

| Aspect | Old | New |
|--------|-----|-----|
| Framing | One-line deprecation banner, then the 2022 workaround presented as the only option | SCAPI Custom APIs presented first as the supported route; workaround demoted to a "For the Archives: The 2022 Workaround" section |
| "No official way" claim | Stated as current fact | Corrected; kept only inside the archive section with a period-piece disclaimer |
| GET-only / no-transactions limitation | Presented as the ceiling for custom endpoints | Scoped to the old workaround; Custom APIs support POST/PUT/PATCH/DELETE with transactions |
| OCAPI `"_v": "22.6"` settings example | Unannotated | Annotated in the archive preamble (current at time of writing; OCAPI versioning stopped at 24.5) |
| Front matter | `lastmod` 2026-07-04, no `scapi` tag, description claimed no official way exists | `lastmod` bumped, `scapi` tag added, description and takeaways rewritten for the 2026 state |

## Fact-check notes

Claims in the new first half were verified against the Salesforce docs
(Custom APIs guide, Custom API authentication guide, timeouts/limits guide)
in July 2026: `rest-apis` cartridge folder with OAS 3.0 contract + `api.json`
mapping + script implementation matched to `operationId`; the
`/custom/{apiName}/{version}/organizations/{organizationId}/` URL shape;
ShopperToken vs AmOAuth2 schemes with exactly one `c_`-prefixed custom scope;
10 s / 5 MiB shopper and 60 s / 20 MB admin limits with the Timeouts API
ceiling of 120 s; beta in 23.9 (GET only) and GA in 24.2 with
`dw.system.RESTResponseMgr`.

## Impact and verification

- Impacted: one published post only; no scripts, workflows, templates, or
  governance files changed. URL, aliases, and hero image untouched.
- Verified with: `npm run validate:frontmatter`, `npm run check:spelling`
  (no new allow-list entries needed), `markdownlint-cli2` on the post, and a
  full `npm run build:local` Hugo build.

## Related files

- `src/content/posts/creating-custom-ocapi-endpoints/index.md`
- Cross-linked posts: `in-the-ring-ocapi-versus-scapi`,
  `a-look-at-the-23-9-commerce-cloud-release`,
  `a-look-at-the-salesforce-b2c-commerce-cloud-24-2-release`,
  `how-to-use-ocapi-scapi-hooks`,
  `how-to-set-up-slas-for-the-composable-storefront`,
  `a-survival-guide-to-sfcc-platform-limits`
