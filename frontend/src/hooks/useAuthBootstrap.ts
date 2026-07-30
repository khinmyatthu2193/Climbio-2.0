import { useEffect } from 'react';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

let bootstrapRequest: ReturnType<typeof authService.refresh> | null = null;

export function useAuthBootstrap() {
  const initialized = useAuthStore((state) => state.initialized);

  useEffect(() => {
    if (initialized) return;

    bootstrapRequest ??= authService.refresh();
    const request = bootstrapRequest;

    request
      .then(({ user, accessToken }) => useAuthStore.getState().setSession(user, accessToken))
      .catch(() => useAuthStore.getState().clearSession())
      .finally(() => {
        if (bootstrapRequest === request) bootstrapRequest = null;
      });
  }, [initialized]);
}
