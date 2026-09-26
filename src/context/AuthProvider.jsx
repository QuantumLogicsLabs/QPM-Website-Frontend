import { useCallback, useEffect, useMemo, useState } from "react";
import * as authApi from "@/api/auth";
import AuthModal from "@/components/auth/AuthModal";
import { AuthContext } from "./AuthContext";

function initialSession() {
  const token = authApi.tokenStorage.get();
  return { token, user: null, status: token ? "checking" : "ready" };
}

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(initialSession);
  const [modal, setModal] = useState({ open: false, mode: "login" });

  // Validate a stored token once on load.
  useEffect(() => {
    if (session.status !== "checking") return;
    const { token } = session;
    const controller = new AbortController();

    authApi
      .getCurrentUser(token, { signal: controller.signal })
      .then(({ user }) => {
        setSession((s) => (s.token === token ? { ...s, user, status: "ready" } : s));
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        const rejected = error.status === 401 || error.status === 403;
        if (rejected) authApi.tokenStorage.clear();
        // On a network error keep the token so the session survives a backend restart.
        setSession((s) =>
          s.token === token ? { token: rejected ? null : token, user: null, status: "ready" } : s,
        );
      });

    return () => controller.abort();
  }, [session]);

  const startSession = useCallback(({ token, user }) => {
    authApi.tokenStorage.set(token);
    setSession({ token, user, status: "ready" });
    return user;
  }, []);

  const login = useCallback(
    async (identifier, password) => startSession(await authApi.login(identifier, password)),
    [startSession],
  );

  const signup = useCallback(
    async (fields) => startSession(await authApi.signup(fields)),
    [startSession],
  );

  const logout = useCallback(() => {
    authApi.tokenStorage.clear();
    setSession({ token: null, user: null, status: "ready" });
  }, []);

  const openAuth = useCallback((mode = "login") => setModal({ open: true, mode }), []);
  const closeAuth = useCallback(() => setModal((m) => ({ ...m, open: false })), []);

  const value = useMemo(
    () => ({
      user: session.user,
      token: session.token,
      isReady: session.status === "ready",
      isAuthenticated: Boolean(session.user),
      login,
      signup,
      logout,
      openAuth,
      closeAuth,
    }),
    [session, login, signup, logout, openAuth, closeAuth],
  );

  return (
    <AuthContext value={value}>
      {children}
      {modal.open && <AuthModal key={modal.mode} initialMode={modal.mode} onClose={closeAuth} />}
    </AuthContext>
  );
}
