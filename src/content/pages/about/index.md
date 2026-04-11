---
title: About
description: >-
  Rhino Inquisitor is Thomas Theunen's working notebook for Salesforce B2C
  Commerce Cloud architecture, delivery lessons, and practical field guidance.
date: '2022-02-25T21:45:53.000Z'
lastmod: '2026-03-24T07:27:00.000Z'
url: /about/
draft: false
archiveExclude: true
author: Thomas Theunen
---
Rhino Inquisitor is the place where I document the technical side of Salesforce B2C Commerce Cloud work that usually gets compressed into architecture meetings, incident calls, migration plans, and release-readiness checklists.

My name is Thomas Theunen. I am the Head of Commerce at [Forward](https://www.forward.eu), and I have spent more than a decade working across commerce implementation, platform strategy, architecture, and delivery. The common thread in that work has been translating business pressure into technical decisions that can survive production: decisions about storefront architecture, integration boundaries, rollout safety, performance budgets, SEO risk, and operational maintainability.

I still enjoy the hands-on side of the work, especially when a problem moves from vague concern to something you can break apart, model properly, and make safer. I write this site for people who need more than general platform messaging. If you are trying to understand how SFCC behaves under real delivery conditions, this is the material I want to provide.

## What I Actually Work On

Most of my day-to-day work is not about abstract transformation language. It is about making technical decisions in environments where the trade-offs matter, the timelines are real, and the cost of being wrong is high.

That usually includes:

- storefront direction across SFRA, headless, and composable approaches
- API and integration design with SCAPI, OCAPI, hooks, middleware, and third-party platforms
- performance-sensitive architecture decisions such as caching strategy, synchronous versus asynchronous flows, and backend dependency isolation
- launch and migration planning, including redirect safety, canonical consistency, customer migration, and production rollback readiness
- engineering quality concerns such as observability, security, accessibility, and release impact assessment

The work itself changes from client to client, but the responsibility stays the same: make the solution understandable, operable, and safe enough that a team can live with it after launch.

![Thomas Theunen standing beside a wooden counter and plants in a Trailblazer hoodie.](thomas-theunen-about-portrait-cropped.jpg)

## How I Think About Commerce Engineering

I do not separate architecture from delivery. A design is only good if a team can implement it without creating hidden fragility, operate it under load, and extend it without rewriting the whole system six months later.

That means I care a lot about the questions that often get deferred until too late:

- Where does this customization increase upgrade risk?
- What happens when a dependency slows down or fails?
- Is this flow observable when something breaks in production?
- Are we optimizing for a demo, or for sustained operation?
- Is the team buying a capability, or buying a maintenance burden?

In commerce, those questions show up everywhere. Real-time inventory checks can damage storefront latency. Search and SEO mistakes can turn a migration into a visibility problem. A release note that looks minor can carry real operational consequences. A launch plan without rollback discipline is not a serious launch plan.

That is the level at which I prefer to write and think, and it is usually the level at which I am most useful on a project as well.

## Why Rhino Inquisitor Exists

Rhino Inquisitor exists because too much commerce content stops at the overview level. It explains what a feature is, but not when it becomes dangerous, what constraints matter, or which implementation choices create long-term drag.

I use this site to publish the kind of material I would want a senior developer, architect, or delivery lead to have before making a decision. That includes topics such as:

- SFCC architecture and storefront direction
- SCAPI, OCAPI, and integration patterns
- performance, caching, and quota-sensitive design
- release analysis and change impact
- migration strategy, redirect risk, and SEO continuity
- secure implementation and production-readiness practices

Alongside the writing, I also spend time on public tooling and open source work around the Salesforce B2C Commerce ecosystem. That is part of the same goal: make the platform easier to reason about and easier to work with in practice.

## Who This Site Is For

This site is primarily for:

- Salesforce B2C Commerce developers who want concrete implementation guidance
- architects and technical leads making platform and integration decisions
- delivery leads who need to understand migration, release, and launch risk in technical terms
- teams moving from broad platform familiarity toward disciplined production execution

It is probably not the right place if you are looking for generic ecommerce thought leadership, vendor summaries, or high-level transformation language without implementation detail.

## Engineering Principles I Keep Returning To

Some principles come up repeatedly in both my project work and the material I publish here.

- Prefer maintainable architecture over clever customization.
- Treat performance, SEO, accessibility, and security as system requirements, not afterthoughts.
- Make failure modes visible early through observability, testing, and explicit rollout planning.
- Keep release-readiness and rollback planning inside the engineering process rather than outside it.
- Document trade-offs clearly enough that another team can understand why a decision was made.

If a solution cannot be explained clearly, monitored in production, and changed without drama, it is not finished.

## Contact

Rhino Inquisitor does not run a public contact form. If you want to reach me about a page, a technical topic, public tooling, or related work, use one of these public channels:

- [LinkedIn](https://www.linkedin.com/in/thomas-theunen-10905680/) for direct professional contact about the site, speaking, or project work
- [GitHub](https://github.com/taurgis/) for public tooling, experiments, and Salesforce Commerce Cloud developer work
- [Trailblazer profile](https://www.salesforce.com/trailblazer/thomas-theunen) for Salesforce community contact and profile details

If you are looking for published material first, the [blog](/posts/) and [topics](/category/) remain the quickest way to find the relevant article or resource.

## Start Here

If you want to explore the technical side of the site, start with the [blog](/posts/) or browse [topics](/category/) to jump into a specific area. If you want the quick summary version: I work on Salesforce B2C Commerce problems where architecture quality, delivery discipline, and production safety all matter at the same time, and Rhino Inquisitor is where I write those lessons down.
