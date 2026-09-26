import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/utils/cn";
import styles from "./Markdown.module.css";

const REMARK_PLUGINS = [remarkGfm];

const COMPONENTS = {
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
