import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/utils/cn";
import styles from "./ThemeToggle.module.css";

/** Sun/moon switch between the light and dark themes. */
export default function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useTheme();
  const next = theme === "light" ? "dark" : "light";

  return (
    <button
      type="button"
      className={cn(styles.toggle, className)}
      onClick={toggleTheme}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      <Sun size={16} aria-hidden="true" className={cn(styles.icon, theme === "light" && styles.visible)} />
      <Moon size={16} aria-hidden="true" className={cn(styles.icon, theme === "dark" && styles.visible)} />
    </button>
  );
}
