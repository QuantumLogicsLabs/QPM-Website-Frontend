import { useEffect, useId, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { isAbortError } from "@/api/client";
import { publishPackage } from "@/api/registry";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { describedBy } from "@/utils/a11y";
import {
  dependenciesToObject,
  guessFromFilename,
  parseKeywords,
  validateDependencies,
  validatePackageName,
  validateTarball,
  validateUrl,
  validateVersion,
} from "@/utils/validation";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import ProgressBar from "@/components/ui/ProgressBar";
import SubmitButton from "@/components/ui/SubmitButton";
import DependencyEditor from "./DependencyEditor";
import FileDropzone from "./FileDropzone";
import ReadmeEditor from "./ReadmeEditor";
import styles from "./Form.module.css";

const DEFAULT_VERSION = "1.0.0";
const LICENSES = ["MIT", "Apache-2.0", "GPL-3.0-only", "BSD-3-Clause", "ISC", "MPL-2.0", "Unlicense"];
const IDLE = { status: "idle", progress: 0, error: null };

export default function UploadForm({ initialName = "", onPublished }) {
  const { token } = useAuth();
  const toast = useToast();
  const id = useId();
  const fieldId = (name) => `${id}-${name}`;

  const [file, setFile] = useState(null);
  const [values, setValues] = useState({
    name: initialName.toLowerCase(),
    version: DEFAULT_VERSION,
    description: "",
    keywords: "",
    license: "MIT",
    repository: "",
    readme: "",
  });
  const [dependencies, setDependencies] = useState([]);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [upload, setUpload] = useState(IDLE);
  const abortRef = useRef(null);

  // Abort an in-flight upload if the user leaves the page.
  useEffect(() => {
    const pending = abortRef;
    return () => pending.current?.abort();
  }, []);

  const errors = {
    file: validateTarball(file),
    name: validatePackageName(values.name),
    version: validateVersion(values.version),
    repository: validateUrl(values.repository.trim()),
    dependencies: validateDependencies(dependencies),
  };
  const errorFor = (field) => (submitted || touched[field] ? errors[field] : null);
  const touch = (field) => () => setTouched((current) => ({ ...current, [field]: true }));
  const update = (field, transform = (value) => value) => (event) =>
    setValues((current) => ({ ...current, [field]: transform(event.target.value) }));

  const keywords = parseKeywords(values.keywords);
  const busy = upload.status !== "idle";

  const selectFile = (selected) => {
    setFile(selected);
    setTouched((current) => ({ ...current, file: true }));
    const guess = guessFromFilename(selected.name);
    setValues((current) => ({
      ...current,
      name: current.name || guess.name,
      version: guess.version && current.version === DEFAULT_VERSION ? guess.version : current.version,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);

    const invalidField = Object.keys(errors).find((field) => errors[field]);
    if (invalidField) {
      document.getElementById(fieldId(invalidField))?.focus();
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setUpload({ status: "uploading", progress: 0, error: null });

    try {
      const result = await publishPackage(
        {
          name: values.name,
          version: values.version.trim(),
          description: values.description.trim(),
          keywords: keywords.join(","),
          license: values.license.trim() || "MIT",
          repository: values.repository.trim(),
          readme: values.readme.trim(),
          dependencies: JSON.stringify(dependenciesToObject(dependencies)),
        },
        file,
        {
          token,
          signal: controller.signal,
          onProgress: (progress) =>
            setUpload((current) => ({
              ...current,
              progress,
              status: progress >= 1 ? "processing" : "uploading",
            })),
        },
      );
      setUpload(IDLE);
      onPublished(result?.package ?? { name: values.name, version: values.version });
    } catch (error) {
      if (isAbortError(error)) {
        setUpload(IDLE);
        toast.info("Upload cancelled.");
      } else {
        setUpload({ ...IDLE, error: error.message });
      }
    } finally {
      abortRef.current = null;
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className={styles.form}>
      <section className={styles.section} aria-labelledby={fieldId("archive-title")}>
        <div>
          <h2 id={fieldId("archive-title")} className={styles.sectionTitle}>
            Package archive
          </h2>
          <p className={styles.sectionLead}>
            Your built package as a <code>.tgz</code>. Optional — without one, an empty package
            container is created.
          </p>
        </div>
        <Field htmlFor={fieldId("file")} error={errorFor("file")}>
          <FileDropzone
            id={fieldId("file")}
            file={file}
            onSelect={selectFile}
            onClear={() => setFile(null)}
            invalid={Boolean(errorFor("file"))}
            disabled={busy}
            aria-describedby={describedBy(fieldId("file"), { error: errorFor("file") })}
          />
        </Field>
      </section>

      <section className={styles.section} aria-labelledby={fieldId("details-title")}>
        <h2 id={fieldId("details-title")} className={styles.sectionTitle}>
          Details
        </h2>

        <div className={styles.row}>
          <Field
            label="Package name"
            htmlFor={fieldId("name")}
            required
            error={errorFor("name")}
            hint="Lowercase letters, numbers, dashes, dots or underscores."
          >
            <Input
              id={fieldId("name")}
              value={values.name}
              onChange={update("name", (value) => value.toLowerCase().replace(/\s+/g, "-"))}
              onBlur={touch("name")}
              placeholder="quantum-utils"
              autoComplete="off"
              spellCheck={false}
              invalid={Boolean(errorFor("name"))}
              aria-describedby={describedBy(fieldId("name"), { error: errorFor("name"), hint: true })}
              className="mono"
            />
          </Field>
          <Field label="Version" htmlFor={fieldId("version")} required error={errorFor("version")} hint="Semantic version">
            <Input
              id={fieldId("version")}
              value={values.version}
              onChange={update("version")}
              onBlur={touch("version")}
              placeholder="1.0.0"
              autoComplete="off"
              spellCheck={false}
              invalid={Boolean(errorFor("version"))}
              aria-describedby={describedBy(fieldId("version"), { error: errorFor("version"), hint: true })}
              className="mono"
            />
          </Field>
        </div>

        <Field label="Description" htmlFor={fieldId("description")} optional>
          <Input
            id={fieldId("description")}
            value={values.description}
            onChange={update("description")}
            placeholder="High-performance utility functions for Quantum Language"
            maxLength={280}
          />
        </Field>

        <div className={styles.rowEven}>
          <Field label="Keywords" htmlFor={fieldId("keywords")} optional hint={keywords.length ? null : "Separate with commas."}>
            <Input
              id={fieldId("keywords")}
              value={values.keywords}
              onChange={update("keywords")}
              placeholder="quantum, math, matrix"
              autoComplete="off"
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
          <Field label="License" htmlFor={fieldId("license")}>
            <Input
              id={fieldId("license")}
              value={values.license}
              onChange={update("license")}
              list={fieldId("licenses")}
              placeholder="MIT"
              autoComplete="off"
            />
            <datalist id={fieldId("licenses")}>
              {LICENSES.map((license) => (
                <option key={license} value={license} />
              ))}
            </datalist>
          </Field>
        </div>

        <Field label="Repository URL" htmlFor={fieldId("repository")} optional error={errorFor("repository")}>
          <Input
            id={fieldId("repository")}
            type="url"
            value={values.repository}
            onChange={update("repository")}
            onBlur={touch("repository")}
            placeholder="https://github.com/username/repository"
            autoComplete="url"
            invalid={Boolean(errorFor("repository"))}
            aria-describedby={describedBy(fieldId("repository"), { error: errorFor("repository") })}
          />
        </Field>
      </section>

      <section className={styles.section} aria-labelledby={fieldId("deps-title")}>
        <div>
          <h2 id={fieldId("deps-title")} className={styles.sectionTitle}>
            Dependencies
          </h2>
          <p className={styles.sectionLead}>Other QPM packages this version needs at install time.</p>
        </div>
        <Field htmlFor={fieldId("dependencies")} error={errorFor("dependencies")}>
          <DependencyEditor id={fieldId("dependencies")} value={dependencies} onChange={setDependencies} disabled={busy} />
        </Field>
      </section>

      <section className={styles.section} aria-labelledby={fieldId("readme-title")}>
        <div>
          <h2 id={fieldId("readme-title")} className={styles.sectionTitle}>
            README
          </h2>
          <p className={styles.sectionLead}>
            Shown on the package page. Leave it empty to generate one from the name and description.
          </p>
        </div>
        <ReadmeEditor
          id={fieldId("readme")}
          value={values.readme}
          onChange={(readme) => setValues((current) => ({ ...current, readme }))}
          packageName={values.name}
          aria-labelledby={fieldId("readme-title")}
        />
      </section>

      <footer className={styles.footer}>
        {upload.error && (
          <Alert tone="error" title="Publishing failed">
            {upload.error}
          </Alert>
        )}

        {busy && (
          <div className={styles.progress}>
            <div className={styles.progressLabel}>
              <span>
                {upload.status === "processing"
                  ? "Saving to Google Drive…"
                  : `Uploading ${file ? file.name : "package metadata"}…`}
              </span>
              {upload.status === "uploading" && <span>{Math.round(upload.progress * 100)}%</span>}
            </div>
            <ProgressBar
              value={upload.status === "processing" ? null : upload.progress}
              label="Publishing progress"
            />
          </div>
        )}

        <div className={styles.actions}>
          {upload.status === "uploading" && (
            <Button variant="ghost" size="lg" onClick={() => abortRef.current?.abort()}>
              Cancel
            </Button>
          )}
          <SubmitButton size="lg" icon={Upload} loading={busy} pendingLabel="Publishing…">
            {values.name && !errors.version ? `Publish ${values.name}@${values.version}` : "Publish package"}
          </SubmitButton>
        </div>
      </footer>
    </form>
  );
}
