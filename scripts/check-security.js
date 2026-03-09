import { access, readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import fg from "fast-glob"
import matter from "gray-matter"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, "..")
const publicDir = path.join(rootDir, "public")
const contentDir = path.join(rootDir, "src", "content")
const canonicalOrigin = "https://www.rhino-inquisitor.com"

const allowedSourceHttpSnippets = new Map([
  [
    "src/layouts/partials/media/image.html",
    ['hasPrefix $requestedSrc "http://"'],
  ],
  [
    "src/layouts/partials/seo/resolve.html",
    ['hasPrefix . "http://"'],
  ],
  [
    "src/layouts/sitemap.xml",
    ['xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'],
  ],
  [
    "src/static/images/social-default.svg",
    ['xmlns="http://www.w3.org/2000/svg"'],
  ],
])

const blockedArtifactNames = new Set(["package.json", "package-lock.json", "README.md"])
const blockedArtifactDirectories = new Set(["analysis", "migration", "scripts", "tmp"])

function toPosixPath(filePath) {
  return filePath.split(path.sep).join("/")
}

function normalizeRoute(route) {
  const parsed = new URL(route, canonicalOrigin)
  const pathname = parsed.pathname || "/"

  if (pathname === "/") {
    return pathname
  }

  return pathname.endsWith("/") ? pathname : `${pathname}/`
}

function routeToOutputPath(route) {
  if (route === "/") {
    return path.join(publicDir, "index.html")
  }

  return path.join(publicDir, route.replace(/^\//, ""), "index.html")
}

function fallbackRouteFromContentPath(filePath) {
  const relativePath = toPosixPath(path.relative(contentDir, filePath)).replace(/\.[^.]+$/, "")

  if (relativePath.endsWith("/_index")) {
    const directory = relativePath.slice(0, -"/_index".length)
    return directory ? `/${directory}/` : "/"
  }

  return `/${relativePath}/`
}

function getSourceLineFailures(relativePath, source) {
  const allowedSnippets = allowedSourceHttpSnippets.get(relativePath) ?? []
  const failures = []
  const lines = source.split(/\r?\n/)

  for (const [index, line] of lines.entries()) {
    if (!line.includes("http://")) {
      continue
    }

    const isAllowed = allowedSnippets.some((snippet) => line.includes(snippet))
    if (isAllowed) {
      continue
    }

    failures.push(`${relativePath}:${index + 1} contains unexpected http:// reference -> ${line.trim()}`)
  }

  return failures
}

function findAttributeFailures(relativePath, html) {
  const failures = []
  const attributePattern = /\b(href|src|action)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi

  for (const match of html.matchAll(attributePattern)) {
    const attributeName = match[1]
    const attributeValue = match[2] ?? match[3] ?? match[4] ?? ""

    if (attributeValue.startsWith("http://")) {
      failures.push(`${relativePath} contains ${attributeName}=${attributeValue}`)
    }
  }

  return failures
}

function findExternalScriptFailures(relativePath, html) {
  const failures = []
  const scriptPattern = /<script\b[^>]*\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi

  for (const match of html.matchAll(scriptPattern)) {
    const src = match[1] ?? match[2] ?? match[3] ?? ""

    if (src.startsWith("//")) {
      failures.push(`${relativePath} contains scheme-relative script src (${src})`)
      continue
    }

    if (src.startsWith("http://") || src.startsWith("https://")) {
      const parsed = new URL(src)
      if (parsed.origin !== canonicalOrigin) {
        failures.push(`${relativePath} contains external script src (${src})`)
      }
    }
  }

  return failures
}

async function checkSourceTemplates() {
  const sourceFiles = await fg(["src/layouts/**/*", "src/static/**/*"], {
    cwd: rootDir,
    absolute: true,
    onlyFiles: true,
  })

  const failures = []

  for (const filePath of sourceFiles) {
    const source = await readFile(filePath, "utf8")
    const relativePath = toPosixPath(path.relative(rootDir, filePath))
    failures.push(...getSourceLineFailures(relativePath, source))
  }

  return failures
}

async function checkBuiltHtml() {
  const htmlFiles = await fg("**/*.html", {
    cwd: publicDir,
    absolute: true,
    onlyFiles: true,
  })

  const failures = []

  for (const filePath of htmlFiles) {
    const html = await readFile(filePath, "utf8")
    const relativePath = toPosixPath(path.relative(publicDir, filePath))
    failures.push(...findAttributeFailures(relativePath, html))
    failures.push(...findExternalScriptFailures(relativePath, html))
  }

  return failures
}

async function checkArtifactIsolation() {
  const outputFiles = await fg("**/*", {
    cwd: publicDir,
    absolute: true,
    onlyFiles: true,
  })

  const failures = []

  for (const filePath of outputFiles) {
    const relativePath = toPosixPath(path.relative(publicDir, filePath))
    const segments = relativePath.split("/")
    const fileName = segments.at(-1) ?? ""

    if (relativePath.endsWith(".md")) {
      failures.push(`${relativePath} should not exist in public output`)
    }

    if (blockedArtifactNames.has(fileName)) {
      failures.push(`${relativePath} should not exist in public output`)
    }

    if (segments.some((segment) => blockedArtifactDirectories.has(segment))) {
      failures.push(`${relativePath} is inside a blocked artifact directory`)
    }
  }

  return failures
}

async function checkDraftExclusion() {
  const contentFiles = await fg("**/*.md", {
    cwd: contentDir,
    absolute: true,
    onlyFiles: true,
  })
  const sitemapPath = path.join(publicDir, "sitemap.xml")
  const sitemapXml = await readFile(sitemapPath, "utf8")
  const failures = []

  for (const filePath of contentFiles) {
    const source = await readFile(filePath, "utf8")
    const { data } = matter(source)

    if (data.draft !== true) {
      continue
    }

    const route = normalizeRoute(data.url ?? fallbackRouteFromContentPath(filePath))
    const outputPath = routeToOutputPath(route)
    const sitemapEntry = `${canonicalOrigin}${route}`

    try {
      await access(outputPath)
      failures.push(`${toPosixPath(path.relative(rootDir, filePath))} rendered draft output at ${toPosixPath(path.relative(publicDir, outputPath))}`)
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw error
      }
    }

    if (sitemapXml.includes(sitemapEntry)) {
      failures.push(`${toPosixPath(path.relative(rootDir, filePath))} appears in sitemap.xml as ${sitemapEntry}`)
    }
  }

  return failures
}

async function main() {
  await access(publicDir)

  const sourceFailures = await checkSourceTemplates()
  const htmlFailures = await checkBuiltHtml()
  const artifactFailures = await checkArtifactIsolation()
  const draftFailures = await checkDraftExclusion()
  const failures = [
    ...sourceFailures,
    ...htmlFailures,
    ...artifactFailures,
    ...draftFailures,
  ]

  if (failures.length > 0) {
    console.error("check:security failed")
    for (const failure of failures) {
      console.error(`- ${failure}`)
    }
    process.exitCode = 1
    return
  }

  console.log("check:security passed")
  console.log("- no unexpected http:// references in src/layouts/ or src/static/")
  console.log("- no http:// href/src/action attributes in built HTML")
  console.log("- no external runtime script src values in built HTML")
  console.log("- no migration, analysis, tmp, script, package, or markdown artifacts in public/")
  console.log("- no draft content emitted to public/ or sitemap.xml")
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`check:security failed: ${message}`)
  process.exitCode = 1
})