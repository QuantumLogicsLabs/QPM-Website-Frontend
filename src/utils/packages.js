/** Sort options for package lists, keyed by the value stored in ?sort= */
export const PACKAGE_SORTS = {
  downloads: {
    label: "Most downloaded",
    compare: (a, b) => b.downloads - a.downloads,
  },
  updated: {
    label: "Recently updated",
    compare: (a, b) => new Date(b.updatedAt ?? 0) - new Date(a.updatedAt ?? 0),
  },
  name: {
    label: "Name (A–Z)",
    compare: (a, b) => a.name.localeCompare(b.name),
  },
};

/** Most frequent keywords across `packages`, most common first. */
export function topKeywords(packages, limit = 8) {
  const counts = new Map();
  for (const pkg of packages) {
    for (const keyword of pkg.keywords) {
      const key = keyword.toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([keyword]) => keyword);
}
