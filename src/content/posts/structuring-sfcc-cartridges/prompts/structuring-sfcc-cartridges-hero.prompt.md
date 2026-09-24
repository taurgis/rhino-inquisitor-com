# Image prompt: structuring-sfcc-cartridges-hero.jpg

## What this image is for

This is the **hero image** for the post "Extend, Replace, or Copy: Structuring SFCC Cartridges." It renders at the very top of the article, above the opening paragraph (the "you override one client-side JavaScript file... and the build immediately wants you to copy the whole of `main.js`" anecdote), and doubles as the social-share/OG image. There is no surrounding prose or code to visually match — it needs to signal the article's core idea at a glance: **Rule Zero** from the first section, "Extend the Base, Never Edit It" — you build your own cartridges on top of the stack, in front of the base, but the base itself stays untouched underneath.

## Image-generation prompt

**Subject**: An anthropomorphic gray rhinoceros — stocky, humanoid proportions, upright two-legged stance, human-like five-fingered hands, a heavy sloped brow, small rounded ears, one large primary horn plus one smaller secondary horn behind it, and textured, wrinkled gray skin rendered with visible cross-hatching and fine linework (not smooth or plastic-looking). For this image, dress the rhino as a careful builder or architect: a canvas tool apron with a few pockets over a rolled-sleeve work shirt, a carpenter's pencil tucked behind one ear.

**Scene**: The rhino stands at a wooden shelving unit, carefully placing a new wooden crate-like block on top of a short stack of similar blocks it has already added. Its other hand hovers protectively just above — but never touching — one large, older, weathered stone block that sits at the very bottom of the stack, clearly the foundation everything else rests on. The rhino's posture makes the caution obvious: it leans its weight and attention toward the new block going on top, while its lower hand is held flat and slightly back from the stone block, like someone waving off their own instinct to touch it. Its expression is focused and deliberate, not casual — this is a rule it takes seriously, not a habit. The stacked wooden blocks above the foundation are plain and uniform in shape, varying only slightly in size, so the eye reads them as "layers added on top" rather than distinct labelled objects.

**Setting**: A quiet carpentry workshop or storage room — a tall wooden shelving unit or scaffold-like rack, a few other crates and coiled rope pushed into soft shadow at the edges of the frame, a single hanging work lamp overhead. Lighting is warm and directional, with the lamp's glow falling most strongly on the old stone foundation block at the bottom of the stack, marking it as the one important, untouchable thing in the scene; the rest of the room fades into deep ink-navy shadow around the edges.

**Color palette**: Warm, restrained "Paper & Ink" palette. Cream and warm paper-beige midtones for the wooden blocks, shelving, and the rhino's clothing; deep ink-navy (near-black, slightly blue) shadows in the corners of the room and behind the shelving; a single warm amber/gold accent color reserved for the glow on the old stone foundation block — that block should be the clear "most important element" the eye lands on first, distinct in both light and slightly rougher, older-looking stone texture from the plain cream-toned wooden blocks stacked above it. No neon, no saturated primary reds/blues/greens, no glossy default-AI-generator color grading.

**Line and rendering style**: Clean, dark ink outlines in a comic-book line-art style, filled with painterly digital shading — soft brushwork texture, visible hand-drawn cross-hatching on the rhino's hide and clothing folds, not flat vector or cel-shaded color fills. Not photorealistic. Think warm editorial-illustration style, like a hand-inked comic panel with painted color washes over it.

**Composition**: The rhino and the shelving stack sit toward the left two-thirds of the frame, leaving open, relatively empty negative space (soft shadow, no important detail) on the right third of the frame for a possible text overlay. Landscape orientation. Single cohesive scene — no panel splits, no collage, no grid of separate vignettes.

**No-text constraint**: Do not render any legible text, numbers, labels, icons-that-read-as-letters, logos, or watermarks anywhere in the image — not on the blocks, not on any crate, tool, or wall in the background. The foundation block should read as important purely through its lighting, texture, and position at the base of the stack, never through a written label. Anything that needs to be exact (cartridge names, stacking order) belongs in the article's prose and diagrams, never in generated artwork.

**Aspect ratio / output**: 16:9 landscape, approximately 1672×941 pixels (matching this site's existing hero images, confirmed against `how-sfcc-price-books-actually-work-hero.jpg`, 1672×941). One single cohesive illustrated scene, high detail, no panel splits or collage.

## Front matter snippet

`index.md` currently declares this hero image and alt text:

```yaml
heroImage: structuring-sfcc-cartridges-hero.jpg
heroImageAlt: >-
  A cartoon rhino architect stacks labelled cartridge blocks on a shelf,
  careful not to touch the solid base block underneath.
```

**Note for whoever generates the final image**: the existing `heroImageAlt` says the blocks are "labelled." The prompt above deliberately avoids any legible text on the blocks (see No-text constraint), so once the image is generated, update the alt text to match what's actually rendered rather than claiming label text that isn't there. Suggested replacement, under 125 characters:

```yaml
heroImageAlt: >-
  A cartoon rhino architect stacks wooden blocks on a shelf, carefully
  avoiding the glowing stone foundation block below.
```
