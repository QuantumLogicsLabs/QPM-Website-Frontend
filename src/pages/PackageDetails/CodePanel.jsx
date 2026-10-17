import { useMemo, useState } from "react";
import { ChevronRight, CloudOff, File, FileCode, FileText, Folder, FolderOpen, RefreshCw } from "lucide-react";
import { getPackageFile, getPackageFiles } from "@/api/registry";
import { useResource } from "@/hooks/useResource";
import { cn } from "@/utils/cn";
import { formatBytes, pluralize } from "@/utils/format";
import Button from "@/components/ui/Button";
import CopyButton from "@/components/ui/CopyButton";
import Skeleton from "@/components/ui/Skeleton";
import styles from "./CodePanel.module.css";

const CODE_EXTENSIONS = /\.(qc|q|js|jsx|ts|tsx|json|py|c|h|cpp|hpp|rs|go|java|sh|css|html|yml|yaml|toml)$/i;

const fileIcon = (path) => (CODE_EXTENSIONS.test(path) ? FileCode : /\.(md|txt)$/i.test(path) ? FileText : File);

/** Turns flat paths into a nested tree; folders sort before files. */
function buildTree(files) {
  const root = { children: new Map() };
  for (const file of files) {
    const segments = file.path.split("/");
    let node = root;
    segments.forEach((segment, index) => {
      const isFile = index === segments.length - 1;
      if (!node.children.has(segment)) {
        node.children.set(segment, {
          name: segment,
          path: segments.slice(0, index + 1).join("/"),
          ...(isFile ? { size: file.size } : { children: new Map() }),
        });
      }
      node = node.children.get(segment);
    });
  }
  return root;
}

const sortedChildren = (node) =>
  [...node.children.values()].sort((a, b) => {
    if (!!a.children !== !!b.children) return a.children ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

/** README at the root if there is one, else the first file. */
function defaultFile(files) {
  return files.find(({ path }) => /^readme(\.md)?$/i.test(path))?.path ?? files[0]?.path ?? null;
}

export default function CodePanel({ pkg, version, file, onSelectVersion, onSelectFile }) {
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

  const versionPicker = pkg.versions.length > 1 && (
    <label className={styles.versionPicker}>
      <span>Version</span>
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

  if (loading || !files) {
    return (
      <div className={styles.layout} aria-busy="true">
        <div className={styles.tree}>
          {[70, 55, 80, 60, 45].map((width, index) => (
            <Skeleton key={index} width={`${width}%`} height={14} className={styles.skeletonGap} />
          ))}
        </div>
        <Skeleton width="100%" height={320} radius="12px" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <>
        {versionPicker && <div className={styles.toolbar}>{versionPicker}</div>}
        <p className={styles.empty}>This version's archive doesn't contain any files.</p>
      </>
    );
  }

  const selected = files.some(({ path }) => path === file) ? file : defaultFile(files);

  return (
    <>
      <div className={styles.toolbar}>
        <h2 className={styles.heading}>{pluralize(files.length, "file")}</h2>
        {versionPicker}
      </div>
      <div className={styles.layout}>
        <FileTree files={files} selected={selected} onSelect={onSelectFile} />
        <FileViewer key={`${version}:${selected}`} name={pkg.name} version={version} path={selected} />
      </div>
    </>
  );
}

function FileTree({ files, selected, onSelect }) {
  const tree = useMemo(() => buildTree(files), [files]);
  // Folders start collapsed, except the ones leading to the selected file.
  const [open, setOpen] = useState(() => {
    const segments = selected?.split("/") ?? [];
    return new Set(segments.slice(0, -1).map((_, index) => segments.slice(0, index + 1).join("/")));
  });

  const toggle = (path) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });

  const renderNode = (node, depth) => {
    const indent = { paddingLeft: `calc(${depth} * 14px + var(--space-2))` };

    if (node.children) {
      const expanded = open.has(node.path);
      return (
        <li key={node.path}>
          <button
            type="button"
            className={styles.entry}
            style={indent}
            aria-expanded={expanded}
            onClick={() => toggle(node.path)}
          >
            <ChevronRight size={14} aria-hidden="true" className={cn(styles.chevron, expanded && styles.chevronOpen)} />
            {expanded ? <FolderOpen size={15} aria-hidden="true" /> : <Folder size={15} aria-hidden="true" />}
            <span className={styles.entryName}>{node.name}</span>
          </button>
          {expanded && <ul role="list">{sortedChildren(node).map((child) => renderNode(child, depth + 1))}</ul>}
        </li>
      );
    }

    const Icon = fileIcon(node.path);
    const current = node.path === selected;
    return (
      <li key={node.path}>
        <button
          type="button"
          className={cn(styles.entry, current && styles.entryActive)}
          style={indent}
          aria-current={current ? "true" : undefined}
          onClick={() => onSelect(node.path)}
        >
          <span className={styles.chevronSpacer} />
          <Icon size={15} aria-hidden="true" />
          <span className={styles.entryName}>{node.name}</span>
        </button>
      </li>
    );
  };

  return (
    <nav aria-label="Package files" className={styles.tree}>
      <ul role="list">{sortedChildren(tree).map((node) => renderNode(node, 0))}</ul>
    </nav>
  );
}

function FileViewer({ name, version, path }) {
  const { data: file, error, loading, reload } = useResource(
    (signal) => getPackageFile(name, version, path, { signal }),
    [name, version, path],
  );

  const lines = useMemo(() => {
    if (!file?.content) return [];
    const split = file.content.split("\n");
    if (split.length > 1 && split.at(-1) === "") split.pop();
    return split;
  }, [file]);

  let body;
  if (error) {
    body = (
      <div className={styles.message}>
        <p>{error.message}</p>
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={reload}>
          Try again
        </Button>
      </div>
    );
  } else if (loading || !file) {
    body = (
      <div className={styles.viewerLoading}>
        {[60, 80, 45, 70, 30, 55].map((width, index) => (
          <Skeleton key={index} width={`${width}%`} height={12} className={styles.skeletonGap} />
        ))}
      </div>
    );
  } else if (file.binary) {
    body = <p className={styles.message}>Binary file — download the .tgz to view it.</p>;
  } else if (file.tooLarge) {
    body = <p className={styles.message}>This file is too large to display here.</p>;
  } else if (!file.content) {
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
    <section className={styles.viewer} aria-label={path}>
      <header className={styles.viewerHeader}>
        <span className={styles.viewerPath} title={path}>
          {path}
        </span>
        {file && !loading && (
          <span className={styles.viewerMeta}>
            {file.content ? `${pluralize(lines.length, "line")} · ` : ""}
            {formatBytes(file.size)}
          </span>
        )}
        {file?.content && !loading && <CopyButton value={file.content} label="Copy file contents" />}
      </header>
      {body}
    </section>
  );
}
