import { cn } from "@/utils/cn";
import styles from "./EmptyState.module.css";

/** Centered icon + message + actions for empty, error and gated states. */
export default function EmptyState({ icon: Icon, tone = "neutral", title, description, className, children }) {
  return (
    <div className={cn("surface", styles.empty, className)}>
      {Icon && (
        <div className={cn(styles.iconWrap, styles[tone])}>
          <Icon size={26} aria-hidden="true" />
        </div>
      )}
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
}
