# Image Prompt: Hero — Multi-Site, Multi-Brand Storefronts on SFCC

## Purpose and placement

This is the **hero image** for the post `multi-site-multi-brand-storefronts-on-sfcc/index.md` ("Multi-Site, Multi-Brand Storefronts on SFCC: When to Share a Codebase and When to Split It"). It renders at the very top of the article, above the byline/date and above the first paragraph ("Two questions landed in two different Slack channels the same week..."). There is no body prose immediately before it to visually echo — it sets up the whole post's central question before the reader hits a single word of the article: *do these storefronts share one codebase, or does each brand get its own?*

## Image-generation prompt

### Subject

An anthropomorphic gray rhinoceros — stocky, humanoid proportions, upright two-legged stance, human-like five-fingered hands, a heavy sloped brow, small rounded ears, one large primary horn and one smaller secondary horn behind it, textured wrinkled gray skin rendered with visible cross-hatching and fine linework (not smooth or airbrushed). He is dressed as an architect/draftsman: a canvas work apron over a rolled-sleeve shirt, a pencil tucked behind one ear, forearms slightly dusty as if he's been handling blueprints all morning. His expression is thoughtful and appraising — weighing a decision, not confused by it.

### Scene

The rhino stands at a physical fork in a path rendered like an architectural floor plan come to life, one hand raised to gesture at the choice ahead. The path splits into two:

- **The left path** leads to a single, unified storefront structure — one clean building/kiosk facade with a single glowing shopfront window, representing one shared codebase serving multiple brands from underneath.
- **The right path** splits further into two or three smaller distinct storefront facades, each subtly different in shape and trim (different rooflines, different window styles) but built from the same underlying framework of scaffolding/blueprint lines beneath them — representing separate codebases for genuinely divergent brands.

Faint blueprint-style grid lines and construction chalk marks run along the ground connecting both paths back to one shared foundation slab, visually reinforcing that the org/data layer underneath is shared either way — only the storefronts built on top diverge. The rhino is not yet committed to either path; he's studying both, one foot planted at the junction.

### Setting

An architect's drafting yard at golden hour — think an open-air workshop crossed with a construction site for miniature storefront models. Rolled blueprints, a drafting table, and measuring tools sit at the edges of the frame. Warm late-afternoon light rakes in from one side, casting long soft shadows down the fork in the path and picking out the glow of the one lit shopfront window on the left branch. The background fades into soft, loosely rendered city rooftops under a warm hazy sky — enough to suggest "commerce district" without becoming a detailed skyline.

### Color palette

Warm, restrained "Paper & Ink" palette: cream and aged-paper midtones throughout, deep ink-navy shadows in the folds of the apron and the recesses of the storefront structures, warm sepia-brown for wood and stone textures. Reserve a single warm amber/gold accent for the one most important story element — the glowing lit window of the unified storefront on the left path (or, alternatively, the warm highlight along the fork point where the rhino's hand gestures) — so the eye lands there first. No neon, no saturated primary colors, no default AI-generator color grading (no teal-and-orange, no oversaturated blues).

### Line and rendering style

Clean, confident dark ink outlines in a comic-book / graphic-novel line-art style, filled with painterly digital shading and visible brushwork texture — soft directional hatching and dry-brush texture in the shadows, not flat vector fills and not cel-shaded anime style. Not photorealistic. The linework should read as hand-drawn illustration reproduced digitally, similar to an editorial or technical-blog illustration rather than a rendered 3D scene.

### Composition

Landscape orientation. The rhino is positioned left-of-center to center, facing/gesturing toward the fork on the right side of the frame, with the two branching storefront paths receding into the middle-right of the composition. Leave open negative space in the upper-right sky area and along the right third of the frame for a possible text overlay (title treatment) — keep that region relatively uncluttered (soft sky, distant rooftops only, no busy detail). Single cohesive scene, no panel splits, no collage, no inset diagrams.

### No-text constraint

Do not render any legible text, labels, signage, storefront names, logos, UI elements, or watermarks anywhere in the image. No shop signs with lettering, no blueprint annotations that resemble readable text, no faux-UI screens. General-purpose image generators reliably garble or misspell text — anything that needs to be exact belongs in the article's prose, not in generated artwork. If a surface would naturally carry a sign or label in real life (the shopfronts, the blueprints), render it as a blank or abstractly-marked surface instead.

### Aspect ratio / output

16:9 landscape, approximately 1672×941px (matching this site's existing hero image dimensions — verify against a current hero file before finalizing if the target size has changed). Single cohesive scene, high detail, no panel splits or collage.

## Front matter (already set — confirm output matches)

The post's front matter already specifies this exact filename and alt text; the generated image should match this framing precisely:

```yaml
heroImage: multi-site-multi-brand-storefronts-on-sfcc-hero.png
heroImageAlt: >-
  A cartoon rhino architect at a fork: one path leads to a single
  storefront, the other splits into several branded ones.
```

Save the final output to the post's own folder as `multi-site-multi-brand-storefronts-on-sfcc-hero.png`.
