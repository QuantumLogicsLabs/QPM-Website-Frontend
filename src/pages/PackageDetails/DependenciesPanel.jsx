import { Link } from "react-router";
import styles from "./Panels.module.css";

export default function DependenciesPanel({ dependencies }) {
  const entries = Object.entries(dependencies);

  if (entries.length === 0) {
    return <p className={styles.empty}>No dependencies — this package is self-contained.</p>;
  }

  return (
    <>
      <h2 className={styles.heading}>Dependencies of the latest version</h2>
      <ul role="list" className={styles.list}>
        {entries.map(([name, range]) => (
          <li key={name} className={styles.row}>
            <Link to={`/package/${encodeURIComponent(name)}`} className={styles.depLink}>
              {name}
            </Link>
            <code className={styles.range}>{range}</code>
          </li>
        ))}
      </ul>
    </>
  );
}
