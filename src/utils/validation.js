// Client-side checks that mirror what the registry accepts, so authors get
// feedback before a round-trip (and before a large upload).

const PACKAGE_NAME_RE = /^[a-z0-9][a-z0-9._-]*$/;
const SEMVER_RE = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
// Same pattern the backend uses in /publish-from-github.
const GITHUB_REPO_RE = /github\.com[/:]([^/]+)\/([^/#?]+?)(?:\.git)?\/?$/i;
const TARBALL_RE = /\.(tgz|tar\.gz)$/i;

export const MAX_TARBALL_BYTES = 100 * 1024 * 1024; // multer limit on the backend

export function validatePackageName(name) {
  if (!name) return "Package name is required.";
  if (name.length > 214) return "Package names must be 214 characters or fewer.";
  if (!PACKAGE_NAME_RE.test(name)) {
    return "Use lowercase letters, numbers, dashes, dots or underscores (no spaces).";
  }
  return null;
}

export function validateVersion(version) {
  if (!version) return "Version is required.";
  if (!SEMVER_RE.test(version)) return "Use semantic versioning, e.g. 1.0.0 or 2.1.0-beta.1.";
  return null;
}

export function validateUrl(url) {
  if (!url) return null;
  try {
    const { protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:" ? null : "Use an http(s) URL.";
  } catch {
    return "Enter a full URL, including https://";
  }
}

export function parseGithubRepo(url) {
  const match = url.trim().match(GITHUB_REPO_RE);
  return match ? { owner: match[1], repo: match[2] } : null;
}

export function validateGithubRepo(url) {
  if (!url) return "Repository URL is required.";
  return parseGithubRepo(url) ? null : "Use a GitHub repository URL, e.g. https://github.com/owner/repo";
}

export function validateTarball(file) {
  if (!file) return null;
  if (!TARBALL_RE.test(file.name)) return "Choose a .tgz or .tar.gz archive.";
  if (file.size > MAX_TARBALL_BYTES) return "Archives must be 100 MB or smaller.";
  return null;
}

/** Rows come from <DependencyEditor>: [{ key, name, range }]. Blank rows are ignored. */
export function validateDependencies(rows) {
  const seen = new Set();
  for (const row of rows) {
    const name = row.name.trim();
    const range = row.range.trim();
    if (!name && !range) continue;
    if (!name) return "Every dependency needs a package name.";
    if (!PACKAGE_NAME_RE.test(name)) return `“${name}” isn't a valid package name.`;
    if (!range) return `Add a version range for “${name}”, e.g. ^1.0.0.`;
    if (seen.has(name)) return `“${name}” is listed more than once.`;
    seen.add(name);
  }
  return null;
}

export const dependenciesToObject = (rows) =>
  Object.fromEntries(
    rows.filter((row) => row.name.trim()).map((row) => [row.name.trim(), row.range.trim() || "*"]),
  );

/** "quantum, Math ,  matrix" → ["quantum", "math", "matrix"] (deduplicated) */
export function parseKeywords(input) {
  const words = input
    .split(",")
    .map((word) => word.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set(words)];
}

/** "quantum-utils-1.2.0.tgz" → { name: "quantum-utils", version: "1.2.0" } */
export function guessFromFilename(filename) {
  const base = filename.replace(TARBALL_RE, "");
  const match = base.match(/^(.+?)-(\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.+-]+)?)$/);
  const name = (match ? match[1] : base).toLowerCase();
  return { name, version: match ? match[2] : null };
}
