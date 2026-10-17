import { useMemo } from "react";
import { CloudOff, CornerLeftUp, ExternalLink, File, FileCode, FileImage, FileText, Folder, RefreshCw } from "lucide-react";
import { getPackageFile, getPackageFiles, rawFileUrl } from "@/api/registry";
import { useResource } from "@/hooks/useResource";
import { formatBytes, pluralize } from "@/utils/format";
import Button from "@/components/ui/Button";
import CopyButton from "@/components/ui/CopyButton";
import Skeleton from "@/components/ui/Skeleton";
import styles from "./CodePanel.module.css";

// Friendly content types by extension, shown in the listing like a registry would.
const TYPES = {
  sa: "text/x-quantum",
  qc: "text/x-quantum",
  q: "text/x-quantum",
  js: "application/javascript",
  mjs: "application/javascript",
  cjs: "application/javascript",
  jsx: "text/jsx",
  ts: "application/typescript",
  tsx: "text/tsx",
  json: "application/json",
  md: "text/markdown",
  txt: "text/plain",
  html: "text/html",
  css: "text/css",
  py: "text/x-python",
  c: "text/x-c",
  h: "text/x-c",
  cpp: "text/x-c++",
  hpp: "text/x-c++",
  rs: "text/x-rust",
  go: "text/x-go",
  java: "text/x-java",
  sh: "application/x-sh",
  ps1: "text/plain",
  yml: "text/yaml",
  yaml: "text/yaml",
  toml: "text/x-toml",
  xml: "application/xml",
  svg: "image/svg+xml",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  ico: "image/x-icon",
  pdf: "application/pdf",
};

const extension = (path) => (path.includes(".") ? path.split(".").pop().toLowerCase() : "");
const fileType = (path) => TYPES[extension(path)] ?? "text/plain";
const isImage = (path) => fileType(path).startsWith("image/");

function fileIcon(path) {
  const type = fileType(path);
  if (type.startsWith("image/")) return FileImage;
  if (type === "text/markdown" || type === "text/plain") return FileText;
  return TYPES[extension(path)] ? FileCode : File;
}

/** Folders and files directly inside `dir` ("" = root); folder sizes are the sum of their contents. */
function listDirectory(files, dir) {
  const prefix = dir ? `${dir}/` : "";
  const folders = new Map();
  const entries = [];

  for (const file of files) {
    if (!file.path.startsWith(prefix)) continue;
    const rest = file.path.slice(prefix.length);
    const slash = rest.indexOf("/");
    if (slash === -1) {
      entries.push({ kind: "file", name: rest, path: file.path, size: file.size });
    } else {
      const name = rest.slice(0, slash);
      const folder = folders.get(name) ?? { kind: "folder", name, path: prefix + name, size: 0, count: 0 };
      folder.size += file.size;
      folder.count += 1;
      folders.set(name, folder);
    }
  }

  const byName = (a, b) => a.name.localeCompare(b.name);
  return [...[...folders.values()].sort(byName), ...entries.sort(byName)];
}

export default function CodePanel({ pkg, version, path = "", onSelectVersion, onNavigate }) {
  const { data: files, error, loading, reload } = useResource(
    (signal) => getPackageFiles(pkg.name, version, { signal }),
    [pkg.name, version],
  );

  if (error) {
    return (
      <div className={styles.message}>
        <CloudOff size={20} aria-hidden="true" />
        <p>{error.message}</p>
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={reload}>
          Try again
        </Button>
      </div>
    );
  }

  if (loading || !files) {
    return (
      <div className={styles.frame} aria-busy="true">
        <div className={styles.frameHeader}>
          <Skeleton width={140} height={16} />
        </div>
        {[40, 30, 55, 35, 45, 25].map((width, index) => (
          <div key={index} className={styles.skeletonRow}>
            <Skeleton width={`${width}%`} height={14} />
          </div>
        ))}
      </div>
    );
  }

  const versionPicker = pkg.versions.length > 1 && (
    <label className={styles.versionPicker}>
      <span className="visually-hidden">Version</span>
      <select value={version} onChange={(event) => onSelectVersion(event.target.value)}>
        {pkg.versions.map(({ version: v }) => (
          <option key={v} value={v}>
            v{v}
            {v === pkg.latest ? " (latest)" : ""}
          </option>
        ))}
      </select>
    </label>
  );

  if (files.length === 0) {
    return <p className={styles.message}>This version's archive doesn't contain any files.</p>;
  }

  const file = files.find((item) => item.path === path);
  const dir = file ? path.split("/").slice(0, -1).join("/") : path;
  const entries = file ? [] : listDirectory(files, dir);

  // An unknown path (e.g. from an old link) falls back to the root listing.
  if (!file && dir && entries.length === 0) {
    return <CodePanel pkg={pkg} version={version} path="" onSelectVersion={onSelectVersion} onNavigate={onNavigate} />;
  }

  return (
    <div className={styles.frame}>
      <header className={styles.frameHeader}>
        <Breadcrumb name={pkg.name} path={path} isFile={!!file} onNavigate={onNavigate} />
        {versionPicker}
      </header>

      {file ? (
        <FileViewer name={pkg.name} version={version} file={file} key={`${version}:${file.path}`} />
      ) : (
        <table className={styles.table}>
          <caption className="visually-hidden">
            Files in /{pkg.name}/{dir}
          </caption>
          <thead className="visually-hidden">
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Type</th>
              <th scope="col">Size</th>
            </tr>
          </thead>
          <tbody>
            {dir && (
              <tr>
                <td colSpan={3}>
                  <button
                    type="button"
                    className={styles.entry}
                    onClick={() => onNavigate(dir.split("/").slice(0, -1).join("/"))}
                  >
                    <CornerLeftUp size={16} aria-hidden="true" />
                    <span>..</span>
                  </button>
                </td>
              </tr>
            )}
            {entries.map((entry) => {
              const Icon = entry.kind === "folder" ? Folder : fileIcon(entry.path);
              return (
                <tr key={entry.path}>
                  <td>
                    <button
                      type="button"
                      className={entry.kind === "folder" ? styles.folderEntry : styles.entry}
                      onClick={() => onNavigate(entry.path)}
                    >
                      <Icon size={16} aria-hidden="true" />
                      <span className={styles.entryName}>
                        {entry.name}
                        {entry.kind === "folder" ? "/" : ""}
                      </span>
                    </button>
                  </td>
                  <td className={styles.type}>
                    {entry.kind === "folder" ? <strong>folder</strong> : fileType(entry.path)}
                  </td>
                  <td className={styles.size}>
                    {entry.kind === "folder" ? <strong>{formatBytes(entry.size)}</strong> : formatBytes(entry.size)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Breadcrumb({ name, path, isFile, onNavigate }) {
  const segments = path ? path.split("/") : [];
  return (
    <nav aria-label="File path" className={styles.breadcrumb}>
      <span aria-hidden="true">/</span>
      <button type="button" className={styles.crumb} onClick={() => onNavigate("")}>
        {name}
      </button>
      {segments.map((segment, index) => {
        const last = index === segments.length - 1;
        const target = segments.slice(0, index + 1).join("/");
        return (
          <span key={target} className={styles.crumbGroup}>
            <span aria-hidden="true">/</span>
            {last && isFile ? (
              <span className={styles.crumbCurrent} aria-current="page">
                {segment}
              </span>
            ) : (
              <button type="button" className={styles.crumb} onClick={() => onNavigate(target)}>
                {segment}
              </button>
            )}
          </span>
        );
      })}
      {!isFile && <span aria-hidden="true">/</span>}
    </nav>
  );
}

function FileViewer({ name, version, file }) {
  const image = isImage(file.path);
  const raw = rawFileUrl(name, version, file.path);
  const { data, error, loading, reload } = useResource(
    (signal) => (image ? Promise.resolve(null) : getPackageFile(name, version, file.path, { signal })),
    [name, version, file.path, image],
  );

  const lines = useMemo(() => {
    if (!data?.content) return [];
    const split = data.content.replace(/\r\n?/g, "\n").split("\n");
    if (split.length > 1 && split.at(-1) === "") split.pop();
    return split;
  }, [data]);

  let body;
  if (image) {
    body = (
      <div className={styles.imagePreview}>
        <img src={raw} alt={file.path} />
      </div>
    );
  } else if (error) {
    body = (
      <div className={styles.message}>
        <p>{error.message}</p>
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={reload}>
          Try again
        </Button>
      </div>
    );
  } else if (loading || !data) {
    body = (
      <div className={styles.viewerLoading}>
        {[60, 80, 45, 70, 30, 55].map((width, index) => (
          <Skeleton key={index} width={`${width}%`} height={12} className={styles.skeletonGap} />
        ))}
      </div>
    );
  } else if (data.binary) {
    body = <p className={styles.message}>Binary file — use “Raw” to download it.</p>;
  } else if (data.tooLarge) {
    body = <p className={styles.message}>This file is too large to display here — use “Raw” to view it.</p>;
  } else if (!data.content) {
    body = <p className={styles.message}>This file is empty.</p>;
  } else {
    body = (
      <pre className={styles.code}>
        <code>
          {lines.map((line, index) => (
            <span key={index} className={styles.line}>
              <span className={styles.lineNumber} aria-hidden="true">
                {index + 1}
              </span>
              <span className={styles.lineText}>{line || " "}</span>
            </span>
          ))}
        </code>
      </pre>
    );
  }

  return (
    <>
      <div className={styles.fileBar}>
        <span className={styles.fileMeta}>
          {data?.content ? `${pluralize(lines.length, "line")} · ` : ""}
          {formatBytes(file.size)} · {fileType(file.path)}
        </span>
        <Button href={raw} target="_blank" rel="noopener noreferrer" variant="ghost" size="sm" icon={ExternalLink}>
          Raw
        </Button>
        {data?.content && <CopyButton value={data.content} label="Copy file contents" />}
      </div>
      {body}
    </>
  );
}
