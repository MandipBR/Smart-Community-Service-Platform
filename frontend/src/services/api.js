import axios from "axios";
import { jwtDecode } from "jwt-decode";

const baseURL =
  import.meta.env.VITE_API_URL?.trim() || "http://localhost:5000/api";

const PUBLIC_PATHS = new Set([
  "/",
  "/about",
  "/faq",
  "/contact",
  "/events",
  "/leaderboard",
  "/map",
  "/login",
  "/org-login",
  "/signup",
  "/signup-choice",
  "/org-signup",
  "/google-success",
]);

const isPublicPath = (pathname = "") => {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (/^\/events\/[^/]+$/.test(pathname)) return true;
  if (/^\/verify\/[^/]+$/.test(pathname)) return true;
  if (/^\/org\/[^/]+\/impact$/.test(pathname)) return true;
  return false;
};

const api = axios.create({
  baseURL,
  withCredentials: true,
});

const readStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // no-op: storage may be unavailable in strict browser contexts
  }
};

const removeStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // no-op: storage may be unavailable in strict browser contexts
  }
};

const redactSensitive = (value) => {
  if (!value || typeof value !== "object") return value;
  const sensitive = new Set(["password", "currentPassword", "newPassword", "otp", "credential"]);
  if (Array.isArray(value)) return value.map((item) => redactSensitive(item));
  return Object.fromEntries(
    Object.entries(value).map(([key, val]) => [
      key,
      sensitive.has(key) ? "[REDACTED]" : redactSensitive(val),
    ])
  );
};

export const getToken = () => readStorage("token");
export const hasToken = () => Boolean(getToken());
export const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};
export const isTokenExpired = (token = getToken()) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    if (!decoded?.exp) return true;
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const redirectToLogin = () => {
  if (typeof window === "undefined") return;
  const currentPath = window.location.pathname;
  if (!isPublicPath(currentPath)) {
    window.location.replace("/login");
  }
};

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    if (isTokenExpired(token)) {
      clearAuth();
      redirectToLogin();
      return Promise.reject(new axios.Cancel("Session expired"));
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (import.meta.env.DEV) {
    console.log("API Request:", {
      method: config.method,
      url: config.url,
      payload: redactSensitive(config.data),
      params: config.params,
    });
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    const status = error?.response?.status;
    if (status === 401 || isTokenExpired()) {
      clearAuth();
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);

export const setAuth = (token, user) => {
  if (token) {
    writeStorage("token", token);
  }
  if (user) {
    writeStorage("user", JSON.stringify(user));
  }
};

export const clearAuth = () => {
  removeStorage("token");
  removeStorage("user");
};

export const getUser = () => {
  const raw = readStorage("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const getApiBase = () => baseURL;

export default api;
