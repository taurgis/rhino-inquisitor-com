# Agent-Discovery `Link` Response Header

Adds automated verification (and documents the required Cloudflare-side
configuration) for a homepage `Link` response header that lets HTTP clients
and AI agents discover this site's machine-readable resources, per
[RFC 8288 (Web Linking)](https://www.rfc-editor.org/rfc/rfc8288) and the
registered relation types from
[RFC 9727, Section 3](https://www.rfc-editor.org/rfc/rfc9727#section-3) and
[RFC 8631](https://www.rfc-editor.org/rfc/rfc8631).

> **Superseded (2026-07-14):** the standalone Cloudflare rule below now
> conflicts with the per-article Markdown `Link` headers added in
> [`docs/publishing/article-markdown-link-headers.md`](article-markdown-link-headers.md)
> — both rules write to the homepage's `Link` header, and `Set` overwrites
> rather than appends, so only one survives. Replace this rule with that
> doc's "Rule 3 — homepage combined `Link` header", which carries both the
> `describedby` and `alternate` relations in one value. The `describedby`
> relation and its rationale below are still accurate; only the delivery
> mechanism (a standalone rule vs. a combined one) changes.

## Change summary

- `scripts/gates/check-https-security.js` gained a new live-host check,
  `agentDiscoveryLinkHeader`, that inspects the `Link` response header on
  `https://www.rhino-inquisitor.com/` and reports whether it carries a
  registered discovery relation (`api-catalog`, `service-desc`,
  `service-doc`, or `describedby`).
- This is a verification-only change: the header itself cannot be set by
  this repository (see "Why this isn't set in Hugo/GitHub Pages" below). The
  actual header must be added at the Cloudflare zone in front of the site,
  the same way `Content-Security-Policy` and other hardening headers were
  documented as an open, Cloudflare-side item in
  `docs/security/security-audit-2026-07.md` (Finding 3).

## Why this isn't set in Hugo/GitHub Pages

This site is a static Hugo build published to GitHub Pages
(`.github/workflows/deploy-pages.yml`). GitHub Pages does not support custom
response headers (no `_headers` file, no per-route header config), so no
Hugo template or config change can add a `Link` header to the built output.
The live site is fronted by Cloudflare (confirmed via response headers in
the July 2026 security audit), so the header has to be injected at the edge
with a Cloudflare **Transform Rule** (or a Worker), which lives outside this
repository's version control.

## Recommended Cloudflare Transform Rule

Steps in the Cloudflare dashboard, for the `rhino-inquisitor.com` zone
([Response Header Transform Rules docs](https://developers.cloudflare.com/rules/transform/response-header-modification/create-dashboard/)):

1. Go to **Rules** → **Overview** for the zone.
2. Select **Create rule** → **Response Header Transform Rule**.
3. **Rule name**: `Agent discovery Link header` (or similar).
4. **When incoming requests match**: choose **Custom filter expression**
   and enter (Expression Editor, not the field-by-field builder, is
   easiest for the `or`):

   ```text
   (http.host eq "rhino-inquisitor.com" or http.host eq "www.rhino-inquisitor.com") and http.request.uri.path eq "/"
   ```

5. Under **Modify response header**, select **Set static**.
6. **Header name**: `Link`
7. **Value**:

   ```text
   </llms.txt>; rel="describedby"
   ```

8. Leave it at one header modification (no need for **Set new header**).
9. Select **Deploy** (not **Save as Draft**) to make it live immediately.
   If prompted about a proxied DNS record for the hostname, confirm the
   zone's `A`/`CNAME` records for both `rhino-inquisitor.com` and `www` are
   already proxied (orange-clouded) — they should be, since HSTS/CSP-style
   headers already work today.

Using **Set static** (not **Add static**) means this rule also fixes the
header if a future rule or origin change ever emits a conflicting `Link`
value — it always overrides to this one on `/`.

`describedby` (registered via POWDER, listed in the IANA Link Relations
registry) is the relation that fits this site: it "refers to a resource
providing information about the link's context." The target,
`/llms.txt`, already exists — Hugo emits it for the home page via the
`llms` output format in `hugo.toml` (`[outputFormats.llms]`,
`src/layouts/home.llms.txt`) — and is a genuine machine-readable
description of the site for LLM/agent consumption. `api-catalog` /
`service-desc` / `service-doc` (RFC 9727 / RFC 8631) describe *API*
endpoints; this site publishes content, not an API, so those relations do
not apply and are not fabricated here.

Multiple `Link` headers, or one comma-separated header value, are both
valid per RFC 8288 Section 3.5 — additional relations can be appended later
(e.g. if an `api-catalog` document is ever published) without removing this
one.

## Impact and verification

- Impacted: the "Run HTTPS and security gate" step inside
  `npm run gates:local` (via `check-https-security.js`), and the Cloudflare
  zone configuration for `rhino-inquisitor.com` (outside this repo).
- The new check is **non-blocking** (`warning`, not `fail`) — like the
  existing `securityHeaders` check — because the header is set outside this
  repository's deploy pipeline and must not block Pages deploys until the
  Cloudflare-side rule is live.
- Verify locally without live checks (schema/regression only):

  ```bash
  node scripts/gates/check-https-security.js --skip-live-checks
  ```

- Verify against the live site once the Transform Rule is configured:

  ```bash
  RHI_HTTPS_LIVE_HOST_READY=true node scripts/gates/check-https-security.js
  curl -sI https://rhino-inquisitor.com/ | grep -i '^link:'
  ```

- External validation (per the originating request), via
  [isitagentready.com](https://isitagentready.com):

  ```bash
  curl -sX POST https://isitagentready.com/api/scan \
    -H 'Content-Type: application/json' \
    -d '{"url":"https://rhino-inquisitor.com"}'
  ```

  Check that `checks.discoverability.linkHeaders.status` is `"pass"`.

## Related files

- `scripts/gates/check-https-security.js` — `extractLinkRelations` /
  `checkAgentDiscoveryLinkHeader` (new) and `analyzeLiveChecks` wiring.
- `docs/publishing/https-live-host-gate.md` — live-host check list, updated
  to mention this check.
- `hugo.toml` (`[outputFormats.llms]`) and `src/layouts/home.llms.txt` —
  source of the `/llms.txt` target resource.
- `docs/security/security-audit-2026-07.md` (Finding 3) — prior precedent
  for hardening headers being a Cloudflare-side, out-of-repo change.
- Cloudflare zone configuration for `rhino-inquisitor.com` (outside this
  repo) — where the `Link` header Transform Rule must actually be created.
