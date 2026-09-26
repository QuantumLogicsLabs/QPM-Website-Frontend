import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/utils/cn";
import styles from "./Alert.module.css";

const ICONS = { error: CircleAlert, success: CircleCheck, warning: TriangleAlert, info: Info };

/** Inline, persistent message. tone: "error" | "success" | "warning" | "info" */
export default function Alert({ tone = "info", title, action, className, children }) {
  const Icon = ICONS[tone];
  return (
    <div className={cn(styles.alert, styles[tone], className)} role={tone === "error" ? "alert" : "status"}>
      <Icon size={18} className={styles.icon} aria-hidden="true" />
      <div className={styles.body}>
        {title && <p className={styles.title}>{title}</p>}
        {children && <div className={styles.text}>{children}</div>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
