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

export async function getMyPackages(token, username, { signal } = {}) {
  const data = await request("/registry/user/my-packages", { token, signal });
  return (data?.packages ?? []).map((pkg) => toSummary(pkg, username));
}

/**
 * Publishes via multipart/form-data (no base64 inflation, supports progress).
 * @param {Record<string, string>} fields
 * @param {File | null} file
 */
export function publishPackage(fields, file, { token, signal, onProgress } = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null && value !== "") form.append(key, value);
  }
  if (file) form.append("file", file);
  return upload("/registry/publish", form, { token, signal, onProgress });
}

/** @param {{ repoUrl: string, branch?: string, version: string, dependencies?: object }} payload */
export const publishFromGithub = (payload, { token, signal } = {}) =>
  request("/registry/publish-from-github", { method: "POST", body: payload, token, signal });

export const getHealth = ({ signal } = {}) => request("/health", { signal });
