import { useId, useState } from "react";
import { Check } from "lucide-react";
import { MAX_DESCRIPTION_LENGTH, MAX_KEYWORD_LENGTH, MAX_KEYWORDS, updatePackage } from "@/api/registry";
import { useToast } from "@/hooks/useToast";
import { describedBy } from "@/utils/a11y";
import { parseKeywords } from "@/utils/validation";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import styles from "./EditPackageModal.module.css";

function validateKeywords(keywords) {
  if (keywords.length > MAX_KEYWORDS) return `Use at most ${MAX_KEYWORDS} keywords.`;
  const tooLong = keywords.find((keyword) => keyword.length > MAX_KEYWORD_LENGTH);
  if (tooLong) return `Keywords can be at most ${MAX_KEYWORD_LENGTH} characters.`;
  return null;
}

/**
 * Lets the owner change a package's description and keywords.
 * `onSaved` gets the package's `{ name, description, keywords }` as stored.
 */
export default function EditPackageModal({ pkg, token, onClose, onSaved }) {
  const id = useId();
  const toast = useToast();
  const [description, setDescription] = useState(pkg.description);
  const [keywordsInput, setKeywordsInput] = useState(pkg.keywords.join(", "));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const keywords = parseKeywords(keywordsInput);
  const keywordsError = validateKeywords(keywords);
  // Only fields the owner actually changed are sent, so untouched ones are stored as they were.
  const descriptionChanged = description.trim() !== pkg.description.trim();
  const keywordsChanged = keywords.join(",") !== parseKeywords(pkg.keywords.join(",")).join(",");
  const canSave = (descriptionChanged || keywordsChanged) && !keywordsError && !pending;

  const submit = async (event) => {
    event.preventDefault();
    if (!canSave) return;
    setPending(true);
    setError(null);
    try {
      const saved = await updatePackage(
        pkg.name,
        {
          ...(descriptionChanged && { description: description.trim() }),
          ...(keywordsChanged && { keywords }),
        },
        { token },
      );
      toast.success(`Updated ${pkg.name}.`);
      onSaved(saved);
    } catch (err) {
      setError(err.message);
      setPending(false);
    }
  };

  // Descriptions are a single line, so Enter saves instead of starting a new one.
  const onDescriptionKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      event.currentTarget.form.requestSubmit();
    }
  };

  const descriptionId = `${id}-description`;
  const keywordsId = `${id}-keywords`;

  return (
    <Modal onClose={pending ? () => {} : onClose} labelledBy={`${id}-title`} size="md">
      <form onSubmit={submit} className={styles.form}>
        <h2 id={`${id}-title`} className={styles.title}>
          Edit {pkg.name}
        </h2>

        {error && <Alert tone="error">{error}</Alert>}

        <Field
          label="Description"
          htmlFor={descriptionId}
          hint="Shown in search results and at the top of the package page. Leave it empty to remove it."
          aside={
            <span className={styles.count} aria-hidden="true">
              {description.length}/{MAX_DESCRIPTION_LENGTH}
            </span>
          }
        >
          <Textarea
            id={descriptionId}
            value={description}
            onChange={(event) => setDescription(event.target.value.replace(/\s*\n\s*/g, " "))}
            onKeyDown={onDescriptionKeyDown}
            placeholder="High-performance utility functions for Quantum Language"
            maxLength={MAX_DESCRIPTION_LENGTH}
            rows={3}
            aria-describedby={describedBy(descriptionId, { hint: true })}
            autoFocus
          />
        </Field>

        <Field
          label="Keywords"
          htmlFor={keywordsId}
          hint="Separate with commas. They help people find your package in search."
          error={keywordsError}
          aside={
            <span className={styles.count} aria-hidden="true">
              {keywords.length}/{MAX_KEYWORDS}
            </span>
          }
        >
          <Input
            id={keywordsId}
            value={keywordsInput}
            onChange={(event) => setKeywordsInput(event.target.value)}
            placeholder="quantum, math, matrix"
            autoComplete="off"
            invalid={Boolean(keywordsError)}
            aria-describedby={describedBy(keywordsId, { error: keywordsError, hint: true })}
          />
          {keywords.length > 0 && (
            <div className={styles.chips} aria-label="Keyword preview">
              {keywords.map((keyword) => (
                <Badge key={keyword} tone="cyan">
                  #{keyword}
                </Badge>
              ))}
            </div>
          )}
        </Field>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" icon={Check} loading={pending} disabled={!canSave}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
