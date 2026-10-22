---
schema_version: 1
artifact_type: section
source_url: https://www.php.net/ChangeLog-8.php#version-8131
source_urls:
  - https://www.php.net/ChangeLog-8.php#version-8131
normalized_url: https://www.php.net/ChangeLog-8.php
cache_key: d2b175c4d4d22348e19e4bacb35b4d2c44d63ceb84bcca8cfc2ae6cd4ac1a22c
topic: 
tags:
  - fixed
  - bug
  - fix
  - memory
  - error
format_available:
  - compressed
  - detailed
tier: standard
ttl: 
fetched_at: 2026-10-22T09:25:33.391Z
validated_at: 2026-10-22T09:25:33.391Z
stale_after: 2026-11-21T09:25:33.391Z
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
last_modified: Wed, 21 Oct 2026 13:33:44 GMT
content_hash: e1a77e7bd372527aea4a42c7f7095694e0e21c1cfafbcca10f76333f18129545
token_estimate:
  compressed: 236
  detailed: 362
status: active
site_module_id: 
docs_engine: 
docs_framework: redocly
source_doc_url: 
search_provider: 
parent_cache_key: 357fa8ede2f92e1b40db56650c0acf70d73ed54db92fe3916e435795b653e8d9
section_anchor: version-8131
section_heading_path: Version 8.1.31
---

## Summary

Version 8.1.31

## Compressed

### Version 8.1.31

**21 Nov 2024**

*   CLI:
    *   Fixed bug [GHSA-4w77-75f9-2c8w] (Heap-Use-After-Free in sapi\_read\_post\_data Processing in CLI SAPI Interface).
*   LDAP:
    *   Fixed bug [GHSA-g665-fm4p-vhff] (OOB access in ldap\_escape). (CVE-2024-8932)
*   MySQLnd:
    *   Fixed bug [GHSA-h35g-vwh6-m678] (Leak partial content of the heap through heap buffer over-read). (CVE-2024-8929)
*   PDO DBLIB:
    *   Fixed bug [GHSA-5hqh-c84r-qjcv] (Integer overflow in the dblib quoter causing OOB writes). (CVE-2024-11236)
*   PDO Firebird:
    *   Fixed bug [GHSA-5hqh-c84r-qjcv] (Integer overflow in the firebird quoter causing OOB writes). (CVE-2024-11236)
*   Streams:
    *   Fixed bug [GHSA-c5f2-jwm7-mmq2] (Configuring a proxy in a stream context might allow for CRLF injection in URIs). (CVE-2024-11234)
    *   Fixed bug [GHSA-r977-prxv-hc43] (Single byte overread with convert.quoted-printable-decode filter). (CVE-2024-11233)

## Detailed

### Version 8.1.31

**21 Nov 2024**

*   CLI:
    *   Fixed bug [GHSA-4w77-75f9-2c8w](https://github.com/php/php-src/security/advisories/GHSA-4w77-75f9-2c8w) (Heap-Use-After-Free in sapi\_read\_post\_data Processing in CLI SAPI Interface).
*   LDAP:
    *   Fixed bug [GHSA-g665-fm4p-vhff](https://github.com/php/php-src/security/advisories/GHSA-g665-fm4p-vhff) (OOB access in ldap\_escape). (CVE-2024-8932)
*   MySQLnd:
    *   Fixed bug [GHSA-h35g-vwh6-m678](https://github.com/php/php-src/security/advisories/GHSA-h35g-vwh6-m678) (Leak partial content of the heap through heap buffer over-read). (CVE-2024-8929)
*   PDO DBLIB:
    *   Fixed bug [GHSA-5hqh-c84r-qjcv](https://github.com/php/php-src/security/advisories/GHSA-5hqh-c84r-qjcv) (Integer overflow in the dblib quoter causing OOB writes). (CVE-2024-11236)
*   PDO Firebird:
    *   Fixed bug [GHSA-5hqh-c84r-qjcv](https://github.com/php/php-src/security/advisories/GHSA-5hqh-c84r-qjcv) (Integer overflow in the firebird quoter causing OOB writes). (CVE-2024-11236)
*   Streams:
    *   Fixed bug [GHSA-c5f2-jwm7-mmq2](https://github.com/php/php-src/security/advisories/GHSA-c5f2-jwm7-mmq2) (Configuring a proxy in a stream context might allow for CRLF injection in URIs). (CVE-2024-11234)
    *   Fixed bug [GHSA-r977-prxv-hc43](https://github.com/php/php-src/security/advisories/GHSA-r977-prxv-hc43) (Single byte overread with convert.quoted-printable-decode filter). (CVE-2024-11233)

## Provenance

Section "Version 8.1.31" of https://www.php.net/ChangeLog-8.php (parent 357fa8ede2f92e1b40db56650c0acf70d73ed54db92fe3916e435795b653e8d9)