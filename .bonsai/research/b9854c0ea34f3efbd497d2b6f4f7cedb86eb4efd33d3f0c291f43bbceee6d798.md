---
schema_version: 1
artifact_type: section
source_url: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#example-using-output-as-url
source_urls:
  - https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#example-using-output-as-url
normalized_url: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
cache_key: b9854c0ea34f3efbd497d2b6f4f7cedb86eb4efd33d3f0c291f43bbceee6d798
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
content_hash: 4ada3e189131d9ecbad61ec98c0a02024671561994b613de0248fcae8b836fa7
token_estimate:
  compressed: 94
  detailed: 212
status: active
site_module_id: 
docs_engine: next
docs_framework: 
source_doc_url: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax.md
search_provider: 
parent_cache_key: ce43d72df653a2218ac18b5f8e1adbd0de69863245c6434cb4d5f410d0c24e04
section_anchor: example-using-output-as-url
section_heading_path: Workflow syntax for GitHub Actions > jobs.<jobid>.environment > Example: Using output as URL
---

## Summary

Workflow syntax for GitHub Actions > jobs.<jobid>.environment > Example: Using output as URL

## Compressed

### Example: Using output as URL

```yaml
environment:
  name: production_environment
  url: ${{ steps.step_id.outputs.url_output }}
```

The value of `name` can be an expression. Allowed expression contexts: [`github`], [`inputs`], [`vars`], [`needs`], [`strategy`], and [`matrix`]. For more information about expressions, see [Evaluate expressions in workflows and actions].

## Detailed

### Example: Using output as URL

```yaml
environment:
  name: production_environment
  url: ${{ steps.step_id.outputs.url_output }}
```

The value of `name` can be an expression. Allowed expression contexts: [`github`](/en/actions/reference/workflows-and-actions/contexts#github-context), [`inputs`](/en/actions/reference/workflows-and-actions/contexts#inputs-context), [`vars`](/en/actions/reference/workflows-and-actions/contexts#vars-context), [`needs`](/en/actions/reference/workflows-and-actions/contexts#needs-context), [`strategy`](/en/actions/reference/workflows-and-actions/contexts#strategy-context), and [`matrix`](/en/actions/reference/workflows-and-actions/contexts#matrix-context). For more information about expressions, see [Evaluate expressions in workflows and actions](/en/actions/reference/workflows-and-actions/expressions).

## Provenance

Section "Workflow syntax for GitHub Actions > jobs.<jobid>.environment > Example: Using output as URL" of https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax (parent ce43d72df653a2218ac18b5f8e1adbd0de69863245c6434cb4d5f410d0c24e04)