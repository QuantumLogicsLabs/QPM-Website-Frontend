import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { Compass, LogOut, Menu, Upload, User, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/utils/cn";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/publish", label: "Publish", icon: Upload },
];

const navLinkClass = ({ isActive }) => cn(styles.navLink, isActive && styles.active);

export default function Navbar() {
  const { user, isReady, openAuth } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);

  // Close the mobile menu whenever the route changes.
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  // Explore has its own large search box.
  const showSearch = pathname !== "/explore";

  return (
    <header className={styles.header}>
      <div className={cn("container", styles.bar)}>
        <Logo />

        {showSearch && (
          <div className={styles.search}>
            <SearchBar shortcut />
          </div>
        )}

        <nav aria-label="Main" className={styles.nav}>
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={navLinkClass}>
              <Icon size={17} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          {!isReady ? (
            <Skeleton width={132} height={34} radius="999px" />
          ) : user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => openAuth("login")}>
                Sign in
              </Button>
              <Button size="sm" onClick={() => openAuth("signup")}>
                Sign up
              </Button>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          icon={menuOpen ? X : Menu}
          className={styles.menuToggle}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        />
      </div>

      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </header>
  );
}

function MobileMenu({ onClose }) {
  const { user, isReady, openAuth, logout } = useAuth();
  const toast = useToast();

  const openAuthFromMenu = (mode) => {
    onClose();
    openAuth(mode);
  };

  return (
    <div id="mobile-menu" className={styles.mobileMenu}>
      <div className={cn("container", styles.mobileInner)}>
        <SearchBar onSearch={onClose} />

        <nav aria-label="Main" className={styles.mobileNav}>
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={navLinkClass}>
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
          {user && (
            <NavLink to="/profile" className={navLinkClass}>
              <User size={18} aria-hidden="true" />
              Your profile
            </NavLink>
          )}
        </nav>

        {isReady && (
          <div className={styles.mobileAccount}>
            {user ? (
              <>
                <Link to="/profile" className={styles.mobileUser}>
                  <Avatar name={user.username} size={32} />
                  <span>@{user.username}</span>
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={LogOut}
                  onClick={() => {
                    onClose();
                    logout();
                    toast.info("You've been signed out.");
                  }}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" block onClick={() => openAuthFromMenu("login")}>
                  Sign in
                </Button>
                <Button block onClick={() => openAuthFromMenu("signup")}>
                  Create account
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
