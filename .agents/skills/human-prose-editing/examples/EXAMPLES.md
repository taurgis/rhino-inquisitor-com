# Human Prose Editing Examples

## Example 1: Collapse repeated meaning

### Before

Caching is important for performance. It matters because speed is important and users expect fast pages.

### After

Caching matters because it determines whether SFCC can reuse rendered responses and reduce load-time cost per request.

## Example 2: Replace vague praise

### Before

SFCC provides a powerful and flexible way to handle promotions.

### After

SFCC promotions let merchandisers change pricing behavior without shipping new storefront code for each campaign.

## Example 3: End with insight

### Before

This concludes our discussion of session handling.

### After

The key design point is that session bridging is a transition strategy, not a permanent architecture target, in mixed OCAPI and SCAPI storefronts.
## Example 4: Fill the logic gap, flag the specifics gap

### Before

The pre-commit hook rejected the post. Teams often struggle with this gate, and it is important to understand why it fails.

### After

The pre-commit hook rejected the post because it linked to a domain that is not on the external-link allowlist. A new domain has to be registered in `scripts/gates/external-link-domains.js` before the commit goes through. <!-- TODO author: which link tripped it? -->

Context: the repo's publishing docs state the allowlist rule, so the mechanism is filled in from them. Which link tripped it is not on the page, so the editor marks the gap instead of inventing a domain.
