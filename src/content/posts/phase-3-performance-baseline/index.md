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
scaffoldFixture: true
draft: false
author: "Engineering Owner"
takeaways:
  - "Validates asset policy, image handling, and Lighthouse CI"
  - "Provides a deterministic article route for Phase 3 checks"
  - "Baseline checks persist through Phase 4 content migration"
---

## Why this fixture exists

This article exists to give the Phase 3 scaffold one deterministic article route for local performance and asset-policy checks.

## What it validates

- The article template renders stable metadata and body structure.
- The Hugo image partial emits width and height attributes.
- Local performance checks can target a non-homepage route without depending on production content.

> [!NOTE]
> This fixture content is not intended for production. Phase 4 will replace it with migrated articles.

> [!TIP]
> When adding new performance checks, target this route to keep baseline comparisons stable.

> [!WARNING]
> Do not remove this fixture before Phase 4 migration scripts confirm replacement content coverage.

## Next step

Phase 4 will replace this placeholder with migrated content at scale, but the baseline checks added in RHI-026 should remain unchanged.