---
schema_version: 1
artifact_type: section
source_url: https://developer.salesforce.com/docs/commerce/b2c-commerce/references/b2c-script-api/dw.web.URLUtils.html#httpwebroot
source_urls:
  - https://developer.salesforce.com/docs/commerce/b2c-commerce/references/b2c-script-api/dw.web.URLUtils.html#httpwebroot
normalized_url: https://developer.salesforce.com/docs/commerce/b2c-commerce/references/b2c-script-api/dw.web.URLUtils.html
cache_key: 9b9fd50fd4fb5bdd76d64efcce221fbb19ca4cac8b56130bb55529fb8a4fd27d
topic: 
tags:
  - url
  - commerce
  - references
  - b2c-commerce
  - b2c-script-api
format_available:
  - compressed
  - detailed
tier: standard
ttl: 
fetched_at: 2026-08-31T13:36:57.251Z
validated_at: 2026-08-31T13:36:57.251Z
stale_after: 2026-09-30T13:36:57.251Z
capture_method: route_markdown
extraction_status: extracted
extraction_confidence: high
quality_notes:
  - captured from public Markdown/MDX source: https://developer.salesforce.com/docs/commerce/b2c-commerce/references/b2c-script-api/dw.web.URLUtils.md
  - auto-generated tags via keyword extraction
supplied_at: 
supplied_by: 
etag: "e59c7ffe5a0cfd3b33b917b8719fa57e"
last_modified: Fri, 28 Aug 2026 03:43:00 GMT
content_hash: 93173473252efefbaa0c9e6448029775075be8d35f404412def366790e5837ec
token_estimate:
  compressed: 160
  detailed: 226
status: active
site_module_id: salesforce-developer
docs_engine: 
docs_framework: 
source_doc_url: https://developer.salesforce.com/docs/commerce/b2c-commerce/references/b2c-script-api/dw.web.URLUtils.md
search_provider: 
parent_cache_key: e9510bba019b972e58eef7e646cff6865fa6ff73b740b7c232a6efa207a769bd
section_anchor: httpwebroot
section_heading_path: Class URLUtils > Method Details > httpWebRoot()
---

## Summary

Class URLUtils > Method Details > httpWebRoot()

## Compressed

### httpWebRoot()

- ~~static httpWebRoot(): [URL]~~
  - : Return an absolute web root URL with HTTP protocol and host information from current
    request. If an HTTP host is configured in the preferences the returned URL will include
    that host.

    Note: The use of this method is deprecated. The method httpStatic() should
    be used instead. It provides better cache integration.

    **Returns:**

    - an absolute web root URL with HTTP protocol and host information from the current
      request.

    **Deprecated:**

:::warning
Use the [httpStatic(String)] or [httpStatic(String, String, String)] methods instead.
:::

***

## Detailed

### httpWebRoot()

- ~~static httpWebRoot(): [URL](/docs/commerce/b2c-commerce/references/b2c-script-api/dw.web.URL.md)~~
  - : Return an absolute web root URL with HTTP protocol and host information from current
    request. If an HTTP host is configured in the preferences the returned URL will include
    that host.

    Note: The use of this method is deprecated. The method httpStatic() should
    be used instead. It provides better cache integration.

    **Returns:**

    - an absolute web root URL with HTTP protocol and host information from the current
      request.

    **Deprecated:**

:::warning
Use the [httpStatic(String)](/docs/commerce/b2c-commerce/references/b2c-script-api/dw.web.URLUtils.md#httpstaticstring) or [httpStatic(String, String, String)](/docs/commerce/b2c-commerce/references/b2c-script-api/dw.web.URLUtils.md#httpstaticstring-string-string) methods instead.
:::

***

## Provenance

Section "Class URLUtils > Method Details > httpWebRoot()" of https://developer.salesforce.com/docs/commerce/b2c-commerce/references/b2c-script-api/dw.web.URLUtils.html (parent e9510bba019b972e58eef7e646cff6865fa6ff73b740b7c232a6efa207a769bd)