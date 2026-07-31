import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';
import type { AuthResponse } from '@/types/auth';

function resolveApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();
  if (!configuredUrl) {
    if (import.meta.env.PROD) throw new Error('VITE_API_URL is required for production builds');
    return 'http://localhost:4000/api';
  }

  if (import.meta.env.PROD && typeof window !== 'undefined') {
    const apiHost = new URL(configuredUrl, window.location.origin).hostname;
    const pageIsLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    if (!pageIsLocal && ['localhost', '127.0.0.1'].includes(apiHost)) {
      throw new Error('VITE_API_URL must point to the deployed backend in production');
    }
  }

  return configuredUrl.replace(/\/$/, '');
}

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshRequest: Promise<string> | null = null;

api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
  if (error.response?.status !== 401 || !original || original._retry || original.url?.includes('/auth/refresh')) {
    return Promise.reject(error);
  }
  original._retry = true;
  refreshRequest ??= api.post<AuthResponse>('/auth/refresh').then(({ data }) => {
    useAuthStore.getState().setSession(data.user, data.accessToken);
    return data.accessToken;
  }).finally(() => { refreshRequest = null; });
  try {
    original.headers.Authorization = `Bearer ${await refreshRequest}`;
    return api(original);
  } catch (refreshError) {
    useAuthStore.getState().clearSession();
    return Promise.reject(refreshError);
  }
});
