import { useState, type ReactNode } from 'react';
import { useIsFetching } from '@tanstack/react-query';
import { BookOpen, ExternalLink, FileText, LayoutDashboard, LoaderCircle, LogOut, Menu, MessageSquareText, Package, PanelLeftClose, Settings, ShoppingBag, Sparkles, X } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useTheme } from '@/hooks/useTheme';
import climbioSidebarLogo from '@/assets/branding/climbio-for-sidenavbar.png';
import { useLanguage } from '@/hooks/useLanguage';
import { sidebarLabelClass } from '@/components/layout/sidebarStyles';
import { IconLabel, iconFrameClass } from '@/components/ui/IconLabel';

const navigation = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Invoices', href: '/invoices', icon: FileText },
  { label: 'AI Advisor', href: '/ai-advisor', icon: Sparkles },
  { label: 'Climbio Chat', href: '/ai-chat', icon: MessageSquareText },
  { label: 'Public store', href: '/my-store', icon: ShoppingBag },
  { label: 'User manual', href: '/user-manual', icon: BookOpen },
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
  const { language } = useLanguage();
  const aiAnalysisRunning = useIsFetching({ queryKey: ['ai-business-analysis'] }) > 0;
  const { user, clearSession } = useAuthStore();
  const currentPage = navigation.find((item) => isCurrent(item.href)) ?? navigation[0];

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
      window.location.replace('/account/login');
    }
  };

  const sidebar = (compact = false) => (
    <>
      <div className={cn('flex h-[76px] items-center border-b border-slate-200 pt-4 transition-all dark:border-slate-800/80', compact ? 'justify-center px-2' : 'justify-between gap-3 px-4')}>
        {compact ? (
          <button className="flex w-9 min-w-0 items-center overflow-hidden rounded-xl transition-all" onClick={toggleCollapsed} aria-label="Expand sidebar" title="Expand sidebar">
            <span className="relative block size-9 overflow-hidden transition-all">
              <img src={climbioSidebarLogo} alt="" className="absolute -left-3 -top-[23px] w-[135px] max-w-none transition-all dark:brightness-0 dark:invert" />
            </span>
          </button>
        ) : (
        <a className="flex w-[184px] min-w-0 items-center overflow-hidden rounded-xl transition-all" href="/" aria-label="Climbio dashboard">
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
        )}
        {!compact && (
          <button className="hidden shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-violet-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white lg:block" onClick={toggleCollapsed} aria-label="Collapse sidebar" title="Collapse sidebar">
            <PanelLeftClose className="size-5" />
          </button>
        )}
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
              'group relative flex h-[52px] items-center rounded-xl text-sm font-semibold transition',
              compact ? 'justify-center px-2' : 'gap-3 px-4',
              isCurrent(href) ? 'bg-violet-100 text-violet-800 ring-1 ring-inset ring-violet-200 dark:bg-violet-500/20 dark:text-white dark:ring-violet-400/30' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white',
            )}
          >
            {isCurrent(href) && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-violet-500 dark:bg-violet-400" />}
            <span className={cn('min-w-5', iconFrameClass)} aria-hidden="true">
              <Icon className={cn('block size-[18px] shrink-0 transition', isCurrent(href) ? 'text-violet-600 dark:text-violet-300' : 'text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300')} />
            </span>
            {!compact && <span className={sidebarLabelClass}>{label}</span>}
          </a>
        ))}
      </nav>
      <div className="border-t border-slate-200 p-3 dark:border-slate-800/80">
        <div className={cn('mb-1 flex items-center rounded-xl py-2.5', compact ? 'justify-center px-1' : 'gap-3 px-3')}>
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white shadow-lg shadow-violet-950/30">
            <span className="leading-none">{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
          {!compact && <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{user?.shopName}</p>
          </div>}
        </div>
        <Button className={cn('h-[52px] w-full gap-3 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white', compact ? 'justify-center px-0' : 'justify-start px-4')} variant="ghost" onClick={logout} title={compact ? 'Log out' : undefined} aria-label="Log out">
          <span className={cn('min-w-5', iconFrameClass)} aria-hidden="true"><LogOut className="size-[18px]" /></span>{!compact && <span className={sidebarLabelClass}>Log out</span>}
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
            {aiAnalysisRunning && (
              <a href="/ai-advisor" className="hidden min-h-11 items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 text-xs font-bold text-violet-700 shadow-sm sm:inline-flex dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200">
                <LoaderCircle className="size-4 animate-spin" />
                {language === 'my' ? 'AI သုံးသပ်နေဆဲ' : 'AI analysis running'}
              </a>
            )}
            <LanguageToggle />
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <a className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm hover:border-violet-300 hover:bg-violet-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-violet-500 dark:hover:bg-slate-700" href="/my-store"><IconLabel icon={ExternalLink}>View store</IconLabel></a>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
