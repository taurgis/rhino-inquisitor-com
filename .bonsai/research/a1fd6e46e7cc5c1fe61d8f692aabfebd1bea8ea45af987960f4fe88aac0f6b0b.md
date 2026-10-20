---
schema_version: 1
artifact_type: section
source_url: https://www.w3.org/TR/xml/#27-cdata-sections
source_urls:
  - https://www.w3.org/TR/xml/#27-cdata-sections
normalized_url: https://www.w3.org/TR/xml/
cache_key: a1fd6e46e7cc5c1fe61d8f692aabfebd1bea8ea45af987960f4fe88aac0f6b0b
topic: 
tags:
  - xml
  - entity
  - document
  - element
  - character
format_available:
  - compressed
  - detailed
tier: standard
ttl: 
fetched_at: 2026-10-20T09:17:02.994Z
validated_at: 2026-10-20T09:17:02.994Z
stale_after: 2026-11-19T09:17:02.994Z
capture_method: static_fetch
extraction_status: extracted
extraction_confidence: high
quality_notes:
  - readability extracted main article
  - quality:oversized
  - auto-generated tags via keyword extraction
supplied_at: 
supplied_by: 
etag: 
last_modified: Tue, 09 Oct 2018 13:18:59 GMT
content_hash: 787404b12623c65b363ce59c07de50dbe238203481d732d77013f9a4e5ad840d
token_estimate:
  compressed: 216
  detailed: 273
status: active
site_module_id: 
docs_engine: generated-static
docs_framework: 
source_doc_url: 
search_provider: 
parent_cache_key: 245675ade775c25392ca00559f6295191acfd951b2e5aa36637f4f7eb9ea8676
section_anchor: 27-cdata-sections
section_heading_path: 2 Documents > 2.7 CDATA Sections
---

## Summary

2 Documents > 2.7 CDATA Sections

## Compressed

### 2.7 CDATA Sections

\[Definition: **CDATA sections** may occur anywhere character data may occur; they are used to escape blocks of text containing characters which would otherwise be recognized as markup.

##### CDATA Sections

| [18] | CDSect | ::= | CDStart CData CDEnd |
| --- | --- | --- | --- |
| [19] | CDStart | ::= | '<![CDATA[' |
| [20] | CData | ::= | (Char* - (Char* ']]>' Char*)) |
| [21] | CDEnd | ::= | ']]>' |

Within a CDATA section, only the [CDEnd] string is recognized as markup, so that left angle brackets and ampersands may occur in their literal form; they need not (and cannot) be escaped using " `&lt;` " and " `&amp;` ". CDATA sections cannot nest.

An example of a CDATA section, in which " `<greeting>` " and " `</greeting>` " are recognized as [character data], not [markup]:

<!\[CDATA\[<greeting>Hello, world!</greeting>\]\]>

## Detailed

### 2.7 CDATA Sections

\[Definition: **CDATA sections** may occur anywhere character data may occur; they are used to escape blocks of text containing characters which would otherwise be recognized as markup. CDATA sections begin with the string " `<![CDATA[` " and end with the string " `]]>` ":\]

##### CDATA Sections

| [18] | CDSect | ::= | CDStart CData CDEnd |
| --- | --- | --- | --- |
| [19] | CDStart | ::= | '<![CDATA[' |
| [20] | CData | ::= | (Char* - (Char* ']]>' Char*)) |
| [21] | CDEnd | ::= | ']]>' |

Within a CDATA section, only the [CDEnd](https://www.w3.org/TR/xml/#NT-CDEnd) string is recognized as markup, so that left angle brackets and ampersands may occur in their literal form; they need not (and cannot) be escaped using " `&lt;` " and " `&amp;` ". CDATA sections cannot nest.

An example of a CDATA section, in which " `<greeting>` " and " `</greeting>` " are recognized as [character data](https://www.w3.org/TR/xml/#dt-chardata "Character Data"), not [markup](https://www.w3.org/TR/xml/#dt-markup "Markup"):

<!\[CDATA\[<greeting>Hello, world!</greeting>\]\]>

## Provenance

Section "2 Documents > 2.7 CDATA Sections" of https://www.w3.org/TR/xml/ (parent 245675ade775c25392ca00559f6295191acfd951b2e5aa36637f4f7eb9ea8676)