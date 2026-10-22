---
schema_version: 1
artifact_type: section
source_url: https://www.php.net/ChangeLog-8.php#version-8421
source_urls:
  - https://www.php.net/ChangeLog-8.php#version-8421
normalized_url: https://www.php.net/ChangeLog-8.php
cache_key: f7c5aa7a4da1a72f4f310661de5fdc1aba2da7d8a77eebd2f77867d5e86bfbb4
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
content_hash: 8703740b935fa4b0e4778307008b9b0000a1fa27b15077d46cb576cb269efa1c
token_estimate:
  compressed: 940
  detailed: 1345
status: active
site_module_id: 
docs_engine: 
docs_framework: redocly
source_doc_url: 
search_provider: 
parent_cache_key: 357fa8ede2f92e1b40db56650c0acf70d73ed54db92fe3916e435795b653e8d9
section_anchor: version-8421
section_heading_path: Version 8.4.21
---

## Summary

Version 8.4.21

## Compressed

### Version 8.4.21

**07 May 2026**

*   Core:
    *   Fixed bug [GH-19983] (GC assertion failure with fibers, generators and destructors).
    *   Fixed bug [GH-21478] (Forward property operations to real instance for initialized lazy proxies).
    *   Fixed bug [GH-21605] (Missing addref for Countable::count()).
    *   Fixed bug [GH-21699] (Assertion failure in shutdown\_executor when resolving self::/parent::/static:: callables if the error handler throws).
    *   Fixed bug [GH-21603] (Missing addref for \_\_unset).
    *   Fixed bug [GH-21760] (Trait with class constant name conflict against enum case causes SEGV).
*   CLI:
    *   Fixed bug [GH-21754] (\`--rf\` command line option with a method triggers ext/reflection deprecation warnings).
*   Curl:
    *   Add support for brotli and zstd on Windows.
*   DOM:
    *   Fixed [GHSA-4jhr-8w89-j733] and [GH-21566] (Dom\\XMLDocument::C14N() emits duplicate xmlns declarations after setAttributeNS()). (CVE-2026-7263)
    *   Fixed bug [GH-21688] (segmentation fault on empty HTMLDocument).
    *   Upgrade to lexbor v2.7.0.
*   FPM:
    *   Fixed [GHSA-7qg2-v9fj-4mwv] (XSS within status endpoint). (CVE-2026-6735)
*   Iconv:
    *   Fixed bug [GH-17399] (iconv memory leak on bailout).
*   MBString:
    *   Fixed [GHSA-wm6j-2649-pv75] (Null pointer dereference in php\_mb\_check\_encoding() via mb\_ereg\_search\_init()). (CVE-2026-7259)
    *   Fixed [GHSA-74r9-qxhc-fx53] (Out-of-bounds access in mbfl\_name2encoding\_ex()). (CVE-2026-6104)
*   Opcache:
    *   Fixed bug [GH-21158] (JIT: Assertion jit->ra\[var\].flags & (1<<0) failed in zend\_jit\_use\_reg).
    *   Fixed bug [GH-21593] (Borked function JIT JMPNZ smart branch).
    *   Fixed bug [GH-21460] (COND optimization regression).
    *   Fixed faulty returns out of zend\_try block in zend\_jit\_trace().
*   OpenSSL:
    *   Fix a bunch of memory leaks and crashes on edge cases.
*   PDO\_Firebird:
    *   Fixed [GHSA-w476-322c-wpvm] (SQL injection via NUL bytes in quoted strings). (CVE-2025-14179)
*   Phar:
    *   Restore is\_link handler in phar\_intercept\_functions\_shutdown.
    *   Fixed bug [GH-21797] (phar: NULL dereference in Phar::webPhar() when SCRIPT\_NAME is absent from SAPI environment).
    *   Fix memory leak in Phar::offsetGet().
    *   Fix memory leak in phar\_add\_file().
    *   Fixed bug [GH-21799] (phar: propagate phar\_stream\_flush return value from phar\_stream\_close).
    *   Fix memory leak in phar\_verify\_signature() when md\_ctx is invalid.
*   Random:
    *   Fixed bug [GH-21731] (Random\\Engine\\Xoshiro256StarStar::\_\_unserialize() accepts all-zero state).
*   Session:
    *   Fixed memory leak when session GC callback return a refcounted value.
*   SOAP:
    *   Fixed [GHSA-85c2-q967-79q5] (Stale SOAP\_GLOBAL(ref\_map) pointer with Apache Map). (CVE-2026-6722)
    *   Fixed [GHSA-m33r-qmcv-p97q] (Use-after-free after header parsing failure with SOAP\_PERSISTENCE\_SESSION). (CVE-2026-7261)
    *   Fixed [GHSA-hmxp-6pc4-f3vv] (Broken Apache map value NULL check). (CVE-2026-7262)
*   SPL:
    *   Fixed bug [GH-21499] (RecursiveArrayIterator getChildren UAF after parent free).
    *   Fix concurrent iteration and deletion issues in SplObjectStorage.
*   Standard:
    *   Fixed [GHSA-96wq-48vp-hh57] (Signed integer overflow of char array offset). (CVE-2026-7568)
    *   Fixed [GHSA-m8rr-4c36-8gq4] (Consistently pass unsigned char to ctype.h functions). (CVE-2026-7258)
*   Streams:
    *   Fixed bug [GH-21468] (Segfault in file\_get\_contents w/ a https URL and a proxy set). (CVE-2026-12184)
*   XSL:
    *   Fixed bug [GH-21600] (Segfault on module shutdown).
*   Zip:
    *   Fixed bug [GH-21698] (memory leak with ZipArchive::addGlob() early return statements).

## Detailed

### Version 8.4.21

**07 May 2026**

*   Core:
    *   Fixed bug [GH-19983](https://github.com/php/php-src/issues/19983) (GC assertion failure with fibers, generators and destructors).
    *   Fixed bug [GH-21478](https://github.com/php/php-src/issues/21478) (Forward property operations to real instance for initialized lazy proxies).
    *   Fixed bug [GH-21605](https://github.com/php/php-src/issues/21605) (Missing addref for Countable::count()).
    *   Fixed bug [GH-21699](https://github.com/php/php-src/issues/21699) (Assertion failure in shutdown\_executor when resolving self::/parent::/static:: callables if the error handler throws).
    *   Fixed bug [GH-21603](https://github.com/php/php-src/issues/21603) (Missing addref for \_\_unset).
    *   Fixed bug [GH-21760](https://github.com/php/php-src/issues/21760) (Trait with class constant name conflict against enum case causes SEGV).
*   CLI:
    *   Fixed bug [GH-21754](https://github.com/php/php-src/issues/21754) (\`--rf\` command line option with a method triggers ext/reflection deprecation warnings).
*   Curl:
    *   Add support for brotli and zstd on Windows.
*   DOM:
    *   Fixed [GHSA-4jhr-8w89-j733](https://github.com/php/php-src/security/advisories/GHSA-4jhr-8w89-j733) and [GH-21566](https://github.com/php/php-src/issues/21566) (Dom\\XMLDocument::C14N() emits duplicate xmlns declarations after setAttributeNS()). (CVE-2026-7263)
    *   Fixed bug [GH-21688](https://github.com/php/php-src/issues/21688) (segmentation fault on empty HTMLDocument).
    *   Upgrade to lexbor v2.7.0.
*   FPM:
    *   Fixed [GHSA-7qg2-v9fj-4mwv](https://github.com/php/php-src/security/advisories/GHSA-7qg2-v9fj-4mwv) (XSS within status endpoint). (CVE-2026-6735)
*   Iconv:
    *   Fixed bug [GH-17399](https://github.com/php/php-src/issues/17399) (iconv memory leak on bailout).
*   MBString:
    *   Fixed [GHSA-wm6j-2649-pv75](https://github.com/php/php-src/security/advisories/GHSA-wm6j-2649-pv75) (Null pointer dereference in php\_mb\_check\_encoding() via mb\_ereg\_search\_init()). (CVE-2026-7259)
    *   Fixed [GHSA-74r9-qxhc-fx53](https://github.com/php/php-src/security/advisories/GHSA-74r9-qxhc-fx53) (Out-of-bounds access in mbfl\_name2encoding\_ex()). (CVE-2026-6104)
*   Opcache:
    *   Fixed bug [GH-21158](https://github.com/php/php-src/issues/21158) (JIT: Assertion jit->ra\[var\].flags & (1<<0) failed in zend\_jit\_use\_reg).
    *   Fixed bug [GH-21593](https://github.com/php/php-src/issues/21593) (Borked function JIT JMPNZ smart branch).
    *   Fixed bug [GH-21460](https://github.com/php/php-src/issues/21460) (COND optimization regression).
    *   Fixed faulty returns out of zend\_try block in zend\_jit\_trace().
*   OpenSSL:
    *   Fix a bunch of memory leaks and crashes on edge cases.
*   PDO\_Firebird:
    *   Fixed [GHSA-w476-322c-wpvm](https://github.com/php/php-src/security/advisories/GHSA-w476-322c-wpvm) (SQL injection via NUL bytes in quoted strings). (CVE-2025-14179)
*   Phar:
    *   Restore is\_link handler in phar\_intercept\_functions\_shutdown.
    *   Fixed bug [GH-21797](https://github.com/php/php-src/issues/21797) (phar: NULL dereference in Phar::webPhar() when SCRIPT\_NAME is absent from SAPI environment).
    *   Fix memory leak in Phar::offsetGet().
    *   Fix memory leak in phar\_add\_file().
    *   Fixed bug [GH-21799](https://github.com/php/php-src/issues/21799) (phar: propagate phar\_stream\_flush return value from phar\_stream\_close).
    *   Fix memory leak in phar\_verify\_signature() when md\_ctx is invalid.
*   Random:
    *   Fixed bug [GH-21731](https://github.com/php/php-src/issues/21731) (Random\\Engine\\Xoshiro256StarStar::\_\_unserialize() accepts all-zero state).
*   Session:
    *   Fixed memory leak when session GC callback return a refcounted value.
*   SOAP:
    *   Fixed [GHSA-85c2-q967-79q5](https://github.com/php/php-src/security/advisories/GHSA-85c2-q967-79q5) (Stale SOAP\_GLOBAL(ref\_map) pointer with Apache Map). (CVE-2026-6722)
    *   Fixed [GHSA-m33r-qmcv-p97q](https://github.com/php/php-src/security/advisories/GHSA-m33r-qmcv-p97q) (Use-after-free after header parsing failure with SOAP\_PERSISTENCE\_SESSION). (CVE-2026-7261)
    *   Fixed [GHSA-hmxp-6pc4-f3vv](https://github.com/php/php-src/security/advisories/GHSA-hmxp-6pc4-f3vv) (Broken Apache map value NULL check). (CVE-2026-7262)
*   SPL:
    *   Fixed bug [GH-21499](https://github.com/php/php-src/issues/21499) (RecursiveArrayIterator getChildren UAF after parent free).
    *   Fix concurrent iteration and deletion issues in SplObjectStorage.
*   Standard:
    *   Fixed [GHSA-96wq-48vp-hh57](https://github.com/php/php-src/security/advisories/GHSA-96wq-48vp-hh57) (Signed integer overflow of char array offset). (CVE-2026-7568)
    *   Fixed [GHSA-m8rr-4c36-8gq4](https://github.com/php/php-src/security/advisories/GHSA-m8rr-4c36-8gq4) (Consistently pass unsigned char to ctype.h functions). (CVE-2026-7258)
*   Streams:
    *   Fixed bug [GH-21468](https://github.com/php/php-src/issues/21468) (Segfault in file\_get\_contents w/ a https URL and a proxy set). (CVE-2026-12184)
*   XSL:
    *   Fixed bug [GH-21600](https://github.com/php/php-src/issues/21600) (Segfault on module shutdown).
*   Zip:
    *   Fixed bug [GH-21698](https://github.com/php/php-src/issues/21698) (memory leak with ZipArchive::addGlob() early return statements).

## Provenance

Section "Version 8.4.21" of https://www.php.net/ChangeLog-8.php (parent 357fa8ede2f92e1b40db56650c0acf70d73ed54db92fe3916e435795b653e8d9)