import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { cn } from "@/utils/cn";
import { publishCurlSnippet } from "@/utils/snippets";
import Button from "@/components/ui/Button";
import CopyButton from "@/components/ui/CopyButton";
import styles from "./TokenCard.module.css";

const mask = (token) => `${"•".repeat(28)}${token.slice(-6)}`;

/** The JWT is masked by default — it grants publish rights to the account. */
export default function TokenCard({ token }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <section className={cn("surface", styles.card)} aria-labelledby="token-heading">
      <div className={styles.header}>
        <span className={styles.icon}>
          <KeyRound size={20} aria-hidden="true" />
        </span>
        <div>
          <h2 id="token-heading" className={styles.title}>
            API token
          </h2>
          <p className={styles.description}>
            Authenticates publishing from scripts and the terminal. Treat it like a password — it
            expires 7 days after you sign in.
          </p>
        </div>
      </div>

      <div className={styles.tokenRow}>
        <code className={styles.token} aria-label={revealed ? "API token" : "API token (hidden)"}>
          {revealed ? token : mask(token)}
        </code>
        <div className={styles.tokenActions}>
          <Button
            variant="ghost"
            size="sm"
            icon={revealed ? EyeOff : Eye}
            aria-label={revealed ? "Hide token" : "Reveal token"}
            aria-pressed={revealed}
            onClick={() => setRevealed((value) => !value)}
          />
          <CopyButton value={token} label="Copy token" copiedLabel="Copied" showLabel variant="secondary" />
        </div>
      </div>

      <details className={styles.usage}>
        <summary>Example: publish with curl</summary>
        <pre className={styles.code}>
          <code>{publishCurlSnippet()}</code>
        </pre>
      </details>
    </section>
  );
}
