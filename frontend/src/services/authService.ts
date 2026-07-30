import { api } from './api';
import type { AuthResponse, ChangePasswordInput, UpdateProfileInput, User } from '@/types/auth';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  shopName: string;
  phone?: string;
}

export const authService = {
  register: (input: RegisterInput) => api.post<AuthResponse>('/auth/register', input).then((r) => r.data),
  login: (input: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', input).then((r) => r.data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post<AuthResponse>('/auth/refresh').then((r) => r.data),
  me: () => api.get<AuthResponse['user']>('/auth/me').then((r) => r.data),
  updateProfile: (input: UpdateProfileInput) => api.put<User>('/auth/profile', input).then((r) => r.data),
  changePassword: (input: ChangePasswordInput) => api.put('/auth/change-password', input),
  uploadLogo: (file: File) => {
    const data = new FormData();
    data.append('logo', file);
    return api.post<User>('/auth/upload-logo', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
  },
};
