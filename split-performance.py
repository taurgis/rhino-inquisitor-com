import sys

with open('.github/workflows/build-pr.yml', 'r') as f:
    content = f.read()

performance_idx = content.find('  performance:\n')
if performance_idx == -1:
    print("Could not find performance job")
    sys.exit(1)

before_performance = content[:performance_idx]

# Create the new lighthouse and performance jobs
new_jobs = """  lighthouse:
    needs:
      - prepare
    if: needs.prepare.outputs.route_sensitive == 'true'
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        profile: [mobile, desktop]

    steps:
      - name: Check out repository
        uses: actions/checkout@v5
        with:
          fetch-depth: 0

      - name: Set up Node.js
        uses: actions/setup-node@v5
        with:
          node-version: ${{ env.NODE_VERSION }}
          package-manager-cache: false

      - name: Restore npm and node_modules cache
        uses: actions/cache@v5
        with:
          path: |
            ~/.npm
            node_modules
          key: ${{ runner.os }}-node-${{ env.NODE_VERSION }}-${{ hashFiles('package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-${{ env.NODE_VERSION }}-

      - name: Restore Hugo extended binary cache
        uses: actions/cache@v5
        with:
          path: ~/.cache/hugo/${{ env.HUGO_VERSION }}
          key: ${{ runner.os }}-hugo-${{ env.HUGO_VERSION }}

      - name: Install Hugo extended
        shell: bash
        run: |
          set -euo pipefail
          HUGO_DIR="$HOME/.cache/hugo/${HUGO_VERSION}"
          if [[ ! -x "$HUGO_DIR/hugo" ]]; then
            mkdir -p "$HUGO_DIR"
            curl -fsSL -o "$RUNNER_TEMP/hugo.tar.gz" "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz"
            tar -xzf "$RUNNER_TEMP/hugo.tar.gz" -C "$HUGO_DIR" hugo
          fi
          export PATH="$HUGO_DIR:$PATH"
          echo "$HUGO_DIR" >> "$GITHUB_PATH"
          hugo version

      - name: Install Node dependencies
        run: npm ci

      - name: Build production site
        run: npm run build:prod

      - name: Run Lighthouse for profile
        run: npm run lhci:run:${{ matrix.profile }}

      - name: Upload Lighthouse artifact
        uses: actions/upload-artifact@v6
        with:
          name: pr-lhci-report-${{ matrix.profile }}-${{ github.run_id }}
          path: validation/lhci-report/${{ matrix.profile }}
          if-no-files-found: error
          retention-days: 7

  performance_budget:
    needs:
      - prepare
      - lighthouse
    if: needs.prepare.outputs.route_sensitive == 'true'
    runs-on: ubuntu-latest

    steps:
      - name: Check out repository
        uses: actions/checkout@v5
        with:
          fetch-depth: 0

      - name: Set up Node.js
        uses: actions/setup-node@v5
        with:
          node-version: ${{ env.NODE_VERSION }}
          package-manager-cache: false

      - name: Restore npm and node_modules cache
        uses: actions/cache@v5
        with:
          path: |
            ~/.npm
            node_modules
          key: ${{ runner.os }}-node-${{ env.NODE_VERSION }}-${{ hashFiles('package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-${{ env.NODE_VERSION }}-

      - name: Restore Hugo extended binary cache
        uses: actions/cache@v5
        with:
          path: ~/.cache/hugo/${{ env.HUGO_VERSION }}
          key: ${{ runner.os }}-hugo-${{ env.HUGO_VERSION }}

      - name: Install Hugo extended
        shell: bash
        run: |
          set -euo pipefail
          HUGO_DIR="$HOME/.cache/hugo/${HUGO_VERSION}"
          if [[ ! -x "$HUGO_DIR/hugo" ]]; then
            mkdir -p "$HUGO_DIR"
            curl -fsSL -o "$RUNNER_TEMP/hugo.tar.gz" "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz"
            tar -xzf "$RUNNER_TEMP/hugo.tar.gz" -C "$HUGO_DIR" hugo
          fi
          export PATH="$HUGO_DIR:$PATH"
          echo "$HUGO_DIR" >> "$GITHUB_PATH"
          hugo version

      - name: Install Node dependencies
        run: npm ci

      - name: Build production site
        run: npm run build:prod

      - name: Download mobile LHCI artifact
        uses: actions/download-artifact@v6
        with:
          name: pr-lhci-report-mobile-${{ github.run_id }}
          path: validation/lhci-report/mobile

      - name: Download desktop LHCI artifact
        uses: actions/download-artifact@v6
        with:
          name: pr-lhci-report-desktop-${{ github.run_id }}
          path: validation/lhci-report/desktop

      - name: Run performance budget check
        id: performance_budget_check
        run: npm run check:perf-budget

      - name: Summarize performance result
        if: always()
        shell: bash
        run: |
          if [[ "${{ steps.performance_budget_check.outcome }}" == "success" ]]; then
            echo "Performance gate passed." >> "$GITHUB_STEP_SUMMARY"
          else
            echo "Performance gate failed. RHI-054 now treats this as a blocking regression." >> "$GITHUB_STEP_SUMMARY"
          fi

      - name: Upload performance budget report
        if: always()
        uses: actions/upload-artifact@v6
        with:
          name: pr-performance-budget-${{ github.run_id }}
          path: validation/performance-budget-report.json
          if-no-files-found: ignore
          retention-days: 7
"""

with open('.github/workflows/build-pr.yml', 'w') as f:
    f.write(before_performance + new_jobs)

