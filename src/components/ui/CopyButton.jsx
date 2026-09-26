import { Check, Copy } from "lucide-react";
import { useClipboard } from "@/hooks/useClipboard";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/utils/cn";
import Button from "./Button";
import styles from "./CopyButton.module.css";

/** Copies `value` and briefly swaps to a check mark. Safe to use inside links/cards. */
export default function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  showLabel = false,
  variant = "ghost",
  size = "sm",
  className,
}) {
  const { copied, copy } = useClipboard();
  const toast = useToast();

  const handleClick = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!(await copy(value))) toast.error("Couldn't copy to the clipboard.");
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        icon={copied ? Check : Copy}
        onClick={handleClick}
        aria-label={showLabel ? undefined : label}
        title={label}
        className={cn(copied && styles.copied, className)}
      >
        {showLabel ? (copied ? copiedLabel : label) : null}
      </Button>
      <span className="visually-hidden" aria-live="polite">
        {copied ? copiedLabel : ""}
      </span>
    </>
  );
}
