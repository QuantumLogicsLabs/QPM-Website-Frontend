import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/utils/cn";
import styles from "./Markdown.module.css";

const REMARK_PLUGINS = [remarkGfm];

// READMEs start with their own "# title", but the page already has an <h1>.
// Render every heading one level lower while keeping its original look.
const demoted = (level) =>
  function Heading({ node: _node, className, ...props }) {
    const Tag = `h${Math.min(level + 1, 6)}`;
    return <Tag className={cn(styles[`h${level}`], className)} {...props} />;
  };

const COMPONENTS = {
  h1: demoted(1),
  h2: demoted(2),
  h3: demoted(3),
  h4: demoted(4),
  h5: demoted(5),
  h6: demoted(6),
  // External links open in a new tab; `node` is stripped so it isn't passed to the DOM.
  a: ({ node: _node, href = "", ...props }) =>
    /^https?:\/\//i.test(href) ? (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
    ) : (
      <a href={href} {...props} />
    ),
};

/** Renders README markdown (GitHub-flavoured). Raw HTML is not rendered. */
export default function Markdown({ children, className }) {
  return (
    <div className={cn(styles.prose, className)}>
      <ReactMarkdown remarkPlugins={REMARK_PLUGINS} components={COMPONENTS}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
