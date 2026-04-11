# Chrome DevTools MCP Skill - 2026-04-11

## Change summary

Added a new Agent Skill, `.github/skills/chrome-devtools-mcp/`, that explains how to set up and use Chrome DevTools MCP for browser inspection, debugging, screenshot capture, and performance analysis in agent-driven workflows.

Updated the skill the same day with Rhino Inquisitor-specific prompt patterns for local Hugo preview and staging routes, plus a second reference file for workspace-specific troubleshooting.

## Why this changed

Contributors previously had to reconstruct Chrome DevTools MCP usage from upstream documentation and ad hoc prompts. The repository now has a reusable skill that captures the safe default workflow, the main connection modes, and high-value prompt patterns without duplicating the upstream tool reference.

The initial version remained intentionally generic. Follow-up work was needed so contributors could apply the skill directly to this repository's browser-validation surfaces without re-deriving which host to open, how preview URLs resolve, or which non-production behaviors are expected.

## Behavior details

Old behavior:

- No repository skill existed for Chrome DevTools MCP.
- Contributors had no repo-local guidance on when to launch a clean browser, when to attach to an existing session, or how to keep remote debugging usage safe.
- Browser-debugging prompts and setup details were inconsistent across sessions.

Intermediate behavior after the initial skill landed:

- The skill covered generic Chrome DevTools MCP setup and workflows only.
- Contributors still had to infer Rhino Inquisitor-specific hosts, prompt patterns, and preview/staging troubleshooting from separate validation artifacts.

New behavior:

- A dedicated `chrome-devtools-mcp` skill provides one workflow for browser automation, DOM and CSS inspection, console and network debugging, screenshots, and performance tracing.
- The skill promotes safe defaults such as isolated profiles and narrow task scoping before advanced attach modes.
- A companion reference file provides configuration examples for launched, headless, slim, and attach-based sessions.
- The main skill now includes Rhino Inquisitor-specific prompt patterns for `http://localhost:1313/`, stable archive and category routes, hosted staging checks, and preview-entrypoint redirect evidence.
- A second reference file now explains workspace-specific troubleshooting for host selection, expected staging `noindex`, preview-entrypoint redirects, production-build structured-data checks, and stale-artifact pitfalls.
- Contributors can discover the skill from both `AGENTS.md` and `analysis/documentation/README.md`.

## Impact

- Affected contributors: AI-agent operators, maintainers, and developers who use browser tooling during debugging or validation.
- Affected workflow: browser-debugging tasks now have a consistent repo-local entry point instead of relying only on upstream documentation, and they now have repository-specific guidance for choosing between local preview, preview-entrypoint, and staging surfaces.
- Scope: guidance, discoverability, and governance only; no runtime, build, or deployment behavior changed.

## Verification

1. Confirm the skill folder and files exist:

   - `.github/skills/chrome-devtools-mcp/SKILL.md`
   - `.github/skills/chrome-devtools-mcp/references/SETUP-AND-WORKFLOWS.md`

1. Confirm the skill guidance includes:

   - Prerequisites and MCP client setup
   - Managed and attach-based connection modes
   - Safe-default guidance for isolated profiles and remote debugging
   - Example workflows for UI verification, console or network debugging, layout inspection, and performance tracing

1. Confirm the Rhino Inquisitor extension includes:

   - Prompt examples for localhost preview, stable list or article routes, and staging-host rehearsal checks
   - A troubleshooting reference that covers preview-entrypoint redirects, expected preview `noindex`, local production fallback for structured-data evidence, and environment-matched command usage

1. Confirm the skill links to primary upstream sources instead of copying the full tool catalog.

1. Confirm discoverability updates exist in:

   - `AGENTS.md`
   - `analysis/documentation/README.md`

## Related files

- `.github/skills/chrome-devtools-mcp/SKILL.md`
- `.github/skills/chrome-devtools-mcp/references/SETUP-AND-WORKFLOWS.md`
- `.github/skills/chrome-devtools-mcp/references/RHINO-INQUISITOR-TROUBLESHOOTING.md`
- `AGENTS.md`
- `analysis/documentation/README.md`

## References

- <https://github.com/ChromeDevTools/chrome-devtools-mcp>
- <https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/tool-reference.md>
- <https://developer.chrome.com/blog/chrome-devtools-mcp>
- <https://developer.chrome.com/blog/remote-debugging-port>
- <https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/create-skills>
- <https://code.visualstudio.com/docs/copilot/customization/agent-skills>
