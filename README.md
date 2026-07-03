# Rhino Inquisitor

Source and tooling for rhino-inquisitor.com — a Hugo site deployed to GitHub Pages via GitHub Actions.

Day-to-day work is authoring and publishing new articles while keeping SEO, URL/redirect integrity, accessibility, and performance intact.

## Repository Structure

```text
.
|-- .github/
|   |-- agents/          # Agent role definitions (Hugo Specialist, SEO Specialist)
|   |-- instructions/    # Repository governance and quality gates
|   `-- workflows/       # build-pr.yml (PR gates), deploy-pages.yml (publish)
|-- .agents/skills/      # Domain skills used by agents
|-- url-data/           # URL manifests and redirect/parity data read by live gates
|-- validation/          # Validation inputs and report schema
|-- monitoring/          # Site monitoring runbook and reports
|-- scripts/             # SEO, URL-parity, redirect, accessibility, and performance gate scripts
|-- src/
|   |-- content/         # Hugo content source files (articles live here)
|   |-- layouts/         # Hugo templates and partials
|   |-- static/          # Pass-through assets served by Hugo
|   |-- assets/          # Pipeline-processed assets
|   |-- data/            # Hugo data files
|   `-- archetypes/      # Hugo archetype stubs
|-- hugo.toml            # Canonical Hugo config
|-- LICENSE              # MIT license for site code/tooling
|-- SECURITY.md          # Vulnerability reporting policy
`-- README.md
```

## Key Documents

- [Agent Guide](AGENTS.md)
- [Repository Instructions](.github/instructions/)
- [Security Policy](SECURITY.md)

## Local Prerequisites

- Hugo Extended `0.157.0` (pinned; matches `HUGO_VERSION` in CI)
- Node.js `>=20.18.1` as declared in `package.json`
- npm matching the active Node.js runtime

## Local Commands

- Production-style build: `hugo --minify --environment production` (or `npm run build:prod`)
- Local preview server: `npm run dev`
- Front matter validation: `npm run validate:frontmatter`
- SEO smoke validation: `npm run check:seo`
- Security and privacy validation: `npm run check:security`
- Accessibility smoke validation: `npm run check:a11y`
- Full deploy gate suite (mirrors the publish pipeline): `npm run gates:local`

## Publishing

- Open a PR to `main`; `.github/workflows/build-pr.yml` runs the route-sensitive validation gates.
- On merge to `main`, `.github/workflows/deploy-pages.yml` builds and publishes to GitHub Pages after the blocking gate suite passes.

## Security

This is a static site with no server-side application or user data. See [SECURITY.md](SECURITY.md) for supported scope and how to privately report a suspected vulnerability (via GitHub's private vulnerability reporting, not a public issue).

## License

- **Code and tooling** (Hugo templates/partials, build and validation scripts, configuration under this repository) are licensed under the [MIT License](LICENSE).
- **Blog article content** under `src/content/posts/` is licensed separately under [Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)](https://creativecommons.org/licenses/by-nc-nd/4.0/). You may share and link to articles with attribution, but not modify, republish, or use them commercially without permission.

## Notes

- Use relative links for internal references.
- Keep this README current when major structure or process changes occur.
