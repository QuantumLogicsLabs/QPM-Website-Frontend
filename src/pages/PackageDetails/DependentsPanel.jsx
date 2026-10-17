import { Link } from "react-router";
import { RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import styles from "./Panels.module.css";

export default function DependentsPanel({ name, dependents, error, loading, reload }) {
  if (error) {
    return (
      <div className={styles.empty}>
        <p>{error.message}</p>
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={reload} className={styles.retry}>
          Try again
        </Button>
      </div>
    );
  }

  if (loading || !dependents) {
    return [70, 50, 60].map((width, index) => (
      <Skeleton key={index} width={`${width}%`} height={16} className={styles.skeletonGap} />
    ));
  }

  if (dependents.length === 0) {
    return <p className={styles.empty}>No published packages depend on {name} yet.</p>;
  }

  return (
    <>
      <h2 className={styles.heading}>Packages that depend on {name}</h2>
      <ul role="list" className={styles.list}>
        {dependents.map((dependent) => (
          <li key={dependent.name} className={styles.row}>
            <div className={styles.dependent}>
              <Link to={`/package/${encodeURIComponent(dependent.name)}`} className={styles.depLink}>
                {dependent.name}
              </Link>
              {dependent.description && <p className={styles.secondary}>{dependent.description}</p>}
            </div>
            <code className={styles.range}>{dependent.range}</code>
          </li>
        ))}
      </ul>
    </>
  );
}
