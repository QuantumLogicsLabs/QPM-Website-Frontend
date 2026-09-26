import { useActionState, useId, useState } from "react";
import { ArrowRight, AtSign, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { describedBy } from "@/utils/a11y";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import SubmitButton from "@/components/ui/SubmitButton";
import styles from "./AuthModal.module.css";

const COPY = {
  login: {
    title: "Welcome back",
    subtitle: "Sign in to manage your packages and API token.",
    submit: "Sign in",
    pending: "Signing in…",
    switchPrompt: "New to QPM?",
    switchLabel: "Create an account",
  },
  signup: {
    title: "Create your QPM account",
    subtitle: "Claim package names and publish under your own handle.",
    submit: "Create account",
    pending: "Creating account…",
    switchPrompt: "Already have an account?",
    switchLabel: "Sign in",
  },
};

export default function AuthModal({ initialMode = "login", onClose }) {
  const [mode, setMode] = useState(initialMode);
  const id = useId();
  const copy = COPY[mode];

  return (
    <Modal onClose={onClose} labelledBy={`${id}-title`} describedBy={`${id}-subtitle`}>
      <header className={styles.header}>
        <img src="/logo.svg" alt="" width={44} height={44} className={styles.logo} />
        <h2 id={`${id}-title`} className={styles.title}>
          {copy.title}
        </h2>
        <p id={`${id}-subtitle`} className={styles.subtitle}>
          {copy.subtitle}
        </p>
      </header>

      {/* Keyed by mode so switching resets the form and its action state. */}
      <AuthForm key={mode} mode={mode} onSuccess={onClose} />

      <p className={styles.switch}>
        {copy.switchPrompt}{" "}
        <button
          type="button"
          className={styles.switchButton}
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {copy.switchLabel}
        </button>
      </p>
    </Modal>
  );
}

const initialState = { error: null, values: {} };

function AuthForm({ mode, onSuccess }) {
  const { login, signup } = useAuth();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const id = useId();
  const fieldId = (name) => `${id}-${name}`;
  const copy = COPY[mode];

  // React 19 form action: the form's pending state flows to <SubmitButton>
  // through react-dom's useFormStatus.
  const [state, formAction] = useActionState(async (_previous, formData) => {
    const values = Object.fromEntries(formData);
    try {
      const user =
        mode === "login"
          ? await login(values.identifier.trim(), values.password)
          : await signup({
              username: values.username.trim(),
              email: values.email.trim(),
              password: values.password,
              bio: values.bio?.trim(),
            });
      toast.success(
        mode === "login" ? `Signed in as @${user.username}.` : `Welcome to QPM, @${user.username}!`,
      );
      onSuccess();
      return initialState;
    } catch (error) {
      // Refill everything except the password after React resets the form.
      const { password: _password, ...kept } = values;
      return { error: error.message, values: kept };
    }
  }, initialState);

  const passwordHint = mode === "signup" ? "At least 6 characters." : undefined;

  return (
    <form action={formAction} className={styles.form}>
      {state.error && <Alert tone="error">{state.error}</Alert>}

      {mode === "signup" ? (
        <>
          <Field label="Username" htmlFor={fieldId("username")} hint="Shown on every package you publish.">
            <Input
              id={fieldId("username")}
              name="username"
              icon={AtSign}
              placeholder="quantumdev"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
              autoFocus
              defaultValue={state.values.username}
              aria-describedby={describedBy(fieldId("username"), { hint: true })}
            />
          </Field>
          <Field label="Email" htmlFor={fieldId("email")}>
            <Input
              id={fieldId("email")}
              name="email"
              type="email"
              icon={Mail}
              placeholder="you@domain.com"
              autoComplete="email"
              required
              defaultValue={state.values.email}
            />
          </Field>
        </>
      ) : (
        <Field label="Email or username" htmlFor={fieldId("identifier")}>
          <Input
            id={fieldId("identifier")}
            name="identifier"
            icon={User}
            placeholder="you@domain.com or quantumdev"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            autoFocus
            defaultValue={state.values.identifier}
          />
        </Field>
      )}

      <Field label="Password" htmlFor={fieldId("password")} hint={passwordHint}>
        <Input
          id={fieldId("password")}
          name="password"
          type={showPassword ? "text" : "password"}
          icon={Lock}
          placeholder="••••••••"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={mode === "signup" ? 6 : undefined}
          required
          aria-describedby={describedBy(fieldId("password"), { hint: passwordHint })}
          trailing={
            <Button
              variant="ghost"
              size="sm"
              icon={showPassword ? EyeOff : Eye}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((shown) => !shown)}
            />
          }
        />
      </Field>

      {mode === "signup" && (
        <Field label="Bio" htmlFor={fieldId("bio")} optional>
          <Input
            id={fieldId("bio")}
            name="bio"
            placeholder="Quantum Language contributor"
            maxLength={160}
            defaultValue={state.values.bio}
          />
        </Field>
      )}

      <SubmitButton block size="lg" iconRight={ArrowRight} pendingLabel={copy.pending}>
        {copy.submit}
      </SubmitButton>
    </form>
  );
}
