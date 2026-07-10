# POD number guide — July 2026 audit and refresh

## Change summary

`src/content/posts/the-sfcc-guide-to-finding-pod-numbers/index.md` was
audited roughly a year after publication (July 2025) because the article
itself predicts its own subject's decline: it warns that Hyperforce
migration will eventually make its POD-discovery tricks unreliable. The
audit's central question was how far that migration has actually
progressed, and whether that changes how the article should be framed.
Findings below show the migration is real, active, and multi-year, but
still short of making the article's methods obsolete — so this is a
light-touch currency update (sourced Hyperforce framing, a caveat on each
UI method, two caption fixes) rather than a rewrite.

## Old vs new behavior

| Aspect | Old | New |
|--------|-----|-----|
| Hyperforce framing | Described as an abstract, forward-looking architectural shift with no dates or specifics | Sourced: multi-year migration starting Q4 2024, realm-by-realm with 60–90 days' notice and a 2–5 hour cutover window; first-party POD infrastructure stays live until every realm has moved; current (2026) B2C Commerce release docs still frame deployment entirely in POD terms |
| Post-Hyperforce guidance | None — treated the shift as "your methods stop working" with no replacement described | Added: outbound IP allowlisting moves from a single POD IP to a small set of AWS-region IP ranges, and Salesforce carries the existing firewall allowlist over automatically during the move |
| Method 1 (Custom Maintenance Page hover trick) | Presented without a currency caveat | Confirmed via the current Salesforce Developer "Maintenance Pages" guide that preview links still embed a POD-numbered hostname; added an explicit note that this stops working once Hyperforce takes over the realm |
| Method 2 (Lightning footer) | Presented without a currency caveat | No official Salesforce documentation was found describing this footer feature one way or the other (likely a practitioner-observed UI detail); kept as originally written, since nothing contradicts it, and added the same Hyperforce-scoping caveat as Method 1 |
| Image caption (Method 4 section) | `caption="Figure 1: Use official Salesforce channels to find reliable POD information"` | "Figure 1:" prefix removed per house style (`src/content/posts/AGENTS.md`, `image-caption-writing` skill) |
| Post-figure paragraph | "On the right path: Getting information from the official source." directly below the figure | Removed — pure restatement of the caption with no new reader value, which duplicates the following paragraph's opening idea |
| POD list / worked example (POD 126/127/IP) | Unverified since 2025 | Re-confirmed byte-for-byte against the live AMER POD list (published Jun 30, 2026): POD 126 → Realm NA, Location USA East - VA, DR POD 127, outgoing IP `136.146.57.33` — no change needed |
| Front matter | `lastmod` 2026-07-04 | `lastmod` bumped to 2026-07-10; `date` and `url` untouched |

## Fact-check notes

All sources fetched via `npx @taurgis/bonsai <url> --format detailed` in this
session (plan-mode research used a WebFetch fallback first, which mostly hit
JS nav-shells on `help.salesforce.com` — those findings were superseded by
the Bonsai re-fetches below):

- **[B2C Commerce Hyperforce FAQ](https://help.salesforce.com/s/articleView?id=cc.b2c_hyperforce_faq.htm&language=en_US&type=5)** — confirms: migration is a multi-year effort beginning Q4 2024; new B2C Commerce customers are provisioned on Hyperforce from day one; existing realms get 60–90 days' notice before a scheduled move; the realm-move maintenance window (measured from maintenance page up to maintenance page down) is 2–5 hours; existing firewall rules are copied automatically to the new Hyperforce destination; first-party POD environments are decommissioned only "after all customers' realms are migrated" — no fixed sunset date exists yet.
- **[Hyperforce Realm Move Preparation and Process](https://help.salesforce.com/s/articleView?id=002888834&language=en_US&type=1)** (published Jun 23, 2026) — confirms the PIG move runs in a 2–7am window in the source POD's time zone (~5 hours), and lists the outbound IP ranges to allowlist post-move, grouped by AWS region (`useast2`, `apsoutheast2`, `apnortheast1`, `eunorth1`, `apsouth2`) — matching the five Hyperforce AWS regions named in the FAQ (Ohio, Tokyo, Stockholm, Sydney, Hyderabad). This is the sourced basis for the new "you'll be allowlisting a region, not chasing a number" paragraph.
- **[Maintenance Pages (Salesforce Developers)](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-maintenance-pages.html)** — confirms the BM path (`Administration > Site Development > Custom/Maintenance Pages`) and the `podNN.demandware.net`-style hostname convention are both still current; explicitly states maintenance pages "are not POD-specific" and gives a worked example of the same page resolving through two different POD-numbered hostnames after a POD move, which independently corroborates the mechanic Method 1 relies on.
- **[How to find tenant information about your B2C Commerce realms](https://help.salesforce.com/s/articleView?id=002467426&language=en_US&type=1)** (published Jul 31, 2025) — confirms `https://account.demandware.com/` is still the current Account Manager login URL, and describes the Business Manager instance URL format and the Group ID / Realm ID lookup path already described in the article.
- **[Locations and Outgoing POD IPs — AMER PODs](https://help.salesforce.com/s/articleView?id=000391456&language=en_US&type=1)** (published Jun 30, 2026) and **[— EMEA/APAC PODs](https://help.salesforce.com/s/articleView?id=000391425&language=en_US&type=1)** (published Jul 2, 2026) — both resolve correctly and are current within the last two weeks. The AMER table confirms POD 126 → Realm NA, Location "USA East - VA", DR POD 127, outgoing IP `136.146.57.33`, an exact match for the article's worked example.
- **`https://status.salesforce.com/products/B2C_Commerce_Cloud`** — confirmed live with active 2026 release entries (26.2 through 26.6) during the plan-mode research pass; not re-fetched via Bonsai since nothing about the finding was in question.
- **Log Center migration link** (`https://help.salesforce.com/s/articleView?id=000394842&language=en_US&type=1`) — resolves to the current, general "Log Center" documentation hub (dashboard, search, streaming, anomaly detection, alerts). It corroborates the underlying claim that logging is now centralised and regional rather than POD-specific, but the page itself doesn't restate the specific "migrated in 2023" date — that detail is left as originally written since nothing contradicts it, but it isn't independently re-verified against a dated source in this pass.
- **Lightning footer POD display (Method 2)** — searched official Help and Developer docs (including the B2C Commerce Business Manager UI release note) and found no article describing this specific feature. Treated as a practitioner-observed detail rather than an officially documented one; the article doesn't claim official documentation for it either, so no wording overstatement to correct.

## Impact and verification

- Impacted: one published post only. No scripts, workflows, templates, or
  governance files changed. `url`, `date`, hero image, and `description`
  untouched.
- No live Business Manager or Lightning UI access was available this
  session (confirmed with the site owner before starting); Methods 1 and 2
  were verified against official documentation only, not hands-on.
- Verified with: `npm run validate:frontmatter` (197 files, pass),
  `npm run check:spelling` (197 files, pass, no new allow-list entries),
  `npx markdownlint-cli2` on the post (0 errors), and `npm run build:local`.

## Follow-up fact-check audit (2026-07-10)

After the currency refresh above shipped, a dedicated fact-check pass
covered the claims in the article that hadn't yet been independently
verified. All five checked out; no article changes were needed.

| Claim | Verdict | Source |
|---|---|---|
| Trust site lists individual PODs as subscribable entries, not just product-level status | **Confirmed** — verbatim | [How to Receive B2C Commerce Release, Maintenance, and Incident Notifications](https://help.salesforce.com/s/articleView?id=000391618&language=en_US&type=1): "Search by POD in the search bar... Select the Instance (POD) to subscribe" |
| PWA Kit/Managed Runtime should be deployed close to your POD's region to cut latency | **Confirmed** — near-verbatim match | [Optimizing PWA Performance with Region Selection in Managed Runtime](https://help.salesforce.com/s/articleView?id=000594748&language=en_US&type=1): "By deploying your PWA to a cluster near the PODs storing your customers' data, you minimize latency and significantly improve page load times," and points readers at the same AMER/EMEA-APAC POD lists the article already cites |
| Legacy Log Center URL `logcenter-<POD><Cylinder>-hippo.demandware.net/logcenter`, `00`=SIG, `01`=PIG | **Likely** — the live system was retired in 2023, so no primary source survives; `00`=SIG was independently corroborated via a third-party archived writeup, but the `01`=PIG half rests only on search-summary corroboration. Low-stakes: inert history, already framed as "A History Lesson" | No live primary source (system retired); independent blog corroboration for the `00` half only |
| "4-letter Group ID" / "alphanumeric Realm ID" via Account Manager's Assigned Realms section | **Confirmed** — verbatim | [How to find tenant information about your B2C Commerce realms](https://help.salesforce.com/s/articleView?id=002467426&language=en_US&type=1) uses this exact framing |
| Log Center centralization happened in 2023 | **Confirmed** | Article is titled "Commerce Cloud Log Center Migration 2023"; Infocenter retirement landed June 30, 2023 |

No edits were made to the published article as a result of this pass —
every claim held up. This section documents the audit trail per the
`salesforce-research` project instruction (cite official sources when a
change, or in this case a verification, relies on platform behavior).

## Related files

- `src/content/posts/the-sfcc-guide-to-finding-pod-numbers/index.md`
- Cross-linked post: `the-salesforce-b2c-commerce-cloud-environment`
