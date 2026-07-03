# Security Policy

This repository builds and deploys [rhino-inquisitor.com](https://rhino-inquisitor.com), a static Hugo blog published via GitHub Pages. There is no server-side application, database, authentication, or user account system — the deployed site is static HTML/CSS/JS/assets. The security surface that matters here is:

- The Hugo build pipeline and validation scripts under `scripts/`.
- Site templates and partials under `src/layouts/`.
- The GitHub Actions workflows under `.github/workflows/` that build and publish the site.
- Third-party dependencies declared in `package.json` / `package-lock.json`.

## Supported Versions

Only the `main` branch and the currently deployed production site are supported. There are no maintained release branches or older versions.

## Reporting a Vulnerability

Please report suspected vulnerabilities privately using GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability) feature on this repository (**Security** tab → **Report a vulnerability**). Do not open a public issue for security reports.

Please include:

- A description of the vulnerability and its potential impact.
- Steps to reproduce, or a proof of concept.
- Any relevant logs, requests, or affected files/URLs.

You can expect an initial response within 5 business days. This is a personally maintained project without a formal bug bounty program, but valid reports are taken seriously and fixed as soon as practical, with credit given if desired.

## Scope

**In scope:**

- Vulnerabilities in the build/deploy pipeline (e.g. injection into the Hugo build, GitHub Actions workflow compromise, secrets exposure).
- Vulnerabilities in custom scripts under `scripts/` that could be exploited via crafted content or inputs.
- Client-side vulnerabilities in the deployed site (e.g. XSS via templates, insecure third-party embeds, mixed-content/HTTPS issues).
- Vulnerable dependencies with a known, exploitable impact on this project.

**Out of scope:**

- Findings that require physical or privileged access to GitHub Pages, GitHub Actions runners, or repository maintainer accounts (report those to GitHub directly).
- Denial-of-service or load/stress testing against the live site.
- Missing security headers or hardening suggestions with no demonstrated exploit — open a normal issue or PR for these instead.
- Social engineering, phishing, or physical-security reports unrelated to this codebase.

## Existing Automated Checks

This repository already runs automated security-relevant gates in CI (see `.github/workflows/build-pr.yml`), including `npm run check:security` (mixed-content, HTTP leakage, and related checks) and `npm run check:https-security`. Reports that a passing gate is insufficient, or that a check is missing, are welcome.
