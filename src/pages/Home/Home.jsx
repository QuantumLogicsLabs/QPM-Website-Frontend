import { useMemo } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  HardDrive,
  Network,
  PackageSearch,
  RefreshCw,
  ShieldCheck,
  Upload,
  Zap,
} from "lucide-react";
import { SEARCH_LIMIT, searchPackages } from "@/api/registry";
import { useAuth } from "@/hooks/useAuth";
import { useResource } from "@/hooks/useResource";
import { cn } from "@/utils/cn";
import { formatCompact } from "@/utils/format";
import SearchBar from "@/components/layout/SearchBar";
import PackageGrid from "@/components/package/PackageGrid";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import CommandSnippet from "@/components/ui/CommandSnippet";
import EmptyState from "@/components/ui/EmptyState";
import PageMeta from "@/components/ui/PageMeta";
import Skeleton from "@/components/ui/Skeleton";
import { topKeywords } from "@/utils/packages";
import styles from "./Home.module.css";

const FEATURES = [
  {
    icon: Network,
    title: "Speaks the npm protocol",
    body: "Package documents are served in an npm-compatible shape — dist-tags, versions and tarballs — so the qpm CLI reads straight from it.",
  },
  {
    icon: HardDrive,
    title: "Tarballs on Google Drive",
    body: "Every published .tgz streams into Google Drive and back out on install. No object-storage bill, no extra infrastructure.",
  },
  {
    icon: Zap,
    title: "Searchable metadata",
    body: "Names, versions, keywords, dependencies and download counts live in MongoDB behind text indexes for instant search.",
  },
  {
    icon: ShieldCheck,
    title: "Names belong to their authors",
    body: "Publish to the community namespace, or sign in and the registry locks each package name to your account.",
  },
];

const STEPS = [
  {
    title: "Find",
    body: "Search by name, description or keyword. Read the README, browse the code, check the versions.",
    action: { to: "/explore", label: "Browse the registry" },
  },
  {
    title: "Install",
    body: "Pull any package into your project with the qpm CLI.",
    command: "qpm install quantum-core",
  },
  {
    title: "Publish",
    body: "Upload a folder or a .tgz, or import straight from a public GitHub repository.",
    action: { to: "/publish", label: "Publish a package" },
  },
];

export default function Home() {
  const { user, openAuth } = useAuth();
  const { data, error, initialLoading, reload } = useResource(
    (signal) => searchPackages("", { signal }),
    [],
  );

  const packages = useMemo(() => data?.packages ?? [], [data]);
  const stats = useMemo(() => {
    const capped = (data?.total ?? 0) >= SEARCH_LIMIT;
    const owners = new Set(packages.map((pkg) => pkg.owner ?? "community"));
    return [
      { label: "Packages", value: `${packages.length}${capped ? "+" : ""}` },
      {
        label: "Downloads",
        value: `${formatCompact(packages.reduce((sum, pkg) => sum + pkg.downloads, 0))}${capped ? "+" : ""}`,
      },
      { label: "Publishers", value: `${owners.size}${capped ? "+" : ""}` },
    ];
  }, [data, packages]);
  const tags = useMemo(() => topKeywords(packages, 5), [packages]);

  const sample = packages[0]?.name ?? "quantum-equations";

  return (
    <>
      <PageMeta />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={cn("container", styles.heroGrid)}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowDot} aria-hidden="true" />
              Package registry for Quantum Language
            </p>
            <h1 className={styles.title}>
              Ship Quantum code in one command<span className="text-accent">.</span>
            </h1>
            <p className={styles.lead}>
              Find community modules, publish your own from a folder or a GitHub repo, and pull anything into
              your project with <code>qpm install</code>.
            </p>

            <SearchBar size="lg" placeholder="Search packages…" className={styles.heroSearch} />

            {tags.length > 0 && (
              <p className={styles.trending}>
                <span>Popular</span>
                {tags.map((tag) => (
                  <Link key={tag} to={`/explore?q=${encodeURIComponent(tag)}`} className={styles.trendingTag}>
                    {tag}
                  </Link>
                ))}
              </p>
            )}
          </div>

          <div className={styles.terminal} aria-hidden="true">
            <div className={styles.terminalBar}>
              <span />
              <span />
              <span />
              <em>~/my-project</em>
            </div>
            <pre className={styles.terminalBody}>
              <span className={styles.prompt}>$</span> qpm install {sample}
              {"\n"}
              <span className={styles.dim}>  resolving {sample}@latest</span>
              {"\n"}
              <span className={styles.dim}>  fetching tarball from registry</span>
              {"\n"}
              <span className={styles.ok}>  ✓</span> added 1 package
              {"\n\n"}
              <span className={styles.prompt}>$</span> <span className={styles.cursor} />
            </pre>
          </div>
        </div>

        <div className="container">
          <dl className={styles.stats}>
            {stats.map(({ label, value }) => (
              <div key={label} className={styles.stat}>
                <dt>{label}</dt>
                <dd>{initialLoading ? <Skeleton width={56} height={30} /> : error ? "—" : value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Popular packages */}
      <section className={styles.section} aria-labelledby="popular-heading">
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionIndex}>01</p>
              <h2 id="popular-heading" className={styles.sectionTitle}>
                Popular packages
              </h2>
            </div>
            <Link to="/explore" className={styles.sectionLink}>
              View all <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          {error ? (
            <Alert
              tone="error"
              title="Couldn't load packages"
              action={
                <Button variant="secondary" size="sm" icon={RefreshCw} onClick={reload}>
                  Retry
                </Button>
              }
            >
              {error.message}
            </Alert>
          ) : initialLoading ? (
            <PackageGrid loading skeletonCount={6} />
          ) : packages.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              tone="indigo"
              title="No packages yet"
              description="The registry is empty — be the first to publish a Quantum package."
            >
              <Button to="/publish" icon={Upload}>
                Publish a package
              </Button>
            </EmptyState>
          ) : (
            <PackageGrid packages={packages.slice(0, 6)} />
          )}
        </div>
      </section>

      {/* How it works */}
      <section className={styles.section} aria-labelledby="steps-heading">
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionIndex}>02</p>
              <h2 id="steps-heading" className={styles.sectionTitle}>
                How it works
              </h2>
            </div>
          </div>
          <ol className={styles.steps}>
            {STEPS.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepBody}>{step.body}</p>
                <div className={styles.stepAction}>
                  {step.command ? (
                    <CommandSnippet command={step.command} />
                  ) : (
                    <Link to={step.action.to} className={styles.stepLink}>
                      {step.action.label}
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section className={styles.section} aria-labelledby="features-heading">
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionIndex}>03</p>
              <h2 id="features-heading" className={styles.sectionTitle}>
                Under the hood
              </h2>
            </div>
          </div>
          <ul role="list" className={styles.features}>
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <li key={title} className={styles.feature}>
                <Icon size={20} aria-hidden="true" className={styles.featureIcon} />
                <h3 className={styles.featureTitle}>{title}</h3>
                <p className={styles.featureBody}>{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Call to action */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.cta}>
            <div>
              <h2 className={styles.ctaTitle}>Got a package? Put it on qpm.</h2>
              <p className={styles.ctaBody}>Upload a folder or a tarball, or point us at a GitHub repo.</p>
            </div>
            <div className={styles.ctaActions}>
              <Link to="/publish" className={styles.ctaPrimary}>
                <Upload size={17} aria-hidden="true" />
                Publish a package
              </Link>
              {!user && (
                <button type="button" className={styles.ctaSecondary} onClick={() => openAuth("signup")}>
                  Create an account
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
