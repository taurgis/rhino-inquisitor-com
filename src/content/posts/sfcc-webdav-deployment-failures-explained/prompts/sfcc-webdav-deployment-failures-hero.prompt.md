# Image prompt: sfcc-webdav-deployment-failures-hero.jpg

## What this image is for

This is the **hero image** for the post "SFCC WebDAV Deployment Failures: Locked ZIPs and Unzip Errors". It renders at the very top of the article, above the opening paragraph (the pipeline log that says `Resource [_upload-...zip] is locked`, retried three times with the same result), and doubles as the social-share/OG image. There is no surrounding prose or code to match. The picture has to signal the core idea at a glance: the archive was delivered fine, but the machine that unpacks it refuses to open because something is already holding the lock.

## Image-generation prompt

**Subject**: An anthropomorphic gray rhinoceros: stocky, humanoid proportions, upright two-legged stance, human-like five-fingered hands, a heavy sloped brow, small rounded ears, one large primary horn plus one smaller secondary horn behind it, and textured, wrinkled gray skin rendered with visible cross-hatching and fine linework (not smooth or plastic-looking). For this image, dress the rhino as a weary delivery courier at a warehouse loading dock: a flat cap, a rolled-sleeve work shirt with a canvas courier satchel strap across the chest, and a leather work apron or vest. No readable badge, patch, or lettering anywhere on the clothing.

**Scene**: The rhino stands on a loading dock holding two sturdy wooden shipping crates stacked in its arms, one resting on top of the other and slightly offset, to suggest two uploads arriving at the same time. Each crate is marked only by a stylised zipper-teeth strip running down its side and a small rope-and-tag handle (no writing on the tag). In front of the rhino stands a large, boxy, riveted brass-and-iron machine, the "unpacking machine", with a hatch door in its front. The hatch is held shut by one oversized padlock, and that padlock is the single warm amber/gold element in the picture. The rhino has stopped mid-step, eyebrows pulled together, head tilted, with a tired, patient "not again" expression, looking at the padlock rather than at the crates. A third crate with the same zipper-strip marking sits abandoned on the dock floor near the machine's base, to suggest a retry that also bounced. A faint puff of steam leaks from the machine's side vent, showing it is busy inside. The rhino is not angry and does not try to force the hatch; the mood is wry frustration.

**Setting**: A quiet industrial loading dock at the end of a working day: worn wooden planks, a rolling door half-open behind the rhino showing deep shadow, a stack of empty pallets, a hanging work lamp. Lighting is warm and directional, coming mainly from the padlock and a low overhead lamp, throwing deep ink-navy shadows across the dock and the back wall while the padlock and the machine's hatch stay the bright focal point.

**Color palette**: Warm, restrained "Paper & Ink" palette. Cream and warm paper-beige midtones for the crates, the rhino's clothing, and the lit parts of the dock; deep ink-navy (near-black, slightly blue) for the shadowed back wall, rolling door interior, and room corners; the machine in muted desaturated iron-gray and dull brass tones. One warm amber/gold accent color is reserved for the padlock and the soft glow it casts on the hatch and the nearest crate. That spot must be the first thing the eye lands on. No red anywhere, no neon, no saturated primary colors, no glossy default-AI-generator color grading.

**Line and rendering style**: Clean, dark ink outlines in a comic-book line-art style, filled with painterly digital shading: soft brushwork texture, visible hand-drawn cross-hatching on the rhino's hide, the wooden crates, and clothing folds. Not flat vector or cel-shaded color fills, and not photorealistic. Think warm editorial illustration, like a hand-inked comic panel with painted colour washes over it.

**Composition**: The rhino, the stacked crates, and the machine with the padlocked hatch sit in the right two-thirds of the frame, with the padlock roughly at the right-hand third line. Leave the left third of the frame as open, relatively empty negative space (soft shadow and a hint of dock wall, no important detail) for a possible text overlay. Landscape orientation. Single cohesive scene, shot at about the rhino's eye level, no panel splits, no collage, no grid of separate vignettes.

**No-text constraint**: Do not render any legible text, numbers, labels, letters, icons that read as letters, logos, or watermarks anywhere in the image: not on the crates, tags, machine, signs, walls, or clothing. The crates are identified purely by the zipper-teeth strip, the machine purely by its shape. Anything that needs to be exact (file names, error messages) belongs in the article's prose and code blocks, never in generated artwork.

**Aspect ratio / output**: 16:9 landscape, approximately 1672x941 pixels (matching this site's existing hero images, for example `how-sfcc-price-books-actually-work-hero.jpg` at 1672x941; some older heroes are 2000x1091 or 1280x720, all roughly 16:9). One single cohesive illustrated scene, high detail, no panel splits or collage. Save as PNG with the filename `sfcc-webdav-deployment-failures-hero.jpg` and place it in the post's own folder, next to `index.md`.

## Front matter snippet

`index.md` already declares this hero image and an alt text:

```yaml
heroImage: sfcc-webdav-deployment-failures-hero.jpg
heroImageAlt: >-
  A cartoon rhino courier at a loading dock holds two ZIP crates while a red padlock blocks the door of the unzip machine
```

**Note for whoever generates the final image**: the existing `heroImageAlt` mentions a *red* padlock. The prompt above deliberately uses an amber/gold padlock to stay inside the site's palette (no red). Once the image is generated, replace the alt text with this one (under 125 characters), adjusting it if the rendered scene differs:

```yaml
heroImage: sfcc-webdav-deployment-failures-hero.jpg
heroImageAlt: >-
  A cartoon rhino courier holds two stacked crates in front of a machine whose hatch is shut by a golden padlock
```
