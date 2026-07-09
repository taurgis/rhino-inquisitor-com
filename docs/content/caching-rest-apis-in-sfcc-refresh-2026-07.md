# Server-side caching article — July 2026 refresh

## Change summary

`src/content/posts/caching-rest-apis-in-sfcc/index.md` was refreshed for the
2026 platform state. The article's entire premise was OCAPI cache
configuration — the cacheable-resource list, both OCAPI settings JSON
examples, the Business Manager path, the "expand parameter" rule — with a
three-sentence SCAPI paragraph tacked on at the end. That paragraph claimed
"you can't control the server-side cache times of SCAPI," which was wrong:
Custom SCAPI endpoints support response caching through
`response.setExpires(milliseconds)` and `response.setVaryBy(identifier)` in
the endpoint's implementation script. The refresh follows the same playbook
as the `creating-custom-ocapi-endpoints` refresh on this branch: lead with
the current, correct state, and preserve the original content in a clearly
labelled archive section rather than deleting it.

## Old vs new behavior

| Aspect | Old | New |
|--------|-----|-----|
| Framing | OCAPI cache configuration presented as the entire subject; SCAPI reduced to a three-sentence afterthought | Custom SCAPI caching (`setExpires()`/`setVaryBy()`) presented first as the current, correct guidance; OCAPI content demoted to a "For the Archives: OCAPI Cache Configuration" section |
| SCAPI caching claim | "Currently, you can't control the server-side cache times of SCAPI... don't apply to the Salesforce Commerce API" — factually wrong | Corrected: Custom APIs cache responses via `setExpires()`/`setVaryBy()`; standard Shopper APIs still have no equivalent exposed cache-time control |
| OCAPI `"_v": "22.6"` settings examples | Unannotated | Annotated in the archive preamble (current at time of writing, April 2023; OCAPI versioning stopped at 24.5) |
| OCAPI reference links (12 resource links + Settings + Get Started + Best Practices) | Unverified since original 2023 publication | Checked live in July 2026: all still resolve, now labelled "(deprecated)" in their page titles rather than removed; noted inline in the archive |
| "Infocenter" branding (2 mentions) | Referred to the retired Infocenter site | Corrected to "Salesforce Developers," per `where-is-the-new-sfcc-documentation` |
| Legacy conversion artifacts | Escaped `cache\_time` / `personalised\_caching\_ enabled`, `86.400 seconds` (period as thousands separator), a flattened "Lowest Cache Time" sub-heading run into its paragraph, a stray caption-duplicate paragraph under the expand-parameter screenshot | All fixed: unescaped identifiers, `86,400 seconds`, a bolded "Lowest cache time wins." lead-in, and the duplicate caption paragraph removed |
| Front matter | `lastmod` 2026-07-04, no `scapi` tag, description and takeaways framed entirely around OCAPI | `lastmod` bumped, `scapi` tag added, description and takeaways rewritten for the SCAPI-first structure |

## Fact-check notes

The corrected SCAPI caching claim was verified against Salesforce's Custom
API caching guide
(`developer.salesforce.com/docs/commerce/commerce-api/guide/custom-api-caching.html`,
fetched via Bonsai in July 2026): Custom APIs support response caching,
scoped to Custom APIs rather than the standard Shopper APIs, through
`dw.system.Response#setExpires(milliseconds)` and
`dw.system.Response#setVaryBy(identifier)` called in the implementation
script, with Page Cache still required as a prerequisite. Both code examples
in the new lead section are adapted directly from that guide's two Custom
Product API caching examples.

The OCAPI reference-link audit (12 Shop API resource links, the OCAPI
Settings reference, the Get Started page, and the Best Practices page) was
run via Bonsai in July 2026. All pages resolve; several now carry
"(deprecated)" in their page title (for example, "Open Commerce API
(deprecated)"), but none have been removed. The Business Manager
"Open Commerce API Settings" menu path could not be confirmed present or
removed from official docs alone — no source affirmatively states either
way — so the article does not assert a present-tense claim about current
Business Manager navigation.

## Impact and verification

- Impacted: one published post only; no scripts, workflows, templates, or
  governance files changed. URL, aliases, `date`, and hero image untouched.
- Verified with: `npm run validate:frontmatter`, `npm run check:spelling`,
  `npx markdownlint-cli2 "src/content/posts/caching-rest-apis-in-sfcc/index.md"`,
  and a full `npm run build:local` Hugo build.

## Related files

- `src/content/posts/caching-rest-apis-in-sfcc/index.md`
- Cross-linked posts: `creating-custom-ocapi-endpoints`,
  `should-i-use-sfra-rest-endpoints-in-a-composable-storefront`,
  `where-is-the-new-sfcc-documentation`, `how-to-use-ocapi-scapi-hooks`
- Model refresh doc: `docs/content/ocapi-endpoints-article-refresh-2026-07.md`
