# Home And Shell Design Skill Alignment

## Change Summary

The homepage and shared shell were refined after auditing the site against the new `css-motion-systems`, `html`, and `ux-interface-design` skills.

This pass tightened the mobile drawer interaction, improved theme-toggle state communication, expanded reduced-motion coverage for shell and homepage motion, cleaned up a few homepage semantics and action-copy mismatches, removed the homepage featured-card stretched-link overlay, and aligned archive/post first-paint motion handling with the shared motion contract.

## Why This Changed

The audit found five concrete gaps:

1. Shared motion was defined ad hoc, and reduced-motion support covered only a small portion of the motion that ships on the homepage and site shell.
2. The mobile drawer close path depended on a fixed JavaScript timeout instead of the actual CSS transition lifecycle, which made later motion changes risky.
3. The homepage contained a few semantic and UX mismatches, including a labeled generic container for support links, redundant native-list roles, and newsletter copy that led with what the site does not offer instead of the available action.
4. The homepage featured article used a stretched-link overlay pattern that risked conflicting with independently rendered metadata links inside the card.
5. The critical archive and post styles still carried their own first-paint scroll and shell behavior without the newer motion-token and reduced-motion contract.

## Behavior Details

### Previous Behavior

- The mobile drawer closed on a hard-coded `300ms` timer, regardless of the actual transition duration in CSS.
- The mobile drawer did not explicitly trap focus while open.
- The theme toggle exposed a generic toggle label without an `aria-pressed` state that reflected the active theme.
- Reduced-motion support only disabled transitions for captioned figures; homepage and shell motion such as smooth scrolling, drawer travel, hover lifts, and featured-image zoom remained active.
- The homepage rendered Active Projects inside an `aside`, rendered the support links inside a labeled `div`, used redundant `role="list"` on native lists, and described the follow block in negative terms.
- The homepage featured card used a stretched-link overlay on the title link, which made the full card behave like one large article target even when metadata could still contain a separate topic link.
- The archive and post critical styles did not yet mirror the newer motion-token and reduced-motion contract for first-paint shell behavior.

### New Behavior

- The mobile drawer now waits for the actual drawer transition to finish, with a small fallback timeout, instead of relying on a hard-coded delay.
- The mobile drawer traps focus while open and marks background content inert until it is closed.
- The theme toggle now reports pressed state and updates its label/title to describe the next available theme action.
- Shared shell and homepage motion now use reusable motion tokens, and reduced-motion mode disables smooth scrolling and suppresses shell/home travel-heavy transitions.
- The homepage now renders Active Projects as a normal content section, renders the support links as navigation, removes redundant native-list roles, and leads the follow block with the available actions.
- The homepage featured card now uses explicit article links on the media and title instead of a stretched-link overlay, so article and metadata links remain independently operable.
- The archive motion rules in the main stylesheet now use the shared motion tokens, and the home/archive/post critical styles now disable smooth scrolling and skip-link motion in reduced-motion mode so first paint and full styles stay aligned.

## Impact And Verification

### Impact

Impacted components:

- shared header and mobile drawer
- theme toggle
- homepage featured article card
- homepage hero support links and projects group
- homepage follow-new-posts callout
- archive and post first-paint shell motion

Impacted workflows:

- keyboard and focus-flow QA for the mobile drawer
- reduced-motion QA for shared shell, archive, and post interactions
- homepage featured-card link-behavior QA
- homepage markup and accessibility smoke checks

SEO impact: none. This pass does not alter URLs, canonicals, metadata ownership, sitemap output, robots directives, or structured data behavior.

### Verification

Executed after the implementation pass:

- `npm run build:prod`
- `npm run check:html-conformance`
- `npm run check:accessibility`

Validation results:

- production Hugo build succeeded
- HTML conformance passed with `0` errors and `0` warnings
- accessibility check passed with `0` blocking failures and `0` warnings

Follow-up validation for the deferred items:

- reran `npm run build:prod` after the featured-card interaction change
- reran `npm run check:html-conformance` after the featured-card interaction change
- reran `npm run check:accessibility` after the featured-card interaction change
- reran `npm run build:prod` after the archive/post critical motion cleanup
- reran `npm run check:accessibility` after the archive/post critical motion cleanup

## Related Files

- `src/layouts/partials/site/header.html`
- `src/layouts/home.html`
- `src/assets/styles/site.css`
- `src/assets/styles/critical-home.css`
- `src/assets/styles/critical-archive.css`
- `src/assets/styles/critical-post.css`

## Assumptions And Open Questions

- Assumption: this pass stays limited to the homepage featured card and first-paint motion handling rather than expanding into other card patterns or broader archive/post interaction redesign.
- Open question: none.