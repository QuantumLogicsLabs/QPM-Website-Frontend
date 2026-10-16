import { cn } from "@/utils/cn";
import styles from "./EmptyState.module.css";

/**
 * Centered icon + message + actions for empty, error and gated states.
 * Use titleAs="h1" when the state *is* the page (404, sign-in gate).
 */
export default function EmptyState({
  icon: Icon,
  tone = "neutral",
  title,
  titleAs: Title = "h2",
  description,
  className,
  children,
}) {
  return (
    <div className={cn("surface", styles.empty, className)}>
      {Icon && (
        <div className={cn(styles.iconWrap, styles[tone])}>
          <Icon size={26} aria-hidden="true" />
        </div>
      )}
      <Title className={styles.title}>{title}</Title>
      {description && <p className={styles.description}>{description}</p>}
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
}
