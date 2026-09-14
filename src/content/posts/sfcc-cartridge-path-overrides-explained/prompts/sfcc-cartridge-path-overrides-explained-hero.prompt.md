# Image prompt: sfcc-cartridge-path-overrides-explained-hero.png

## What this image is for

This is the **hero image** for the post "SFCC Cartridge Path & Overrides: module.superModule, Hooks, and the Mistakes Everyone Makes." It renders at the very top of the article, above the opening paragraph (the "you add a cartridge to the path... nothing changes" anecdote), and doubles as the social-share/OG image. There is no surrounding prose or code to visually match — it needs to signal the article's core idea at a glance: that cartridge-path resolution is about ordered precedence, where the first matching file wins and the rest are never touched.

## Image-generation prompt

**Subject**: An anthropomorphic gray rhinoceros — stocky, humanoid proportions, upright two-legged stance, human-like five-fingered hands, a heavy sloped brow, small rounded ears, one large primary horn plus one smaller secondary horn behind it, and textured, wrinkled gray skin rendered with visible cross-hatching and fine linework (not smooth or plastic-looking). For this image, dress the rhino as a methodical archivist or file clerk: a canvas work apron or waistcoat over a rolled-sleeve shirt, reading glasses pushed low on its snout, maybe a pencil tucked behind one ear.

**Scene**: The rhino stands at a waist-high workbench, holding up and comparing four large translucent glass or acrylic panes standing on edge in a row, like dividers in a filing rack — arranged left to right, each pane a slightly different cool tint (pale blue, pale green, pale gray, pale amber-gray) so they read as distinct layers without any text on them. A bright lantern or work-lamp sits behind the leftmost pane, shining through the stack toward the rhino. The rhino leans in close, one hand shading its eyes, peering at the *frontmost* pane — the one closest to the lamp — because light passing through that pane is the only one casting a shape on the workbench surface; the panes behind it are visibly blocked and dark, their own shapes never reaching the surface at all. The rhino's other hand points at the one illuminated shape on the bench, as if confirming "this one, and only this one, is what actually shows." Its expression is focused and satisfied, like it just solved a small puzzle.

**Setting**: A quiet workshop or archive room — wooden workbench, a few tool jars and rolled papers pushed to the side, shelving fading into soft shadow behind the rhino. Lighting is warm and directional from the single lamp behind the glass panes, throwing deep ink-navy shadows across the rest of the room while the panes and the workbench in front of them stay the bright focal point.

**Color palette**: Warm, restrained "Paper & Ink" palette. Cream and warm paper-beige midtones for the workbench, walls, and rhino's clothing; deep ink-navy (near-black, slightly blue) for the shadowed shelving and room corners; a single warm amber/gold accent color reserved for the lamp's glow and the one illuminated shape it casts on the workbench — that spot of light should be the clear "most important element" the eye lands on first. The four glass panes themselves stay in cool, desaturated cream/gray/pale-blue tones so they never compete with the amber accent. No neon, no saturated primary reds/blues/greens, no glossy default-AI-generator color grading.

**Line and rendering style**: Clean, dark ink outlines in a comic-book line-art style, filled with painterly digital shading — soft brushwork texture, visible hand-drawn cross-hatching on the rhino's hide and clothing folds, not flat vector or cel-shaded color fills. Not photorealistic. Think warm editorial-illustration style, like a hand-inked comic panel with painted color washes over it.

**Composition**: The rhino and the row of glass panes sit toward the right two-thirds of the frame, leaving open, relatively empty negative space (soft shadow, no important detail) on the left third of the frame for a possible text overlay. Landscape orientation. Single cohesive scene — no panel splits, no collage, no grid of separate vignettes.

**No-text constraint**: Do not render any legible text, numbers, labels, icons-that-read-as-letters, logos, or watermarks anywhere in the image — not on the glass panes, not on any paper or shelving in the background. The panes should be distinguished purely by tint, translucency, and position, never by written labels. Anything that needs to be exact (cartridge names, order) belongs in the article's prose and diagrams, never in generated artwork.

**Aspect ratio / output**: 16:9 landscape, approximately 1672×941 pixels (matching this site's existing hero images, confirmed against `how-sfcc-price-books-actually-work-hero.jpg`). One single cohesive illustrated scene, high detail, no panel splits or collage.

## Front matter snippet

`index.md` already declares this hero image and alt text:

```yaml
heroImage: sfcc-cartridge-path-overrides-explained-hero.png
heroImageAlt: >-
  A cartoon rhino stacking transparent building blocks labelled custom, link,
  plugin and base, checking which block is on top.
```

**Note for whoever generates the final image**: the existing `heroImageAlt` says the blocks are "labelled custom, link, plugin and base." The prompt above deliberately avoids any legible text on the panes (see No-text constraint), so once the image is generated, update the alt text to match what's actually rendered rather than claiming label text that isn't there. Suggested replacement, under 125 characters:

```yaml
heroImageAlt: >-
  A cartoon rhino comparing four translucent glass panes lit from behind,
  checking which one casts a shape on the workbench.
```
