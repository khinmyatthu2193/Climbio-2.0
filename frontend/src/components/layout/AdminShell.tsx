import { BarChart3, ClipboardList, FileClock, LogOut, Menu, Store, Users, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';
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
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const logout = async () => { try { await authService.logout(); } finally { useAuthStore.getState().clearSession(); window.location.replace('/login'); } };
  const sidebar = (mobile = false) => <>
    <div className="flex items-start justify-between px-5 py-6"><div><p className="text-xl font-black">Climbio</p><p className="mt-1 text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-300">Administration</p></div>{mobile && <button type="button" className="grid size-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" onClick={() => setMobileMenuOpen(false)} aria-label="Close navigation"><X className="size-5" /></button>}</div>
    <nav className="space-y-1 px-3" aria-label="Admin navigation">{navigation.map(({ href, label, icon: Icon }) => <a key={href} href={href} onClick={() => setMobileMenuOpen(false)} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold ${window.location.pathname === href ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'}`}><Icon className="size-4" />{label}</a>)}</nav>
    <div className="mt-auto border-t border-slate-200 p-4 dark:border-slate-800"><p className="truncate text-sm font-semibold">{user?.name}</p><p className="mb-3 truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p><Button className="w-full justify-start" variant="ghost" onClick={logout}><LogOut className="size-4" />Log out</Button></div>
  </>;
  return <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 lg:flex">
    <aside className={`hidden min-h-screen w-64 flex-col border-r border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white ${desktopSidebarOpen ? 'lg:flex' : 'lg:hidden'}`}>{sidebar()}</aside>
    {mobileMenuOpen && <div className="fixed inset-0 z-50 lg:hidden"><button type="button" className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} aria-label="Close navigation" /><aside className="relative flex h-full w-[min(82vw,20rem)] flex-col bg-white text-slate-900 shadow-2xl dark:bg-slate-950 dark:text-white">{sidebar(true)}</aside></div>}
    <main className="min-w-0 flex-1"><header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:px-5"><div className="flex items-center gap-3"><button type="button" className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 shadow-sm hover:border-violet-300 hover:text-violet-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:text-violet-300 lg:hidden" onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation"><Menu className="size-5" /></button><button type="button" className="hidden size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 shadow-sm hover:border-violet-300 hover:text-violet-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:text-violet-300 lg:grid" onClick={() => setDesktopSidebarOpen((open) => !open)} aria-label={desktopSidebarOpen ? 'Hide navigation' : 'Show navigation'} title={desktopSidebarOpen ? 'Hide navigation' : 'Show navigation'}><Menu className="size-5" /></button><p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Platform administration</p></div><div className="flex items-center gap-2"><LanguageToggle /><ThemeToggle theme={theme} onToggle={toggleTheme} /></div></header>{children}</main>
  </div>;
}
