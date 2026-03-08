# Low-Fidelity Wireframes - Homepage, Archive, Article

Date: 2026-03-08  
Scope: Low-fidelity layout and flow only (no visual design or implementation changes)

## Notes and assumptions

- These wireframes follow the recommended hybrid direction in the modernization brief.
- Layouts emphasize readability, deterministic discovery, and low-friction navigation.
- Desktop includes side rails where appropriate; mobile is single-column with stacked modules.

## Wireframe ID map

- WF-HOME-D: Homepage desktop
- WF-HOME-M: Homepage mobile
- WF-ARCH-D: Archive desktop
- WF-ARCH-M: Archive mobile
- WF-ART-D: Article desktop
- WF-ART-M: Article mobile

## WF-HOME-D - Homepage desktop

```
+------------------------------------------------------------------------------------+
| Header: Logo | Blog | Topics | About | Search | CTA: Start Reading                  |
+------------------------------------------------------------------------------------+
| Hero: Intro copy (2-3 lines)          | Featured image or pattern                  |
| Primary actions: Start Reading | Browse Topics                                     |
+------------------------------------------------------------------------------------+
| Lane A: Featured Long-Form            | Lane B: Recent Posts     | Lane C: Topics   |
| [Featured card + excerpt]             | [Card] [Card] [Card]     | [Topic chips]    |
| [Key metadata row]                    | [Compact metadata row]   | [Topic counts]   |
+------------------------------------------------------------------------------------+
| Project Rail (compact): Active Projects | Status | Updated                            |
+------------------------------------------------------------------------------------+
| Newsletter / Subscribe / Search prompt                                         |
+------------------------------------------------------------------------------------+
| Footer                                                                            |
+------------------------------------------------------------------------------------+
```

## Homepage - Mobile

```
+------------------------------------------+
| Header: Logo + Menu + Search             |
+------------------------------------------+
| Hero: Intro copy                          |
| CTA: Start Reading | Browse Topics        |
+------------------------------------------+
| Featured Long-Form (full-width card)      |
+------------------------------------------+
| Recent Posts (stacked cards, 3-5)         |
+------------------------------------------+
| Topics (chips + counts, scrollable row)   |
+------------------------------------------+
| Project Rail (compact list)               |
+------------------------------------------+
| Newsletter / Subscribe                    |
+------------------------------------------+
| Footer                                   |
+------------------------------------------+
```


## WF-ARCH-D - Archive desktop

```
+------------------------------------------------------------------------------------+
| Header: Logo | Blog | Topics | About | Search                                     |
+------------------------------------------------------------------------------------+
| Archive Header: Title + Short description                                          |
| Search field (scope: blog) + Filter dropdowns + Sort control                        |
+------------------------------------------------------------------------------------+
| Filter Rail (left): Topics, Type, Difficulty, Year                                  |
|------------------------------------------------------------------------------------|
| Card Grid/List (right):                                                             |
| [Card] [Card] [Card]                                                                |
| [Card] [Card] [Card]                                                                |
| Metadata row: Topic | Date | Read time | Difficulty                                |
+------------------------------------------------------------------------------------+
| Pagination: Prev | 1 | 2 | 3 | Next   + Jump to Year (right)                       |
+------------------------------------------------------------------------------------+
| Footer                                                                            |
+------------------------------------------------------------------------------------+
```

## WF-ARCH-M - Archive mobile

```
+------------------------------------------+
| Header: Logo + Menu + Search             |
+------------------------------------------+
| Archive Title + Short description         |
+------------------------------------------+
| Search field (scope: blog)                |
| Filters (chip row) + Sort (dropdown)      |
+------------------------------------------+
| Cards (stacked list)                      |
| [Card]                                    |
| [Card]                                    |
| [Card]                                    |
+------------------------------------------+
| Pagination (Prev / Next) + Jump to Year   |
+------------------------------------------+
| Footer                                    |
+------------------------------------------+
```


## WF-ART-D - Article desktop

```
+------------------------------------------------------------------------------------+
| Header: Logo | Blog | Topics | About | Search                                     |
+------------------------------------------------------------------------------------+
| Article Title                                                                         |
| Metadata row: Date | Read time | Topic | Updated                                    |
| Summary box (2-3 bullets)                                                           |
+------------------------------------------------------------------------------------+
| Body column (left)                       | TOC rail (right, sticky)                |
| - Section heading                         | - Section links                         |
| - Paragraphs                               | - Progress indicator                    |
| - Callout box                              |                                       |
| - Code blocks                              |                                       |
| - Image / diagram                          |                                       |
+------------------------------------------------------------------------------------+
| Related content matrix: Next in topic | Adjacent | Foundation                       |
+------------------------------------------------------------------------------------+
| Back to topic hub | Next article                                                |
+------------------------------------------------------------------------------------+
| Footer                                                                            |
+------------------------------------------------------------------------------------+
```

## WF-ART-M - Article mobile

```
+------------------------------------------+
| Header: Logo + Menu + Search             |
+------------------------------------------+
| Article Title                              |
| Metadata row (stacked)                     |
| Summary box (collapsed, expandable)        |
+------------------------------------------+
| TOC (collapsible)                          |
+------------------------------------------+
| Body (single column)                       |
| - Section heading                           |
| - Paragraphs                                |
| - Callouts / code blocks                    |
+------------------------------------------+
| Related content (stacked cards)            |
+------------------------------------------+
| Back to topic hub | Next article           |
+------------------------------------------+
| Footer                                    |
+------------------------------------------+
```

## Interaction notes (shared)

- Search scope defaults to blog content; topic chips refine results.
- Metadata rows are consistent across homepage cards, archive cards, and articles.
- TOC is sticky on desktop and collapsible on mobile.
- Related content uses three buckets for intentional progression.

## Annotation keys (for implementation handoff)

- NAV-01: Primary navigation and search entry
- HERO-01: Homepage intro and dual CTA area
- DISC-01: Featured long-form lane
- DISC-02: Recent posts lane
- DISC-03: Topic hubs lane
- PROJ-01: Active projects compact rail
- ARCH-01: Archive search and filters bar
- ARCH-02: Archive card list/grid with metadata row
- ART-01: Article header (title + metadata + summary)
- ART-02: Article TOC behavior (sticky desktop, collapsible mobile)
- ART-03: Related content matrix (three progression buckets)

These keys are referenced by the implementation checklist.
