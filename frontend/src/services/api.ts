// src/services/api.ts
import axios from "axios";
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081") + "/api";

/** Base URL without /api suffix — used for avatar image URLs */
export const SERVER_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081";

const ACCESS_TOKEN_KEY = "accessToken";

export function getAccessToken(): string {
  return localStorage.getItem(ACCESS_TOKEN_KEY) ?? "";
}

export function setAccessToken(token?: string) {
  if (!token) localStorage.removeItem(ACCESS_TOKEN_KEY);
  else localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export const AUTH_EVENTS = {
  LOGOUT: "auth:logout",
} as const;

function emitLogout() {
  window.dispatchEvent(new Event(AUTH_EVENTS.LOGOUT));
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

function isAuthUrl(url?: string) {
  if (!url) return false;
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/refresh") ||
    url.includes("/auth/logout")
  );
}

// Request interceptor — attach JWT token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (isAuthUrl(config.url)) return config;

  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh coordination
let isRefreshing = false;
let refreshPromise: Promise<{ accessToken: string }> | null = null;

async function refreshTokens() {
  const res = await api.post("/auth/refresh", null);

  const accessToken = (res.data as any)?.accessToken as string;
  if (!accessToken) throw new Error("Invalid refresh response");

  setAccessToken(accessToken);
  return { accessToken };
}

// Response interceptor — auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const status = err.response?.status;
    const originalConfig = err.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (status !== 401 || !originalConfig) return Promise.reject(err);
    if (isAuthUrl(originalConfig.url)) return Promise.reject(err);

    if (originalConfig._retry) {
      clearTokens();
      emitLogout();
      return Promise.reject(err);
    }
    originalConfig._retry = true;

    try {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshTokens().finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
      }

      const { accessToken } = await (refreshPromise as NonNullable<typeof refreshPromise>);

      originalConfig.headers = originalConfig.headers ?? {};
      originalConfig.headers.Authorization = `Bearer ${accessToken}`;

      return api(originalConfig);
    } catch (refreshErr) {
      clearTokens();
      emitLogout();
      return Promise.reject(refreshErr);
    }
  }
);

export default api;
