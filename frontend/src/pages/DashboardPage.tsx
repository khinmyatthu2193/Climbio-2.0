import { Button } from '@/components/ui/button';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

export function DashboardPage() {
  const { user, clearSession } = useAuthStore();
  const logout = async () => { try { await authService.logout(); } finally { clearSession(); } };
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <nav className="flex items-center justify-between">
          <span className="text-xl font-black text-primary">Climbio</span>
          <div className="flex items-center gap-3">
            <a className="font-medium text-primary" href="/products">Inventory</a>
            <a className="font-medium text-primary" href="/profile">Profile</a>
            <Button onClick={logout}>Log out</Button>
          </div>
        </nav>
        <section className="mt-20">
          <p className="font-medium text-primary">{user?.role.toLowerCase()} workspace</p>
          <h1 className="mt-2 text-4xl font-bold">Good to see you, {user?.name}.</h1>
          <p className="mt-3 text-slate-600">Your {user?.shopName} workspace is ready for inventory, invoices, and reports.</p>
        </section>
      </div>
    </main>
  );
}
