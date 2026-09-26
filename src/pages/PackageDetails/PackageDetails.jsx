import { Link, useParams, useSearchParams } from "react-router";
import { ChevronRight, Clock, CloudOff, Download, FileText, History, Layers, PackageX, RefreshCw, Scale, Upload, User } from "lucide-react";
import { getPackage } from "@/api/registry";
import { useResource } from "@/hooks/useResource";
import { cn } from "@/utils/cn";
import { formatDate, formatNumber, timeAgo } from "@/utils/format";
import Markdown from "@/components/package/Markdown";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import PageMeta from "@/components/ui/PageMeta";
import Skeleton from "@/components/ui/Skeleton";
import Tabs, { TabPanel } from "@/components/ui/Tabs";
import DependenciesPanel from "./DependenciesPanel";
import PackageSidebar from "./PackageSidebar";
import VersionsPanel from "./VersionsPanel";
import styles from "./PackageDetails.module.css";

const TAB_IDS = ["readme", "versions", "dependencies"];

export default function PackageDetails() {
  const { name } = useParams();
  const [params, setParams] = useSearchParams();
  const tab = TAB_IDS.includes(params.get("tab")) ? params.get("tab") : "readme";
  const { data: pkg, error, loading, reload } = useResource((signal) => getPackage(name, { signal }), [name]);

  if (loading) return <PackageDetailsSkeleton />;

  if (error) {
    const notFound = error.status === 404;
    return (
      <div className="container page">
        <PageMeta title={notFound ? "Package not found" : "Something went wrong"} />
        {notFound ? (
          <EmptyState
            icon={PackageX}
            title="Package not found"
            description={`We couldn't find “${name}” in the QPM registry. Check the spelling, or publish it yourself.`}
          >
            <Button to="/explore" variant="secondary">
              Browse packages
            </Button>
            <Button to={`/publish?name=${encodeURIComponent(name)}`} icon={Upload}>
              Publish “{name}”
            </Button>
          </EmptyState>
        ) : (
          <EmptyState icon={CloudOff} tone="danger" title="Couldn't load this package" description={error.message}>
            <Button icon={RefreshCw} onClick={reload}>
              Try again
            </Button>
          </EmptyState>
        )}
      </div>
    );
  }

  const dependencyCount = Object.keys(pkg.latestVersion?.dependencies ?? {}).length;
  const tabs = [
    { id: "readme", label: "Readme", icon: FileText },
    { id: "versions", label: "Versions", icon: History, count: pkg.versions.length },
    { id: "dependencies", label: "Dependencies", icon: Layers, count: dependencyCount },
  ];

  const selectTab = (id) =>
    setParams(id === "readme" ? {} : { tab: id }, { replace: true, preventScrollReset: true });

  return (
    <div className="container page">
      <PageMeta title={pkg.name} />

      <nav aria-label="Breadcrumb">
        <ol role="list" className={styles.breadcrumb}>
          <li>
            <Link to="/explore">Packages</Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight size={14} />
          </li>
          <li aria-current="page" className={styles.crumbCurrent}>
            {pkg.name}
          </li>
        </ol>
      </nav>

      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.name}>{pkg.name}</h1>
          {pkg.latest && (
            <Badge tone="indigo" className={styles.version}>
              v{pkg.latest}
            </Badge>
          )}
        </div>
        <p className={cn(styles.description, !pkg.description && styles.placeholder)}>
          {pkg.description || "No description provided."}
        </p>
        <ul role="list" className={styles.meta}>
          <li>
            <User size={15} aria-hidden="true" />
            <span>
              Published by <strong>{pkg.owner ? `@${pkg.owner}` : "community"}</strong>
            </span>
          </li>
          {pkg.updatedAt && (
            <li>
              <Clock size={15} aria-hidden="true" />
              <span>
                Updated{" "}
                <time dateTime={pkg.updatedAt} title={formatDate(pkg.updatedAt)}>
                  {timeAgo(pkg.updatedAt)}
                </time>
              </span>
            </li>
          )}
          <li>
            <Download size={15} aria-hidden="true" />
            <span>{formatNumber(pkg.downloads)} downloads</span>
          </li>
          <li>
            <Scale size={15} aria-hidden="true" />
            <span>{pkg.license}</span>
          </li>
        </ul>
      </header>

      <div className={styles.layout}>
        <div className={styles.main}>
          <Tabs idPrefix="package" label="Package sections" tabs={tabs} value={tab} onChange={selectTab} />
          <TabPanel idPrefix="package" id={tab} className={cn("surface", styles.panel)}>
            {tab === "readme" &&
              (pkg.readme ? (
                <Markdown>{pkg.readme}</Markdown>
              ) : (
                <p className={styles.placeholder}>This package doesn't have a README yet.</p>
              ))}
            {tab === "versions" && <VersionsPanel pkg={pkg} />}
            {tab === "dependencies" && <DependenciesPanel dependencies={pkg.latestVersion?.dependencies ?? {}} />}
          </TabPanel>
        </div>

        <PackageSidebar pkg={pkg} />
      </div>
    </div>
  );
}

function PackageDetailsSkeleton() {
  return (
    <div className="container page" aria-busy="true">
      <span className="visually-hidden" role="status">
        Loading package…
      </span>
      <Skeleton width={160} height={14} />
      <div className={styles.header}>
        <Skeleton width="min(360px, 80%)" height={40} />
        <Skeleton width="min(560px, 100%)" height={18} className={styles.skeletonGap} />
        <Skeleton width="min(420px, 90%)" height={16} className={styles.skeletonGap} />
      </div>
      <div className={styles.layout}>
        <div className={styles.main}>
          <Skeleton width="100%" height={50} radius="12px" />
          <div className={cn("surface", styles.panel)}>
            {[90, 100, 75, 95, 60].map((width, index) => (
              <Skeleton key={index} width={`${width}%`} height={14} className={styles.skeletonGap} />
            ))}
          </div>
        </div>
        <div className={styles.skeletonSide}>
          <Skeleton width="100%" height={150} radius="18px" />
          <Skeleton width="100%" height={220} radius="18px" />
        </div>
      </div>
    </div>
  );
}
