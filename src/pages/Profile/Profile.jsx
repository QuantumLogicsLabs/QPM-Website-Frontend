import { useMemo } from "react";
import { Boxes, Calendar, Clock, Download, LogOut, Mail, PackagePlus, RefreshCw, Upload, UserRound } from "lucide-react";
import { getMyPackages } from "@/api/registry";
import { useAuth } from "@/hooks/useAuth";
import { useResource } from "@/hooks/useResource";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/utils/cn";
import { formatDate, formatNumber, timeAgo } from "@/utils/format";
import PackageGrid from "@/components/package/PackageGrid";
import Alert from "@/components/ui/Alert";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import PageMeta from "@/components/ui/PageMeta";
import Skeleton from "@/components/ui/Skeleton";
import TokenCard from "./TokenCard";
import styles from "./Profile.module.css";

export default function Profile() {
  const { user, token, isReady, openAuth } = useAuth();

  if (!isReady) return <ProfileSkeleton />;

  if (!user) {
    return (
      <div className="container page">
        <PageMeta title="Your profile" />
        <EmptyState
          icon={UserRound}
          tone="indigo"
          title="Sign in to see your dashboard"
          description="Manage the packages you've published and grab your API token for publishing from scripts or the terminal."
        >
          <Button onClick={() => openAuth("login")}>Sign in</Button>
          <Button variant="secondary" onClick={() => openAuth("signup")}>
            Create an account
          </Button>
        </EmptyState>
      </div>
    );
  }

  return <Dashboard user={user} token={token} />;
}

function Dashboard({ user, token }) {
  const { logout } = useAuth();
  const toast = useToast();
  const { data, error, initialLoading, reload } = useResource(
    (signal) => getMyPackages(token, user.username, { signal }),
    [token, user.username],
  );

  const packages = useMemo(() => data ?? [], [data]);
  const lastPublished = useMemo(
    () =>
      packages.reduce(
        (latest, pkg) => (pkg.updatedAt && (!latest || pkg.updatedAt > latest) ? pkg.updatedAt : latest),
        null,
      ),
    [packages],
  );

  const stats = [
    { icon: Boxes, label: "Packages", value: formatNumber(packages.length) },
    {
      icon: Download,
      label: "Total downloads",
      value: formatNumber(packages.reduce((sum, pkg) => sum + pkg.downloads, 0)),
    },
    { icon: Clock, label: "Last publish", value: timeAgo(lastPublished) ?? "—" },
  ];

  const signOut = () => {
    logout();
    toast.info("You've been signed out.");
  };

  return (
    <div className="container page">
      <PageMeta title={`@${user.username}`} />

      <header className={cn("surface", styles.profile)}>
        <Avatar name={user.username} size={80} className={styles.avatar} />
        <div className={styles.identity}>
          <h1 className={styles.username}>@{user.username}</h1>
          <p className={cn(styles.bio, !user.bio && styles.placeholder)}>
            {user.bio || "Quantum Language developer & package maintainer."}
          </p>
          <ul role="list" className={styles.meta}>
            <li>
              <Mail size={14} aria-hidden="true" />
              {user.email}
            </li>
            {user.createdAt && (
              <li>
                <Calendar size={14} aria-hidden="true" />
                Joined {formatDate(user.createdAt)}
              </li>
            )}
          </ul>
        </div>
        <div className={styles.actions}>
          <Button to="/publish" icon={Upload}>
            Publish
          </Button>
          <Button variant="secondary" icon={LogOut} onClick={signOut}>
            Sign out
          </Button>
        </div>
      </header>

      <dl className={styles.stats}>
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className={cn("surface", styles.stat)}>
            <dt>
              <Icon size={16} aria-hidden="true" />
              {label}
            </dt>
            <dd>{initialLoading ? <Skeleton width={64} height={28} /> : error ? "—" : value}</dd>
          </div>
        ))}
      </dl>

      <TokenCard token={token} />

      <section className={styles.packages} aria-labelledby="my-packages-heading">
        <div className={styles.sectionHeader}>
          <div>
            <h2 id="my-packages-heading" className={styles.sectionTitle}>
              Your packages
            </h2>
            <p className={styles.sectionLead}>Packages owned by @{user.username}.</p>
          </div>
          {packages.length > 0 && (
            <Button to="/publish" variant="outline" size="sm" icon={PackagePlus}>
              New package
            </Button>
          )}
        </div>

        {error ? (
          <Alert
            tone="error"
            title="Couldn't load your packages"
            action={
              <Button variant="secondary" size="sm" icon={RefreshCw} onClick={reload}>
                Retry
              </Button>
            }
          >
            {error.message}
          </Alert>
        ) : initialLoading ? (
          <PackageGrid loading skeletonCount={3} />
        ) : packages.length === 0 ? (
          <EmptyState
            icon={PackagePlus}
            tone="indigo"
            title="No packages yet"
            description="Packages you publish while signed in will show up here."
          >
            <Button to="/publish" icon={Upload}>
              Publish your first package
            </Button>
          </EmptyState>
        ) : (
          <PackageGrid packages={packages} />
        )}
      </section>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="container page" aria-busy="true">
      <span className="visually-hidden" role="status">
        Loading your profile…
      </span>
      <div className={cn("surface", styles.profile)}>
        <Skeleton width={80} height={80} radius="50%" />
        <div className={styles.identity}>
          <Skeleton width={200} height={30} />
          <Skeleton width="min(320px, 100%)" height={16} className={styles.skeletonGap} />
          <Skeleton width={240} height={14} className={styles.skeletonGap} />
        </div>
      </div>
    </div>
  );
}
