import { useEffect, type ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import type { Role } from '@/types/auth';

export function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { user, initialized } = useAuthStore();
  useEffect(() => {
    if (initialized && !user) window.location.replace('/login');
    else if (initialized && user && roles && !roles.includes(user.role)) window.location.replace('/');
  }, [initialized, roles, user]);
  if (!initialized) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 dark:bg-slate-950" aria-label="Restoring your session">
        <LoaderCircle className="size-7 animate-spin text-violet-500" aria-hidden="true" />
      </main>
    );
  }
  if (!user || (roles && !roles.includes(user.role))) return null;
  return children;
}
