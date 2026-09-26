import { Link } from "react-router";
import { cn } from "@/utils/cn";
import Spinner from "./Spinner";
import styles from "./Button.module.css";

const ICON_SIZE = { sm: 15, md: 17, lg: 18 };

/**
 * One button for every call site. Renders a router <Link> with `to`,
 * a plain <a> with `href`, otherwise a <button>.
 * Pass icons as components: icon={Upload}.
 */
export default function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  block = false,
  to,
  href,
  type = "button",
  disabled,
  className,
  children,
  ...rest
}) {
  const iconSize = ICON_SIZE[size];
  const classes = cn(
    styles.button,
    styles[variant],
    styles[size],
    block && styles.block,
    !children && styles.iconOnly,
    className,
  );

  const content = (
    <>
      {loading ? <Spinner size={iconSize} /> : Icon && <Icon size={iconSize} aria-hidden="true" />}
      {children && <span className={styles.label}>{children}</span>}
      {IconRight && !loading && <IconRight size={iconSize} aria-hidden="true" />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {content}
    </button>
  );
}
