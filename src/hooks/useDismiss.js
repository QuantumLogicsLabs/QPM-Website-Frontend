import { useEffect, useEffectEvent } from "react";

/** Calls `onDismiss` on a pointer press outside `ref` or when Escape is pressed. */
export function useDismiss(ref, onDismiss, enabled = true) {
  const dismiss = useEffectEvent(onDismiss);

  useEffect(() => {
    if (!enabled) return;

    const onPointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) dismiss();
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") dismiss();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [ref, enabled]);
}
