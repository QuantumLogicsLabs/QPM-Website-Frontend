import { Link } from "react-router";
import { Download, ExternalLink, Globe } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatBytes, formatDate, formatNumber, timeAgo } from "@/utils/format";
import Skeleton from "@/components/ui/Skeleton";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import CommandSnippet from "@/components/ui/CommandSnippet";
import GithubIcon from "@/components/ui/GithubIcon";
import styles from "./PackageSidebar.module.css";

const isGithub = (url) => /github\.com/i.test(url);

export default function PackageSidebar({ pkg, stats }) {
  const { latestVersion } = pkg;
  const links = [
    pkg.repository && {
      href: pkg.repository,
      label: isGithub(pkg.repository) ? "GitHub repository" : "Repository",
      icon: isGithub(pkg.repository) ? GithubIcon : ExternalLink,
    },
    pkg.homepage && pkg.homepage !== pkg.repository && { href: pkg.homepage, label: "Homepage", icon: Globe },
  ].filter(Boolean);

  return (
    <>
      <section className={cn("surface", styles.card, styles.install)} aria-label="Install">
        <CommandSnippet label="Install" command={`qpm install ${pkg.name}`} />
        {latestVersion && (
          <Button href={latestVersion.tarball} download variant="secondary" block icon={Download}>
            Download v{latestVersion.version} (.tgz)
          </Button>
        )}
      </section>

      <div className={styles.side}>
        <section className={cn("surface", styles.card)} aria-labelledby="weekly-heading">
          <h2 id="weekly-heading" className={styles.heading}>
            Weekly downloads
          </h2>
          <div className={styles.weekly}>
            <span className={styles.weeklyCount}>
              {stats ? formatNumber(stats.lastWeek) : <Skeleton width={48} height={24} />}
            </span>
            {stats && <Sparkline values={stats.weekly} />}
          </div>
        </section>

        <section className={cn("surface", styles.card)} aria-labelledby="about-heading">
          <h2 id="about-heading" className={styles.heading}>
            About
          </h2>
          <dl className={styles.facts}>
            <div>
              <dt>Version</dt>
              <dd className="mono">{pkg.latest ?? "—"}</dd>
            </div>
            <div>
              <dt>License</dt>
              <dd>{pkg.license}</dd>
            </div>
            <div>
              <dt>Downloads</dt>
              <dd>{formatNumber(pkg.downloads)}</dd>
            </div>
            <div>
              <dt>Versions</dt>
              <dd>{pkg.versions.length}</dd>
            </div>
            {pkg.updatedAt && (
              <div>
                <dt>Last publish</dt>
                <dd>
                  <time dateTime={pkg.updatedAt} title={formatDate(pkg.updatedAt)}>
                    {timeAgo(pkg.updatedAt)}
                  </time>
                </dd>
              </div>
            )}
            {latestVersion?.size > 0 && (
              <div>
                <dt>Size</dt>
                <dd>{formatBytes(latestVersion.size)}</dd>
              </div>
            )}
          </dl>
        </section>

        {links.length > 0 && (
          <section className={cn("surface", styles.card)} aria-labelledby="links-heading">
            <h2 id="links-heading" className={styles.heading}>
              Links
            </h2>
            <ul role="list" className={styles.links}>
              {links.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className={styles.link}>
                    <Icon size={16} aria-hidden="true" />
                    <span className={styles.linkText}>
                      <span>{label}</span>
                      <span className={styles.linkUrl}>{href.replace(/^https?:\/\//, "")}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {pkg.owner && (
          <section className={cn("surface", styles.card)} aria-labelledby="collaborators-heading">
            <h2 id="collaborators-heading" className={styles.heading}>
              Collaborators
            </h2>
            <ul role="list" className={styles.collaborators}>
              <li title={`@${pkg.owner}`}>
                <Avatar name={pkg.owner} size={36} />
                <span>@{pkg.owner}</span>
              </li>
            </ul>
          </section>
        )}

        {pkg.keywords.length > 0 && (
          <section className={cn("surface", styles.card)} aria-labelledby="keywords-heading">
            <h2 id="keywords-heading" className={styles.heading}>
              Keywords
            </h2>
            <ul role="list" className={styles.keywords}>
              {pkg.keywords.map((keyword) => (
                <li key={keyword}>
                  <Link to={`/explore?q=${encodeURIComponent(keyword)}`} className={styles.keyword}>
                    #{keyword}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}

const SPARK_WIDTH = 160;
const SPARK_HEIGHT = 40;

/** Downloads per week over the last year, oldest on the left. */
function Sparkline({ values }) {
  const max = Math.max(...values, 1);
  const step = SPARK_WIDTH / Math.max(values.length - 1, 1);
  const points = values.map((value, index) => [
    index * step,
    SPARK_HEIGHT - 2 - (value / max) * (SPARK_HEIGHT - 4),
  ]);
  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const total = values.reduce((sum, value) => sum + value, 0);

  return (
    <svg
      className={styles.sparkline}
      viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`${formatNumber(total)} downloads over the last ${values.length} weeks`}
    >
      <polygon points={`0,${SPARK_HEIGHT} ${line} ${SPARK_WIDTH},${SPARK_HEIGHT}`} className={styles.sparkArea} />
      <polyline points={line} className={styles.sparkLine} />
    </svg>
  );
}
