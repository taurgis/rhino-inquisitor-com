import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { google } from "googleapis";

function parseArgs(argv) {
	const args = {};
	for (let index = 0; index < argv.length; index += 1) {
		const token = argv[index];
		if (!token.startsWith("--")) {
			continue;
		}

		const key = token.slice(2);
		const next = argv[index + 1];
		if (!next || next.startsWith("--")) {
			args[key] = true;
			continue;
		}

		args[key] = next;
		index += 1;
	}
	return args;
}

function resolveCredentialPath(inputPath) {
	if (inputPath) {
		return path.resolve(inputPath);
	}

	if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
		return path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
	}

	return null;
}

async function ensureFileReadable(filePath) {
	await access(filePath);
	const raw = await readFile(filePath, "utf8");
	return JSON.parse(raw);
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	const property = args.property || "sc-domain:rhino-inquisitor.com";
	const reportPath = path.resolve(
		args.report || "tmp/rhi-093-search-console-auth-check.json",
	);
	const credentialPath = resolveCredentialPath(args.credentials);

	const report = {
		runTimestamp: new Date().toISOString(),
		environment: args.environment || "production",
		commitSha: process.env.GITHUB_SHA || process.env.VERCEL_GIT_COMMIT_SHA || null,
		status: "fail",
		owner: args.owner || "Thomas Theunen",
		property,
		credentialPath,
		quotaCheck: "metadata-only",
		findings: [],
	};

	try {
		if (!credentialPath) {
			throw new Error(
				"No credential path provided. Pass --credentials or set GOOGLE_APPLICATION_CREDENTIALS.",
			);
		}

		const credentials = await ensureFileReadable(credentialPath);
		if (!credentials.client_email || !credentials.private_key) {
			throw new Error(
				"Credential file is missing service-account fields client_email/private_key.",
			);
		}

		const auth = new google.auth.GoogleAuth({
			credentials,
			scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
		});

		const client = await auth.getClient();
		await client.getAccessToken();

		const webmasters = google.searchconsole({ version: "v1", auth });
		const response = await webmasters.sites.list();
		const siteEntries = response.data.siteEntry || [];
		const matchedProperty = siteEntries.find((entry) => entry.siteUrl === property) || null;

		report.siteEntryCount = siteEntries.length;
		report.matchedProperty = matchedProperty;
		report.status = matchedProperty ? "pass" : "warn";

		if (!matchedProperty) {
			report.findings.push(
				`Authenticated successfully, but property ${property} was not returned by Search Console API.`,
			);
		} else {
			report.findings.push(
				`Authenticated successfully and confirmed property ${property} with permission level ${matchedProperty.permissionLevel}.`,
			);
		}
	} catch (error) {
		report.error = error instanceof Error ? error.message : String(error);
		report.findings.push(report.error);
	}

	await mkdir(path.dirname(reportPath), { recursive: true });
	await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

	if (report.status === "fail") {
		process.exitCode = 1;
	}

	console.log(`Wrote Search Console auth report to ${reportPath}`);
	console.log(`Status: ${report.status}`);
}

await main();