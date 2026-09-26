import { useId, useState } from "react";
import { GitBranch } from "lucide-react";
import { publishFromGithub } from "@/api/registry";
import { useAuth } from "@/hooks/useAuth";
import { describedBy } from "@/utils/a11y";
import {
  dependenciesToObject,
  parseGithubRepo,
  validateDependencies,
  validateGithubRepo,
  validateVersion,
} from "@/utils/validation";
import Alert from "@/components/ui/Alert";
import Field from "@/components/ui/Field";
import GithubIcon from "@/components/ui/GithubIcon";
import { Input } from "@/components/ui/Input";
import ProgressBar from "@/components/ui/ProgressBar";
import SubmitButton from "@/components/ui/SubmitButton";
import DependencyEditor from "./DependencyEditor";
import styles from "./Form.module.css";

export default function GithubImportForm({ onPublished }) {
  const { token } = useAuth();
  const id = useId();
  const fieldId = (name) => `${id}-${name}`;

  const [values, setValues] = useState({ repoUrl: "", branch: "main", version: "1.0.0" });
  const [dependencies, setDependencies] = useState([]);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [request, setRequest] = useState({ pending: false, error: null });

  const errors = {
    repoUrl: validateGithubRepo(values.repoUrl.trim()),
    branch: values.branch.trim() ? null : "Branch is required.",
    version: validateVersion(values.version.trim()),
    dependencies: validateDependencies(dependencies),
  };
  const errorFor = (field) => (submitted || touched[field] ? errors[field] : null);
  const touch = (field) => () => setTouched((current) => ({ ...current, [field]: true }));
  const update = (field) => (event) => setValues((current) => ({ ...current, [field]: event.target.value }));

  const repo = parseGithubRepo(values.repoUrl);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);

    const invalidField = Object.keys(errors).find((field) => errors[field]);
    if (invalidField) {
      document.getElementById(fieldId(invalidField))?.focus();
      return;
    }

    setRequest({ pending: true, error: null });
    try {
      const result = await publishFromGithub(
        {
          repoUrl: values.repoUrl.trim(),
          branch: values.branch.trim(),
          version: values.version.trim(),
          dependencies: dependenciesToObject(dependencies),
        },
        { token },
      );
      setRequest({ pending: false, error: null });
      onPublished(result.package);
    } catch (error) {
      setRequest({ pending: false, error: error.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className={styles.form}>
      <section className={styles.section} aria-labelledby={fieldId("repo-title")}>
        <div>
          <h2 id={fieldId("repo-title")} className={styles.sectionTitle}>
            Repository
          </h2>
          <p className={styles.sectionLead}>
            QPM downloads the branch from GitHub and stores it as this version&apos;s tarball. The
            repository must be public.
          </p>
        </div>

        <Field
          label="GitHub repository URL"
          htmlFor={fieldId("repoUrl")}
          required
          error={errorFor("repoUrl")}
          hint="e.g. https://github.com/owner/repo"
        >
          <Input
            id={fieldId("repoUrl")}
            type="url"
            icon={GithubIcon}
            value={values.repoUrl}
            onChange={update("repoUrl")}
            onBlur={touch("repoUrl")}
            placeholder="https://github.com/owner/repo"
            autoComplete="off"
            spellCheck={false}
            invalid={Boolean(errorFor("repoUrl"))}
            aria-describedby={describedBy(fieldId("repoUrl"), { error: errorFor("repoUrl"), hint: true })}
          />
        </Field>

        <div className={styles.rowEven}>
          <Field label="Branch" htmlFor={fieldId("branch")} required error={errorFor("branch")}>
            <Input
              id={fieldId("branch")}
              icon={GitBranch}
              value={values.branch}
              onChange={update("branch")}
              onBlur={touch("branch")}
              placeholder="main"
              autoComplete="off"
              spellCheck={false}
              invalid={Boolean(errorFor("branch"))}
              aria-describedby={describedBy(fieldId("branch"), { error: errorFor("branch") })}
              className="mono"
            />
          </Field>
          <Field label="Version" htmlFor={fieldId("version")} required error={errorFor("version")}>
            <Input
              id={fieldId("version")}
              value={values.version}
              onChange={update("version")}
              onBlur={touch("version")}
              placeholder="1.0.0"
              autoComplete="off"
              spellCheck={false}
              invalid={Boolean(errorFor("version"))}
              aria-describedby={describedBy(fieldId("version"), { error: errorFor("version") })}
              className="mono"
            />
          </Field>
        </div>

        {repo && (
          <p className={styles.repoPreview}>
            <GithubIcon size={16} />
            Will import <strong>{repo.owner}/{repo.repo}</strong> from branch
            <code>{values.branch.trim() || "main"}</code>
          </p>
        )}

        <Alert tone="info" title="What gets imported">
          <ul className={styles.importList}>
            <li>
              Name, description, keywords and license from <code>qpm.json</code> (the name falls
              back to the repository name).
            </li>
            <li>
              <code>README.md</code> becomes the package page.
            </li>
            <li>The whole branch is archived as the version&apos;s .tgz.</li>
          </ul>
        </Alert>
      </section>

      <section className={styles.section} aria-labelledby={fieldId("deps-title")}>
        <div>
          <h2 id={fieldId("deps-title")} className={styles.sectionTitle}>
            Dependencies
          </h2>
          <p className={styles.sectionLead}>Other QPM packages this version needs at install time.</p>
        </div>
        <Field htmlFor={fieldId("dependencies")} error={errorFor("dependencies")}>
          <DependencyEditor
            id={fieldId("dependencies")}
            value={dependencies}
            onChange={setDependencies}
            disabled={request.pending}
          />
        </Field>
      </section>

      <footer className={styles.footer}>
        {request.error && (
          <Alert tone="error" title="Import failed">
            {request.error}
          </Alert>
        )}

        {request.pending && (
          <div className={styles.progress}>
            <div className={styles.progressLabel}>
              <span>Fetching from GitHub and saving to Google Drive…</span>
            </div>
            <ProgressBar value={null} label="Import progress" />
          </div>
        )}

        <div className={styles.actions}>
          <SubmitButton size="lg" icon={GithubIcon} loading={request.pending} pendingLabel="Importing…">
            Import &amp; publish
          </SubmitButton>
        </div>
      </footer>
    </form>
  );
}
