// Thin HTTP layer shared by every API module. Pages never call fetch directly.

export const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/$/, "");

/** Absolute URL for an API path, for copy-paste snippets (curl etc.). */
export const apiUrl = (path = "") => new URL(`${API_BASE}${path}`, window.location.origin).href;

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export const isAbortError = (error) => error?.name === "AbortError";

function parseJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function errorMessage(data, status) {
  if (data?.error) return data.error;
  if (status >= 500) return "The registry ran into a problem. Please try again in a moment.";
  if (status === 404) return "We couldn't find what you were looking for.";
  return `Request failed with status ${status}.`;
}

const networkError = () =>
  new ApiError("Can't reach the QPM registry. Check that the backend is running and try again.");

/**
 * JSON request helper.
 * @param {string} path  Path relative to the API base, e.g. "/registry/search".
 * @param {{ method?: string, body?: unknown, token?: string | null, signal?: AbortSignal }} [options]
 */
export async function request(path, { method = "GET", body, token, signal } = {}) {
  const headers = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const init = { method, headers, signal };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, init);
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw networkError();
  }

  const data = parseJson(await response.text());
  if (!response.ok) throw new ApiError(errorMessage(data, response.status), response.status, data);
  return data;
}

/**
 * Multipart upload with progress reporting. fetch() can't report upload
 * progress, so this uses XMLHttpRequest.
 * @param {string} path
 * @param {FormData} formData
 * @param {{ token?: string | null, signal?: AbortSignal, onProgress?: (fraction: number) => void }} [options]
 */
export function upload(path, formData, { token, signal, onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}${path}`);
    xhr.setRequestHeader("Accept", "application/json");
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    xhr.upload.onload = () => onProgress?.(1);

    xhr.onload = () => {
      const data = parseJson(xhr.responseText);
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(new ApiError(errorMessage(data, xhr.status), xhr.status, data));
    };
    xhr.onerror = () => reject(networkError());
    xhr.onabort = () => reject(new DOMException("Upload cancelled.", "AbortError"));

    signal?.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(formData);
  });
}
