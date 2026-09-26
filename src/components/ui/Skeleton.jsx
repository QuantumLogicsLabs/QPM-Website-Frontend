import { cn } from "@/utils/cn";
import styles from "./Skeleton.module.css";

/** Shimmering placeholder block. Size it with width/height or a className. */
export default function Skeleton({ width, height = "1em", radius, className }) {
  return (
    <span
      className={cn(styles.skeleton, className)}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}
