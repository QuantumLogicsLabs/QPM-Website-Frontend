import { useEffect, useEffectEvent, useState } from "react";
import { isAbortError } from "@/api/client";

/**
 * Runs an async loader whenever `deps` change, aborting stale requests.
 * The previous data is kept while refetching, so lists can dim instead of
 * flashing back to a skeleton.
 *
 * @template T
 * @param {(signal: AbortSignal) => Promise<T>} loader
 * @param {unknown[]} deps  Serializable values the loader depends on.
 */
export function useResource(loader, deps) {
  const [reloadCount, setReloadCount] = useState(0);
  const key = JSON.stringify([...deps, reloadCount]);
  const [result, setResult] = useState({ key: null, data: undefined, error: null });
  const load = useEffectEvent((signal) => loader(signal));

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal).then(
      (data) => setResult({ key, data, error: null }),
      (error) => {
        if (isAbortError(error) || controller.signal.aborted) return;
        setResult((prev) => ({ key, data: prev.data, error }));
      },
    );
    return () => controller.abort();
  }, [key]);

  const loading = result.key !== key;
  return {
    data: result.data,
    error: loading ? null : result.error,
    loading,
    /** Nothing has loaded yet — render skeletons. */
    initialLoading: loading && result.data === undefined,
    reload: () => setReloadCount((count) => count + 1),
  };
}
