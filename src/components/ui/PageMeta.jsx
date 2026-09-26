const DEFAULT_TITLE = "QPM — Quantum Package Manager Registry";

/**
 * Per-page document title. React 19 hoists <title> into <head> from anywhere
 * in the tree, so no helmet library or effect is needed.
 */
export default function PageMeta({ title }) {
  return <title>{title ? `${title} · QPM Registry` : DEFAULT_TITLE}</title>;
}
