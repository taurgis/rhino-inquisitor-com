# Chrome DevTools MCP Setup And Workflows

Use this reference when the main skill is not enough and you need concrete configuration patterns or a reminder of which mode fits the task.

## Baseline MCP Client Config

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

Prerequisites from upstream:

- Node.js `20.19+`
- npm
- Google Chrome current stable or newer, or Chrome for Testing

## Safer Launch Examples

### Disposable browser profile

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest", "--isolated"]
    }
  }
}
```

Use when you want a temporary profile that is removed when Chrome exits.

### Headless automation

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest", "--isolated", "--headless"]
    }
  }
}
```

Use when you need reproducible automation without keeping a visible browser open.

### Minimal tool surface

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest", "--isolated", "--headless", "--slim"]
    }
  }
}
```

Use when the task is limited to navigation, script execution, and screenshots.

## Attach Modes

### Auto-connect to a running local Chrome session

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest", "--autoConnect"]
    }
  }
}
```

Use when you already have a local Chrome session and want the agent to attach automatically. Upstream documents this for Chrome `144+` with remote debugging enabled from `chrome://inspect/#remote-debugging`.

### Attach to a specific debuggable browser endpoint

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@latest",
        "--browser-url=http://127.0.0.1:9222"
      ]
    }
  }
}
```

Use when you need preserved session state, when launch is blocked by sandboxing, or when manual testing already established the exact page state.

## Remote Debugging Safety Notes

- Do not point Chrome DevTools MCP at a browser session you use for sensitive browsing.
- Chrome `136+` requires remote debugging switches to be paired with a non-default `--user-data-dir` if you want to debug a launched Chrome instance safely.
- Avoid leaving a remote debugging port open longer than needed because local applications can connect to and control that browser.

## Task-To-Workflow Map

| Need | Start with |
|------|------------|
| Visual regression or smoke check | Managed browser with `--isolated` |
| CI-like validation | Managed browser with `--isolated --headless` |
| Existing login or manual repro state | `--autoConnect` or `--browser-url` |
| Quick screenshots or DOM reads only | `--slim` |
| Root-cause performance work | Managed browser plus a performance trace |

## High-Value Prompt Patterns

### Verify a page render

```text
Use Chrome DevTools MCP to open <page-url>, wait for the main content to settle, capture a screenshot, and report any console errors or failed requests.
```

### Diagnose a broken interaction

```text
Use Chrome DevTools MCP to reproduce the interaction on <page-url>, inspect console and network activity, and identify the first concrete failure with evidence.
```

### Investigate layout drift

```text
Use Chrome DevTools MCP to inspect the DOM and computed styles on <page-url> at desktop width, explain why the component shifts, and include the relevant element evidence.
```

### Run a performance trace

```text
Use Chrome DevTools MCP to record a performance trace for <page-url> and summarize the dominant bottleneck affecting loading or responsiveness.
```

## Further Reading

- Main README: https://github.com/ChromeDevTools/chrome-devtools-mcp
- Tool reference: https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/tool-reference.md
- Slim tool reference: https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/slim-tool-reference.md
- Troubleshooting: https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/troubleshooting.md
- Launch article: https://developer.chrome.com/blog/chrome-devtools-mcp
- Remote debugging security update: https://developer.chrome.com/blog/remote-debugging-port