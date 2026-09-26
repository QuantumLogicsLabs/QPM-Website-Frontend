import { cn } from "@/utils/cn";
import CopyButton from "./CopyButton";
import styles from "./CommandSnippet.module.css";

/** A terminal-style one-liner with a copy button. */
export default function CommandSnippet({ command, prompt = "$", label, className }) {
  return (
    <div className={cn(styles.snippet, className)}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.row}>
        <code className={styles.code}>
          <span className={styles.prompt} aria-hidden="true">
            {prompt}
          </span>
          {command}
        </code>
        <CopyButton value={command} label="Copy command" />
      </div>
    </div>
  );
}
