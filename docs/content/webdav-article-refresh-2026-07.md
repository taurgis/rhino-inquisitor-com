# WebDAV beginner's guide — July 2026 audit and refresh

## Change summary

`src/content/posts/a-beginners-guide-to-webdav-in-sfcc/index.md` was audited
against the official Salesforce B2C Commerce documentation and expanded. The
original article covered use cases and the two authentication paths, but left
the platform's deviations from the WebDAV standard as a hand-wave
("versioning capabilities (Not enabled on SFCC - as far as we know)") and
said nothing about the folder layout, access keys, size limits, retention
clocks, or the script-side client. The refresh replaces the hedge with
sourced statements and adds the missing sections, following the same
lead-with-current-state playbook as the earlier custom-endpoints refresh.

## Old vs new behavior

| Aspect | Old | New |
|--------|-----|-----|
| Versioning claim | Parenthetical "as far as we know" inside the protocol intro | Dedicated "Where SFCC Parts Ways With the Standard" section: no DeltaV (RFC 3253), no `LOCK`/`UNLOCK` (class 1 server), documented `COPY` deviation from RFC 4918 (silent no-op since 22.3) |
| Folder coverage | Folders mentioned only incidentally in permission examples | "The Folder Map" section: URL prefix, all top-level folders, read-only `/securitylogs`, Business Manager Folder Browser, HTTPS enforcement |
| Authentication | Basic Auth (BM users) and API client tokens only | Adds access keys as an optional scoped substitute for the password: MFA covers interactive logins only and is not challenged for WebDAV API logins (username/password keeps working), one-year expiry, six-attempt lockout, shown-once behaviour. An earlier draft of this refresh wrongly claimed MFA blocks password auth for WebDAV; corrected after an owner fact-check against the B2C Commerce MFA FAQ |
| Limits and retention | Absent | 500 MB upload cap (100→500 in 22.9), 200 MB download cap, five-minute timeout, `ZIP`/`UNZIP` verbs, 30-day impex purge (7-day sandbox job logs), 30/90-day log retention with 3-day gzip archive, 100,000-file folder cap, timestamp reset |
| Script API | Absent | `dw.net.WebDAVClient` section: supported methods, get() size ceilings, cannot connect to any B2C instance's WebDAV server |
| JSON permissions example | Missing closing `]` and `}` (invalid JSON) | Fixed to match the official example |
| Wikipedia link | Dutch Wikipedia (`nl.wikipedia.org`) | English Wikipedia |
| Front matter | `lastmod` 2026-07-07T18:30 | `lastmod` bumped to 19:00; takeaways rewritten for the new scope (title, description, url untouched) |
| Opening and voice | Generic two-sentence opening ("File Management is critical and necessary...") | Scenario opening (the vanished April export) matching the register of the newest posts, with a callback in the housekeeping section and the closing paragraph; conversion artifacts in the API-client example paragraph (stray quote marks, escaped underscore) fixed on touch |

## Fact-check notes

Claims verified in July 2026 against the Salesforce Help WebDAV pages (Using
WebDAV, Access WebDAV Files, WebDAV Authentication and Authorization, WebDAV
Client Permissions, WebDAV Permissions, Create an Access Key for Logins, File
Size and Transfer Restrictions, WebDAV Timestamp Reset), the B2C log files
developer guide, the `dw.net.WebDAVClient` Script API page, and the 22.3/22.9
release notes. Key sourced numbers: 500 MB upload / 200 MB download / 5-minute
timeout; impex 30 days; logs 30 days (archive after 3), security logs 90
days; 100,000 files per folder; WebDAVClient string get 2 MB default / 10 MB
max, file get 5 MB default / 200 MB max; access keys expire after one year
and lock after six failed attempts. Per the B2C Commerce Multi-Factor
Authentication FAQ and the May 2022 enforcement release note, MFA applies to
interactive logins (Business Manager, Account Manager, Log Center, Control
Center, On-Demand Sandboxes) and is not challenged for API logins such as
WebDAV File Access — the Account Manager password remains valid there and
access keys are an optional substitute, confirmed by the site owner from
field experience. The command lists (read: GET, OPTIONS,
PROPFIND; write: PUT, POST, DELETE, MKCOL, COPY, MOVE, PROPPATCH, ZIP, UNZIP)
come from the WebDAV Client Permissions page; the absence of LOCK/UNLOCK and
DeltaV verbs grounds the no-locking/no-versioning statements.

## Impact and verification

- Impacted: one published post, plus two additions to
  `scripts/gates/spelling-allow.txt` (`securitylogs`, `subfolder`). URL,
  aliases, title, description, and hero image untouched.
- Verified with: `npm run validate:frontmatter`, `npm run check:spelling`,
  `markdownlint-cli2` on the post, and a full `npm run build:local` Hugo
  build.

## Related files

- `src/content/posts/a-beginners-guide-to-webdav-in-sfcc/index.md`
- `scripts/gates/spelling-allow.txt`
- Cross-linked posts: `the-salesforce-b2c-commerce-cloud-environment`,
  `delta-exports-in-salesforce-b2c-commerce-cloud`,
  `a-survival-guide-to-sfcc-platform-limits`,
  `salesforce-b2c-commerce-cloud-22-9-release`
