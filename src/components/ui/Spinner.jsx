import { LoaderCircle } from "lucide-react";
import { cn } from "@/utils/cn";
import styles from "./Spinner.module.css";

/** Decorative by default; pass `label` to announce it as a status. */
export default function Spinner({ size = 16, label, className }) {
  return (
    <LoaderCircle
      size={size}
      className={cn(styles.spinner, className)}
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : "true"}
    />
  );
}
