import { useState, type ReactNode } from 'react';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { BookOpen, FileText, LayoutDashboard, LoaderCircle, Menu, MessageSquareText, Package, PanelLeftClose, PanelLeftOpen, Settings, ShoppingBag, Sparkles, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTheme } from '@/hooks/useTheme';
import { ProfileMenu } from '@/components/layout/ProfileMenu';
import climbioSidebarLogo from '@/assets/branding/climbio-logo-new.png';
import { useLanguage } from '@/hooks/useLanguage';
import { sidebarLabelClass } from '@/components/layout/sidebarStyles';
import { iconFrameClass } from '@/components/ui/IconLabel';

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

function Brand({ mobile = false }: { mobile?: boolean }) {
  return (
    <a className={cn('block shrink-0', mobile ? 'h-10 w-36' : 'h-[52px] w-[184px]')} href="/" aria-label="Climbio dashboard">
      <img
        src={climbioSidebarLogo}
        alt="Climbio"
        className="h-full w-full object-contain object-left"
      />
    </a>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(
    () => localStorage.getItem('climbio-sidebar-collapsed') !== 'true',
  );
  const { theme, toggleTheme } = useTheme();
  const { language } = useLanguage();
  const aiAnalysisRunning = useIsFetching({ queryKey: ['ai-business-analysis'] }) > 0;
  const aiChatRunning = useIsMutating({ mutationKey: ['ai-chat'] }) > 0;
  const currentPage = navigation.find((item) => isCurrent(item.href)) ?? navigation[0];

  const toggleDesktopSidebar = () => {
    setDesktopSidebarOpen((open) => {
      const next = !open;
      localStorage.setItem('climbio-sidebar-collapsed', String(!next));
      return next;
    });
  };

  const sidebar = () => (
    <nav className="sidebar-scroll min-h-0 flex-1 space-y-1.5 overflow-y-auto p-3" aria-label="Primary navigation">
      <p className="px-3 pb-2 pt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Workspace</p>
      {navigation.map(({ label, href, icon: Icon }) => (
        <a
          key={href}
          href={href}
          aria-current={isCurrent(href) ? 'page' : undefined}
          className={cn(
            'group relative flex h-[52px] items-center gap-3 rounded-xl px-4 text-sm font-semibold transition',
            isCurrent(href)
              ? 'bg-violet-100 text-violet-800 ring-1 ring-inset ring-violet-200 dark:bg-violet-500/20 dark:text-white dark:ring-violet-400/30'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white',
          )}
        >
          {isCurrent(href) && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-violet-500 dark:bg-violet-400" />}
          <span className={cn('min-w-5', iconFrameClass)} aria-hidden="true">
            <Icon className={cn('block size-[18px] shrink-0 transition', isCurrent(href) ? 'text-violet-600 dark:text-violet-300' : 'text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300')} />
          </span>
          <span className={sidebarLabelClass}>{label}</span>
        </a>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-40 flex h-[72px] items-center border-b border-slate-300/80 bg-slate-50/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90">
        {desktopSidebarOpen && (
          <div className="hidden h-full w-[272px] shrink-0 items-center border-r border-slate-300/80 px-5 dark:border-slate-800 lg:flex">
            <Brand />
          </div>
        )}
        <div className="flex min-w-0 flex-1 items-center gap-4 px-4 sm:px-6 lg:px-8">
          <button type="button" className="shrink-0 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation" aria-expanded={mobileOpen} aria-controls="mobile-dashboard-sidebar">
            <Menu className="size-5" />
          </button>
          <div className="lg:hidden"><Brand mobile /></div>
          <nav className="hidden min-w-0 items-center gap-3 text-sm lg:flex" aria-label="Current page">
            <span className="group relative">
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                onClick={toggleDesktopSidebar}
                aria-label={desktopSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
                aria-expanded={desktopSidebarOpen}
                aria-controls="dashboard-sidebar"
              >
                {desktopSidebarOpen
                  ? <PanelLeftClose className="block size-5" aria-hidden="true" />
                  : <PanelLeftOpen className="block size-5" aria-hidden="true" />}
              </button>
              <span role="tooltip" className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-slate-700">
                {desktopSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
              </span>
            </span>
            <span className="relative top-px truncate font-bold text-slate-900 dark:text-white" aria-current="page">{currentPage.label}</span>
          </nav>
          <div className="ml-auto flex min-w-0 items-center gap-3">
            {aiAnalysisRunning && (
              <a href="/ai-advisor" className="hidden min-h-11 items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 text-xs font-bold text-violet-700 shadow-sm sm:inline-flex dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200">
                <LoaderCircle className="size-4 animate-spin" />
                {language === 'my' ? 'AI ဆန်းစစ်နေဆဲ' : 'AI analysis running'}
              </a>
            )}
            {aiChatRunning && (
              <a href="/ai-chat" className="hidden min-h-11 items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 text-xs font-bold text-violet-700 shadow-sm sm:inline-flex dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200">
                <LoaderCircle className="size-4 animate-spin" />
                {language === 'my' ? 'Chat အဖြေပြင်ဆင်နေသည်' : 'Chat response running'}
              </a>
            )}
            <ProfileMenu theme={theme} onToggleTheme={toggleTheme} />
          </div>
        </div>
      </header>

      {desktopSidebarOpen && (
        <aside id="dashboard-sidebar" className="fixed bottom-0 left-0 top-[72px] z-30 hidden w-[272px] flex-col border-r border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950 lg:flex">
          {sidebar()}
        </aside>
      )}

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
          <aside id="mobile-dashboard-sidebar" className="relative flex h-full w-[min(82vw,18rem)] flex-col bg-slate-50 shadow-2xl dark:bg-slate-950">
            <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
              <Brand />
              <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)} aria-label="Close navigation">
                <X className="size-5" />
              </button>
            </div>
            {sidebar()}
          </aside>
        </div>
      )}

      <div className={cn(desktopSidebarOpen && 'lg:pl-[272px]')}>{children}</div>
    </div>
  );
}
