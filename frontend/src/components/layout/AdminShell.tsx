import { BarChart3, ClipboardList, FileClock, LogOut, Store, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

const navigation = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/applications', label: 'Applications', icon: ClipboardList },
  { href: '/admin/shops', label: 'Shops', icon: Store },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/audit-logs', label: 'Audit logs', icon: FileClock },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const logout = async () => { try { await authService.logout(); } finally { useAuthStore.getState().clearSession(); window.location.replace('/login'); } };
  return <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 lg:flex">
    <aside className="border-b bg-slate-950 text-white lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r lg:border-slate-800">
      <div className="px-5 py-6"><p className="text-xl font-black">Climbio</p><p className="mt-1 text-xs font-semibold uppercase tracking-wider text-violet-300">Administration</p></div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1" aria-label="Admin navigation">{navigation.map(({ href, label, icon: Icon }) => <a key={href} href={href} className={`flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-sm font-semibold ${window.location.pathname === href ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}><Icon className="size-4" />{label}</a>)}</nav>
      <div className="hidden border-t border-slate-800 p-4 lg:block"><p className="truncate text-sm font-semibold">{user?.name}</p><p className="mb-3 truncate text-xs text-slate-400">{user?.email}</p><Button className="w-full justify-start" variant="ghost" onClick={logout}><LogOut className="size-4" />Log out</Button></div>
    </aside>
    <main className="min-w-0 flex-1"><header className="border-b bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900"><p className="text-sm font-semibold text-slate-500">Platform administration</p></header>{children}</main>
  </div>;
}
