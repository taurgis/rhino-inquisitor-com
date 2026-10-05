---
schema_version: 1
artifact_type: section
source_url: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#custom-shell
source_urls:
  - https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#custom-shell
normalized_url: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
cache_key: 81b1b9f0afc7c15042cdb2bc35ffafdcaadb4f86c7e3f17bc3d6312d96fdca0f
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
content_hash: 3b33183f3f39ddeccb974fd7ecf9066caa59b86dfda68181c07da22c3c916c12
token_estimate:
  compressed: 145
  detailed: 169
status: active
site_module_id: 
docs_engine: next
docs_framework: 
source_doc_url: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax.md
search_provider: 
parent_cache_key: ce43d72df653a2218ac18b5f8e1adbd0de69863245c6434cb4d5f410d0c24e04
section_anchor: custom-shell
section_heading_path: Workflow syntax for GitHub Actions > jobs.<jobid>.steps[].shell > Custom shell
---

## Summary

Workflow syntax for GitHub Actions > jobs.<jobid>.steps[].shell > Custom shell

## Compressed

### Custom shell

You can set the `shell` value to a template string using `command [options] {0} [more_options]`. GitHub interprets the first whitespace-delimited word of the string as the command, and inserts the file name for the temporary script at `{0}`.

For example:

```yaml
steps:
  - name: Display the environment variables and their values
    shell: perl {0}
    run: |
      print %ENV
```

The command used, `perl` in this example, must be installed on the runner.

For information about the software included on GitHub-hosted runners, see [GitHub-hosted runners].

## Detailed

### Custom shell

You can set the `shell` value to a template string using `command [options] {0} [more_options]`. GitHub interprets the first whitespace-delimited word of the string as the command, and inserts the file name for the temporary script at `{0}`.

For example:

```yaml
steps:
  - name: Display the environment variables and their values
    shell: perl {0}
    run: |
      print %ENV
```

The command used, `perl` in this example, must be installed on the runner.

For information about the software included on GitHub-hosted runners, see [GitHub-hosted runners](/en/actions/concepts/runners/github-hosted-runners#preinstalled-software-for-github-owned-images).

## Provenance

Section "Workflow syntax for GitHub Actions > jobs.<jobid>.steps[].shell > Custom shell" of https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax (parent ce43d72df653a2218ac18b5f8e1adbd0de69863245c6434cb4d5f410d0c24e04)