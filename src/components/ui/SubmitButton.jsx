import { useFormStatus } from "react-dom";
import Button from "./Button";

/**
 * Submit button that reads its parent <form action={...}>'s pending state via
 * react-dom's useFormStatus. Forms using onSubmit can pass `loading` instead.
 */
export default function SubmitButton({ loading = false, pendingLabel, children, ...props }) {
  const { pending } = useFormStatus();
  const busy = pending || loading;

  return (
    <Button type="submit" loading={busy} {...props}>
      {busy && pendingLabel ? pendingLabel : children}
    </Button>
  );
}
