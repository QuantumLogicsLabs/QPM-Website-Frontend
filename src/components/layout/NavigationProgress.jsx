import { useNavigation } from "react-router";
import styles from "./NavigationProgress.module.css";

/** Thin bar at the top of the viewport while a route (lazy chunk) is loading. */
export default function NavigationProgress() {
  const navigation = useNavigation();
  if (navigation.state === "idle") return null;
  return <div className={styles.bar} role="progressbar" aria-label="Loading page" />;
}
