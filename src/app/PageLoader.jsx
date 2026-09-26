import Spinner from "@/components/ui/Spinner";
import styles from "./PageLoader.module.css";

/** Shown while the first page chunk loads. */
export default function PageLoader() {
  return (
    <div className={styles.loader}>
      <Spinner size={28} label="Loading page" />
    </div>
  );
}
