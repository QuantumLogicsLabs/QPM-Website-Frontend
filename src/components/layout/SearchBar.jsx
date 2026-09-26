import { useId, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Search } from "lucide-react";
import { useSearchShortcut } from "@/hooks/useSearchShortcut";
import { cn } from "@/utils/cn";
import Button from "@/components/ui/Button";
import styles from "./SearchBar.module.css";

/**
 * Search box that sends the user to /explore?q=…
 * size "md" is the compact navbar variant; "lg" adds a submit button.
 */
export default function SearchBar({
  size = "md",
  shortcut = false,
  placeholder = "Search packages…",
  className,
  onSearch,
}) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [value, setValue] = useState("");
  const id = useId();
  useSearchShortcut(inputRef, shortcut);

  const handleSubmit = (event) => {
    event.preventDefault();
    const query = value.trim();
    navigate(query ? `/explore?q=${encodeURIComponent(query)}` : "/explore");
    inputRef.current?.blur();
    onSearch?.();
  };

  return (
    <form role="search" onSubmit={handleSubmit} className={cn(styles.form, styles[size], className)}>
      <label htmlFor={id} className="visually-hidden">
        Search packages
      </label>
      <Search size={size === "lg" ? 20 : 17} className={styles.icon} aria-hidden="true" />
      <input
        ref={inputRef}
        id={id}
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        className={styles.input}
      />
      {shortcut && !value && (
        <kbd className={styles.kbd} title="Press / to search">
          /
        </kbd>
      )}
      {size === "lg" && (
        <Button type="submit" className={styles.submit}>
          Search
        </Button>
      )}
    </form>
  );
}
