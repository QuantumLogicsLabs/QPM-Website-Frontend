/** Joins truthy class names: cn("a", cond && "b") → "a b". */
export const cn = (...parts) => parts.filter(Boolean).join(" ");
