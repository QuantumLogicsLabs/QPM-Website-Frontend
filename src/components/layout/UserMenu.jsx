import { useId, useRef, useState } from "react";
import { Link } from "react-router";
import { ChevronDown, LogOut, Upload, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDismiss } from "@/hooks/useDismiss";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/utils/cn";
import Avatar from "@/components/ui/Avatar";
import styles from "./UserMenu.module.css";

/** Avatar button with a disclosure dropdown (profile, publish, sign out). */
export default function UserMenu({ user }) {
  const { logout } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuId = useId();
  const close = () => setOpen(false);

  useDismiss(rootRef, close, open);

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Account menu for @${user.username}`}
        onClick={() => setOpen((value) => !value)}
      >
        <Avatar name={user.username} size={28} />
        <span className={styles.username}>{user.username}</span>
        <ChevronDown size={15} className={cn(styles.chevron, open && styles.chevronOpen)} aria-hidden="true" />
      </button>

      {open && (
        <div id={menuId} className={styles.menu}>
          <div className={styles.menuHeader}>
            <p className={styles.caption}>Signed in as</p>
            <p className={styles.handle}>@{user.username}</p>
          </div>
          <ul role="list" className={styles.items}>
            <li>
              <Link to="/profile" className={styles.item} onClick={close}>
                <User size={16} aria-hidden="true" />
                Your profile
              </Link>
            </li>
            <li>
              <Link to="/publish" className={styles.item} onClick={close}>
                <Upload size={16} aria-hidden="true" />
                Publish a package
              </Link>
            </li>
            <li className={styles.separator}>
              <button
                type="button"
                className={styles.item}
                onClick={() => {
                  close();
                  logout();
                  toast.info("You've been signed out.");
                }}
              >
                <LogOut size={16} aria-hidden="true" />
                Sign out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
