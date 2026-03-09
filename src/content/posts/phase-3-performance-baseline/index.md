---
title: "Phase 3 Performance Baseline"
description: "Representative scaffold article used to validate asset policy, image handling, and Lighthouse CI in Phase 3."
date: 2026-03-09T10:00:00Z
lastmod: 2026-03-09T10:00:00Z
categories:
  - platform
tags:
  - phase-3
  - performance
heroImage: "hero.png"
url: "/phase-3-performance-baseline/"
draft: false
author: "Engineering Owner"
---

## Why this fixture exists

This article exists to give the Phase 3 scaffold one deterministic article route for local performance and asset-policy checks.

## What it validates

- The article template renders stable metadata and body structure.
- The Hugo image partial emits width and height attributes.
- Local performance checks can target a non-homepage route without depending on production content.

## Next step

Phase 4 will replace this placeholder with migrated content at scale, but the baseline checks added in RHI-026 should remain unchanged.