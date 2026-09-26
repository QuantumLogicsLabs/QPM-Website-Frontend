import { useEffect } from "react";

const isEditable = (target) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

/** Focuses `inputRef` when the user presses "/" or Ctrl/⌘+K. */
export function useSearchShortcut(inputRef, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event) => {
      const key = event.key?.toLowerCase();
      const slash = key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey && !isEditable(event.target);
      const commandK = key === "k" && (event.metaKey || event.ctrlKey);
      if (!slash && !commandK) return;

      event.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [inputRef, enabled]);
}
