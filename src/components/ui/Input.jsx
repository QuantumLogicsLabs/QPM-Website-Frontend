import { cn } from "@/utils/cn";
import styles from "./Field.module.css";

// React 19 passes `ref` as a regular prop, so no forwardRef is needed.

export function Input({ icon: Icon, trailing, invalid = false, className, ref, ...props }) {
  return (
    <div className={cn(styles.control, Icon && styles.withIcon, trailing && styles.withTrailing)}>
      {Icon && <Icon size={18} className={styles.icon} aria-hidden="true" />}
      <input
        ref={ref}
        className={cn(styles.input, invalid && styles.invalid, className)}
        aria-invalid={invalid || undefined}
        {...props}
      />
      {trailing && <div className={styles.trailing}>{trailing}</div>}
    </div>
  );
}

export function Textarea({ invalid = false, className, ref, ...props }) {
  return (
    <textarea
      ref={ref}
      className={cn(styles.input, styles.textarea, invalid && styles.invalid, className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function Select({ className, children, ref, ...props }) {
  return (
    <select ref={ref} className={cn(styles.input, styles.select, className)} {...props}>
      {children}
    </select>
  );
}
