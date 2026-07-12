/**
 * The single source of truth for the `url` front matter shape, shared by
 * scripts/validate-frontmatter.js (schema validation) and
 * scripts/gates/check-when-published.js (target validation). Keep this file
 * dependency-free: the when-published gate runs from the pre-commit hook on
 * machines that have not run `npm ci`.
 */

/** Lowercase, leading slash, `a-z 0-9 - /` only; trailing slash optional. */
export const urlPattern = /^\/(?:|[a-z0-9/-]*[a-z0-9-]\/?)$/;

/** System routes that legitimately carry an extension. */
export const systemUrlAllowlist = new Set(['/404.html']);

/**
 * Normalize a pretty URL to the form Hugo serves (`RelPermalink`): directory
 * URLs gain a trailing slash, file-like URLs (with an extension) and the
 * root stay as-is. Lets `url: /foo` front matter match a `/foo/` target.
 */
export function normalizeUrl(url) {
  if (typeof url !== 'string' || url === '' || url === '/') {
    return url;
  }
  if (url.endsWith('/') || /\.[a-z0-9]+$/u.test(url)) {
    return url;
  }
  return `${url}/`;
}
