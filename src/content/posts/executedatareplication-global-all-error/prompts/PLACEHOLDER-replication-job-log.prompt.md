# Screenshot brief: PLACEHOLDER-replication-job-log.png

**Kind:** Real screenshot capture. Do not generate this image.

**Purpose and placement:** In the section "Verify It Yourself", step 4 ("Open the job log and check that each global task, for example `csc_settings`, shows as processed"). It replaces the `<!-- TODO author ... -->` comment and the placeholder image line right after the numbered list, before the paragraph starting "Two docs details are worth knowing...". It is evidence that the proposed `"global": { "all": true }` configuration really replicated every global task, so it must come from a real, verified run.

**Final file name:** `executedatareplication-global-all-error-job-log.png` (rename from the PLACEHOLDER name; plain kebab-case, no hash), stored next to `index.md`.

## What to capture

1. On a sandbox or staging instance (not production), create a job with an `ExecuteDataReplication` step. Set `ReplicationConfiguration` to the proposed JSON with `"target": "development"` and `"tasks": { "global": { "all": true } }`. Save it.
2. Run the job. Business Manager path: Administration > Operations > Jobs, select the job, Run. Wait for it to finish.
3. Open the finished execution and click the log file link (the job's execution detail page, "Log File"). The URL looks like `/on/demandware.servlet/webdav/Sites/Logs/jobs/<job-id>/Job-<job-id>-<timestamp>.log`.
4. Capture the browser window (or crop to the log) showing:
   - the lines where the replication step starts and finishes, and
   - the individual global tasks listed as processed, with `csc_settings` visible.
5. Keep the final state: the run completed successfully, with no schema error.

## Redaction and hygiene

- Redact instance host names, user names, email addresses, tokens and customer data. Use solid blocks, not blur.
- Crop out browser chrome and bookmarks. Capture at 2x for readability, width about 1400 px at most, PNG.
- If the log does not show every global task, do not publish the claim; update the post's Update box instead.

## Suggested front matter / shortcode

Replace the markdown image with:

```md
{{< img-caption src="executedatareplication-global-all-error-job-log.png" alt="Job log of a data replication run listing each processed global task, including csc_settings" caption="Each global task gets its own log line, so a missing one is visible at a glance." >}}
```

Alt text: 90 characters, under the 125 limit, and describes the image. The caption makes the argument (the log, not the saved configuration, is the proof) and does not restate the alt text or use "Figure 1". Adjust the caption wording if the real log shows something different (for example, only some tasks processed).
