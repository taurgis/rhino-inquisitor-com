#!/usr/bin/env bash

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

SUMMARY_PATH="$REPO_ROOT/url-data/reports/gate-summary.csv"
PREVIEW_BASE_URL="${PREVIEW_BASE_URL:-https://staging.rhino-inquisitor.com/}"
CI_RUN_URL="${CI_RUN_URL:-}"
BUILD_DURATION_PATH="$REPO_ROOT/tmp/build-duration-ms.txt"
PRODUCTION_ARTIFACT_DIR="$REPO_ROOT/tmp/ci-prod-public"
PREVIEW_ARTIFACT_DIR="$REPO_ROOT/tmp/ci-preview-public"
PREVIEW_BUILD_MARKER_PATH="$REPO_ROOT/tmp/preview-build.marker"
CANONICAL_PRODUCTION_BASE_URL="https://rhino-inquisitor.com/"
DEPLOY_ARTIFACT_SOURCE="${DEPLOY_ARTIFACT_SOURCE:-auto}"
SELECTED_DEPLOY_ARTIFACT_SOURCE="production"
GATE_GROUP=""

GATE_NAMES=()
GATE_COMMANDS=()

restore_production_output() {
  if [[ ! -d "$PRODUCTION_ARTIFACT_DIR" ]]; then
    return 0
  fi

  rm -rf "$REPO_ROOT/public"
  mkdir -p "$REPO_ROOT/public"
  cp -R "$PRODUCTION_ARTIFACT_DIR/." "$REPO_ROOT/public/"
}

cleanup_preview_state() {
  rm -f "$PREVIEW_BUILD_MARKER_PATH"
}

on_exit() {
  local exit_code="$1"

  if [[ -f "$PREVIEW_BUILD_MARKER_PATH" ]]; then
    if [[ "$exit_code" -ne 0 || "$SELECTED_DEPLOY_ARTIFACT_SOURCE" == "production" ]]; then
      restore_production_output
    fi
    cleanup_preview_state
  fi
}

trap 'on_exit $?' EXIT

print_help() {
  cat <<'EOF'
Usage: bash scripts/gates/run-all-gates.sh [options]

Options:
  --preview-base-url <url>  Preview-host base URL for preview rehearsal validation.
  --deploy-artifact-source <mode>
                            Final artifact left in public/: auto, production, or preview.
  --summary-path <path>     CSV summary output path.
  --ci-run-url <url>        CI run URL to record in the gate summary.
  --group <name>            Only run gates associated with this group (e.g. url, seo, a11y, perf, security, build).
  --help                    Show this help message.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --preview-base-url)
      PREVIEW_BASE_URL="$2"
      shift 2
      ;;
    --deploy-artifact-source)
      DEPLOY_ARTIFACT_SOURCE="$2"
      shift 2
      ;;
    --summary-path)
      SUMMARY_PATH="$2"
      shift 2
      ;;
    --ci-run-url)
      CI_RUN_URL="$2"
      shift 2
      ;;
    --group)
      GATE_GROUP="$2"
      shift 2
      ;;
    --help)
      print_help
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      print_help >&2
      exit 1
      ;;
  esac
done

normalize_url() {
  node -e 'const raw = process.argv[1]; const parsed = new URL(raw); parsed.protocol = "https:"; const trimmed = parsed.pathname.replace(/\/+$/u, ""); parsed.pathname = trimmed ? `${trimmed}/` : "/"; parsed.hash = ""; parsed.search = ""; process.stdout.write(parsed.toString());' "$1"
}

timestamp_utc() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

csv_escape() {
  node -e 'const value = process.argv[1] ?? ""; process.stdout.write(JSON.stringify(String(value)));' "$1"
}

write_summary_header() {
  mkdir -p "$(dirname "$SUMMARY_PATH")"
  printf 'gate_name,command,status,blocking,run_timestamp,ci_run_url,notes\n' > "$SUMMARY_PATH"
}

append_summary_row() {
  local gate_name="$1"
  local gate_command="$2"
  local gate_outcome="$3"
  local gate_notes="$4"
  local run_timestamp

  run_timestamp="$(timestamp_utc)"

  printf '%s,%s,%s,%s,%s,%s,%s\n' \
    "$(csv_escape "$gate_name")" \
    "$(csv_escape "$gate_command")" \
    "$(csv_escape "$gate_outcome")" \
    '"true"' \
    "$(csv_escape "$run_timestamp")" \
    "$(csv_escape "$CI_RUN_URL")" \
    "$(csv_escape "$gate_notes")" >> "$SUMMARY_PATH"
}

register_gate() {
  local gate_name="$1"
  local gate_command="$2"
  local group_name="${3:-}"
  
  if [[ -n "$GATE_GROUP" && "$GATE_GROUP" != "$group_name" && "$group_name" != "all" ]]; then
    return 0
  fi

  GATE_NAMES+=("$1")
  GATE_COMMANDS+=("$2")
}

run_gate() {
  local gate_name="$1"
  local gate_command="$2"

  echo "==> $gate_name"

  if bash -c "$gate_command"; then
    echo "PASS: $gate_name"
    append_summary_row "$gate_name" "$gate_command" "pass" "Blocking gate passed."
    return 0
  fi

  echo "FAIL: $gate_name" >&2
  if [[ -n "${GITHUB_ACTIONS:-}" ]]; then
    printf '::error title=gate failed::%s\n' "$gate_name"
  fi
  append_summary_row "$gate_name" "$gate_command" "fail" "Blocking gate failed. Review workflow or local command output for the failing file or URL."
  return 1
}

write_summary_header
PREVIEW_BASE_URL="$(normalize_url "$PREVIEW_BASE_URL")"
CANONICAL_PRODUCTION_BASE_URL="$(normalize_url "$CANONICAL_PRODUCTION_BASE_URL")"

case "$DEPLOY_ARTIFACT_SOURCE" in
  auto)
    if [[ "$PREVIEW_BASE_URL" == "$CANONICAL_PRODUCTION_BASE_URL" ]]; then
      SELECTED_DEPLOY_ARTIFACT_SOURCE="production"
GATE_GROUP=""
    else
      SELECTED_DEPLOY_ARTIFACT_SOURCE="preview"
    fi
    ;;
  production|preview)
    SELECTED_DEPLOY_ARTIFACT_SOURCE="$DEPLOY_ARTIFACT_SOURCE"
    ;;
  *)
    echo "Unsupported deploy artifact source: $DEPLOY_ARTIFACT_SOURCE" >&2
    exit 1
    ;;
esac

echo "Deploy artifact source: $SELECTED_DEPLOY_ARTIFACT_SOURCE"
cleanup_preview_state

register_gate "Validate front matter" "cd \"$REPO_ROOT\" && npm run validate:frontmatter" "build"
register_gate "Enforce local video shortcode policy" "cd \"$REPO_ROOT\" && npm run check:local-video-shortcodes" "build"
register_gate "Build production validation site" "cd \"$REPO_ROOT\" && build_started_at=\$(node -e 'console.log(Date.now())') && npm run build:prod && build_finished_at=\$(node -e 'console.log(Date.now())') && mkdir -p \"\$(dirname \"$BUILD_DURATION_PATH\")\" && printf '%s' \"\$((build_finished_at - build_started_at))\" > \"$BUILD_DURATION_PATH\"" "build"
register_gate "Validate production artifact integrity and size" "cd \"$REPO_ROOT\" && npm run validate:artifact -- --label production-validation --report tmp/artifact-validation-production.json" "build"
register_gate "Validate URL inventory" "cd \"$REPO_ROOT\" && npm run validate:url-inventory" "url"
register_gate "Run Pages artifact constraints check" "cd \"$REPO_ROOT\" && build_duration_ms=\$(cat \"$BUILD_DURATION_PATH\" 2>/dev/null || printf '') && if [[ -n \"\$build_duration_ms\" ]]; then npm run check:pages-constraints -- --build-duration-ms \"\$build_duration_ms\"; else npm run check:pages-constraints; fi" "build"
register_gate "Run URL parity check" "cd \"$REPO_ROOT\" && npm run check:url-parity" "url"
register_gate "Run redirect target existence check" "cd \"$REPO_ROOT\" && npm run check:redirect-targets" "url"
register_gate "Run redirect chain check" "cd \"$REPO_ROOT\" && npm run check:redirect-chains" "url"
register_gate "Run URL parity gate" "cd \"$REPO_ROOT\" && npm run check:url-parity" "url"
register_gate "Run redirect quality gate" "cd \"$REPO_ROOT\" && npm run check:redirect-quality" "url"
register_gate "Run SEO consistency gate" "cd \"$REPO_ROOT\" && npm run check:seo-consistency" "seo"
register_gate "Run robots and sitemap gate" "cd \"$REPO_ROOT\" && npm run check:robots-sitemap" "seo"
register_gate "Run structured-data gate" "cd \"$REPO_ROOT\" && npm run check:structured-data" "seo"
register_gate "Run social-preview gate" "cd \"$REPO_ROOT\" && npm run check:social-preview" "seo"
register_gate "Run HTML conformance gate" "cd \"$REPO_ROOT\" && npm run check:html-conformance" "a11y"
register_gate "Run accessibility axe gate" "cd \"$REPO_ROOT\" && npm run check:accessibility" "a11y"
register_gate "Run HTTPS and security gate" "cd \"$REPO_ROOT\" && npm run check:https-security" "security"
register_gate "Run canonical alignment check" "cd \"$REPO_ROOT\" && npm run check:canonical-alignment" "url"
register_gate "Run mixed-content check" "cd \"$REPO_ROOT\" && npm run check:mixed-content" "security"
register_gate "Run retirement policy check" "cd \"$REPO_ROOT\" && npm run check:retirement-policy" "url"
register_gate "Run host and protocol check" "cd \"$REPO_ROOT\" && npm run check:host-protocol" "security"
register_gate "Run redirect security check" "cd \"$REPO_ROOT\" && npm run check:redirect-security" "security"
register_gate "Run redirect signal validation check" "cd \"$REPO_ROOT\" && npm run check:redirects:seo" "url"
register_gate "Run metadata validation check" "cd \"$REPO_ROOT\" && npm run check:metadata" "seo"
register_gate "Run image and video SEO validation check" "cd \"$REPO_ROOT\" && npm run check:images" "build"
register_gate "Run schema validation check" "cd \"$REPO_ROOT\" && npm run check:schema" "seo"
register_gate "Run sitemap and feed validation check" "cd \"$REPO_ROOT\" && npm run check:sitemap" "seo"
register_gate "Run crawl-control validation check" "cd \"$REPO_ROOT\" && npm run check:crawl-controls" "seo"
register_gate "Run LLM artifact validation check" "cd \"$REPO_ROOT\" && npm run check:llm-artifacts" "build"
register_gate "Run SEO smoke check" "cd \"$REPO_ROOT\" && npm run check:seo:artifact" "seo"
register_gate "Run internal link check" "cd \"$REPO_ROOT\" && npm run check:internal-links" "seo"
register_gate "Run accessibility gate" "cd \"$REPO_ROOT\" && npm run check:a11y:seo" "a11y"
register_gate "Run performance gate" "cd \"$REPO_ROOT\" && npm run check:perf:gate" "perf"
register_gate "Archive production validation output" "cd \"$REPO_ROOT\" && rm -rf \"$PRODUCTION_ARTIFACT_DIR\" && mkdir -p \"$PRODUCTION_ARTIFACT_DIR\" && cp -R public/. \"$PRODUCTION_ARTIFACT_DIR/\"" "build"
register_gate "Build preview rehearsal site" "cd \"$REPO_ROOT\" && PREVIEW_BASE_URL=\"$PREVIEW_BASE_URL\" npm run build:preview-pages && touch \"$PREVIEW_BUILD_MARKER_PATH\"" "build"
register_gate "Run preview crawl-control validation check" "cd \"$REPO_ROOT\" && node scripts/seo/check-crawl-controls.js --mode preview --base-url \"$PREVIEW_BASE_URL\" --report tmp/ci-preview-crawl-control-audit.csv" "seo"
register_gate "Verify preview-host path prefix and noindex" "cd \"$REPO_ROOT\" && node scripts/gates/check-preview-prefix-noindex.js --base-url \"$PREVIEW_BASE_URL\"" "security"
register_gate "Run SEO-safe deployment host check" "cd \"$REPO_ROOT\" && npm run check:seo-safe-deploy -- --expected-origin \"$PREVIEW_BASE_URL\" --crawl-mode blocked --report tmp/seo-safe-deploy-report.json" "security"
register_gate "Run preview LLM artifact validation check" "cd \"$REPO_ROOT\" && node scripts/seo/check-llm-artifacts.js --report tmp/preview-llm-artifact-quality-report.json" "build"
register_gate "Validate deploy artifact integrity and size" "cd \"$REPO_ROOT\" && npm run validate:artifact -- --label preview-deploy --report tmp/artifact-validation-preview.json" "build"
register_gate "Archive preview rehearsal output" "cd \"$REPO_ROOT\" && rm -rf \"$PREVIEW_ARTIFACT_DIR\" && mkdir -p \"$PREVIEW_ARTIFACT_DIR\" && cp -R public/. \"$PREVIEW_ARTIFACT_DIR/\"" "build"

failure_index=-1

for index in "${!GATE_NAMES[@]}"; do
  if ! run_gate "${GATE_NAMES[$index]}" "${GATE_COMMANDS[$index]}"; then
    failure_index="$index"
    break
  fi
done

if [[ "$failure_index" -ge 0 ]]; then
  for (( index = failure_index + 1; index < ${#GATE_NAMES[@]}; index += 1 )); do
    append_summary_row "${GATE_NAMES[$index]}" "${GATE_COMMANDS[$index]}" "skipped" "Skipped because an earlier blocking gate failed."
  done
  exit 1
fi

echo "All blocking gates passed."