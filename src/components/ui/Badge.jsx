import { cn } from "@/utils/cn";
import styles from "./Badge.module.css";

/** tone: "indigo" | "cyan" | "emerald" | "amber" | "violet" | "neutral" */
export default function Badge({ tone = "indigo", icon: Icon, className, children, ...rest }) {
  return (
    <span className={cn(styles.badge, styles[tone], className)} {...rest}>
      {Icon && <Icon size={12} aria-hidden="true" />}
      {children}
    </span>
  );
}
