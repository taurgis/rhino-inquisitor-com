# Rhino Inquisitor Blog Modernization Designs (Readability + Discovery)

Date: 2026-03-08  
Scope: Analysis and design direction only (no implementation changes)

## Executive Summary

The current site already has strong content quality and clear topical focus, but discovery is mostly linear and readability is heavily dependent on long-scroll behavior. The modernization direction should preserve the current voice and category structure while introducing a cleaner reading system, stronger browsing pathways, and lower-friction search and related-content patterns.

This document proposes three design directions and one recommended hybrid. All options are based on observed current patterns from the live homepage, archive, category/video listing, and long-form article pages.

## Current-State Baseline (Observed)

### What works now

- Clear editorial domain focus (SFCC and adjacent topics).
- Regular publishing cadence and deep long-form content.
- Existing discovery building blocks already present:
  - Archive page with many entries and pagination.
  - Category pages (for example, video).
  - Search entry points.
  - Related-content block on article pages ("More From My Blog").
- Strong visual identity through distinctive hero and article images.

### Readability gaps

- Long-form article pages are dense and visually continuous, which increases cognitive fatigue.
- Scannability can be improved with stronger chapter navigation, key-point callouts, and clearer rhythm between sections.
- Archive cards are readable but metadata hierarchy is not as prominent as title/excerpt, making quick comparison harder.

### Discovery gaps

- Discovery relies heavily on chronological lists and footer links.
- Category and archive experiences do not appear to expose richer filtering (topic, format, depth, freshness).
- Related-content modules exist, but can be made more contextual to the current article intent.
- High-value discovery actions (search, jump to series/topic, continue reading path) can be surfaced earlier in page flow.

## Design Goals

### Primary goals

1. Improve reading comfort for long technical articles.
2. Improve content discovery speed without adding interface clutter.
3. Preserve existing brand personality while making visual language feel more modern and intentional.

### Success targets

- Reading mode metrics:
  - Body size: 18-20px desktop, 17-18px mobile.
  - Line height: 1.65-1.8.
  - Measure (line length): 65-75 characters on desktop.
- Discovery metrics:
  - Any article reachable from homepage in <= 2 clicks.
  - Related-content block present on 100% of articles, minimum 3 relevant links.
  - Category/topic landing with at least 2 sorting modes and 1 filtering control.
- Behavioral outcome targets (post-launch validation):
  - Increased pages/session on blog journeys.
  - Increased article completion depth.
  - Lower bounce on archive/category entry points.

## Design Direction A: Editorial Clarity

### Positioning

A modern technical journal feel. Clean hierarchy, calm spacing, minimal noise, highly readable long-form.

### Visual language

- Typography pairing:
  - Headings: a modern editorial serif.
  - Body and UI: a neutral, high-legibility sans.
- Color strategy:
  - Bright, neutral canvas with high-contrast text.
  - One brand accent for links, tags, and active states.
- Motion:
  - Very restrained, mostly content-first reveals and subtle section transitions.

### Readability features

- Sticky reading progress bar on article pages.
- In-article chapter navigator (table of contents) visible on desktop rail and collapsible on mobile.
- Optional "Focus Mode" toggle:
  - Increases line spacing slightly.
  - Dims non-essential chrome.
- Key-point summary box after the intro section.

### Discovery features

- Contextual "Continue Learning" module with three buckets:
  - Same topic.
  - Adjacent topic.
  - Foundational explainer.
- Enhanced archive cards with stronger metadata strip:
  - Category.
  - Publish date.
  - Reading time.
  - Difficulty indicator.

## Design Direction B: Topic Atlas

### Positioning

Discovery-first knowledge map for technical readers who browse by domain and subtopic.

### Visual language

- Slightly bolder and more modular than Direction A.
- Topic chips and section dividers are first-class visual elements.

### Readability features

- Strong section chunking in articles with reusable pattern blocks:
  - Problem.
  - Why it matters.
  - Implementation path.
  - Risks.
- Inline "jump to architecture/code/performance" anchors.

### Discovery features

- Topic hub landing (replaces purely chronological archive as primary browse view):
  - Featured clusters (for example: Architecture, Performance, Security, Integrations).
  - Cluster health signal (new this week, evergreen, updated recently).
- Faceted archive controls:
  - Topic.
  - Content type (article, video, external).
  - Date range.
  - Difficulty.
- "Paths" pattern:
  - Curated 3-5 article reading sequences for common intents.
  - Example: "New SFCC developer path", "Performance hardening path".

## Design Direction C: Conversational Technical Magazine

### Positioning

A more expressive editorial front with stronger storytelling presentation and high discoverability prompts.

### Visual language

- Larger hero treatment and bolder lead typography.
- Alternating section backgrounds to prevent reading fatigue on long pages.
- More visible art direction in listing modules.

### Readability features

- Structured "listen/read/save" utility row near title block.
- Article checkpoints every few sections with quick recap bullets.
- Side notes/callouts for important caveats and architecture trade-offs.

### Discovery features

- Smart recommendation stack under article:
  - "Read next in this thread".
  - "If you are solving X, start here".
  - "Popular this month".
- Homepage split into three scannable lanes:
  - Latest.
  - Most useful (engagement-weighted).
  - Reference guides.

## Recommended Hybrid Direction

Use Direction A as the baseline UX system and blend selected discovery modules from Direction B.

### Why this hybrid is recommended

- Direction A gives immediate readability gains with lower design/system risk.
- Direction B contributes stronger discovery structure without requiring a full visual identity reset.
- This combination is easiest to phase in while preserving current brand trust and information architecture.

### Hybrid definition

- Visual and typography system: Direction A.
- Discovery architecture: Direction B light version.
- Magazine-style expressiveness from Direction C: only for homepage hero and featured lanes.

## Page-Level Blueprint

### Homepage

- Keep personal/brand intro, but shorten above-the-fold text and prioritize two actions:
  - Start reading.
  - Browse by topic.
- Add a three-lane content deck below hero:
  - Featured long-form article.
  - Recent posts.
  - Topic hubs.
- Move "Active Projects" into a compact project rail to reduce competition with article discovery.

### Archive / Blog Index

- Introduce split header:
  - Search field with explicit placeholder scope.
  - Filter/sort controls.
- Card redesign:
  - Stronger title hierarchy.
  - Metadata row above excerpt.
  - Consistent image aspect ratio.
- Preserve pagination but add "jump to year" shortcut for deep history.

### Category / Video Listing

- Keep category title, add short category descriptor.
- Add format-aware badges and card treatments (video/podcast/article).
- Add related categories strip for lateral movement.

### Article Page

- New top block:
  - Title.
  - Metadata row (date, reading time, topic, update status).
  - Optional key takeaway summary.
- Body system:
  - Better spacing rhythm between sections.
  - Callout styles for warnings and practical tips.
  - Sticky table of contents on desktop.
- Bottom system:
  - Contextual related-content matrix.
  - "Next in topic" and "Back to topic hub" actions.

## Content Metadata Model (Discovery Support)

To support modern discovery patterns, each post should expose or derive:

- Primary topic.
- Secondary topics/tags.
- Content type.
- Reading time.
- Difficulty level.
- Last updated timestamp.
- Optional series/path membership.

This metadata can stay mostly invisible in body copy while powering better filters, recommendations, and ordering.

## Phased Rollout Plan

### Phase 1: Readability foundation

- Typography and spacing system update.
- Article layout updates (TOC, metadata row, summary block).
- Archive card hierarchy improvements.

### Phase 2: Discovery uplift

- Topic hub and lightweight faceted controls.
- Improved related-content logic.
- Homepage three-lane discovery deck.

### Phase 3: Optimization and tuning

- Validate behavior metrics.
- Tune recommendation heuristics.
- Refine mobile condensed modes for list density.

## Verification Checklist

- Readability checks:
  - Validate type scale, line height, and measure targets.
  - Run mobile readability review on article and archive pages.
- Discovery checks:
  - Validate search, filter, and sort paths.
  - Validate <= 2 click path from homepage to any featured content cluster.
  - Validate related-content relevance on at least 20 sampled articles.
- Accessibility checks:
  - Color contrast and focus visibility.
  - Keyboard traversal for search and filter controls.
  - Heading hierarchy and landmark integrity.

## Open Questions

- Should popularity ranking be based on analytics events, manual curation, or both?
- Do we want a strict separation between evergreen references and timely commentary?
- Should external articles be first-class in archive filters or treated as outbound references only?
- Is "listen" (audio summaries) a near-term requirement or deferred?

## Decision Request

Approve the Hybrid Direction (A + B light), then move to wireframe-level specification for:

1. Homepage.
2. Archive/topic index.
3. Article template.

This gives a practical design baseline that improves readability immediately and materially increases discovery quality without requiring a disruptive brand reset.