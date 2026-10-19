import { Link } from "react-router";
import { ArrowRight, CircleCheck } from "lucide-react";
import { cn } from "@/utils/cn";
import { qpmPublishSnippet } from "@/utils/snippets";
import CopyButton from "@/components/ui/CopyButton";
import styles from "./PublishTips.module.css";

const TIPS = [
  { title: "Lowercase names.", body: "Letters, numbers, dashes, dots and underscores." },
  { title: "Semantic versions.", body: "Each version of a package can be published only once." },
  { title: "Your name, your package.", body: "Signed-in authors lock the package name to their account." },
  { title: "100 MB limit", body: "per archive." },
];

export default function PublishTips() {
  const commands = qpmPublishSnippet({ comments: false });

  return (
    <aside className={styles.aside} aria-label="Publishing tips">
      <section className={cn("surface", styles.card)}>
        <h2 className={styles.heading}>Before you publish</h2>
        <ul role="list" className={styles.tips}>
          {TIPS.map(({ title, body }) => (
            <li key={title}>
              <CircleCheck size={16} aria-hidden="true" />
              <span>
                <strong>{title}</strong> {body}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className={cn("surface", styles.card)}>
        <div className={styles.cardHeader}>
          <h2 className={styles.heading}>Prefer the terminal?</h2>
          <CopyButton value={commands} label="Copy commands" />
        </div>
        <p className={styles.body}>
          Log in to qpm once with the API token from your profile, then run these in your package folder.
        </p>
        <pre className={styles.code}>
          <code>{commands}</code>
        </pre>
        <Link to="/profile" className={styles.link}>
          Get your API token
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </section>
    </aside>
  );
}
