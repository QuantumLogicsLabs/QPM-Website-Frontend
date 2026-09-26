import { useState } from "react";
import { Eye, Pencil } from "lucide-react";
import { cn } from "@/utils/cn";
import Markdown from "@/components/package/Markdown";
import { Textarea } from "@/components/ui/Input";
import styles from "./ReadmeEditor.module.css";

const MODES = [
  { id: "write", label: "Write", icon: Pencil },
  { id: "preview", label: "Preview", icon: Eye },
];

/** Markdown textarea with a rendered preview toggle. */
export default function ReadmeEditor({ id, value, onChange, packageName, ...textareaProps }) {
  const [mode, setMode] = useState("write");

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <div className={styles.modes} role="group" aria-label="README editor mode">
          {MODES.map(({ id: modeId, label, icon: Icon }) => (
            <button
              key={modeId}
              type="button"
              aria-pressed={mode === modeId}
              className={cn(styles.mode, mode === modeId && styles.active)}
              onClick={() => setMode(modeId)}
            >
              <Icon size={14} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
        <span className={styles.hint}>Markdown supported</span>
      </div>

      {mode === "write" ? (
        <Textarea
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={10}
          placeholder={`# ${packageName || "my-package"}\n\nWhat it does, how to install it, and a quick example.`}
          className={styles.textarea}
          {...textareaProps}
        />
      ) : (
        <div className={styles.preview}>
          {value.trim() ? <Markdown>{value}</Markdown> : <p className={styles.empty}>Nothing to preview yet.</p>}
        </div>
      )}
    </div>
  );
}
