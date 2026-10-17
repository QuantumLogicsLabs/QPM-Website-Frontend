import { Link } from "react-router";
import { cn } from "@/utils/cn";
import styles from "./Logo.module.css";

/** Brand mark (served from /public/logo.svg, vectorized from logo.png) + wordmark, linking home. */
export default function Logo({ className }) {
  return (
    <Link to="/" className={cn(styles.logo, className)} aria-label="QPM Registry — home">
      <img src="/logo.svg" alt="" width={46} height={42} className={styles.mark} />
      <span className={styles.wordmark} aria-hidden="true">
        <span className={styles.name}>qpm</span>
        <span className={styles.tag}>/registry</span>
      </span>
    </Link>
  );
}
