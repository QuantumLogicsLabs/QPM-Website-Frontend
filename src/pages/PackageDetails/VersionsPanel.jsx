import { Download } from "lucide-react";
import { formatDate, timeAgo } from "@/utils/format";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import styles from "./Panels.module.css";

export default function VersionsPanel({ pkg }) {
  if (pkg.versions.length === 0) {
    return <p className={styles.empty}>No versions have been published yet.</p>;
  }

  return (
    <>
      <h2 className={styles.heading}>Version history</h2>
      <ol role="list" className={styles.list}>
        {pkg.versions.map(({ version, publishedAt, tarball }) => (
          <li key={version} className={styles.row}>
            <div className={styles.primary}>
              <span className={styles.version}>v{version}</span>
              {version === pkg.latest && <Badge tone="cyan">latest</Badge>}
            </div>
            <time className={styles.secondary} dateTime={publishedAt ?? undefined} title={formatDate(publishedAt) ?? undefined}>
              {timeAgo(publishedAt) ?? "—"}
            </time>
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
          </li>
        ))}
      </ol>
    </>
  );
}
