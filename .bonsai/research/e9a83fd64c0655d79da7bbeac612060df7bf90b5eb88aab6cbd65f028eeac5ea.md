---
schema_version: 1
artifact_type: section
source_url: https://developer.salesforce.com/docs/commerce/commerce-api/references/about-commerce-api/about.md#slas-release-eu-ap2-and-ap3-regions
source_urls:
  - https://developer.salesforce.com/docs/commerce/commerce-api/references/about-commerce-api/about.md#slas-release-eu-ap2-and-ap3-regions
normalized_url: https://developer.salesforce.com/docs/commerce/commerce-api/references/about-commerce-api/about.md
cache_key: e9a83fd64c0655d79da7bbeac612060df7bf90b5eb88aab6cbd65f028eeac5ea
topic: 
tags:
  - slas
  - scapi
  - api
  - shopper
  - release
format_available:
  - compressed
  - detailed
tier: standard
ttl: 
fetched_at: 2026-08-31T07:55:29.260Z
validated_at: 2026-08-31T07:55:29.260Z
stale_after: 2026-09-30T07:55:29.260Z
capture_method: route_markdown
extraction_status: extracted
extraction_confidence: high
quality_notes:
  - captured from public Markdown/MDX source: https://developer.salesforce.com/docs/commerce/commerce-api/references/about-commerce-api/about.md
  - auto-generated tags via keyword extraction
supplied_at: 
supplied_by: 
etag: "eda517009dbe0ce75e2e8ab1a0c617c2"
last_modified: Fri, 28 Aug 2026 03:42:57 GMT
content_hash: d4abe9c15feea256c0912c4d7812cd9730b13c32bcd63dd3b7cb3c033401a76a
token_estimate:
  compressed: 412
  detailed: 464
status: active
site_module_id: salesforce-developer
docs_engine: 
docs_framework: 
source_doc_url: https://developer.salesforce.com/docs/commerce/commerce-api/references/about-commerce-api/about.md
search_provider: 
parent_cache_key: 1e4875d044154d3e64699ece4e302e990bf3e822090a1751b712a75c0ef3ca9c
section_anchor: slas-release-eu-ap2-and-ap3-regions
section_heading_path: B2C Commerce API Release Notes > 07/22/2026 > SLAS Release (EU, AP2, and AP3 Regions)
---

## Summary

B2C Commerce API Release Notes > 07/22/2026 > SLAS Release (EU, AP2, and AP3 Regions)

## Compressed

### SLAS Release (EU, AP2, and AP3 Regions)

- Resolved an intermittent SLAS Admin UI login issue where some users encountered an HTTP 431 ("Request Header Fields Too Large").
- Improved profile linking for first-time LINE IDP sign-in: SLAS now matches an identifier returned by LINE against existing storefront profiles and links the sign-in to that profile, instead of creating a duplicate account for a shopper who already exists in your customer base. This change applies only to the first-time linking step. LINE token refresh behavior is unchanged, and linking for other identity providers (Apple, Azure, etc.) is unchanged.
- **SLAS JWT Updates**
  - The SLAS `id_token` includes a `ctg` claim.
  - The SLAS `access_token` includes a `CRM` claim.
  - Fixed a formatting issue with the existing `AUD` claim which uses the ECOM tenant Global Unique ID, when available, in place of the Tenant ID.
  - **Action Required & Best Practices:** For most customers, no action is required. The addition of new JWT claims—and the reordering of existing ones—are considered non-breaking changes under our documented SLAS and SCAPI [change policy]. Future SLAS releases may introduce additional claims to both the `access_token` and `id_token`.
  - If your integration uses custom logic to parse the SLAS JWT, ensure your implementation follows these documented best practices:
    - Do not rely on claim ordering. As noted in [SLAS documentation], integrations should not expect a fixed set or specific sequence of claims.
    - Handle new claims gracefully. Ensure your code does not throw errors when encountering new or previously undefined claims.

## Detailed

### SLAS Release (EU, AP2, and AP3 Regions)

- Resolved an intermittent SLAS Admin UI login issue where some users encountered an HTTP 431 ("Request Header Fields Too Large").
- Improved profile linking for first-time LINE IDP sign-in: SLAS now matches an identifier returned by LINE against existing storefront profiles and links the sign-in to that profile, instead of creating a duplicate account for a shopper who already exists in your customer base. This change applies only to the first-time linking step. LINE token refresh behavior is unchanged, and linking for other identity providers (Apple, Azure, etc.) is unchanged.
- **SLAS JWT Updates**
  - The SLAS `id_token` includes a `ctg` claim.
  - The SLAS `access_token` includes a `CRM` claim.
  - Fixed a formatting issue with the existing `AUD` claim which uses the ECOM tenant Global Unique ID, when available, in place of the Tenant ID.
  - **Action Required & Best Practices:** For most customers, no action is required. The addition of new JWT claims—and the reordering of existing ones—are considered non-breaking changes under our documented SLAS and SCAPI [change policy](https://developer.salesforce.com/docs/commerce/commerce-api/guide/scapi-get-started.md#change-policy). Future SLAS releases may introduce additional claims to both the `access_token` and `id_token`.
  - If your integration uses custom logic to parse the SLAS JWT, ensure your implementation follows these documented best practices:
    - Do not rely on claim ordering. As noted in [SLAS documentation](https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas.md#access-tokens-and-refresh-tokens), integrations should not expect a fixed set or specific sequence of claims.
    - Handle new claims gracefully. Ensure your code does not throw errors when encountering new or previously undefined claims.

## Provenance

Section "B2C Commerce API Release Notes > 07/22/2026 > SLAS Release (EU, AP2, and AP3 Regions)" of https://developer.salesforce.com/docs/commerce/commerce-api/references/about-commerce-api/about.md (parent 1e4875d044154d3e64699ece4e302e990bf3e822090a1751b712a75c0ef3ca9c)