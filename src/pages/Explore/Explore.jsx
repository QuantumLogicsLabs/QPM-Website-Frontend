import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { CloudOff, PackageSearch, RefreshCw, Search, Upload, X } from "lucide-react";
import { SEARCH_LIMIT, searchPackages } from "@/api/registry";
import { useResource } from "@/hooks/useResource";
import { useSearchShortcut } from "@/hooks/useSearchShortcut";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/format";
import { PACKAGE_SORTS, topKeywords } from "@/utils/packages";
import PackageGrid from "@/components/package/PackageGrid";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { Input, Select } from "@/components/ui/Input";
import PageMeta from "@/components/ui/PageMeta";
import styles from "./Explore.module.css";

const DEFAULT_SORT = "downloads";
const SEARCH_DELAY_MS = 300;

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const query = (params.get("q") ?? "").trim();
  const sort = PACKAGE_SORTS[params.get("sort")] ? params.get("sort") : DEFAULT_SORT;

  const inputRef = useRef(null);
  useSearchShortcut(inputRef);

  // The input is a draft of ?q=. Keep it in sync when the URL changes from
  // outside (tag click, back button, navbar search).
  const [draft, setDraft] = useState(query);
  const [syncedQuery, setSyncedQuery] = useState(query);
  if (query !== syncedQuery) {
    setSyncedQuery(query);
    setDraft(query);
  }

  const updateParams = useCallback(
    (changes, { replace = false } = {}) => {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          for (const [key, value] of Object.entries(changes)) {
            if (value) next.set(key, value);
            else next.delete(key);
          }
          return next;
        },
        { replace, preventScrollReset: true },
      );
    },
    [setParams],
  );

  // Search as you type (debounced). Enter submits immediately.
  const commitDraft = useEffectEvent((value) => {
    if (value !== query) updateParams({ q: value }, { replace: true });
  });
  useEffect(() => {
    const timer = setTimeout(() => commitDraft(draft.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [draft]);

  const { data, error, loading, initialLoading, reload } = useResource(
    (signal) => searchPackages(query, { signal }),
    [query],
  );

  const packages = useMemo(
    () => [...(data?.packages ?? [])].sort(PACKAGE_SORTS[sort].compare),
    [data, sort],
  );
  const tags = useMemo(() => topKeywords(data?.packages ?? [], 10), [data]);
  const activeTag = query.toLowerCase();

  const submitSearch = (event) => {
    event.preventDefault();
    updateParams({ q: draft.trim() });
  };

  const clearSearch = () => {
    setDraft("");
    updateParams({ q: "" });
    inputRef.current?.focus();
  };

  const toggleTag = (tag) => updateParams({ q: tag === activeTag ? "" : tag });

  const showSkeleton = initialLoading || (loading && packages.length === 0);
  const capped = (data?.total ?? 0) >= SEARCH_LIMIT;

  return (
    <div className="container page">
      <PageMeta title={query ? `“${query}” packages` : "Explore packages"} />

      <header className={styles.header}>
        <h1 className={styles.title}>Explore packages</h1>
        <p className={styles.lead}>Search and discover open-source Quantum Language libraries.</p>
      </header>

      <div className={cn("surface", styles.toolbar)}>
        <form role="search" onSubmit={submitSearch} className={styles.searchRow}>
          <Input
            ref={inputRef}
            type="search"
            icon={Search}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Search by name, description or keyword"
            aria-label="Search packages"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            className={styles.searchInput}
            trailing={
              draft ? (
                <Button variant="ghost" size="sm" icon={X} aria-label="Clear search" onClick={clearSearch} />
              ) : (
                <kbd className={styles.kbd} title="Press / to search">
                  /
                </kbd>
              )
            }
          />
          <Button type="submit" size="lg" className={styles.searchButton}>
            Search
          </Button>
        </form>

        {tags.length > 0 && (
          <div className={styles.tags}>
            <span className={styles.tagsLabel}>Popular tags</span>
            <ul role="list" className={styles.tagList}>
              {tags.map((tag) => {
                const active = tag === activeTag;
                return (
                  <li key={tag}>
                    <button
                      type="button"
                      aria-pressed={active}
                      className={cn(styles.tag, active && styles.tagActive)}
                      onClick={() => toggleTag(tag)}
                    >
                      #{tag}
                      {active && <X size={12} aria-hidden="true" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <div className={styles.resultsBar}>
        <p className={styles.count} role="status">
          {loading
            ? "Searching…"
            : error
              ? ""
              : `${formatNumber(packages.length)}${capped ? "+" : ""} ${packages.length === 1 ? "package" : "packages"}${query ? ` matching “${query}”` : ""}`}
        </p>
        <label className={styles.sort}>
          <span>Sort by</span>
          <Select
            value={sort}
            onChange={(event) =>
              updateParams({ sort: event.target.value === DEFAULT_SORT ? "" : event.target.value }, { replace: true })
            }
            className={styles.sortSelect}
          >
            {Object.entries(PACKAGE_SORTS).map(([value, { label }]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </label>
      </div>

      {error ? (
        <EmptyState icon={CloudOff} tone="danger" title="Couldn't load packages" description={error.message}>
          <Button icon={RefreshCw} onClick={reload}>
            Try again
          </Button>
        </EmptyState>
      ) : showSkeleton ? (
        <PackageGrid loading />
      ) : packages.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title={query ? `No packages match “${query}”` : "No packages published yet"}
          description={
            query
              ? "Try a different keyword, check the spelling, or publish the package yourself."
              : "The registry is empty — be the first to publish a Quantum package."
          }
        >
          {query && (
            <Button variant="secondary" onClick={clearSearch}>
              Clear search
            </Button>
          )}
          <Button to="/publish" icon={Upload}>
            Publish a package
          </Button>
        </EmptyState>
      ) : (
        <PackageGrid packages={packages} busy={loading} />
      )}
    </div>
  );
}
