import { API_BASE, request, upload } from "./client";

/** The backend caps /registry/search at this many results. */
export const SEARCH_LIMIT = 50;

// The backend reports ownerless (guest-published) packages as "anonymous".
const normalizeOwner = (owner) => (owner && owner !== "anonymous" ? owner : null);

/**
 * /search and /user/my-packages return different shapes (the latter is a raw
 * Mongo document), so both are mapped onto one summary shape here.
 */
function toSummary(raw, ownerOverride) {
  return {
    name: raw.name,
    description: raw.description || "",
    keywords: Array.isArray(raw.keywords) ? raw.keywords.filter(Boolean) : [],
    version: raw.latest_version ?? raw.latestVersion ?? null,
    downloads: raw.downloads ?? 0,
    updatedAt: raw.updated_at ?? raw.updatedAt ?? null,
    owner: normalizeOwner(ownerOverride ?? (typeof raw.owner === "string" ? raw.owner : raw.owner?.username)),
  };
}

/** Same-origin tarball URL (the backend's dist.tarball uses its own host). */
export const tarballUrl = (name, version) =>
  `${API_BASE}/registry/${encodeURIComponent(name)}/-/${encodeURIComponent(`${name}-${version}`)}.tgz`;

export async function searchPackages(query = "", { signal } = {}) {
  const qs = query ? `?q=${encodeURIComponent(query)}` : "";
  const data = await request(`/registry/search${qs}`, { signal });
  return {
    packages: (data?.objects ?? []).map((pkg) => toSummary(pkg)),
    total: data?.total ?? 0,
  };
}

export async function getPackage(name, { signal } = {}) {
  const data = await request(`/registry/${encodeURIComponent(name)}`, { signal });

  const versions = Object.entries(data.versions ?? {})
    .map(([version, meta]) => ({
      version,
      description: meta.description || "",
      dependencies: meta.dependencies ?? {},
      size: meta.dist?.unpackedSize || 0,
      publishedAt: data.time?.[version] ?? null,
      tarball: tarballUrl(data.name, version),
    }))
    .sort((a, b) => new Date(b.publishedAt ?? 0) - new Date(a.publishedAt ?? 0));

  const latest = data["dist-tags"]?.latest ?? versions[0]?.version ?? null;
  const latestVersion = versions.find((v) => v.version === latest) ?? versions[0] ?? null;

  return {
    name: data.name,
    description: data.description || "",
    keywords: (data.keywords ?? []).filter(Boolean),
    license: data.license || "MIT",
    homepage: data.homepage || "",
    repository: data.repository || "",
    readme: data.readme || "",
    downloads: data.downloads ?? 0,
    owner: normalizeOwner(data.owner),
    latest,
    latestVersion,
    versions,
    updatedAt: latestVersion?.publishedAt ?? null,
  };
}

const versionPath = (name, version) =>
  `/registry/${encodeURIComponent(name)}/v/${encodeURIComponent(version)}`;

/** Every file in a version's tarball: `{ path, size }[]`, sorted by path. */
export async function getPackageFiles(name, version, { signal } = {}) {
  // "no-store": a version can be deleted and republished under the same number, so a
  // response the browser kept (e.g. an old "files weren't saved" error) must never be reused.
  const data = await request(`${versionPath(name, version)}/files`, { signal, cache: "no-store" });
  return data?.files ?? [];
}

/** One file's contents; `content` is null when the file is binary or too large to show. */
export const getPackageFile = (name, version, path, { signal } = {}) =>
  request(`${versionPath(name, version)}/file?path=${encodeURIComponent(path)}`, { signal, cache: "no-store" });

export async function getMyPackages(token, username, { signal } = {}) {
  const data = await request("/registry/user/my-packages", { token, signal });
  return (data?.packages ?? []).map((pkg) => toSummary(pkg, username));
}

/** Raw bytes of one file (used for image previews and the "Raw" link). */
export const rawFileUrl = (name, version, path) =>
  `${API_BASE}${versionPath(name, version)}/raw?path=${encodeURIComponent(path)}`;

/** `{ weekly: number[52] (oldest first), lastWeek: number, versions: { [version]: downloadsLast7Days } }` */
export const getPackageStats = (name, { signal } = {}) =>
  request(`/registry/${encodeURIComponent(name)}/stats`, { signal, cache: "no-store" });

/** Packages whose latest version depends on `name`: `{ name, version, description, range }[]` */
export async function getPackageDependents(name, { signal } = {}) {
  const data = await request(`/registry/${encodeURIComponent(name)}/dependents`, { signal, cache: "no-store" });
  return data?.dependents ?? [];
}

/** The backend rejects package descriptions longer than this. */
export const MAX_DESCRIPTION_LENGTH = 280;

/** Changes a package's description. Only its owner may do this. */
export const updatePackageDescription = (name, description, { token, signal } = {}) =>
  request(`/registry/${encodeURIComponent(name)}`, { method: "PATCH", body: { description }, token, signal });

/** Deletes a package and all of its versions. Only its owner may do this. */
export const deletePackage = (name, { token, signal } = {}) =>
  request(`/registry/${encodeURIComponent(name)}`, { method: "DELETE", token, signal });

/**
 * Publishes via multipart/form-data (no base64 inflation, supports progress).
 * @param {Record<string, string>} fields
 * @param {{ file: File, path: string, packagePath?: string }[]} files  Loose files / a folder; the registry packs them into a .tgz.
 */
export function publishPackage(fields, files = [], { token, signal, onProgress } = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null && value !== "") form.append(key, value);
  }
  if (files.length) {
    // `paths` goes first so the server sees it before the file parts; it maps 1:1 to `files`.
    form.append("paths", JSON.stringify(files.map((item) => item.packagePath ?? item.path)));
    for (const item of files) form.append("files", item.file, item.file.name);
  }
  return upload("/registry/publish", form, { token, signal, onProgress });
}

/** @param {{ repoUrl: string, branch?: string, version: string, dependencies?: object }} payload */
export const publishFromGithub = (payload, { token, signal } = {}) =>
  request("/registry/publish-from-github", { method: "POST", body: payload, token, signal });

export const getHealth = ({ signal } = {}) => request("/health", { signal });
