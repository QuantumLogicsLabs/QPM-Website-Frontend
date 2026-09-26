import { useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Toaster from "@/components/ui/Toaster";
import { ToastContext } from "./ToastContext";

const MAX_VISIBLE = 3;

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (tone, message, { title, duration = tone === "error" ? 6000 : 3500 } = {}) => {
      nextId.current += 1;
      const id = nextId.current;
      setToasts((list) => [...list.slice(-(MAX_VISIBLE - 1)), { id, tone, title, message }]);
      if (duration > 0) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss],
  );

  const toast = useMemo(
    () => ({
      success: (message, options) => show("success", message, options),
      error: (message, options) => show("error", message, options),
      info: (message, options) => show("info", message, options),
      dismiss,
    }),
    [show, dismiss],
  );

  return (
    <ToastContext value={toast}>
      {children}
      {createPortal(<Toaster toasts={toasts} onDismiss={dismiss} />, document.body)}
    </ToastContext>
  );
}
