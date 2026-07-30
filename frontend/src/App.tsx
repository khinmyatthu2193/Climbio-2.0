import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthBootstrap } from '@/hooks/useAuthBootstrap';
import { AuthPage } from '@/pages/AuthPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProfilePage } from '@/pages/ProfilePage';

export default function App() {
  useAuthBootstrap();
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/login') return <AuthPage register={false} />;
  if (path === '/register') return <AuthPage register />;
  if (path === '/profile') return <ProtectedRoute><ProfilePage /></ProtectedRoute>;
  return <ProtectedRoute><DashboardPage /></ProtectedRoute>;
}
