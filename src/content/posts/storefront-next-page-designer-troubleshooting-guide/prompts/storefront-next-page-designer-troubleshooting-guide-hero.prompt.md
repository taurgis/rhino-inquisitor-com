# Image Prompt: Hero Image

**Post:** `storefront-next-page-designer-troubleshooting-guide`
**Placement:** Hero image for the article. This is the single image that sits above the title/intro paragraph on the published page and is used as the social-share/OG image — it does not sit inline next to any specific section, code block, or diagram in the body.
**Kind:** Illustration (fully generated artwork, not a diagram)

## Reference used

Looked directly at an existing hero illustration in this repo before writing this prompt:
`src/content/posts/storefront-next-architecture-and-migration-from-pwa-kit/storefront-next-migration-hero.jpg` (1672x941px, landscape). That image shows a cartoon human developer on a factory conveyor belt swapping UI panels labeled with product names, a small friendly robot assistant, and warm amber/cream lighting with soft cel-shaded rendering. This new hero should use the site's rhino mascot instead of a human character, in the same warm, restrained palette, but with clean ink linework and painterly (not flat cel-shaded) rendering — see the style spec below.

## Self-contained image-generation prompt

Copy everything in the fenced block below into the image generator exactly as written. The generator has no access to this repository and cannot see any reference image — every visual detail is spelled out here.

```text
Subject: An anthropomorphic gray rhinoceros character — stocky, humanoid body proportions, standing upright on two legs like a person, with human-like five-fingered hands. It has a heavy, sloped brow, small rounded ears, one large primary horn and one smaller secondary horn on its snout, and thick, wrinkled, textured gray skin (like real rhino hide, not smooth cartoon plastic). For this image, dress the rhino as a developer troubleshooting a problem: a soft dark hoodie with sleeves pushed up past its thick forearms, simple round glasses perched on its snout, and it is holding a glowing magnifying glass up in one hand as if inspecting something ahead of it.

Scene: The rhino stands at the start of a winding, elevated wooden-plank path that forks and re-forks ahead of it, like a physical flowchart made of walkways suspended in the air. Along the early forks of the path, small warning signposts lean at odd angles — a cracked padlock icon, a torn paper/map icon, a spinning circular loading icon — each mounted on a simple wooden post, blocking or marking the wrong branches. The rhino leans forward, sweeping its glowing magnifying glass toward the correct branch, and follows a faint trail of warm golden light that skips past the broken signposts and threads through the correct sequence of forks toward a single glowing rectangular screen/panel floating at the far end of the path, standing upright like a doorway, radiating a soft check-mark-shaped glow from within (a rounded glowing shape, not a literal drawn checkmark icon or symbol with edges — just a soft glowing motif, no crisp iconography that could read as text).

Setting: A dim, moody indoor workshop-like space with tall shadowy shelving and pipework fading into darkness in the background, lit mainly by the warm amber glow coming from the far screen and the rhino's magnifying glass, plus a cool ink-navy ambient light elsewhere in the room. Soft floating dust motes catch the light.

Color palette: Warm, restrained "Paper & Ink" palette. Midtones in cream and warm paper-white for the wooden walkways and the rhino's skin highlights. Deep ink-navy for the shadows, background, and the rhino's hoodie. Reserve one warm amber/gold accent color exclusively for the glowing magnifying glass, the trail of correct light, and the glowing screen at the end of the path — that gold is the only saturated color in the image and should immediately draw the eye. No neon colors, no saturated primary reds/blues/greens anywhere, no default AI-generator color grading or gradients.

Line and rendering style: Clean, confident dark ink outlines in a comic-book line-art style, filled with painterly digital shading — visible brushwork texture and soft blended light, not flat vector shapes and not flat cel-shading. Avoid photorealism entirely; this is stylized illustration.

Composition: The rhino is positioned in the lower-left third of the frame, mid-stride, facing toward the upper-right where the glowing screen sits at the end of the path. Leave open, uncluttered negative space in the upper-left quadrant of the image (dark background, no busy detail) so a title can be overlaid there later. Landscape orientation, single cohesive scene filling the full frame — no panel splits, no collage, no border.

No-text constraint: Do not render any legible text, numbers, labels, icons with lettering, logos, or watermarks anywhere in the image. The warning signposts and the glowing screen must read purely through shape, color, and light — no error codes, no words, no readable symbols of any kind.

Aspect ratio and output: 16:9 landscape, approximately 1672x941 pixels (or the nearest 16:9 preset the generator supports), single finished illustration, high detail, no additional panels or variations.
```

## Ready-to-paste front matter

The draft's front matter already references this filename; this confirms the values to keep (or use these if regenerating):

```yaml
heroImage: storefront-next-page-designer-troubleshooting-guide-hero.png
heroImageAlt: >-
  Cartoon rhino developer with a magnifying glass tracing a glowing path
  past broken signposts to a working screen.
```
