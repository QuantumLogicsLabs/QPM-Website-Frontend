import { cn } from "@/utils/cn";
import PackageCard, { PackageCardSkeleton } from "./PackageCard";
import styles from "./PackageGrid.module.css";

/**
 * Responsive grid of package cards.
 * `loading` renders skeletons; `busy` dims existing results during a refetch.
 */
export default function PackageGrid({ packages = [], loading = false, busy = false, skeletonCount = 6, className }) {
  if (loading) {
    return (
      <div className={cn(styles.grid, className)} aria-busy="true">
        <span className="visually-hidden" role="status">
          Loading packages…
        </span>
        {Array.from({ length: skeletonCount }, (_, index) => (
          <PackageCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <ul role="list" className={cn(styles.grid, busy && styles.busy, className)} aria-busy={busy || undefined}>
      {packages.map((pkg) => (
        <li key={pkg.name} className={styles.item}>
          <PackageCard pkg={pkg} />
        </li>
      ))}
    </ul>
  );
}
