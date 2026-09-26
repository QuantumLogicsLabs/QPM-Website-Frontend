import { Link } from "react-router";
import { Clock, Download } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatCompact, formatDate, formatNumber, timeAgo } from "@/utils/format";
import Badge from "@/components/ui/Badge";
import CopyButton from "@/components/ui/CopyButton";
import Skeleton from "@/components/ui/Skeleton";
import styles from "./PackageCard.module.css";

const MAX_KEYWORDS = 3;

export default function PackageCard({ pkg }) {
  const { name, description, version, keywords, downloads, owner, updatedAt } = pkg;
  const updated = timeAgo(updatedAt);
  const extraKeywords = keywords.length - MAX_KEYWORDS;

  return (
    <article className={cn("surface", styles.card)}>
      <header className={styles.header}>
        <span className={styles.monogram} aria-hidden="true">
          {name.charAt(0).toUpperCase()}
        </span>
        <div className={styles.heading}>
          <h3 className={styles.name}>
            {/* Stretched link: the whole card is clickable, the copy button stays separate. */}
            <Link to={`/package/${encodeURIComponent(name)}`} className={styles.link}>
              {name}
            </Link>
          </h3>
          <p className={styles.byline}>
            {version && <span className="mono">v{version}</span>}
            {version && <span aria-hidden="true"> · </span>}
            <span>{owner ? `@${owner}` : "community"}</span>
          </p>
        </div>
      </header>

      <p className={cn(styles.description, !description && styles.placeholder)}>
        {description || "No description provided."}
      </p>

      {keywords.length > 0 && (
        <ul role="list" className={styles.keywords} aria-label="Keywords">
          {keywords.slice(0, MAX_KEYWORDS).map((keyword) => (
            <li key={keyword}>
              <Badge tone="cyan">#{keyword}</Badge>
            </li>
          ))}
          {extraKeywords > 0 && (
            <li>
              <Badge tone="neutral">+{extraKeywords}</Badge>
            </li>
          )}
        </ul>
      )}

      <footer className={styles.footer}>
        <span className={styles.stat} title={`${formatNumber(downloads)} downloads`}>
          <Download size={14} aria-hidden="true" />
          {formatCompact(downloads)}
          <span className="visually-hidden"> downloads</span>
        </span>
        {updated && (
          <span className={styles.stat} title={`Updated ${formatDate(updatedAt)}`}>
            <Clock size={14} aria-hidden="true" />
            {updated}
          </span>
        )}
        <CopyButton value={`qpm install ${name}`} label={`Copy install command for ${name}`} className={styles.copy} />
      </footer>
    </article>
  );
}

export function PackageCardSkeleton() {
  return (
    <div className={cn("surface", styles.card)} aria-hidden="true">
      <div className={styles.header}>
        <Skeleton width={40} height={40} radius="10px" />
        <div className={styles.heading}>
          <Skeleton width="55%" height={18} />
          <Skeleton width="35%" height={12} className={styles.skeletonGap} />
        </div>
      </div>
      <div>
        <Skeleton width="100%" height={12} />
        <Skeleton width="80%" height={12} className={styles.skeletonGap} />
      </div>
      <div className={styles.footer}>
        <Skeleton width={60} height={14} />
        <Skeleton width={80} height={14} />
      </div>
    </div>
  );
}
