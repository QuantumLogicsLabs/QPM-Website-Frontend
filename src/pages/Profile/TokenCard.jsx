import { useState } from "react";
import { Eye, EyeOff, KeyRound, RefreshCw } from "lucide-react";
import { getApiToken, regenerateApiToken } from "@/api/auth";
import { useResource } from "@/hooks/useResource";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/utils/cn";
import { publishCurlSnippet, qpmPublishSnippet } from "@/utils/snippets";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import CopyButton from "@/components/ui/CopyButton";
import Skeleton from "@/components/ui/Skeleton";
import styles from "./TokenCard.module.css";

const mask = (token) => `${"•".repeat(28)}${token.slice(-6)}`;

/**
 * The account's API token, for `qpm login` and scripts. It doesn't expire, so it's masked
 * by default and can be regenerated, which retires the old one. A backend without API
 * tokens answers 404; the session token stands in for one then.
 */
export default function TokenCard({ sessionToken }) {
  const toast = useToast();
  const [revealed, setRevealed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenerated, setRegenerated] = useState(null);
  const { data, error, initialLoading, reload } = useResource(
    (signal) => getApiToken(sessionToken, { signal }),
    [sessionToken],
  );

  const legacy = error?.status === 404;
  const token = regenerated ?? data?.token ?? (legacy ? sessionToken : null);
  const commands = qpmPublishSnippet();

  const regenerate = async () => {
    setRegenerating(true);
    try {
      const { token: next } = await regenerateApiToken(sessionToken);
      setRegenerated(next);
      setRevealed(false);
      setConfirming(false);
      toast.success("New API token created. Run qpm login with it on each computer that publishes.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <section className={cn("surface", styles.card)} aria-labelledby="token-heading">
      <div className={styles.header}>
        <span className={styles.icon}>
          <KeyRound size={20} aria-hidden="true" />
        </span>
        <div className={styles.heading}>
          <h2 id="token-heading" className={styles.title}>
            API token
          </h2>
          <p className={styles.description}>
            {legacy ? (
              "Authenticates publishing from scripts and the terminal. Treat it like a password — it expires 7 days after you sign in."
            ) : (
              <>
                Paste it into <code>qpm login</code> once to publish from the terminal or scripts. Treat it like a
                password — it doesn&apos;t expire, so regenerate it if it leaks.
              </>
            )}
          </p>
        </div>
        {!legacy && (
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            className={styles.regenerate}
            disabled={!token || confirming}
            onClick={() => setConfirming(true)}
          >
            Regenerate
          </Button>
        )}
      </div>

      {confirming && (
        <Alert
          tone="warning"
          title="Regenerate your API token?"
          action={
            <div className={styles.confirmActions}>
              <Button variant="secondary" size="sm" disabled={regenerating} onClick={() => setConfirming(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" loading={regenerating} onClick={regenerate}>
                Regenerate
              </Button>
            </div>
          }
        >
          The current token stops working right away, on every computer and in every script that uses it.
        </Alert>
      )}

      {error && !legacy ? (
        <Alert
          tone="error"
          title="Couldn't load your API token"
          action={
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={reload}>
              Retry
            </Button>
          }
        >
          {error.message}
        </Alert>
      ) : (
        <div className={styles.tokenRow}>
          {initialLoading || !token ? (
            <Skeleton width="min(420px, 70%)" height={18} />
          ) : (
            <code className={styles.token} aria-label={revealed ? "API token" : "API token (hidden)"}>
              {revealed ? token : mask(token)}
            </code>
          )}
          {token && (
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
          )}
        </div>
      )}

      <div>
        <div className={styles.terminalHeader}>
          <h3 className={styles.terminalTitle}>Publish from the terminal</h3>
          <CopyButton value={commands} label="Copy commands" />
        </div>
        <pre className={styles.code}>
          <code>{commands}</code>
        </pre>
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
