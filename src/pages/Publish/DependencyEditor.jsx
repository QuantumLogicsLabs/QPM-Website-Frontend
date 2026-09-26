import { Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "./DependencyEditor.module.css";

let nextKey = 0;
const createRow = () => ({ key: ++nextKey, name: "", range: "^1.0.0" });

/** Row-based editor for { name: range } dependencies — no hand-written JSON. */
export default function DependencyEditor({ id, value, onChange, disabled = false }) {
  const update = (key, patch) => onChange(value.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  const remove = (key) => onChange(value.filter((row) => row.key !== key));

  return (
    <div id={id} tabIndex={-1} className={styles.editor}>
      {value.length > 0 ? (
        <ul role="list" className={styles.rows}>
          {value.map((row, index) => (
            <li key={row.key} className={styles.row}>
              <Input
                aria-label={`Dependency ${index + 1} name`}
                value={row.name}
                onChange={(event) => update(row.key, { name: event.target.value.toLowerCase().trim() })}
                placeholder="package-name"
                autoComplete="off"
                spellCheck={false}
                autoFocus
                disabled={disabled}
                className="mono"
              />
              <Input
                aria-label={`Dependency ${index + 1} version range`}
                value={row.range}
                onChange={(event) => update(row.key, { range: event.target.value })}
                placeholder="^1.0.0"
                autoComplete="off"
                spellCheck={false}
                disabled={disabled}
                className="mono"
              />
              <Button
                variant="ghost"
                icon={Trash2}
                aria-label={`Remove dependency ${row.name || index + 1}`}
                onClick={() => remove(row.key)}
                disabled={disabled}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>No dependencies yet.</p>
      )}
      <Button
        variant="secondary"
        size="sm"
        icon={Plus}
        onClick={() => onChange([...value, createRow()])}
        disabled={disabled}
        className={styles.add}
      >
        Add dependency
      </Button>
    </div>
  );
}
