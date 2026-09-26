import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { cn } from "@/utils/cn";
import styles from "./Toaster.module.css";

const ICONS = { success: CircleCheck, error: CircleAlert, info: Info };

/** Presentational stack of toasts. Rendered through a portal by <ToastProvider>. */
export default function Toaster({ toasts, onDismiss }) {
  return (
    <div className={styles.region} role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.tone] ?? Info;
        return (
          <div
            key={toast.id}
            className={cn(styles.toast, styles[toast.tone])}
            role={toast.tone === "error" ? "alert" : "status"}
          >
            <Icon size={18} className={styles.icon} aria-hidden="true" />
            <div className={styles.body}>
              {toast.title && <p className={styles.title}>{toast.title}</p>}
              <p className={styles.message}>{toast.message}</p>
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
