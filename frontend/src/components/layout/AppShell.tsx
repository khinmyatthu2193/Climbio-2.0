import { useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, FileText, LayoutDashboard, LogOut, Menu, Package, Settings, ShoppingBag, X } from 'lucide-react';
import { authService } from '@/services/authService';
import { publicShopService } from '@/services/publicShopService';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';
import climbioSidebarLogo from '@/assets/branding/climbio-for-sidenavbar.png';

const navigation = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Invoices', href: '/invoices', icon: FileText },
  { label: 'Public store', href: '/my-store', icon: ShoppingBag },
  { label: 'Settings', href: '/profile', icon: Settings },
];

function isCurrent(href: string) {
  const path = window.location.pathname;
  return href === '/' ? path === '/' : path.startsWith(href);
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('climbio-sidebar-collapsed') === 'true');
  const { theme, toggleTheme } = useTheme();
  const { user, clearSession } = useAuthStore();
  const queryClient = useQueryClient();
  const currentPage = navigation.find((item) => isCurrent(item.href)) ?? navigation[0];
  const store = useQuery({
    queryKey: ['my-public-store'],
    queryFn: publicShopService.getMyStore,
    enabled: user?.role === 'ADMIN',
  });
  const statusMutation = useMutation({
    mutationFn: publicShopService.updateStatus,
    onSuccess: (data) => queryClient.setQueryData(['my-public-store'], data),
  });

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem('climbio-sidebar-collapsed', String(next));
      return next;
    });
  };

  const logout = async () => {
    try { await authService.logout(); } finally {
      clearSession();
      window.location.replace('/login');
    }
  };

  const sidebar = (compact = false) => (
    <>
      <div className={cn('flex h-[72px] items-center border-b border-slate-200 transition-all dark:border-slate-800/80', compact ? 'justify-center gap-1 px-2' : 'justify-between gap-3 px-4')}>
        <a className={cn('flex min-w-0 items-center overflow-hidden rounded-xl transition-all', compact ? 'w-9' : 'w-[184px]')} href="/" aria-label="Climbio dashboard" title={compact ? 'Climbio dashboard' : undefined}>
          <span className={cn('relative block overflow-hidden transition-all', compact ? 'size-9' : 'h-[52px] w-[184px]')}>
            <img
              src={climbioSidebarLogo}
              alt="Climbio"
              className={cn(
                'absolute max-w-none transition-all dark:brightness-0 dark:invert',
                compact ? '-left-3 -top-[23px] w-[135px]' : '-left-6 -top-[54px] w-60',
              )}
            />
          </span>
        </a>
        <button className="hidden shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-violet-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white lg:block" onClick={toggleCollapsed} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <Menu className="size-5" />
        </button>
        <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation">
          <X className="size-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-1.5 p-3" aria-label="Primary navigation">
        {!compact && <p className="px-3 pb-2 pt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Workspace</p>}
        {navigation.map(({ label, href, icon: Icon }) => (
          <a
            key={href}
            href={href}
            title={compact ? label : undefined}
            aria-current={isCurrent(href) ? 'page' : undefined}
            className={cn(
              'group relative flex min-h-11 items-center rounded-xl text-sm font-semibold transition',
              compact ? 'justify-center px-2' : 'gap-3 px-3',
              isCurrent(href) ? 'bg-violet-100 text-violet-800 ring-1 ring-inset ring-violet-200 dark:bg-violet-500/20 dark:text-white dark:ring-violet-400/30' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white',
            )}
          >
            {isCurrent(href) && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-violet-500 dark:bg-violet-400" />}
            <Icon className={cn('size-[18px] transition', isCurrent(href) ? 'text-violet-600 dark:text-violet-300' : 'text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300')} aria-hidden="true" />
            {!compact && label}
          </a>
        ))}
      </nav>
      <div className="border-t border-slate-200 p-3 dark:border-slate-800/80">
        {user?.role === 'ADMIN' && store.data && (
          <div className={cn('mb-2 rounded-xl bg-slate-100 dark:bg-slate-900', compact ? 'flex justify-center p-2' : 'px-3 py-3')}>
            <div className={cn('flex items-center', compact ? 'justify-center' : 'justify-between gap-3')}>
              {!compact && (
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Store availability</p>
                  <p className={cn('mt-0.5 text-[11px]', store.data.publicEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500')}>
                    {store.data.publicEnabled ? 'Store is live' : 'Store is offline'}
                  </p>
                </div>
              )}
              <button
                type="button"
                role="switch"
                aria-checked={store.data.publicEnabled}
                aria-label={`Store availability: ${store.data.publicEnabled ? 'on' : 'off'}`}
                title={compact ? `Store availability: ${store.data.publicEnabled ? 'on' : 'off'}` : undefined}
                disabled={statusMutation.isPending}
                onClick={() => statusMutation.mutate(!store.data.publicEnabled)}
                className={cn('relative h-6 w-11 shrink-0 rounded-full transition disabled:cursor-wait disabled:opacity-60', store.data.publicEnabled ? 'bg-emerald-500' : 'bg-slate-700')}
              >
                <span className={cn('absolute left-1 top-1 size-4 rounded-full bg-white shadow transition-transform', store.data.publicEnabled && 'translate-x-5')} />
              </button>
            </div>
          </div>
        )}
        <div className={cn('mb-1 flex items-center rounded-xl py-2.5', compact ? 'justify-center px-1' : 'gap-3 px-3')}>
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white shadow-lg shadow-violet-950/30">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          {!compact && <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{user?.shopName}</p>
          </div>}
        </div>
        <Button className={cn('w-full text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white', compact ? 'justify-center px-0' : 'justify-start')} variant="ghost" onClick={logout} title={compact ? 'Log out' : undefined} aria-label="Log out">
          <LogOut className="size-4" /> {!compact && 'Log out'}
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <aside className={cn('fixed inset-y-0 left-0 z-40 hidden flex-col bg-white shadow-[1px_0_0_0_rgb(226_232_240)] transition-[width] duration-200 dark:bg-slate-950 dark:shadow-none lg:flex', collapsed ? 'w-[88px]' : 'w-[272px]')}>{sidebar(collapsed)}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-[min(82vw,18rem)] flex-col bg-white shadow-2xl dark:bg-slate-950">{sidebar(false)}</aside>
        </div>
      )}
      <div className={cn('transition-[padding] duration-200', collapsed ? 'lg:pl-[88px]' : 'lg:pl-[272px]')}>
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 sm:px-6 lg:px-8">
          <button className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <Menu className="size-5" />
          </button>
          <div className="hidden items-center gap-3 lg:flex">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{user?.shopName} <span className="mx-1 text-slate-300 dark:text-slate-600">/</span> Workspace</p>
              <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">{currentPage.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <a className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm hover:border-violet-300 hover:bg-violet-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-violet-500 dark:hover:bg-slate-700" href="/my-store">View store <ExternalLink className="size-3.5" /></a>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
