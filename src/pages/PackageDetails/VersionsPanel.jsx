import { Download } from "lucide-react";
import { formatDate, formatNumber, timeAgo } from "@/utils/format";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import styles from "./Panels.module.css";

/** Downloads in the last 7 days, or a dash while stats are loading/unavailable. */
const weekDownloads = (stats, version) => (stats ? formatNumber(stats.versions?.[version] ?? 0) : "—");

export default function VersionsPanel({ pkg, stats, onViewCode }) {
  if (pkg.versions.length === 0) {
    return <p className={styles.empty}>No versions have been published yet.</p>;
  }

  return (
    <>
      <h2 className={styles.heading}>Current tags</h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Version</th>
              <th scope="col" className={styles.numeric}>
                Downloads (last 7 days)
              </th>
              <th scope="col" className={styles.numeric}>
                Tag
              </th>
            </tr>
          </thead>
          <tbody>
            {pkg.latest && (
              <tr>
                <td>
                  <button type="button" className={styles.versionLink} onClick={() => onViewCode(pkg.latest)}>
                    {pkg.latest}
                  </button>
                </td>
                <td className={styles.numeric}>{weekDownloads(stats, pkg.latest)}</td>
                <td className={styles.numeric}>
                  <Badge tone="cyan">latest</Badge>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className={styles.heading}>Version history</h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Version</th>
              <th scope="col" className={styles.numeric}>
                Downloads (last 7 days)
              </th>
              <th scope="col" className={styles.numeric}>
                Published
              </th>
              <th scope="col">
                <span className="visually-hidden">Download</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {pkg.versions.map(({ version, publishedAt, tarball }) => (
              <tr key={version}>
                <td>
                  <button
                    type="button"
                    className={styles.versionLink}
                    title={`Browse the code of v${version}`}
                    onClick={() => onViewCode(version)}
                  >
                    {version}
                  </button>
                </td>
                <td className={styles.numeric}>{weekDownloads(stats, version)}</td>
                <td className={styles.numeric}>
                  <time dateTime={publishedAt ?? undefined} title={formatDate(publishedAt) ?? undefined}>
                    {timeAgo(publishedAt) ?? "—"}
                  </time>
                </td>
                <td className={styles.action}>
                  <Button
                    href={tarball}
                    download
                    variant="ghost"
                    size="sm"
                    icon={Download}
                    aria-label={`Download ${pkg.name}@${version}`}
                  >
                    .tgz
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
