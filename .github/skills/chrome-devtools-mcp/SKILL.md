---
name: chrome-devtools-mcp
description: 'Guidance for using Chrome DevTools MCP to inspect live Chrome pages, debug browser behavior, run performance traces, and capture screenshots. Use when a task needs browser automation, DOM and CSS inspection, console or network debugging, or page-performance analysis.'
argument-hint: 'Provide a URL, route, or browser-debugging goal.'
user-invocable: true
license: Forward Proprietary
compatibility: 'VS Code or GitHub Copilot agent workflows with Chrome DevTools MCP, Node.js 20.19+, npm, and Google Chrome or Chrome for Testing'
---

# Chrome DevTools MCP

Use this skill when an agent needs browser visibility instead of static code inspection alone. It keeps the default workflow safe and narrow, then points to the upstream reference for fast-changing flags and tool details.

## When to Use This Skill

- Verifying browser-visible changes on local preview, staging, or production-safe test pages
- Debugging console errors, failed network requests, DOM issues, or CSS/layout regressions
- Capturing screenshots or page snapshots as evidence for UI bugs or content issues
- Running performance traces or Lighthouse-style audits against a live page
- Reproducing a user flow that needs real browser state instead of a synthetic HTML read
- **Not for:** cross-browser compatibility testing, personal-profile browsing, or long-lived remote-debugging sessions on sensitive pages

## Quick Start

1. Confirm the host has Node.js `20.19+`, npm, and Google Chrome or Chrome for Testing.
2. Add Chrome DevTools MCP to your MCP client config with `npx -y chrome-devtools-mcp@latest`.
3. Prefer a clean launched browser first; use `--isolated` when you want a temporary profile that is removed after the session.
4. Move to attach mode only when you need an existing signed-in session, preserved app state, or a browser the agent cannot launch itself.
5. Keep the task narrow: identify the page, the expected outcome, and the artifact you need back.

See [Setup and Workflows](references/SETUP-AND-WORKFLOWS.md) for config examples, connection options, and safety notes.
See [Rhino Inquisitor Troubleshooting](references/RHINO-INQUISITOR-TROUBLESHOOTING.md) for workspace-specific host selection, redirect-chain, and validation pitfalls.

## Safe Defaults

- Start with a launched Chrome instance rather than attaching to an everyday browsing profile.
- Prefer `--isolated` for debugging sessions that should not persist cookies, cache, or login state.
- Add `--headless` for non-visual automation or CI-style verification.
- Use `--slim` only for simple navigation, script evaluation, and screenshot tasks.
- Treat remote debugging as sensitive access. Do not keep the port open while browsing personal or production-sensitive pages.

## Choose A Connection Mode

| Mode | Use when | Notes |
|------|----------|-------|
| Managed browser | You want a clean repro or a predictable automation session | Chrome launches only when a browser tool is first used. |
| Managed browser with `--isolated` | You want a disposable browser profile | Best default for bug repros and content validation. |
| `--autoConnect` | You already have a local Chrome session and want the agent to attach automatically | Requires Chrome `144+` and remote debugging enabled. |
| `--browser-url` or `--wsEndpoint` | You must attach to a specific debuggable browser endpoint | Use when session state matters or launch is blocked by the environment. |

## Recommended Workflow

1. State the target page and the exact question to answer.
2. Pick the safest connection mode that can still reproduce the issue.
3. Inspect before changing: capture the DOM, console, network, or screenshot evidence first.
4. Use the narrowest tool category that answers the question.
5. Return the finding with the page URL, the observed state, and the artifact or evidence collected.

## Core Workflows

### Validate A Visible Change

Use when you need to confirm a rendered page matches the intended UI state.

Example prompt:

```text
Use Chrome DevTools MCP to open <page-url>, wait for the primary content to load, and verify that the updated hero heading and CTA are visible. Return a screenshot plus any obvious console errors.
```

### Debug Console Or Network Failures

Use when the page loads incorrectly, data is missing, or a user flow breaks.

Example prompt:

```text
Use Chrome DevTools MCP to reproduce the broken flow on <page-url>, inspect console messages and failed network requests, and summarize the first actionable root cause.
```

### Inspect Layout Or DOM State

Use when a style rule, responsive breakpoint, or DOM mutation behaves differently than expected.

Example prompt:

```text
Use Chrome DevTools MCP to inspect the live DOM on <page-url>, identify why the sidebar overlaps the content at desktop width, and capture the relevant element state or computed-style evidence.
```

### Run A Performance Pass

Use when you need a trace-backed performance finding instead of a visual-only check.

Example prompt:

```text
Use Chrome DevTools MCP to open <page-url>, record a performance trace, and report the main bottleneck affecting load or interaction responsiveness.
```

## Rhino Inquisitor Prompt Patterns

Use these when the task is specifically about this workspace's Hugo preview or hosted rehearsal surfaces.

### Local Hugo preview smoke check

Use when you are validating current workspace changes through the development server started with `npm run dev`.

```text
Use Chrome DevTools MCP to open http://localhost:1313/real-time-inventory-checks-in-sfcc/, confirm the article header, body content, and any inline media render correctly, then return a screenshot plus the first console or network failure if one appears.
```

### Local archive or taxonomy regression check

Use when you need to inspect list rendering, archive search state, or category layout after a template or CSS change.

```text
Use Chrome DevTools MCP to open http://localhost:1313/category/ai/, inspect the rendered category header and article-card list, and explain any visible layout drift or missing content with DOM or computed-style evidence.
```

### Staging-host rehearsal check

Use when you need to verify the hosted rehearsal surface rather than the local preview. On staging, `noindex,nofollow` is expected and should not be reported as a defect by itself.

```text
Use Chrome DevTools MCP to open https://staging.rhino-inquisitor.com/archive/, verify the page title, canonical URL, and robots directives, and report whether the route behaves like the expected preview environment rather than production.
```

### Preview-entrypoint redirect evidence

Use when validating a GitHub Pages preview entrypoint that may redirect into staging. Preserve the full redirect chain in the result instead of collapsing it to the final host.

```text
Use Chrome DevTools MCP to open <preview-pages-url>, capture the full redirect chain through the final landing page, and report whether the preview entrypoint resolves into the expected rehearsal host.
```

## Safety And Limitations

- Chrome DevTools MCP can inspect and modify the connected browser session. Do not expose pages or credentials you do not want available to MCP clients.
- Official support is for Google Chrome and Chrome for Testing. Other Chromium browsers may work but are not guaranteed.
- Performance features can query the CrUX API unless disabled with `--no-performance-crux`.
- Usage statistics are enabled by default upstream and can be disabled with `--no-usage-statistics` if needed.
- If you attach through a remote debugging port, use a non-default user-data directory and avoid sensitive browsing while that port is open.
- **Screenshot size limit:** The AI model rejects base64-encoded images where any dimension exceeds **8 000 pixels**. Full-page screenshots of long pages will fail with `At least one of the image dimensions exceed max allowed size: 8000 pixels`. Mitigate by capturing a viewport-sized screenshot instead of a full-page capture, or resize the viewport before the screenshot so neither dimension exceeds the limit.

## Verification Checklist

- [ ] Page URL or route is explicit
- [ ] Connection mode is chosen intentionally
- [ ] Profile safety is appropriate for the task (`--isolated` unless session state is required)
- [ ] Evidence is captured before making conclusions
- [ ] Any advanced flags or troubleshooting steps are checked against upstream docs

## References

- [Setup and Workflows](references/SETUP-AND-WORKFLOWS.md)
- [Rhino Inquisitor Troubleshooting](references/RHINO-INQUISITOR-TROUBLESHOOTING.md)
- [Chrome DevTools MCP README](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [Chrome DevTools MCP tool reference](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/tool-reference.md)
- [Chrome DevTools MCP troubleshooting](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/troubleshooting.md)
- [Chrome DevTools MCP launch article](https://developer.chrome.com/blog/chrome-devtools-mcp)
- [Chrome remote debugging security update](https://developer.chrome.com/blog/remote-debugging-port)
- [GitHub Copilot agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [GitHub skill creation guide](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/create-skills)
- [VS Code Agent Skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
