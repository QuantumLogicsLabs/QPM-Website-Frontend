import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { API_BASE } from "@/api/client";
import { getHealth } from "@/api/registry";
import { useResource } from "@/hooks/useResource";
import { cn } from "@/utils/cn";
import { GUIDES } from "@/pages/Guides/guides";
import Logo from "./Logo";
import styles from "./Footer.module.css";

const YEAR = new Date().getFullYear();
const REPO_URL = "https://github.com/QuantumLogicsLabs/QPM-Website";
const FOOTER_GUIDES = GUIDES.slice(0, 3);

const STATUS_COPY = {
  checking: "Checking registry status…",
  online: "Registry online",
  offline: "Registry unreachable",
};

export default function Footer() {
  const { error, loading } = useResource((signal) => getHealth({ signal }), []);
  const status = loading ? "checking" : error ? "offline" : "online";

  return (
    <footer className={styles.footer}>
      <div className={cn("container", styles.grid)}>
        <div className={styles.brand}>
          <Logo />
          <p className={styles.tagline}>
            The package registry for the Quantum Language ecosystem. Discover, publish and install
            modules with a single <code>qpm install</code>.
          </p>
          <p className={cn(styles.status, styles[status])} role="status">
            <span className={styles.dot} aria-hidden="true" />
            {STATUS_COPY[status]}
          </p>
        </div>

        <nav aria-label="Registry" className={styles.column}>
          <h2 className={styles.heading}>Registry</h2>
          <ul role="list" className={styles.links}>
            <li>
              <Link to="/explore">Explore packages</Link>
            </li>
            <li>
              <Link to="/publish">Publish a package</Link>
            </li>
            <li>
              <Link to="/profile">Your dashboard</Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Resources" className={styles.column}>
          <h2 className={styles.heading}>Resources</h2>
          <ul role="list" className={styles.links}>
            <li>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                Source on GitHub
              </a>
            </li>
            <li>
              <a href={`${API_BASE}/health`} target="_blank" rel="noopener noreferrer">
                API health
              </a>
            </li>
          </ul>
        </nav>

        <nav aria-label="Guides" className={styles.column}>
          <h2 className={styles.heading}>Guides</h2>
          <ul role="list" className={styles.links}>
            {FOOTER_GUIDES.map(({ slug, title }) => (
              <li key={slug}>
                <Link to={`/guides/${slug}`}>{title}</Link>
              </li>
            ))}
            <li>
              <Link to="/guides" className={styles.more}>
                All guides
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className={cn("container", styles.bottom)}>
        <p>© {YEAR} QPM Ecosystem. Built with care for the Quantum Language community.</p>
      </div>
    </footer>
  );
}
