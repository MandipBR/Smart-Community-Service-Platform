import axios from "axios";
import { jwtDecode } from "jwt-decode";

const baseURL =
  import.meta.env.VITE_API_URL?.trim() || "http://localhost:5000/api";

const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/org-login",
  "/signup",
  "/signup-choice",
  "/org-signup",
]);

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export const getToken = () => localStorage.getItem("token");
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
  if (!PUBLIC_PATHS.has(currentPath)) {
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
  localStorage.setItem("token", token);
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }
};

export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getUser = () => {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const getApiBase = () => baseURL;

export default api;
