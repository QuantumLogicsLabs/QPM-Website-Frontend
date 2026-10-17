import { useId, useState } from "react";
import { Trash2 } from "lucide-react";
import { deletePackage } from "@/api/registry";
import { useToast } from "@/hooks/useToast";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import styles from "./DeletePackageModal.module.css";

/** Asks the owner to type the package name before deleting it for good. */
export default function DeletePackageModal({ pkg, token, onClose, onDeleted }) {
  const id = useId();
  const toast = useToast();
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const confirmed = confirmation.trim().toLowerCase() === pkg.name;

  const submit = async (event) => {
    event.preventDefault();
    if (!confirmed || pending) return;
    setPending(true);
    setError(null);
    try {
      await deletePackage(pkg.name, { token });
      toast.success(`Deleted ${pkg.name}.`);
      onDeleted(pkg);
    } catch (err) {
      setError(err.message);
      setPending(false);
    }
  };

  return (
    <Modal onClose={pending ? () => {} : onClose} labelledBy={`${id}-title`} describedBy={`${id}-description`}>
      <form onSubmit={submit} className={styles.form}>
        <header>
          <h2 id={`${id}-title`} className={styles.title}>
            Delete {pkg.name}?
          </h2>
          <p id={`${id}-description`} className={styles.description}>
            This permanently removes the package, all of its versions and their files from the registry. Anyone
            depending on it will no longer be able to install it.
          </p>
        </header>

        {error && <Alert tone="error">{error}</Alert>}

        <Field label={`Type ${pkg.name} to confirm`} htmlFor={`${id}-confirm`}>
          <Input
            id={`${id}-confirm`}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            autoFocus
          />
        </Field>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" icon={Trash2} loading={pending} disabled={!confirmed || pending}>
            Delete package
          </Button>
        </div>
      </form>
    </Modal>
  );
}
