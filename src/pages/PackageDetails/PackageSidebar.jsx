import { Link } from "react-router";
import { Download, ExternalLink, Globe } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatBytes, formatDate, formatNumber, timeAgo } from "@/utils/format";
import Button from "@/components/ui/Button";
import CommandSnippet from "@/components/ui/CommandSnippet";
import GithubIcon from "@/components/ui/GithubIcon";
import styles from "./PackageSidebar.module.css";

const isGithub = (url) => /github\.com/i.test(url);

export default function PackageSidebar({ pkg }) {
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
