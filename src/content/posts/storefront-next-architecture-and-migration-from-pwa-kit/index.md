---
title: 'Storefront Next: Architecture and the PWA Kit Migration'
description: >-
  Storefront Next's real architecture, what actually changes if you migrate
  from PWA Kit, and why most SFRA shops have a safer path in front of them.
date: '2026-07-11T18:29:24.000Z'
lastmod: '2026-07-11T18:59:16.000Z'
url: /storefront-next-architecture-and-migration-from-pwa-kit/
draft: true
heroImage: storefront-next-migration-hero.jpg
heroImageAlt: >-
  Cartoon developer swaps a Chakra UI panel for a Tailwind one on a
  storefront conveyor belt, while a robot hands over routing and
  data-fetching pieces.
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - storefront next
  - pwa kit
  - sfcc
  - composable storefront
  - headless
  - sfra
author: Thomas Theunen
takeaways:
  - "Explains Storefront Next's server-first architecture and how it differs from PWA Kit's client-heavy stack"
  - "Warns that marketing claims of week-long AI-assisted migrations gloss over a real rewrite across state, styling, and tooling"
  - "Frames the SFRA-to-Storefront-Next hybrid path as a shorter, lower-risk route than a full PWA Kit rewrite for most current readers"
---
A CEO went on the record with a number that stopped me mid-scroll: an accelerator that took six developers six months to build on PWA Kit was ported to Storefront Next "in just over a week with six agents." Read that twice. Either something extraordinary happened, or a lot of nuance got left out of one sentence.

Both, and I can say so with a straight face because that accelerator is one my team and I worked on. The number isn't fabricated — six agents did compress a six-month build into about a week. What the quote skips is the finish line: a week got us to roughly 80% done, not the clean handover the sentence implies. I was genuinely astonished at how far the models got on their own. I was less astonished, once the token bill came in, that none of this was free.

This is also the post two of my older ones owe you. [SiteGenesis vs SFRA vs PWA](/sitegenesis-vs-sfra-vs-pwa/) flagged Storefront Next as "new enough that this comparison doesn't cover it." [What Composable Storefront Means for SFCC Developers](/what-does-the-composable-storefront-mean-for-sfcc-developers/) went further: "I haven't built anything on it yet, so I won't hand out a feature-by-feature verdict here." I have now. Here's the verdict.

## What Storefront Next Actually Is

Start with what doesn't change, because it's the part that makes any of this tractable. Storefront Next "keeps the same B2C Commerce backend model as PWA Kit (SCAPI, SLAS, and Managed Runtime)," per [Salesforce's own PWA Kit comparison guide](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/sfnext-pwa-overview.html). Same shopper APIs, same auth service, same hosting platform. If your integrations, price books, and custom SCAPI endpoints work today, they don't need touching.

What changes is everything above that backend. The [architecture guide](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/sfnext-architecture.html) lists the stack plainly: React 19, React Router 7 in framework mode, Vite, TypeScript, Tailwind CSS, shadcn/ui. If you've touched Remix, that "framework mode" phrase should feel familiar — the docs say so directly: "If you're familiar with Remix, React Router 7 framework mode uses the same patterns." Routes get a loader that fetches data before the component renders, the server streams HTML as it becomes available, and the client hydrates on top of it. A request lands at the eCDN, passes through Managed Runtime, runs a middleware chain for auth and i18n, hits the route loader, and streams back. PWA Kit veterans will recognise the shape of that pipeline; what's different is which layer does the work.

The overview guide sums up the shift better than I can: PWA Kit is "a client-heavy, hook-driven architecture," Storefront Next is "server-first." That single sentence explains most of what follows.

## What Actually Happened

Numbers, not vibes: the accelerator landed at roughly 80% ported in about a week, not the finished product the headline implies. Separately, we also took a set of customer-facing demo environments to roughly 75% parity with their current design in a few days. Both ran through an agentic migration workflow with sub-agents my team and I shaped specifically for this kind of migration — not a human developer manually retyping components, and not a single prompt asking an agent to "port this app."

The gap between 100% and where those numbers landed is the part worth dwelling on, because it wasn't evenly spread across the codebase. Routing, data fetching, and auth ported fast — the diffs are mechanical enough that an agent with the right context gets them right on the first or second pass. Styling was the layer that ate the extra time. Point an agent at a page full of Chakra components and ask for the Tailwind/shadcn equivalent without first grounding it in your actual design tokens and component conventions, and you'll burn tokens on output that looks plausible and is subtly wrong: spacing that's almost right, a shadcn variant reached for where a custom class was needed, a component that renders fine in isolation but doesn't compose the way the rest of the app expects. This isn't a one-off complaint about a bad prompt — it's a pattern enough people doing agentic frontend work have run into that the general advice now is to keep an agent focused on logic and data, and give it explicit, upfront grounding before it touches styling at all. Once we built that grounding into our own workflow, styling stopped being the bottleneck. Skip it, and it will be yours too.

## The Layers That Actually Change

Salesforce documents the PWA Kit differences across roughly fifteen reference pages. Most of the effort concentrates in four of them.

**State management.** PWA Kit is "stateless on the server side," per the [state management guide](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/sfnext-pwa-state-management.html), and leans on TanStack Query plus React Context on the client, with tokens sitting in `localStorage`. Storefront Next moves persistence into `httpOnly` cookies and reads them server-side through middleware — the server is still stateless per request, but the cookie carries what used to live in the browser's local storage. The docs are honest that React Context alone doesn't cover every case: for anything beyond simple client state, the guidance is to reach for Zustand rather than pretend Context scales indefinitely.

**Styling.** Chakra's `useMultiStyleConfig` and prop-based variants (`<Button variant="solid" colorScheme="blue">`) give way to Tailwind utility classes composed with `cva()` and `cn()`:

```jsx
// PWA Kit — Chakra
<Button variant="solid" colorScheme="blue" size="md">Primary</Button>
```

```tsx
// Storefront Next — Tailwind + shadcn/ui
<Button variant="default" size="default">Primary</Button>
```

The props look similar enough to lull you into thinking this is a find-and-replace job. It isn't — the variant names, the underlying class composition, and the runtime cost (Chakra ships a CSS-in-JS runtime; Tailwind compiles away to nothing) are all different systems wearing similar-looking APIs.

**Build tooling.** Webpack 5 and Jest are out; Vite 7 and Vitest are in, per the [build tools comparison](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/sfnext-pwa-build-tools.html). TypeScript stops being an optional Babel pass-through and becomes first-class with strict mode on by default. If your CI pipeline, linting, or bundle-analysis tooling assumes Webpack's plugin ecosystem, budget time for that separately from the application code migration — it's not covered by porting components.

**Routing.** File-based routes replace the programmatic array PWA Kit uses:

```javascript
// PWA Kit — React Router 5, programmatic
export const routes = [
  { path: "/product/:productId", component: ProductDetail },
];
```

```text
Storefront Next — React Router 7, file-based
src/routes/
├── product.$productId.tsx    # /product/:productId
```

`useHistory()` and `history.push()` give way to `useNavigate()` and `navigate()`. Small on its own, but it touches every navigation call site in the app, which is exactly the kind of change that's tedious for a human and quick for an agent that can grep the whole codebase in one pass.

## Side by Side

| | PWA Kit | Storefront Next |
|---|---|---|
| Router | React Router 5, programmatic | React Router 7, file-based, framework mode |
| Data fetching | Fetch-on-render (`useProduct()` hooks) | Fetch-then-render (route loaders, Suspense/streaming) |
| State | TanStack Query + React Context, `localStorage` tokens | `httpOnly` cookies + React Context, Zustand for complex state |
| Styling | Chakra UI, CSS-in-JS runtime | Tailwind CSS, shadcn/ui, `cva()`, zero runtime |
| Build tooling | Webpack 5, Babel, Jest | Vite 7, native TypeScript, Vitest |
| Backend | SCAPI, SLAS, Managed Runtime | Same: SCAPI, SLAS, Managed Runtime |

## The Path Most of You Actually Care About

Here's the thing the "migrate from PWA Kit" framing quietly assumes: that you're already on PWA Kit. Most SFCC shops aren't — they're on SFRA, and until recently, PWA Kit wasn't even a required stop on the way to a modern frontend. It still isn't. Salesforce's [current storefront decision guide](https://developer.salesforce.com/docs/commerce/commerce-api/guide/which-product.html) no longer lists PWA Kit as an option at all. The choices are Storefront Next as the "Recommended option," SFRA, a hybrid SFRA-to-Storefront-Next path, or building your own. PWA Kit didn't get demoted — it got dropped from the table entirely.

The hybrid path is worth far more attention from an SFRA shop than a full storefront rewrite, and it's already adjacent to territory this blog has covered. It's built on two pieces you may already half-recognise:

- **Hybrid Auth** keeps an SFRA/SiteGenesis `dwsid` cookie and a SLAS JWT in sync at the same time, using a SLAS client configured with the `sfcc.session_bridge` scope — the same session-bridging idea behind [the OCAPI session bridge](/what-is-the-ocapi-session-bridge/), extended to cover Storefront Next.
- **eCDN route-splitting** sends top-of-funnel traffic — home, category, product detail — to Storefront Next, while checkout stays on your existing SFRA templates until you're ready to move it. If you've already set up [staging](/how-to-set-up-the-ecdn-in-sfcc-staging/) or [production](/lets-go-live-ecdn/) eCDN routing, this is the same mechanism pointed at a new destination rather than a new concept to learn.

> [!NOTE]
> **Version check:** Hybrid Auth support is documented as available as of B2C Commerce 25.6 for Storefront Next, SLAS clients, and SFRA/SiteGenesis templates. A related piece — the `dw.order.mergeBasket` hook for merging baskets on login — landed a release later, in 25.10. Don't assume both shipped together if you're checking version currency before scoping a hybrid project.

Migrating three top-of-funnel page types behind a route-splitting rule is a different project than replacing an entire application, both in risk and in how much you can roll back. That's the version of this decision most of you are actually facing, PWA Kit or not.

## What the Marketing Leaves Out

None of this makes the "just over a week" claim a lie — I was there, and the week is real. It makes it a headline missing its footnote. A week gets you the mechanical layers: routing, data fetching, the parts an agent can transform with a grep and a pattern match. It doesn't tell you that "just over a week" landed at roughly 80% done, that almost all of the missing 20% was styling, or that six developers' worth of institutional knowledge about the accelerator's edge cases doesn't transfer to an agent just because the agent has read the code.

It also doesn't mention the bill. Getting there ran several agents in parallel on frontier-tier models for days at a stretch: Fable and Opus 4.8 on the planning and architecture calls, Opus 4.8 and Sonnet 5 doing the bulk of the actual migration work. Set against six developer-months, that's not a rounding error, but it isn't free either — I've got a separate post working through [what an agent fleet like that actually costs, and how to keep the spend honest](/tokens-arent-free-picking-models-and-keeping-agents-grounded/).

The honest version of the pitch is: agentic migration genuinely compresses the mechanical rewrite, and it does so by roughly the order of magnitude the quote implies. It doesn't compress the parts that were never mechanical to begin with — design fidelity, edge cases nobody wrote down, and the judgement calls a senior developer makes without noticing they're making them. Budget for those, and for the model bill, and the week-long number becomes credible instead of suspicious.

## One Genuine Bright Spot

Not everything here is a caveat. Storefront Next ships an [end-to-end test suite](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/sfnext-e2e-testing.html) built on CodeceptJS and Playwright, with axe-core accessibility scanning against WCAG 2.1 AA baked in across desktop and mobile viewports. CodeceptJS AI adds self-healing locators — tests that repair themselves when a selector breaks instead of failing outright. PWA Kit never shipped anything comparable out of the box. If you're weighing the migration cost against what you get, put this on the credit side of the ledger without qualification.

## So, Should You Migrate

If you're on PWA Kit today and it's doing its job, there's no fire drill here — Storefront Next is new enough, and Hybrid Auth young enough (25.6, a year and a half of production mileage at most), that "wait for the next storefront refresh" is a defensible position. If you're starting greenfield, skip PWA Kit; Salesforce already has, and building on a stack it no longer recommends is a strange way to start a new project.

If you're on SFRA, the calculus is different and, in my experience, more interesting: the hybrid path lets you put a modern frontend in front of shoppers on the pages that matter most for conversion, without touching checkout or betting the whole storefront on day one. That's the project I'd actually recommend starting first.

Whichever path you're on, don't hand an agent your styling system without grounding it first. That one lesson cost my team and me more time than everything else in this migration combined — and it's the cheapest lesson in this whole post to take on faith instead of learning the hard way.

Consider both footnotes closed.
