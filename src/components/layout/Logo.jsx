import { Link } from "react-router";
import { cn } from "@/utils/cn";
import styles from "./Logo.module.css";

/** Brand mark (served from /public/logo.svg) + wordmark, linking home. */
export default function Logo({ className }) {
  return (
    <Link to="/" className={cn(styles.logo, className)} aria-label="QPM Registry — home">
      <img src="/logo.svg" alt="" width={36} height={36} className={styles.mark} />
      <span className={styles.wordmark} aria-hidden="true">
        <span className={styles.name}>QPM</span>
        <span className={styles.tag}>Registry</span>
      </span>
    </Link>
  );
}
