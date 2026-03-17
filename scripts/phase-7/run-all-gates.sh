#!/usr/bin/env bash

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

SUMMARY_PATH="$REPO_ROOT/migration/reports/phase-7-gate-summary.csv"
PREVIEW_BASE_URL="${PHASE7_PREVIEW_BASE_URL:-https://staging.rhino-inquisitor.com/}"
CI_RUN_URL="${PHASE7_CI_RUN_URL:-}"
BUILD_DURATION_PATH="$REPO_ROOT/tmp/phase-7-build-duration-ms.txt"

GATE_NAMES=()
GATE_COMMANDS=()

print_help() {
  cat <<'EOF'
Usage: bash scripts/phase-7/run-all-gates.sh [options]

Options:
  --preview-base-url <url>  Preview-host base URL for preview rehearsal validation.
  --summary-path <path>     CSV summary output path.
  --ci-run-url <url>        CI run URL to record in the gate summary.
  --help                    Show this help message.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --preview-base-url)
      PREVIEW_BASE_URL="$2"
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
  append_summary_row "$gate_name" "$gate_command" "fail" "Blocking gate failed. Review workflow or local command output for the failing file or URL."
  return 1
}

write_summary_header
PREVIEW_BASE_URL="$(normalize_url "$PREVIEW_BASE_URL")"

register_gate "Validate front matter" "cd \"$REPO_ROOT\" && npm run validate:frontmatter"
register_gate "Enforce local video shortcode policy" "cd \"$REPO_ROOT\" && npm run check:local-video-shortcodes"
register_gate "Build production validation site" "cd \"$REPO_ROOT\" && build_started_at=\$(node -e 'console.log(Date.now())') && hugo --cleanDestinationDir --gc --minify --environment production && build_finished_at=\$(node -e 'console.log(Date.now())') && printf '%s' \"\$((build_finished_at - build_started_at))\" > \"$BUILD_DURATION_PATH\""
register_gate "Validate production artifact integrity and size" "cd \"$REPO_ROOT\" && npm run validate:artifact -- --label production-validation --report tmp/phase-7-artifact-validation-production.json"
register_gate "Validate URL inventory" "cd \"$REPO_ROOT\" && npm run validate:url-inventory"
register_gate "Run Pages artifact constraints check" "cd \"$REPO_ROOT\" && build_duration_ms=\$(cat \"$BUILD_DURATION_PATH\" 2>/dev/null || printf '') && if [[ -n \"\$build_duration_ms\" ]]; then npm run check:pages-constraints -- --build-duration-ms \"\$build_duration_ms\"; else npm run check:pages-constraints; fi"
register_gate "Run URL parity check" "cd \"$REPO_ROOT\" && npm run check:url-parity"
register_gate "Run redirect target existence check" "cd \"$REPO_ROOT\" && npm run check:redirect-targets"
register_gate "Run redirect chain check" "cd \"$REPO_ROOT\" && npm run check:redirect-chains"
register_gate "Run canonical alignment check" "cd \"$REPO_ROOT\" && npm run check:canonical-alignment"
register_gate "Run mixed-content check" "cd \"$REPO_ROOT\" && npm run check:mixed-content"
register_gate "Run retirement policy check" "cd \"$REPO_ROOT\" && npm run check:retirement-policy"
register_gate "Run host and protocol check" "cd \"$REPO_ROOT\" && npm run check:host-protocol"
register_gate "Run redirect security check" "cd \"$REPO_ROOT\" && npm run check:redirect-security"
register_gate "Run redirect signal validation check" "cd \"$REPO_ROOT\" && npm run check:redirects:seo"
register_gate "Run metadata validation check" "cd \"$REPO_ROOT\" && npm run check:metadata"
register_gate "Run image and video SEO validation check" "cd \"$REPO_ROOT\" && npm run check:images"
register_gate "Run schema validation check" "cd \"$REPO_ROOT\" && npm run check:schema"
register_gate "Run sitemap and feed validation check" "cd \"$REPO_ROOT\" && npm run check:sitemap"
register_gate "Run crawl-control validation check" "cd \"$REPO_ROOT\" && npm run check:crawl-controls"
register_gate "Run SEO smoke check" "cd \"$REPO_ROOT\" && npm run check:seo:artifact"
register_gate "Run internal link check" "cd \"$REPO_ROOT\" && npm run check:internal-links"
register_gate "Run accessibility gate" "cd \"$REPO_ROOT\" && npm run check:a11y:seo"
register_gate "Run performance gate" "cd \"$REPO_ROOT\" && npm run check:perf:gate"
register_gate "Archive production validation output" "cd \"$REPO_ROOT\" && rm -rf tmp/ci-prod-public && mkdir -p tmp/ci-prod-public && cp -R public/. tmp/ci-prod-public/"
register_gate "Build preview rehearsal site" "cd \"$REPO_ROOT\" && hugo --cleanDestinationDir --gc --minify --environment preview --baseURL \"$PREVIEW_BASE_URL\""
register_gate "Run preview crawl-control validation check" "cd \"$REPO_ROOT\" && node scripts/seo/check-crawl-controls.js --mode preview --base-url \"$PREVIEW_BASE_URL\" --report tmp/ci-preview-crawl-control-audit.csv"
register_gate "Verify preview-host path prefix and noindex" "cd \"$REPO_ROOT\" && node scripts/phase-7/check-preview-prefix-noindex.js --base-url \"$PREVIEW_BASE_URL\""
register_gate "Run SEO-safe deployment host check" "cd \"$REPO_ROOT\" && npm run check:seo-safe-deploy -- --expected-origin \"$PREVIEW_BASE_URL\" --crawl-mode blocked --report tmp/phase-7-seo-safe-deploy-report.json"
register_gate "Validate deploy artifact integrity and size" "cd \"$REPO_ROOT\" && npm run validate:artifact -- --label preview-deploy --report tmp/phase-7-artifact-validation-preview.json"

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

echo "All Phase 7 blocking gates passed."