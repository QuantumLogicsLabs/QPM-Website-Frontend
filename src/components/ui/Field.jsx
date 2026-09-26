import { CircleAlert } from "lucide-react";
import { cn } from "@/utils/cn";
import styles from "./Field.module.css";

/**
 * Label + control + hint/error. Error and hint get ids `${htmlFor}-error` /
 * `${htmlFor}-hint`; point the control at them with utils/a11y#describedBy.
 */
export default function Field({
  label,
  htmlFor,
  required = false,
  optional = false,
  hint,
  error,
  aside,
  className,
  children,
}) {
  return (
    <div className={cn(styles.field, className)}>
      {label && (
        <div className={styles.labelRow}>
          <label htmlFor={htmlFor} className={styles.label}>
            {label}
            {required && (
              <span className={styles.required} aria-hidden="true">
                *
              </span>
            )}
          </label>
          {optional && <span className={styles.optional}>Optional</span>}
          {aside}
        </div>
      )}
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className={styles.error}>
          <CircleAlert size={14} aria-hidden="true" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${htmlFor}-hint`} className={styles.hint}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}
