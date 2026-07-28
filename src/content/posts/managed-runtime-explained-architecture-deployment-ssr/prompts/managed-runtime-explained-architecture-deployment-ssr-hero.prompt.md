# Image prompt: managed-runtime-explained-architecture-deployment-ssr-hero.png

## Purpose and placement

This is the **hero image** for the post "MRT Explained: Managed Runtime Architecture, Deployment, and SSR" (`src/content/posts/managed-runtime-explained-architecture-deployment-ssr/index.md`). It renders at the very top of the article, above the title/intro, as the page's `heroImage`. The post explains that Managed Runtime (MRT) is a Node.js, Lambda-based serverless layer: no idle server, just a function that spins up on demand, renders a React storefront (via streaming SSR), and returns a response — with requests flowing from a shopper's browser through an edge CDN into that on-demand Lambda function, and only ever serving web clients (not mobile apps, which call SCAPI directly). The hero needs to visually capture "an on-demand serverless engine springing to life to serve a web page," not a generic server-room image.

## Reference example looked at

Before drafting this prompt, I opened `src/content/posts/b2c-commerce-cloud-26-8-release/b2c-commerce-cloud-26-8-release-hero.jpg` (1672x941px, landscape) to confirm the house style: a hand-inked comic/graphic-novel rhino character rendered with painterly digital shading and visible brush texture, standing at a worn industrial control console covered in dials, screens, and glowing amber circuitry, in a dim workshop lit mostly by one warm light source, with background elements fading into near-black shadow. The palette is almost entirely cream/tan and deep ink-navy/near-black, with a single warm amber-gold glow reserved for the one thing that matters most in the scene (there, a data feed branching to store icons). No legible text or logos appear anywhere in that image.

## Self-contained image-generation prompt

**Subject**: An anthropomorphic gray rhinoceros — stocky, humanoid proportions, upright two-legged stance, human-like five-fingered hands, a heavy sloped brow, small rounded ears, one large horn and one smaller horn on its snout, and textured, wrinkled gray skin rendered with visible cross-hatching and brush strokes. For this image, the rhino wears a well-worn canvas work vest over a rolled-sleeve shirt, with a tool pouch at its belt — dressed like an engineer who keeps machinery running, not a lab coat or business suit.

**Scene**: The rhino stands with one hand pressed flat against the side of a squat, glowing mechanical pod shaped like a stylized capital lambda (λ) — roughly waist-to-chest height, riveted metal casing, seams of warm light along its edges as if it just powered up. The pod is otherwise dormant-looking machinery around it (dials at rest, screens dark) except for this one lambda-shaped unit, which pulses with amber-gold light. From the top of the glowing lambda pod, a single luminous ribbon of light rises and stretches outward, unspooling into the rough shape of a scrolling web page (a rectangle with a few horizontal bars suggesting lines of streaming content, not literal readable text) hovering in the air toward a small stylized web browser window shape at the opposite side of the scene. The rhino's expression is focused and attentive, watching the lambda pod like someone monitoring a machine that has just sprung to life on demand — not idle, not panicked, alert and in control.

**Setting**: A dim industrial workshop or control room at night, walls and background machinery fading into near-black shadow, one overhead hanging lamp casting a warm pool of light across the rhino and the console. The background should feel large and quiet — rows of unlit switches and gauges receding into darkness — to reinforce the idea of a mostly-idle system that only activates on demand.

**Color palette**: Warm, restrained "Paper & Ink" palette. Base tones are cream/paper and warm tan for the rhino's skin and the workshop's midtones, with deep ink-navy and near-black for shadow and background recession. Reserve a single warm amber/gold accent color exclusively for the glowing lambda pod and the light-ribbon it emits — that is the one thing in the scene that should visually pop. No neon colors, no saturated blues/greens/reds, no default AI-generator color grading (avoid purple/teal gradients or oversaturated rim lighting).

**Line and rendering style**: Clean, dark, confident ink outlines in a comic-book / graphic-novel line-art style, filled with painterly digital shading — visible brushwork texture, soft grain, and hand-inked cross-hatching in the shadows. Not flat vector art, not cel-shaded anime, not photorealistic or 3D-rendered.

**Composition**: Landscape orientation, 16:9. Position the rhino and the glowing lambda pod slightly left-of-center or center, with the light-ribbon/web-page shape extending toward the right side of the frame. Leave open, darker negative space in the upper-right or right third of the image where a text overlay could sit without competing with the main subject. Single cohesive scene — no panel splits, no collage, no side-by-side comparison layout.

**No-text constraint**: Do not render any legible text, labels, numbers, UI copy, logos, or watermarks anywhere in the image. Suggest the "web page" and "browser" shapes purely through generic outline/shape language (a rectangle with a browser-bar notch, a few blank horizontal content bars) — never attempt actual words, since image generators reliably garble or misspell text. Anything that needs to be exact belongs in the article's prose or a Mermaid diagram, never in this artwork.

**Aspect ratio / output**: 16:9 landscape, roughly 1672x941px to match this site's existing hero image dimensions (confirmed against `b2c-commerce-cloud-26-8-release-hero.jpg`, itself 1672x941px). Single cohesive scene, high detail, no panel splits or collage.

## Front matter snippet (already present in this draft — verify against generated image)

```yaml
heroImage: managed-runtime-explained-architecture-deployment-ssr-hero.png
heroImageAlt: >-
  Cartoon rhino engineer inside a glowing Lambda-shaped server box, streaming
  HTML pages toward a web browser
```

Note: the draft's current `heroImageAlt` describes the rhino as "inside" the Lambda box; the prompt above has the rhino standing beside/touching a glowing lambda-shaped pod (a more paintable staging than literally placing the character inside a box). If the generated image matches the prompt's staging rather than "inside," update `heroImageAlt` to something like:

```yaml
heroImageAlt: >-
  Cartoon rhino engineer watching a glowing Lambda-shaped pod stream a web
  page toward a browser window
```
