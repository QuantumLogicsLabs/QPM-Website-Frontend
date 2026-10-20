import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { cn } from "@/utils/cn";
import PageMeta from "@/components/ui/PageMeta";
import { GUIDES } from "./guides";
import styles from "./Guides.module.css";

export default function Guides() {
  return (
    <div className="container page">
      <PageMeta title="Guides" />
      <header className={styles.header}>
        <h1 className={styles.title}>Guides</h1>
        <p className={styles.lead}>
          Learn to publish packages, contribute fixes and help build the Quantum ecosystem.
        </p>
      </header>

      <ol role="list" className={styles.grid}>
        {GUIDES.map(({ slug, title, summary, minutes }, index) => (
          <li key={slug}>
            <Link to={`/guides/${slug}`} className={cn("surface", styles.card)}>
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className={styles.cardTitle}>{title}</h2>
              <p className={styles.cardSummary}>{summary}</p>
              <span className={styles.cardMeta}>
                {minutes} min read
                <ArrowRight size={15} aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
