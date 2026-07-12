#!/usr/bin/env bash
# Fast local validation before pushing to main.
#
# PRs are disabled for this repository, so the first CI validation a commit
# sees is the post-push deploy pipeline. This script front-loads the cheap
# checks (~30s) so broken commits are caught before they leave the machine.
# It runs automatically as a git pre-push hook (installed by `npm run prepare`
# via core.hooksPath); run it manually with `npm run preflight`.
#
# Skip in an emergency with: SKIP_PREFLIGHT=1 git push

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "==> preflight: front matter validation"
npm run --silent validate:frontmatter

echo "==> preflight: local video shortcode policy"
npm run --silent check:local-video-shortcodes

echo "==> preflight: URL parity regression suite"
npm run --silent test:url-parity

echo "==> preflight: external-link gate regression suite (offline)"
npm run --silent test:external-links

echo "==> preflight: callout gate regression suite (offline)"
npm run --silent test:callouts

echo "==> preflight: when-published gate regression suite (offline)"
npm run --silent test:when-published

echo "==> preflight: markdownlint (files changed vs origin/main)"
if git rev-parse --verify --quiet origin/main >/dev/null; then
  base="$(git merge-base HEAD origin/main)"
  # Exclude .bonsai/research/**: raw scraped documentation cached by the
  # Bonsai research tool, not authored prose, so it doesn't owe markdownlint
  # a clean bill of health.
  mapfile -t changed_md < <(git diff --name-only --diff-filter=d "$base" HEAD -- '*.md' ':!.bonsai/research/**')
  if ((${#changed_md[@]})); then
    npx markdownlint-cli2 "${changed_md[@]}"
  else
    echo "no markdown changes"
  fi
else
  echo "origin/main not available; skipping markdown lint"
fi

echo "preflight OK"
