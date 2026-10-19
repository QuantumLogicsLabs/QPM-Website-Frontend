import { useId, useState } from "react";
import { Check } from "lucide-react";
import { MAX_DESCRIPTION_LENGTH, updatePackageDescription } from "@/api/registry";
import { useToast } from "@/hooks/useToast";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import styles from "./EditDescriptionModal.module.css";

/** Lets the owner rewrite a package's description. `onSaved` gets the description as stored. */
export default function EditDescriptionModal({ pkg, token, onClose, onSaved }) {
  const id = useId();
  const toast = useToast();
  const [description, setDescription] = useState(pkg.description);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const changed = description.trim() !== pkg.description.trim();

  const submit = async (event) => {
    event.preventDefault();
    if (!changed || pending) return;
    setPending(true);
    setError(null);
    try {
      const data = await updatePackageDescription(pkg.name, description.trim(), { token });
      toast.success(`Updated the description of ${pkg.name}.`);
      onSaved(data.package.description);
    } catch (err) {
      setError(err.message);
      setPending(false);
    }
  };

  // Descriptions are a single line, so Enter saves instead of starting a new one.
  const onKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      event.currentTarget.form.requestSubmit();
    }
  };

  return (
    <Modal onClose={pending ? () => {} : onClose} labelledBy={`${id}-title`}>
      <form onSubmit={submit} className={styles.form}>
        <h2 id={`${id}-title`} className={styles.title}>
          Edit {pkg.name}
        </h2>

        {error && <Alert tone="error">{error}</Alert>}

        <Field
          label="Description"
          htmlFor={`${id}-description`}
          hint="Shown in search results and at the top of the package page. Leave it empty to remove it."
          aside={
            <span className={styles.count} aria-hidden="true">
              {description.length}/{MAX_DESCRIPTION_LENGTH}
            </span>
          }
        >
          <Textarea
            id={`${id}-description`}
            value={description}
            onChange={(event) => setDescription(event.target.value.replace(/\s*\n\s*/g, " "))}
            onKeyDown={onKeyDown}
            placeholder="High-performance utility functions for Quantum Language"
            maxLength={MAX_DESCRIPTION_LENGTH}
            rows={3}
            aria-describedby={`${id}-description-hint`}
            autoFocus
          />
        </Field>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" icon={Check} loading={pending} disabled={!changed || pending}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
