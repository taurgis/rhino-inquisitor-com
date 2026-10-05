---
schema_version: 1
artifact_type: section
source_url: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#example-of-jobsjobidcache-mode
source_urls:
  - https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#example-of-jobsjobidcache-mode
normalized_url: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
cache_key: 58c5aed06401ab3cd304ea321dd3ff5a1c7efbcfd23aa80dd1e0d329f7c4fbd9
topic: 
tags:
  - workflow
  - actions
  - job
  - run
  - github
format_available:
  - compressed
  - detailed
tier: standard
ttl: 
fetched_at: 2026-10-05T08:43:02.972Z
validated_at: 2026-10-05T08:43:02.972Z
stale_after: 2026-11-04T08:43:02.972Z
capture_method: route_markdown
extraction_status: extracted
extraction_confidence: high
quality_notes:
  - captured from public Markdown/MDX source: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax.md
  - auto-generated tags via keyword extraction
supplied_at: 
supplied_by: 
etag: 
last_modified: 
content_hash: 717e56f0ac90f3b90e9d0e1d79cabebee34698f87557901db7e4706769b9b34c
token_estimate:
  compressed: 44
  detailed: 44
status: active
site_module_id: 
docs_engine: next
docs_framework: 
source_doc_url: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax.md
search_provider: 
parent_cache_key: ce43d72df653a2218ac18b5f8e1adbd0de69863245c6434cb4d5f410d0c24e04
section_anchor: example-of-jobsjobidcache-mode
section_heading_path: Workflow syntax for GitHub Actions > jobs.<jobid>.cache-mode > Example of jobs.<jobid>.cache-mode
---

## Summary

Workflow syntax for GitHub Actions > jobs.<jobid>.cache-mode > Example of jobs.<jobid>.cache-mode

## Compressed

### Example of `jobs.<job_id>.cache-mode`

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    cache-mode: write
  test:
    runs-on: ubuntu-latest
    cache-mode: read
```

## Detailed

### Example of `jobs.<job_id>.cache-mode`

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    cache-mode: write
  test:
    runs-on: ubuntu-latest
    cache-mode: read
```

## Provenance

Section "Workflow syntax for GitHub Actions > jobs.<jobid>.cache-mode > Example of jobs.<jobid>.cache-mode" of https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax (parent ce43d72df653a2218ac18b5f8e1adbd0de69863245c6434cb4d5f410d0c24e04)