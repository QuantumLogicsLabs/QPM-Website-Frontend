import { cn } from "@/utils/cn";
import styles from "./ProgressBar.module.css";

/** `value` is 0–1; pass null for an indeterminate bar. */
export default function ProgressBar({ value, label, className }) {
  const percent = value == null ? null : Math.round(Math.min(Math.max(value, 0), 1) * 100);

  return (
    <div
      className={cn(styles.track, className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent ?? undefined}
    >
      <div
        className={cn(styles.bar, percent == null && styles.indeterminate)}
        style={percent == null ? undefined : { width: `${percent}%` }}
      />
    </div>
  );
}
