import { use } from "react";
import { ToastContext } from "@/context/ToastContext";

/** @returns {{ success: Function, error: Function, info: Function, dismiss: Function }} */
export function useToast() {
  const context = use(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>.");
  return context;
}
