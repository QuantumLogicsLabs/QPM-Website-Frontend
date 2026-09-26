import { useMemo } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  Boxes,
  Download,
  HardDrive,
  Network,
  PackageSearch,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
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
import Badge from "@/components/ui/Badge";
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
    tone: "indigo",
    title: "A registry, not just a site",
    body: "Package documents are served in an npm-compatible shape — dist-tags, versions and tarballs — so the qpm CLI reads straight from it.",
  },
  {
    icon: HardDrive,
    tone: "cyan",
    title: "Google Drive as the vault",
    body: "Every published .tgz streams into Google Drive and back out on install. No object-storage bill, no extra infrastructure.",
  },
  {
    icon: Zap,
    tone: "emerald",
    title: "Metadata that moves fast",
    body: "Names, versions, keywords, dependencies and download counts live in MongoDB behind text indexes for instant search.",
  },
  {
    icon: ShieldCheck,
    tone: "violet",
    title: "Guests welcome, authors protected",
    body: "Publish to the community namespace, or sign in and the registry locks each package name to your account.",
  },
];

const STEPS = [
  {
    title: "Find a package",
    body: "Search by name, description or keyword and compare downloads, versions and READMEs.",
    action: { to: "/explore", label: "Browse the registry" },
  },
  {
    title: "Install it",
    body: "Pull any package into your project with the qpm CLI.",
    command: "qpm install quantum-core",
  },
  {
    title: "Publish your own",
    body: "Upload a .tgz archive or import straight from a public GitHub repository.",
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
      { icon: Boxes, label: "Packages", value: `${packages.length}${capped ? "+" : ""}` },
      {
        icon: Download,
        label: "Downloads",
        value: `${formatCompact(packages.reduce((sum, pkg) => sum + pkg.downloads, 0))}${capped ? "+" : ""}`,
      },
      { icon: Users, label: "Publishers", value: `${owners.size}${capped ? "+" : ""}` },
    ];
  }, [data, packages]);
  const tags = useMemo(() => topKeywords(packages, 5), [packages]);

  return (
    <>
      <PageMeta />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={cn("container", styles.heroInner)}>
          <Badge tone="cyan" icon={Sparkles}>
            The package registry for Quantum Language
          </Badge>
          <h1 className={styles.title}>
            Build, share and install <span className="text-gradient">Quantum packages</span>
          </h1>
          <p className={styles.lead}>
            Discover community modules, publish your own in seconds, and install anything with a
            single command.
          </p>

          <SearchBar size="lg" placeholder="Search packages, e.g. quantum-core" className={styles.heroSearch} />

          {tags.length > 0 && (
            <p className={styles.trending}>
              <span>Popular:</span>
              {tags.map((tag) => (
                <Link key={tag} to={`/explore?q=${encodeURIComponent(tag)}`} className={styles.trendingTag}>
                  #{tag}
                </Link>
              ))}
            </p>
          )}

          <dl className={styles.stats}>
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className={styles.stat}>
                <dt>
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </dt>
                <dd>{initialLoading ? <Skeleton width={48} height={26} /> : error ? "—" : value}</dd>
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
              <h2 id="popular-heading" className={styles.sectionTitle}>
                Popular packages
              </h2>
              <p className={styles.sectionLead}>The most downloaded modules in the registry.</p>
            </div>
            <Button to="/explore" variant="outline" size="sm" iconRight={ArrowRight}>
              View all
            </Button>
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
              <h2 id="steps-heading" className={styles.sectionTitle}>
                Up and running in three steps
              </h2>
              <p className={styles.sectionLead}>From discovery to your first published version.</p>
            </div>
          </div>
          <ol className={styles.steps}>
            {STEPS.map((step, index) => (
              <li key={step.title} className={cn("surface", styles.step)}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {index + 1}
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
              <h2 id="features-heading" className={styles.sectionTitle}>
                Why QPM
              </h2>
              <p className={styles.sectionLead}>Built for speed, reliability and zero-cost storage.</p>
            </div>
          </div>
          <ul role="list" className={styles.features}>
            {FEATURES.map(({ icon: Icon, tone, title, body }) => (
              <li key={title} className={cn("surface", styles.feature)}>
                <span className={cn(styles.featureIcon, styles[tone])}>
                  <Icon size={22} aria-hidden="true" />
                </span>
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
              <h2 className={styles.ctaTitle}>Ready to ship your package?</h2>
              <p className={styles.ctaBody}>
                Publish in under a minute — upload a tarball or point us at a GitHub repo.
              </p>
            </div>
            <div className={styles.ctaActions}>
              <Button to="/publish" size="lg" icon={Upload}>
                Publish a package
              </Button>
              {!user && (
                <Button variant="secondary" size="lg" onClick={() => openAuth("signup")}>
                  Create an account
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
