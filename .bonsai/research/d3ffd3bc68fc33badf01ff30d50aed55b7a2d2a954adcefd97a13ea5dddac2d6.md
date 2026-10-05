---
schema_version: 1
artifact_type: section
source_url: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#example-using-an-action-in-the-same-repository-as-the-workflow-at-the-running-commit-recommended
source_urls:
  - https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#example-using-an-action-in-the-same-repository-as-the-workflow-at-the-running-commit-recommended
normalized_url: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
cache_key: d3ffd3bc68fc33badf01ff30d50aed55b7a2d2a954adcefd97a13ea5dddac2d6
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
content_hash: 99a3e2a98e5af0d8433d5221a0f8edd44efe01171f1dfbd20ab52bb05031411e
token_estimate:
  compressed: 513
  detailed: 643
status: active
site_module_id: 
docs_engine: next
docs_framework: 
source_doc_url: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax.md
search_provider: 
parent_cache_key: ce43d72df653a2218ac18b5f8e1adbd0de69863245c6434cb4d5f410d0c24e04
section_anchor: example-using-an-action-in-the-same-repository-as-the-workflow-at-the-running-commit-recommended
section_heading_path: Workflow syntax for GitHub Actions > jobs.<jobid>.steps[].uses > Example: Using an action in the same repository as the workflow at the running commit (recommended)
---

## Summary

Workflow syntax for GitHub Actions > jobs.<jobid>.steps[].uses > Example: Using an action in the same repository as the workflow at the running commit (recommended)

## Compressed

### Example: Using an action in the same repository as the workflow at the running commit (recommended)

`$/path/to/action`

The `$/` prefix is the self repository reference. You do not need to check out the repository first, so it is the recommended way to reference an action within its own repository.

The `$/` syntax is not available in GitHub Enterprise Server.

A `$/` reference must not include an `@{ref}` suffix. The ref is always the commit the running workflow or action is using, so a reference such as `$/actions/my-action@v1` is invalid.

`$/` always resolves against the repository of the file it appears in, not the repository that called it. For example, if a reusable workflow in one repository is called by a workflow in another repository, a `$/` reference in the called workflow resolves to the called workflow's repository, not the calling workflow's repository.

The following table compares the ways to reference an action.

| Syntax                 | Resolves to                                                                                                         | Recommended for                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `$/path/to/action`     | The same repository as the running workflow or action, at the running commit                                        | Actions in the same repository |
| `{owner}/{repo}@{ref}` | The specified repository at the specified ref                                                                       | Actions in another repository  |
| `./path/to/action`     | A path in the runner's checked-out workspace, relative to the default working directory (`${{ github.workspace }}`) | Edge cases only                |

```yaml
on: [push]

jobs:
  my_first_job:
    runs-on: ubuntu-latest
    steps:
      # References an action in the same repository at the running commit
      - uses: $/.github/actions/hello-world-action
```

## Detailed

### Example: Using an action in the same repository as the workflow at the running commit (recommended)

`$/path/to/action`

The `$/` prefix is the self repository reference. It references an action stored in the same repository as the workflow or action that is currently running, and resolves to that repository at the running commit (the same SHA as the running workflow or action). You do not need to check out the repository first, so it is the recommended way to reference an action within its own repository.

The `$/` syntax is not available in GitHub Enterprise Server.

A `$/` reference must not include an `@{ref}` suffix. The ref is always the commit the running workflow or action is using, so a reference such as `$/actions/my-action@v1` is invalid.

`$/` always resolves against the repository of the file it appears in, not the repository that called it. For example, if a reusable workflow in one repository is called by a workflow in another repository, a `$/` reference in the called workflow resolves to the called workflow's repository, not the calling workflow's repository. This makes `$/` reliable for action composition, where a relative `./` path would instead resolve against whatever is checked out in the caller's workspace. For using `$/` in a composite action's steps, see [Metadata syntax reference](/en/actions/reference/workflows-and-actions/metadata-syntax#runsstepsuses).

The following table compares the ways to reference an action.

| Syntax                 | Resolves to                                                                                                         | Recommended for                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `$/path/to/action`     | The same repository as the running workflow or action, at the running commit                                        | Actions in the same repository |
| `{owner}/{repo}@{ref}` | The specified repository at the specified ref                                                                       | Actions in another repository  |
| `./path/to/action`     | A path in the runner's checked-out workspace, relative to the default working directory (`${{ github.workspace }}`) | Edge cases only                |

```yaml
on: [push]

jobs:
  my_first_job:
    runs-on: ubuntu-latest
    steps:
      # References an action in the same repository at the running commit
      - uses: $/.github/actions/hello-world-action
```

## Provenance

Section "Workflow syntax for GitHub Actions > jobs.<jobid>.steps[].uses > Example: Using an action in the same repository as the workflow at the running commit (recommended)" of https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax (parent ce43d72df653a2218ac18b5f8e1adbd0de69863245c6434cb4d5f410d0c24e04)