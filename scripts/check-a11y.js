import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { access, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const configPath = path.join(rootDir, ".pa11yci.json");
const pa11yCiPath = path.join(
  rootDir,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "pa11y-ci.cmd" : "pa11y-ci"
);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8"
};

function getContentType(filePath) {
  return contentTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

function toFilePath(requestPathname) {
  const decodedPath = decodeURIComponent(requestPathname);
  const normalizedPath = path.posix.normalize(decodedPath);
  const relativePath = normalizedPath === "/"
    ? "index.html"
    : normalizedPath.endsWith("/")
      ? path.posix.join(normalizedPath.slice(1), "index.html")
      : normalizedPath.slice(1);

  const resolvedPath = path.resolve(publicDir, relativePath);
  if (!resolvedPath.startsWith(publicDir)) {
    return null;
  }

  return resolvedPath;
}

async function serveFile(filePath, response) {
  const fileStats = await stat(filePath);
  if (fileStats.isDirectory()) {
    return false;
  }

  const fileBuffer = await readFile(filePath);
  response.writeHead(200, { "Content-Type": getContentType(filePath) });
  response.end(fileBuffer);
  return true;
}

async function createStaticServer() {
  await access(publicDir);

  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
      const primaryPath = toFilePath(requestUrl.pathname);

      if (!primaryPath) {
        response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Bad request");
        return;
      }

      if (await serveFile(primaryPath, response)) {
        return;
      }

      if (!path.extname(primaryPath)) {
        const fallbackPath = path.join(primaryPath, "index.html");
        if (await serveFile(fallbackPath, response)) {
          return;
        }
      }

      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
    } catch (error) {
      if (error?.code === "ENOENT") {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Not found");
        return;
      }

      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Internal server error");
    }
  });

  return await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${address.port}`,
      });
    });
  });
}

async function createGeneratedConfig(baseUrl) {
  const rawConfig = JSON.parse(await readFile(configPath, "utf8"));
  const tempDir = await mkdtemp(path.join(tmpdir(), "rhi-pa11y-"));
  const generatedConfigPath = path.join(tempDir, ".pa11yci.generated.json");
  const urls = (rawConfig.urls ?? []).map((entry) => {
    if (typeof entry === "string") {
      return new URL(entry, baseUrl).toString();
    }

    return {
      ...entry,
      url: new URL(entry.url, baseUrl).toString(),
    };
  });

  const generatedConfig = {
    ...rawConfig,
    urls,
  };

  await writeFile(generatedConfigPath, `${JSON.stringify(generatedConfig, null, 2)}\n`);

  return {
    generatedConfigPath,
    cleanup: async () => rm(tempDir, { force: true, recursive: true }),
  };
}

async function runPa11y(configFile) {
  await access(pa11yCiPath);

  return await new Promise((resolve, reject) => {
    const child = spawn(pa11yCiPath, ["--config", configFile], {
      cwd: rootDir,
      stdio: "inherit",
    });

    child.once("error", reject);
    child.once("close", (code) => resolve(code ?? 1));
  });
}

async function main() {
  const { server, baseUrl } = await createStaticServer();
  const { generatedConfigPath, cleanup } = await createGeneratedConfig(baseUrl);

  console.log(`Serving public/ at ${baseUrl}`);

  try {
    const exitCode = await runPa11y(generatedConfigPath);
    process.exitCode = exitCode;
  } finally {
    server.close();
    await cleanup();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`check:a11y failed: ${message}`);
  process.exitCode = 1;
});