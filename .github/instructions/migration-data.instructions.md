---
description: 'Govern changes to migration data files in migration/** including url-manifest.json, url-inventory files, and migration reports to prevent unauthorized URL disposition changes and ensure audit integrity'
applyTo: 'migration/**'
---

# Migration Data Governance Gate

## Purpose

`migration/url-manifest.json` is the authoritative source of truth for URL disposition decisions referenced by six separate assets in this repository. Uncontrolled edits to migration data files can bypass the SEO approval workflow, introduce URL regressions, and corrupt the audit trail.

This instruction applies to all files under `migration/`:

| File | Classification | Risk if changed incorrectly |
|------|---------------|---------------------------|
| `migration/url-manifest.json` | **Policy document** | URL regression, redirect failures, SEO equity loss |
| `migration/url-inventory.normalized.json` | Input data | Silent data loss, missed routes |
| `migration/url-inventory.raw.json` | Audit artifact | Breaks baseline comparison |
| `migration/url-class-matrix.json` | Policy document | Incorrect disposition applied at scale |
| `migration/url-parity-report.json` | Generated report | If hand-edited, masks CI failures |
| `migration/migration-report.json` | Generated report | If hand-edited, masks pipeline errors |
| `migration/migration-report.csv` | Audit export | Manual edits corrupt audit trail |
| `migration/phase-1-*.md` | Baseline documents | Invalidates pre/post comparison |
| `migration/risk-register.md` | Risk tracking | Unowned risks go unmitigated |

## Mandatory Pre-Step

Before modifying any file matched by `applyTo`, determine the **change type** and apply the corresponding gate:

| Change type | Required action |
|-------------|----------------|
| Changing a URL disposition in `url-manifest.json` | Apply **Disposition Change Gate** below |
| Adding a new URL record to `url-manifest.json` | Apply **New URL Record Gate** below |
| Editing a generated report (`.json`, `.csv`) | Apply **Report Edit Gate** below |
| Updating a baseline or risk document (`.md`) | Apply **Baseline Document Gate** below |
| Script writes to migration files | Scripts are exempt from human gates; verify via `migration-report.json` output |

---

## Disposition Change Gate

Applies to any change to the `disposition` field in `migration/url-manifest.json`.

### `keep` → `keep` (no disposition change)
- No approval gate. Verify that `target_url` still matches the Hugo page `url` front matter.

### Any URL changing to `merge`
- [ ] Written rationale is documented in the `reason` field.
- [ ] Target URL (`target_url`) points to a relevant content page — not a category index or homepage.
- [ ] SEO owner approval is recorded in a PR comment or `migration/phase-1-signoff.md` before merging.
- [ ] Consult the `seo-migration` skill URL Disposition Decision Rules before approving.

### Any URL changing to `retire`
- [ ] Confirm the URL has no measured organic traffic (check Search Console data captured in `migration/phase-1-seo-baseline.md`).
- [ ] Confirm the URL has no external links (check Links report in baseline).
- [ ] If the URL has organic traffic or external links, `retire` requires explicit SEO owner approval with a documented mitigation (e.g., redirect to nearest relevant content).
- [ ] **Never** assign `target_url` to homepage as a catch-all for `retire` dispositions — see `seo-migration` skill rules.
- [ ] `implementation_layer` must be set explicitly: `pages-static`, `edge-cdn`, `dns`, or `none`.

### Any URL changing from `merge` or `retire` back to `keep`
- [ ] Confirm the Hugo page with matching `url` front matter exists or will be created before this PR merges.
- [ ] Run URL parity check after the change.

---

## New URL Record Gate

Applies when adding a URL record that does not exist in the current manifest.

- [ ] URL is normalized: absolute path, lowercase, starts with `/`, ends with `/`.
- [ ] Source provenance is recorded in the `source` field (e.g., `sitemap`, `crawl`, `search-console`).
- [ ] URL class is assigned from the taxonomy in `plan/details/phase-1.md`: `post`, `page`, `category`, `video`, `landing`, `system`, or `attachment`.
- [ ] Required fields are populated: `legacy_url`, `disposition`, `target_url`, `redirect_code`, `reason`, `owner`, `priority`, `implementation_layer`.
- [ ] Consult the `seo-specialist` agent for `merge` or `retire` disposition assignments on new URLs with organic traffic.

---

## Report Edit Gate

Applies to manual edits of generated files: `migration-report.json`, `migration-report.csv`, `url-parity-report.json`.

- [ ] **Strongly discouraged.** Generated reports are produced by migration scripts; manual edits mask pipeline errors.
- [ ] If a correction is genuinely needed, document the reason and the original value in a PR description.
- [ ] Re-run the generating script after any manual correction to verify the output is idempotent.
- [ ] Never change a `status: error` record to `status: ok` manually — fix the underlying migration issue instead.

---

## Baseline Document Gate

Applies to `migration/phase-1-seo-baseline.md`, `migration/phase-1-performance-baseline.md`, `migration/phase-1-security-header-matrix.md`, and `migration/risk-register.md`.

- [ ] Baseline documents are append-only during the migration — do not overwrite historical data.
- [ ] If a metric improves post-migration, add a dated comparison note rather than replacing the original value.
- [ ] Risk register updates must include: updated `likelihood`/`impact` if changed, updated `mitigation` if resolved, and a dated resolution note.

---

## Manifest Field Schema Reference

Every record in `migration/url-manifest.json` must conform to this schema:

```json
{
  "legacy_url":           "/some-wordpress-slug/",
  "disposition":          "keep",
  "target_url":           "/some-wordpress-slug/",
  "redirect_code":        null,
  "reason":               "Content preserved with same URL",
  "owner":                "migration-team",
  "priority":             "high",
  "implementation_layer": "none",
  "url_class":            "post",
  "source":               "post-sitemap.xml",
  "has_organic_traffic":  true,
  "has_external_links":   false
}
```

| Field | Required | Values |
|-------|----------|--------|
| `legacy_url` | **Yes** | Absolute path, lowercase, trailing slash |
| `disposition` | **Yes** | `keep`, `merge`, `retire` |
| `target_url` | **Yes** | Hugo page `url` for keep/merge; `null` for retire-to-404 |
| `redirect_code` | Yes for merge/retire | `301`, `308`, `null` (alias fallback) |
| `reason` | **Yes** | Human-readable rationale |
| `owner` | **Yes** | Team or role responsible |
| `priority` | **Yes** | `critical`, `high`, `medium`, `low` |
| `implementation_layer` | **Yes** | `pages-static`, `edge-cdn`, `dns`, `none` |
| `url_class` | **Yes** | `post`, `page`, `category`, `video`, `landing`, `system`, `attachment`, `pagination` |

---

## When This Is Not Required

- Scripts that write to `migration/` as their expected output (e.g., `scripts/parse-sitemap.js` writing `url-inventory.raw.json`) — these follow the `content-migration` skill pipeline contract.
- Read-only operations: queries, searches, or validation scripts that do not mutate files.

## References

- `.github/skills/seo-migration/SKILL.md` — URL disposition rules and approval gates
- `.github/skills/seo-migration/references/REDIRECT-GUIDE.md` — Redirect decision tree by mechanism
- `.github/agents/seo-specialist.agent.md` — Use for disposition review on high-traffic URLs
- `plan/details/phase-1.md` — URL taxonomy, workstream definitions, exit criteria
- `plan/details/phase-6.md` — Redirect strategy and URL parity requirements
