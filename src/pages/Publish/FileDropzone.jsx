import { useRef, useState } from "react";
import { CloudUpload, FileArchive, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatBytes } from "@/utils/format";
import Button from "@/components/ui/Button";
import styles from "./FileDropzone.module.css";

/** Click-or-drop picker for a single tarball. The native input stays in the DOM for a11y. */
export default function FileDropzone({ id, file, onSelect, onClear, invalid = false, disabled = false, ...inputProps }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const pick = (files) => {
    const selected = files?.[0];
    if (selected) onSelect(selected);
  };

  const dropHandlers = disabled
    ? {}
    : {
        onDragEnter: (event) => {
          event.preventDefault();
          setDragging(true);
        },
        onDragOver: (event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        },
        onDragLeave: (event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false);
        },
        onDrop: (event) => {
          event.preventDefault();
          setDragging(false);
          pick(event.dataTransfer.files);
        },
      };

  const input = (
    <input
      ref={inputRef}
      id={id}
      type="file"
      accept=".tgz,.gz,application/gzip,application/x-gzip"
      className="visually-hidden"
      disabled={disabled}
      onChange={(event) => {
        pick(event.target.files);
        event.target.value = "";
      }}
      {...inputProps}
    />
  );

  if (file) {
    return (
      <div className={cn(styles.fileCard, invalid && styles.invalid, dragging && styles.dragging)} {...dropHandlers}>
        {input}
        <span className={styles.fileIcon}>
          <FileArchive size={22} aria-hidden="true" />
        </span>
        <div className={styles.fileInfo}>
          <p className={styles.fileName}>{file.name}</p>
          <p className={styles.fileMeta}>
            {formatBytes(file.size)}
            {!invalid && " · ready to upload"}
          </p>
        </div>
        <div className={styles.fileActions}>
          <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()} disabled={disabled}>
            Replace
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={X}
            aria-label={`Remove ${file.name}`}
            onClick={onClear}
            disabled={disabled}
          />
        </div>
      </div>
    );
  }

  return (
    <label
      htmlFor={id}
      className={cn(styles.dropzone, dragging && styles.dragging, invalid && styles.invalid, disabled && styles.disabled)}
      {...dropHandlers}
    >
      {input}
      <span className={styles.icon}>
        <CloudUpload size={26} aria-hidden="true" />
      </span>
      <span className={styles.prompt}>
        <strong>Choose a .tgz archive</strong> or drag and drop it here
      </span>
      <span className={styles.meta}>.tgz or .tar.gz · up to 100 MB</span>
    </label>
  );
}
