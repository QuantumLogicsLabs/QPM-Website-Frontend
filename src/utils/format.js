const fullNumber = new Intl.NumberFormat("en");
const compactNumber = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const TIME_UNITS = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

export const formatNumber = (value) => fullNumber.format(value ?? 0);

export const formatCompact = (value) => compactNumber.format(value ?? 0);

export const pluralize = (count, singular, plural = `${singular}s`) =>
  `${formatNumber(count)} ${count === 1 ? singular : plural}`;

function toDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "3 days ago", "last month", "just now" */
export function timeAgo(value) {
  const date = toDate(value);
  if (!date) return null;
  const seconds = (date.getTime() - Date.now()) / 1000;
  for (const [unit, size] of TIME_UNITS) {
    if (Math.abs(seconds) >= size) return relativeTime.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

/** "Sep 26, 2026" */
export function formatDate(value) {
  const date = toDate(value);
  return date
    ? date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : null;
}

export function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export function initials(name = "") {
  return name.replace(/[^a-z0-9]/gi, "").slice(0, 2).toUpperCase() || "?";
}
