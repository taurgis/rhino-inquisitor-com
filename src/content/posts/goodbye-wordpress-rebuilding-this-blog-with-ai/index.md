---
title: 'Goodbye WordPress: Rebuilding This Blog With AI and No Database'
description: >-
  Why I moved Rhino Inquisitor off WordPress to a static Hugo site, how AI ran
  the migration, and the safeguards that kept every old URL alive.
date: '2026-07-02T09:00:00.000Z'
lastmod: '2026-07-02T09:00:00.000Z'
url: /goodbye-wordpress-rebuilding-this-blog-with-ai/
draft: false
heroImage: goodbye-wordpress-static-rebuild.jpg
categories:
  - AI
  - Corporate
tags:
  - ai
  - hugo
  - static site
author: Thomas Theunen
takeaways:
  - "Explains why a blog with no dynamic content does not need a database, a server, or a stack of paid plugins"
  - "Walks through a real WordPress-to-Hugo migration run as 200 tickets across nine phases, with AI doing most of the typing"
  - "Details the safeguards - URL parity on 1,224 routes, redirect and canonical gates, a five-legged CI quality matrix - that made the cutover boring on purpose"
---

If you are reading this, you are looking at a blog that no longer has a database behind it. No MySQL. No admin login sitting on a public URL waiting to be brute-forced. No plugin update nagging me on a Sunday morning. The page you are on was built ahead of time, as a plain HTML file, and handed to you by a server that does nothing but pass files along.

For years, Rhino Inquisitor ran on WordPress. WordPress is not a bad tool. It is a very good tool for a very specific problem: content that changes constantly, edited by people who should never touch a terminal, with comments and forms and user accounts. That is not this site. My content does not change while you read it. There are no contact forms, no logins, no shopping cart. It is articles and images. So I was paying - in money, in attention, and in risk - for a machine built to solve problems I do not have.

This is the story of tearing that machine down and replacing it with something quieter. I will also be honest about the part that surprises people: I did not type most of it. AI did, under my direction, and I want to show you exactly where the line between the two of us sat.

## The bill I stopped wanting to pay

A WordPress site is never just WordPress. Over time it becomes WordPress plus a caching plugin, plus a security plugin, plus an SEO plugin, plus whatever premium add-on you bought once and now cannot remove. Each one wants an update. Each update is a small bet that nothing will break.

Underneath all of that sits the real cost: a database and a server that has to be alive every time someone visits. That server has to be patched. It has to be backed up. It has to be watched, because a public login page and a database are exactly what an attacker goes looking for. None of that work sells anything or teaches anyone anything. It is rent.

Here is the reframe that started the whole project. My content is static. It sits still. So why serve it from a system designed to assemble every page, from scratch, on every single request?

> [!NOTE]
> A static site generator flips the timing. Instead of building each page when a visitor asks for it, it builds every page once, up front, into flat HTML. What ships is a folder of files. There is nothing to execute, nothing to query, and almost nothing to attack.

I picked [Hugo](https://gohugo.io/) for the generator and GitHub Pages for hosting. The practical consequences are almost rude in how good they are:

- **Hosting cost dropped to zero.** GitHub Pages serves the built site for free. There is no server invoice anymore.
- **The attack surface mostly vanished.** No database means no database to breach. No PHP running on request means no runtime to exploit. The "admin panel" is now my own laptop and a git commit.
- **There is nothing to monitor at 2 AM.** No uptime for a dynamic app, no plugin CVEs, no patch treadmill. The files are just there.

There is a flip side to the security story that I want to name rather than hide. The whole site now lives in a public GitHub repository. That sounds alarming until you remember what is actually in it: no database, no credentials, no user data, nothing an attacker could turn against a visitor. The content is meant to be read by the world anyway. The one real consequence is that my drafts are visible before I publish them - if you go looking, you can read a half-finished post. That genuinely does not bother me. But it is the kind of thing you should choose on purpose, not trip over after the fact.

The trade is real, and I will not pretend otherwise: I gave up the comfortable WordPress editor and took on more custom work. Writing is now Markdown in my editor. Publishing is a git push. Layout and features are templates I own. For a developer, that is a good trade. For someone who never wants to see a config file, it would be a terrible one. Know which one you are before you copy me.

There is one more upside to plain Markdown that I did not fully appreciate until I was living in it. The old WordPress content was HTML - nested divs, wrapper classes, editor cruft. Markdown is just text with a little punctuation. That is easy for me to write, and it turns out to be even easier for a machine to read. Given how much of my workflow now runs through AI, that matters more than it used to: an agent parses a clean Markdown file far more reliably than it untangles rendered HTML. The thing I write and the thing the machine reads are now the same file.

## The honest part: who actually did the work

Now the question I get asked most. How much of this did AI do?

A lot. More than a lot. And I would rather tell you plainly than let you assume I hand-crafted every line.

I ran the migration like a real project, not a weekend hack. There was a full ticketing system - 200 tickets in the end - grouped into nine phases, from URL inventory all the way to the go-live cutover. There were role-based AI agents: a business analyst to write requirements, a project manager to sequence tickets, a developer to implement, a QA engineer to try to break it, a docs researcher to check claims against official Salesforce and Hugo documentation. I directed. They typed.

{{< img-caption src="migration-ticket-board.jpg" alt="A migration project board showing nine phases and a long column of numbered tickets being worked through." caption="Nine phases, two hundred tickets. The migration ran like a proper project - because a blog with four years of URLs behind it is not something you eyeball." >}}

That framing matters, so let me be exact about the division of labour. I made the decisions: static over dynamic, Hugo over the alternatives, which URLs live and which retire, what "done" meant. AI did the volume: parsing the old WordPress export, converting every post to Markdown, downloading and re-linking every image, drafting tickets, writing the redirect maps, building the quality gates that check its own output. The commit history is not shy about it either. Plenty of commits are co-authored with the model, in the open, on purpose.

This is the same stance I took years ago in [AI as Architect and Content Creator](/ai-as-an-architect-and-content-creator/): the expertise and the judgement are mine, the speed is the machine's. What changed since then is how much of the grunt work I am now willing to hand over. Migrating four years of posts by hand would have taken weeks and I would have made careless mistakes around post two hundred. The machine does not get bored on post two hundred. It does, however, get confidently wrong - which is exactly why the next section exists.

## The safeguards, or: how not to torch your search rankings

Here is the part that separates a migration from a disaster. When you move a site that has been indexed by Google for years, the fastest way to destroy it is to change or drop URLs. Every old link, every search result, every bookmark points at an address. Break those addresses and the traffic evaporates.

So the single hardest rule of the whole project was this: **every URL that mattered had to keep working.** An entire phase existed just for that. I inventoried the old routes, classified each one as *keep*, *merge*, or *retire*, and wrote a redirect map so that anything I moved still lands somewhere sensible in one hop - no chains, no dead ends.

Then I made the machine prove it, over and over, automatically. The site cannot deploy unless it passes a matrix of quality gates running in parallel:

1. **URL parity** - checks that all 1,224 tracked routes still resolve correctly. On the last run before launch: 1,224 out of 1,224, zero blocking failures.
2. **SEO** - canonical tags, sitemaps, metadata, and structured data all have to line up.
3. **Security** - HTTPS, redirects, and headers on the live host.
4. **Accessibility** - real browser checks, not guesses.
5. **Performance** - Lighthouse budgets under throttled mobile conditions.

> [!WARNING]
> A gate is only useful if it can actually block you. These are wired as required checks: if any leg fails, the deploy does not happen. It is deliberately harder to ship a regression than to ship correctly.

{{< img-caption src="deploy-quality-gate.jpg" alt="Five parallel deploy gates in a row, with one page held back at a red light while the others pass through." caption="Five gates, all required. A single red light anywhere and nothing ships - which is exactly the point." >}}

That performance gate earned its keep. After a visual redesign - a warm, paper-and-ink look I built to replace the old theme - the site started failing its layout-stability score. Pages were visibly jumping as they loaded. The culprit was subtle: I inline a small "critical" stylesheet for fast first paint and load the full stylesheet afterwards, and after the redesign those two had quietly drifted apart. Seventy-three design tokens no longer matched. When the full stylesheet finally applied, it re-laid-out the top of the page - a search bar snapping from 399 pixels tall down to 44 - and that jump is exactly what the gate measures.

The fix was to stop hand-maintaining the critical CSS and generate it directly from the real, rendered pages, so it can never silently drift from the full stylesheet again. Layout shift went from an ugly ~0.5 back down to essentially zero. I would not have caught that by eye across every page type. The gate did.

## Tearing down the scaffolding

There is one more step people forget. The 200 tickets, the phase plans, the migration scripts that parsed WordPress exports, the role-based agents - all of that was scaffolding. It got the site up. It has no business living in the repository of a site that is now, simply, live.

So once the cutover held, I deleted it. The migration tooling, the ticket archive, the WordPress-specific import code, the analysis folder - gone. I tagged the pre-cleanup state first, so the history is preserved if I ever want to look back, then stripped the repo down to what a running blog actually needs. What stayed is only the machinery that protects the live site: the URL data, the redirect maps, and the quality gates. A house does not keep the scaffolding after the walls are up.

That is also why this post reads as a story rather than a manual. By the time you read it, the thing it describes has already been removed. What is left is the point of the whole exercise: a blog that is cheaper, safer, and calmer to run.

## Was it worth it?

Yes, and it is not close.

I traded a monthly hosting bill for nothing. I traded a database and a public admin panel - a genuine, ongoing security liability - for a folder of static files with almost no attack surface. I traded a patch-and-plugin treadmill for a system I forget is even running until I want to publish, at which point I write Markdown and push. The custom work is real and I own it now, but I would rather own a simple thing than rent a complicated one.

And the AI question, one more time, because it is the honest core of this: the machine did most of the labour, I made every decision that mattered, and the guardrails I built to check its work are still watching the site right now, on every deploy. That is the arrangement I trust. Not "AI did it," and not "I did it all by hand." I decided, it built, and neither of us gets to ship anything the gates do not approve.

Welcome to the new place. It is quieter here.
