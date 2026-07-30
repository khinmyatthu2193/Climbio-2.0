import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';
import type { AuthResponse } from '@/types/auth';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api',
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
