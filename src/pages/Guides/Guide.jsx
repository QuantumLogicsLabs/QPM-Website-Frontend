import { Link, NavLink, useParams } from "react-router";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { cn } from "@/utils/cn";
import Markdown from "@/components/package/Markdown";
import GithubIcon from "@/components/ui/GithubIcon";
import PageMeta from "@/components/ui/PageMeta";
import NotFound from "@/pages/NotFound/NotFound";
import { GUIDES } from "./guides";
import styles from "./Guides.module.css";

// Bundled into this page's chunk only, so the footer's guide list stays light.
const BODIES = import.meta.glob("./articles/*.md", { query: "?raw", import: "default", eager: true });
const SOURCE_URL = "https://github.com/QuantumLogicsLabs/QPM-Website-Frontend/blob/main/src/pages/Guides/articles";

const sidebarLinkClass = ({ isActive }) => cn(styles.sidebarLink, isActive && styles.active);

export default function Guide() {
  const { slug } = useParams();
  const index = GUIDES.findIndex((guide) => guide.slug === slug);
  const body = BODIES[`./articles/${slug}.md`];
  if (index === -1 || body === undefined) return <NotFound />;

  const { title, summary, minutes } = GUIDES[index];
  const previous = GUIDES[index - 1];
  const next = GUIDES[index + 1];

  return (
    <div className={cn("container page", styles.layout)}>
      <PageMeta title={title} />

      <nav aria-label="Guides" className={styles.sidebar}>
        <h2 className={styles.sidebarHeading}>Guides</h2>
        <ul role="list" className={styles.sidebarLinks}>
          {GUIDES.map((guide) => (
            <li key={guide.slug}>
              <NavLink to={`/guides/${guide.slug}`} className={sidebarLinkClass}>
                {guide.title}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <article className={styles.article}>
        <Link to="/guides" className={styles.back}>
          <ArrowLeft size={15} aria-hidden="true" />
          All guides
        </Link>

        <header className={styles.articleHeader}>
          <h1 className={styles.articleTitle}>{title}</h1>
          <p className={styles.lead}>{summary}</p>
          <p className={styles.readTime}>
            <Clock size={14} aria-hidden="true" />
            {minutes} min read
          </p>
        </header>

        <Markdown>{body}</Markdown>

        <footer className={styles.articleFooter}>
          <a href={`${SOURCE_URL}/${slug}.md`} target="_blank" rel="noopener noreferrer" className={styles.edit}>
            <GithubIcon size={15} />
            Suggest an edit to this guide
          </a>

          {(previous || next) && (
            <nav aria-label="More guides" className={styles.pager}>
              {previous && (
                <Link to={`/guides/${previous.slug}`} className={cn("surface", styles.pagerLink)}>
                  <span className={styles.pagerLabel}>
                    <ArrowLeft size={14} aria-hidden="true" />
                    Previous
                  </span>
                  {previous.title}
                </Link>
              )}
              {next && (
                <Link to={`/guides/${next.slug}`} className={cn("surface", styles.pagerLink, styles.pagerNext)}>
                  <span className={styles.pagerLabel}>
                    Next
                    <ArrowRight size={14} aria-hidden="true" />
                  </span>
                  {next.title}
                </Link>
              )}
            </nav>
          )}
        </footer>
      </article>
    </div>
  );
}
