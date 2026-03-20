# Phase 8 Approver Roster

## Purpose

Record the required Phase 8 owner roles, backup contacts, read confirmations, and the go/no-go decision window that RHI-083, RHI-091, and RHI-092 depend on.

## Repository governance baseline

The repository currently operates under the single-owner model used in the Phase 7 launch and rollback runbooks. Unless a delegated roster is approved and recorded here, Thomas Theunen is the primary approver for the migration owner, SEO owner, engineering owner, and DNS/operations owner roles.

## Current bootstrap status

- Phase 8 bootstrap ticket: `analysis/tickets/phase-8/RHI-083-phase-8-bootstrap.md`
- Bootstrap status: Done
- Canonical RC ref: `phase-8-rc-v2` -> `efdcefce`
- Phase 7 gate evidence URL: `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23282905074`
- Go/no-go decision window: Pending owner confirmation
- Backup contacts: Thomas Theunen under the current single-owner fallback response

## Approver roster

| Role | Primary approver | Backup contact | Availability confirmed | Notes |
|------|------------------|----------------|------------------------|-------|
| Migration Owner | Thomas Theunen | Thomas Theunen | Confirmed 2026-03-20 | Single-owner baseline; no delegated secondary contact recorded |
| SEO Owner | Thomas Theunen | Thomas Theunen | Confirmed 2026-03-20 | Single-owner baseline; no delegated secondary contact recorded |
| Engineering Owner | Thomas Theunen | Thomas Theunen | Confirmed 2026-03-20 | Single-owner baseline; no delegated secondary contact recorded |
| DNS/Operations Owner | Thomas Theunen | Thomas Theunen | Confirmed 2026-03-20 | Single-owner baseline; no delegated secondary contact recorded |

## Required acknowledgments

| Item | Required roles | Status | Evidence |
|------|----------------|--------|----------|
| Read `analysis/plan/details/phase-8.md` | Migration, SEO, Engineering, DNS/Operations | Confirmed 2026-03-20 | Thomas Theunen acknowledged the plan for all four roles under the single-owner model |
| Reviewed the non-negotiable Phase 8 release gates | Migration, SEO, Engineering, DNS/Operations | Confirmed 2026-03-20 | Thomas Theunen acknowledged the hard-blocker gate list for all four roles under the single-owner model |
| Agreed the canonical RC ref for validation | Migration, Engineering | Confirmed 2026-03-20 | `phase-8-rc-v2` -> `efdcefce` |
| Agreed the go/no-go decision window | Migration, SEO, Engineering, DNS/Operations | Pending | Record date, required present, and format here |

## Workstream ownership baseline

| Workstream | Ticket | Owner | Target date | Confirmation |
|------------|--------|-------|-------------|--------------|
| Setup | RHI-083 | Thomas Theunen | 2026-06-03 | Confirmed 2026-03-20 under the single-owner model |
| WS-A | RHI-084 | Thomas Theunen | 2026-06-04 | Confirmed 2026-03-20 under the single-owner model |
| WS-B | RHI-085 | Thomas Theunen | 2026-06-06 | Confirmed 2026-03-20 under the single-owner model |
| WS-C | RHI-086 | Thomas Theunen | 2026-06-06 | Confirmed 2026-03-20 under the single-owner model |
| WS-D | RHI-087 | Thomas Theunen | 2026-06-09 | Confirmed 2026-03-20 under the single-owner model |
| WS-E | RHI-088 | Thomas Theunen | 2026-06-09 | Confirmed 2026-03-20 under the single-owner model |
| WS-F | RHI-089 | Thomas Theunen | 2026-06-09 | Confirmed 2026-03-20 under the single-owner model |
| WS-G | RHI-090 | Thomas Theunen | 2026-06-10 | Confirmed 2026-03-20 under the single-owner model |
| WS-H | RHI-091 | Thomas Theunen | 2026-06-11 | Confirmed 2026-03-20 under the single-owner model |
| Sign-off | RHI-092 | Thomas Theunen | 2026-06-13 | Confirmed 2026-03-20 under the single-owner model |

## Go/No-Go decision window

| Field | Value |
|-------|-------|
| Target date | 2026-03-20 |
| Required approvers present | Thomas Theunen acting under the single-owner model for migration, SEO, engineering, and DNS/operations |
| Meeting format | Same-day single-owner approval meeting |
| Notes | Owner response: "Meeting with myself, today, everything approved." |

## Change log

| Date | Update |
|------|--------|
| 2026-03-20 | Created during RHI-083 bootstrap to record the single-owner primary-role baseline and the remaining owner-confirmation fields. |
| 2026-03-20 | Recorded the owner-approved RC tag `phase-8-rc-v1`, Phase 8 role acknowledgments, and the single-owner workstream assignment baseline. |
| 2026-03-20 | Recorded the Phase 8 go/no-go decision window as a same-day single-owner approval meeting with all required roles represented by Thomas Theunen. |
| 2026-03-20 | Updated the canonical RC reference to `phase-8-rc-v2` after the RHI-088 performance remediation re-cut. |