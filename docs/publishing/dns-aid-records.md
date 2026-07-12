# DNS for AI Discovery (DNS-AID) — Not Applicable to This Site

Records the decision **not** to publish DNS for AI Discovery (DNS-AID)
records for `rhino-inquisitor.com`, and why, so the request doesn't
resurface as an unexplained gap in a future audit.

## Change summary

- An external scan flagged the absence of DNS-AID well-known entrypoint
  records (e.g. `_index._agents.rhino-inquisitor.com`) as a finding.
- After reading the current spec —
  [`draft-mozleywilliams-dnsop-dnsaid-02`](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/)
  and [RFC 9460](https://www.rfc-editor.org/rfc/rfc9460) (SVCB/HTTPS
  records) — this site does not meet the precondition for DNS-AID to make
  sense: it does not operate a callable AI agent service. No DNS records
  were created. This document is the record of that assessment, not a
  runbook to execute later, though "If an agent is ever added" below
  captures what would be needed if that changes.

## Why DNS-AID doesn't apply here

DNS-AID publishes **SVCB ServiceMode** records so that other AI agents can
open a direct, DNSSEC/DANE-authenticated TLS connection to an
organization's agent and invoke it (over MCP, A2A, etc.). Per the draft:

- An individual agent's record lives at the agent's own owner name (e.g.
  `agent-name.example.com`) and carries `TargetName`, `port`, `alpn`
  (transport/agent protocol, e.g. `alpn=a2a,h2`), optional
  `ipv4hint`/`ipv6hint`, a `well-known` path to a capability descriptor
  (e.g. `agent-card.json`), and `cap-sha256` (a digest of that
  descriptor) — Section 3.1.
- An organization-level index, if published, lives at the reserved label
  `_index._agents.<domain>` and points to a registry of the org's agents —
  Section 3.2. (The issue's example, `_a2a._agents.<domain>`, does not
  match a name defined anywhere in the current draft; the closest match
  is an optional per-agent DNS-SD label like `_a2a.agent-name.example.com`
  used only for protocol filtering, per Section 3.1.1 — it is not an
  organization-level entrypoint.)
- Records **SHOULD** be DNSSEC-signed for data-origin authentication, and
  **MUST** be signed if DANE TLSA records are also published (Section 1.1,
  6.4).

`rhino-inquisitor.com` is a static Hugo site built to plain HTML/JSON/RSS
and deployed to GitHub Pages (`.github/workflows/deploy-pages.yml`) — see
`hugo.toml`. It does not run an MCP server, an A2A endpoint, or any other
network-callable agent, and has no capability descriptor to serve at a
`well-known` path. Publishing an SVCB record here would advertise a
`TargetName`/`port`/`alpn` triple with nothing behind it — an agent
connecting on the strength of that record would get a TLS handshake to a
GitHub Pages host that speaks HTTP for static content, not the declared
agent protocol. That is a worse outcome than publishing nothing: it
fabricates infrastructure the domain doesn't have, for a checklist item
from a third-party scanner, rather than describing real behavior.

This site's actual machine-readability story for LLMs/agents is content
discovery, not agent invocation, and is already handled by two existing,
narrower mechanisms:

- `/llms.txt` (Hugo `[outputFormats.llms]` in `hugo.toml`,
  `src/layouts/home.llms.txt`) — a machine-readable description of the
  site's content.
- The homepage `describedby` `Link` response header pointing at
  `/llms.txt`, documented in
  `docs/publishing/agent-discovery-link-header.md`.

Those satisfy "an agent can find out what this site is and read its
content" (RFC 8288 web linking to a content description). DNS-AID solves
a different problem — "an agent can connect to and invoke your agent
service" — that doesn't apply until this domain hosts one.

## If an agent is ever added

Should this domain (or a subdomain) start hosting a real MCP/A2A
service, DNS-AID becomes applicable and would need, per the draft:

1. A DNSSEC-signed SVCB ServiceMode record at that service's own owner
   name, with `alpn`, `port`, `ipv4hint`/`ipv6hint` as needed, `well-known`
   pointing at its capability descriptor, and `cap-sha256` matching that
   descriptor's digest.
2. Optionally, an `_index._agents.rhino-inquisitor.com` SVCB record if
   more than one such agent exists and a discoverable registry is useful.
3. A DANE TLSA record at `_443._tcp.<owner>` if strict TLS endpoint
   pinning is wanted (Section 6.2) — this makes DNSSEC signing mandatory,
   not just recommended.
4. As with the `Link` header (see
   `docs/publishing/agent-discovery-link-header.md`), the records
   themselves would need to be created in the Cloudflare zone in front of
   this domain — no Hugo/GitHub Pages config can publish DNS records.

## Impact and verification

- No DNS records, Hugo config, or CI gates were changed — this is a
  documentation-only entry recording an assessment.
- Verification of the assessment: `hugo.toml` has no agent/MCP/A2A output
  format or endpoint configuration, and `src/static/` has no capability
  descriptor (`agent-card.json` or similar) for any such service to serve.
- If a future scan (e.g. isitagentready.com) re-flags this as missing,
  this document is the answer — no action is expected unless an agent
  service is actually added, per "If an agent is ever added" above.

## Related files

- `docs/publishing/agent-discovery-link-header.md` — the mechanism that
  does apply to this site (content discovery via `Link` header +
  `/llms.txt`), including why DNS/zone-level changes live outside this
  repo.
- `hugo.toml` (`[outputFormats.llms]`) and `src/layouts/home.llms.txt` —
  the existing content-discovery surface.
- [`draft-mozleywilliams-dnsop-dnsaid-02`](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/) —
  DNS-AID specification (Sections 1.1, 3.1–3.2, 6.2, 6.4 referenced above).
- [RFC 9460](https://www.rfc-editor.org/rfc/rfc9460) — SVCB/HTTPS DNS
  resource records that DNS-AID builds on.
