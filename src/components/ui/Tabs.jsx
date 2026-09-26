import { cn } from "@/utils/cn";
import styles from "./Tabs.module.css";

const tabId = (prefix, id) => `${prefix}-tab-${id}`;
const panelId = (prefix, id) => `${prefix}-panel-${id}`;

/**
 * WAI-ARIA tablist with roving focus (←/→/Home/End).
 * @param {{ tabs: { id: string, label: string, icon?: any, count?: number }[] }} props
 */
export default function Tabs({ tabs, value, onChange, label, idPrefix, className }) {
  const onKeyDown = (event) => {
    const index = tabs.findIndex((tab) => tab.id === value);
    const last = tabs.length - 1;
    const next = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;

    event.preventDefault();
    onChange(tabs[next].id);
    event.currentTarget.querySelectorAll('[role="tab"]')[next]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className={cn(styles.list, className)} onKeyDown={onKeyDown}>
      {tabs.map(({ id, label: tabLabel, icon: Icon, count }) => {
        const selected = id === value;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            id={tabId(idPrefix, id)}
            aria-selected={selected}
            aria-controls={panelId(idPrefix, id)}
            tabIndex={selected ? 0 : -1}
            className={cn(styles.tab, selected && styles.active)}
            onClick={() => onChange(id)}
          >
            {Icon && <Icon size={16} aria-hidden="true" />}
            <span>{tabLabel}</span>
            {count != null && <span className={styles.count}>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ idPrefix, id, className, children }) {
  return (
    <div
      role="tabpanel"
      id={panelId(idPrefix, id)}
      aria-labelledby={tabId(idPrefix, id)}
      tabIndex={0}
      className={cn(styles.panel, className)}
    >
      {children}
    </div>
  );
}
