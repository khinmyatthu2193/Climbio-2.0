import { create } from 'zustand';
import type { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  initialized: boolean;
  setSession: (user: User, accessToken: string) => void;
  setUser: (user: User) => void;
  setInitialized: (initialized: boolean) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  initialized: false,
  setSession: (user, accessToken) => set({ user, accessToken, initialized: true }),
  setUser: (user) => set({ user }),
  setInitialized: (initialized) => set({ initialized }),
  clearSession: () => set({ user: null, accessToken: null, initialized: true }),
}));
