#!/usr/bin/env bash
# Install the pinned Hugo Extended version for local verification builds.
#
# The pinned version is read from HUGO_VERSION in
# .github/workflows/deploy-pages.yml so local installs always match CI;
# override with `HUGO_VERSION=x.y.z scripts/install-hugo.sh` only for
# deliberate version experiments.
#
# Two install strategies, tried in order:
#   1. Prebuilt binary from GitHub releases (fast; normal machines).
#   2. `go install -tags extended` via the Go module proxy — for sandboxed
#      or remote agent environments where the egress policy blocks
#      github.com downloads but allows proxy.golang.org. Requires Go and a
#      C/C++ toolchain (CGO); the build takes several minutes.
#
# The binary lands in ~/.cache/hugo/<version>/hugo (the same layout the CI
# cache uses) and is symlinked into a directory on PATH when possible.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKFLOW_FILE="$REPO_ROOT/.github/workflows/deploy-pages.yml"

if [[ -z "${HUGO_VERSION:-}" ]]; then
  HUGO_VERSION="$(sed -n 's/^[[:space:]]*HUGO_VERSION:[[:space:]]*//p' "$WORKFLOW_FILE" | head -1 | tr -d '"' | tr -d "'")"
fi
if [[ -z "$HUGO_VERSION" ]]; then
  echo "ERROR: could not resolve HUGO_VERSION from $WORKFLOW_FILE" >&2
  exit 1
fi

HUGO_DIR="$HOME/.cache/hugo/$HUGO_VERSION"
HUGO_BIN="$HUGO_DIR/hugo"

link_into_path() {
  local target
  for target in /usr/local/bin "$HOME/.local/bin"; do
    mkdir -p "$target" 2>/dev/null || true
    if [[ -d "$target" && -w "$target" ]]; then
      ln -sf "$HUGO_BIN" "$target/hugo"
      echo "==> linked $target/hugo -> $HUGO_BIN"
      return 0
    fi
  done
  echo "==> no writable PATH directory found; add it yourself:"
  echo "    export PATH=\"$HUGO_DIR:\$PATH\""
}

verify() {
  local out
  out="$("$HUGO_BIN" version)"
  echo "$out"
  if [[ "$out" != *"$HUGO_VERSION"* || "$out" != *extended* ]]; then
    echo "ERROR: installed binary is not Hugo Extended $HUGO_VERSION" >&2
    exit 1
  fi
}

if [[ -x "$HUGO_BIN" ]] && "$HUGO_BIN" version 2>/dev/null | grep -q "$HUGO_VERSION"; then
  echo "==> Hugo Extended $HUGO_VERSION already installed at $HUGO_BIN"
  verify
  link_into_path
  exit 0
fi

mkdir -p "$HUGO_DIR"
ARCH="$(uname -m)"
case "$ARCH" in
  x86_64) HUGO_ARCH="amd64" ;;
  aarch64 | arm64) HUGO_ARCH="arm64" ;;
  *)
    echo "ERROR: unsupported architecture: $ARCH" >&2
    exit 1
    ;;
esac

TARBALL_URL="https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-${HUGO_ARCH}.tar.gz"
TMP_TARBALL="$(mktemp -t hugo-XXXXXX.tar.gz)"
trap 'rm -f "$TMP_TARBALL"' EXIT

echo "==> trying prebuilt binary: $TARBALL_URL"
if curl -fsSL --connect-timeout 15 -o "$TMP_TARBALL" "$TARBALL_URL"; then
  tar -xzf "$TMP_TARBALL" -C "$HUGO_DIR" hugo
  echo "==> installed prebuilt Hugo Extended $HUGO_VERSION"
else
  echo "==> GitHub release download failed (blocked egress policy?)"
  echo "==> falling back to source build via the Go module proxy"
  if ! command -v go >/dev/null; then
    echo "ERROR: fallback needs Go (https://go.dev); neither install path is available" >&2
    exit 1
  fi
  if ! command -v gcc >/dev/null && ! command -v cc >/dev/null; then
    echo "ERROR: fallback needs a C compiler for CGO (Hugo Extended)" >&2
    exit 1
  fi
  echo "==> building Hugo Extended $HUGO_VERSION from source (takes several minutes)..."
  CGO_ENABLED=1 GOBIN="$HUGO_DIR" GOFLAGS="" \
    go install -tags extended "github.com/gohugoio/hugo@v${HUGO_VERSION}"
  echo "==> built Hugo Extended $HUGO_VERSION from source"
fi

verify
link_into_path
