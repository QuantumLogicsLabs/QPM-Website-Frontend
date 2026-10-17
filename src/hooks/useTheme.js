import { useCallback, useEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "qpm-theme";
const THEME_COLORS = { light: "#f5f4ef", dark: "#0d0d0c" };
const listeners = new Set();
const media = () => window.matchMedia("(prefers-color-scheme: light)");

function readStored() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function apply(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
  listeners.forEach((listener) => listener());
}

const getSnapshot = () => document.documentElement.dataset.theme === "light" ? "light" : "dark";

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * The active colour theme. index.html applies it before first paint; this keeps
 * React in sync, persists explicit choices and follows the OS until one is made.
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => "dark");

  useEffect(() => {
    const query = media();
    const onChange = () => {
      if (!readStored()) apply(query.matches ? "light" : "dark");
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const setTheme = useCallback((next) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage blocked: the choice still applies for this visit.
    }
    apply(next);
  }, []);

  const toggleTheme = useCallback(() => setTheme(getSnapshot() === "light" ? "dark" : "light"), [setTheme]);

  return { theme, setTheme, toggleTheme };
}
