import { request } from "./client";

const TOKEN_KEY = "qpm_token";

// localStorage can throw (private mode, blocked storage), so every access is guarded.
export const tokenStorage = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* session-only login */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* nothing to clear */
    }
  },
};

/** @returns {Promise<{ token: string, user: object }>} */
export const login = (emailOrUsername, password) =>
  request("/auth/login", { method: "POST", body: { emailOrUsername, password } });

/** @returns {Promise<{ token: string, user: object }>} */
export const signup = ({ username, email, password, bio = "" }) =>
  request("/auth/signup", { method: "POST", body: { username, email, password, bio } });

/** @returns {Promise<{ user: object }>} */
export const getCurrentUser = (token, { signal } = {}) => request("/auth/me", { token, signal });

/**
 * The account's API token for `qpm login` and scripts. Unlike the session token it doesn't expire.
 * @returns {Promise<{ token: string }>}
 */
export const getApiToken = (token, { signal } = {}) =>
  request("/auth/api-token", { token, signal, cache: "no-store" });

/**
 * Replaces the API token; every earlier one stops working. Needs a session token.
 * @returns {Promise<{ token: string }>}
 */
export const regenerateApiToken = (token) => request("/auth/api-token", { method: "POST", token });
