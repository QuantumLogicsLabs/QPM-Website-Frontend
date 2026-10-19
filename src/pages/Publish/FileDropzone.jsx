import { useRef, useState } from "react";
import { CloudUpload, File as FileIcon, FilePlus, FolderUp, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatBytes } from "@/utils/format";
import { isIgnoredPath } from "@/utils/validation";
import Button from "@/components/ui/Button";
import styles from "./FileDropzone.module.css";

const readEntries = (reader) => new Promise((resolve, reject) => reader.readEntries(resolve, reject));
const readFile = (entry) => new Promise((resolve, reject) => entry.file(resolve, reject));

// Walks a dropped directory entry; paths are relative to the dropped folder's parent.
async function collectEntry(entry, prefix = "") {
  if (entry.isFile) return [{ file: await readFile(entry), path: `${prefix}${entry.name}` }];

  const reader = entry.createReader();
  const found = [];
  for (let batch = await readEntries(reader); batch.length; batch = await readEntries(reader)) {
    for (const child of batch) {
      if (!isIgnoredPath(child.name)) found.push(...(await collectEntry(child, `${prefix}${entry.name}/`)));
    }
  }
  return found;
}

/**
 * Picks any mix of files and folders (click or drag and drop); each pick adds to the list.
 * Reports `{ file, path }` items (path includes any folder names) through onAdd(items, rootFolderName?); the registry
 * bundles them into a .tgz on publish. The native inputs stay in the DOM for a11y.
 */
export default function FileDropzone({
  id,
  items,
  onAdd,
  onRemove,
  onClear,
  invalid = false,
  disabled = false,
  ...inputProps
}) {
  const [dragging, setDragging] = useState(false);
  const filesRef = useRef(null);
  const folderRef = useRef(null);

  const addLoose = (list) => {
    const picked = [...(list ?? [])]
      .filter((file) => !isIgnoredPath(file.name))
      .map((file) => ({ file, path: file.name }));
    if (picked.length) onAdd(picked);
  };

  // A folder pick reports webkitRelativePath as "folder/sub/file". The folder name stays in the
  // path so several folders can be combined; a lone top-level folder is unwrapped on publish.
  const addFolder = (list) => {
    const all = [...(list ?? [])];
    if (!all.length) return;
    const root = all[0].webkitRelativePath.split("/")[0];
    const picked = all
      .map((file) => ({ file, path: file.webkitRelativePath }))
      .filter((item) => !isIgnoredPath(item.path));
    if (picked.length) onAdd(picked, root);
  };

  const addDropped = async (dataTransfer) => {
    // Entries must be grabbed synchronously, before the first await.
    const entries = [...dataTransfer.items].map((item) => item.webkitGetAsEntry?.()).filter(Boolean);
    if (!entries.length) return addLoose(dataTransfer.files);

    // Files and folders can be dropped together; every folder keeps its name in the path.
    const picked = [];
    let root;
    for (const entry of entries) {
      if (isIgnoredPath(entry.name)) continue;
      if (entry.isDirectory) root ??= entry.name;
      picked.push(...(await collectEntry(entry)));
    }
    if (picked.length) onAdd(picked, root);
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
          addDropped(event.dataTransfer);
        },
      };

  const totalBytes = items.reduce((sum, item) => sum + item.file.size, 0);

  return (
    <div className={styles.picker}>
      <input
        ref={filesRef}
        id={id}
        type="file"
        multiple
        className="visually-hidden"
        disabled={disabled}
        onChange={(event) => {
          addLoose(event.target.files);
          event.target.value = "";
        }}
        {...inputProps}
      />
      <input
        ref={folderRef}
        type="file"
        webkitdirectory=""
        directory=""
        multiple
        className="visually-hidden"
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled}
        onChange={(event) => {
          addFolder(event.target.files);
          event.target.value = "";
        }}
      />

      <div
        className={cn(styles.dropzone, dragging && styles.dragging, invalid && styles.invalid, disabled && styles.disabled)}
        {...dropHandlers}
      >
        <span className={styles.icon}>
          <CloudUpload size={26} aria-hidden="true" />
        </span>
        <span className={styles.prompt}>
          <strong>Select files and folders</strong> or drag and drop them here
        </span>
        <div className={styles.pickActions}>
          <Button variant="secondary" size="sm" icon={FilePlus} onClick={() => filesRef.current?.click()} disabled={disabled}>
            Select files
          </Button>
          <Button variant="secondary" size="sm" icon={FolderUp} onClick={() => folderRef.current?.click()} disabled={disabled}>
            Select folder
          </Button>
        </div>
        <span className={styles.meta}>
          Browsers let a picker choose either files or one folder, not both — to add files and folders
          in one go, drag them here together. Every pick adds to the list. Up to 100 MB in total;
          node_modules, quantum_qubits and .git are skipped.
        </span>
      </div>

      {items.length > 0 && (
        <div className={cn(styles.fileList, invalid && styles.invalid)}>
          <div className={styles.listHeader}>
            <span>
              {items.length} file{items.length === 1 ? "" : "s"} · {formatBytes(totalBytes)} · will be bundled into a .tgz
            </span>
            <Button variant="ghost" size="sm" onClick={onClear} disabled={disabled}>
              Clear all
            </Button>
          </div>
          <ul className={styles.list}>
            {items.map((item) => (
              <li key={item.path} className={styles.listItem}>
                <FileIcon size={15} aria-hidden="true" />
                <span className={styles.itemPath}>{item.packagePath}</span>
                <span className={styles.itemSize}>{formatBytes(item.file.size)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={X}
                  aria-label={`Remove ${item.packagePath}`}
                  onClick={() => onRemove(item.path)}
                  disabled={disabled}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
