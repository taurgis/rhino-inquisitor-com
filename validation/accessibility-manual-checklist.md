# Phase 8 Accessibility Manual Checklist

Status: Browser-assisted review completed by GitHub Copilot on 2026-03-20. Representative manual checks now pass after the shared header remediation. Ticket owner acknowledgment was recorded at RHI-089 closeout.

- Reviewer role: Engineering Owner
- Warning and moderate-finding authority: Engineering Owner
- Automation scope baseline: `validation/sample-matrix.json` page samples from RC `phase-8-rc-v2`
- Manual evidence note: This file contains a GitHub Copilot browser-assisted pre-review plus a headless mobile smoke check. Ticket owner acknowledgment was accepted at closeout for final sign-off.

## Representative templates

| Template | Representative route | Page title unique and descriptive | Informational image alt text | Heading structure | Keyboard navigation | Visible focus | Contrast spot check | No keyboard trap | No critical focus loss | Reviewer | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Homepage | `/` | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Engineering Owner | Prefilled, passing | Desktop tab order now starts with a visible skip link and stays within visible header controls. Mobile smoke check on the homepage confirmed toggle focus, close-button focus on open, `Escape` close, and focus return to the toggle. |
| Article | `/real-time-inventory-checks-in-sfcc/` | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Engineering Owner | Prefilled, passing | Article title, image alt text, and heading progression remained clear. Desktop keyboard review no longer entered hidden mobile-drawer controls, and the skip link was visibly available on first focus. |
| Category | `/category/ai/` | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Engineering Owner | Prefilled, passing | Archive title and card image alt text were descriptive, and the category page kept a usable heading hierarchy. Desktop tab order remained within visible controls only after the shared header fix. |
| Privacy or legal page | `/privacy-policy/` | Pass | n/a | Pass | Pass | Pass | Pass | Pass | Pass | Engineering Owner | Prefilled, passing | No informative content images were present on the sampled page. Title, section headings, skip-link visibility, and desktop keyboard flow all passed after the shared header remediation. |

## Follow-up items

| Item | Severity | Owner | Target resolution date | Status | Notes |
|---|---|---|---|---|---|
| None recorded after the shared header rerun. | n/a | Engineering Owner | n/a | Closed | Desktop representative routes and the homepage mobile smoke check passed on 2026-03-20, and the automated WS-F reports reran with 0 warnings. |