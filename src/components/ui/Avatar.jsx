import { cn } from "@/utils/cn";
import { initials } from "@/utils/format";
import styles from "./Avatar.module.css";

export default function Avatar({ name, size = 32, className }) {
  return (
    <span className={cn(styles.avatar, className)} style={{ "--avatar-size": `${size}px` }} aria-hidden="true">
      {initials(name)}
    </span>
  );
}
