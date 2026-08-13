import { useState, type ReactNode } from 'react';
import { BarChart3, ClipboardList, FileClock, Images, Menu, PanelLeftClose, PanelLeftOpen, Store, Users, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTheme } from '@/hooks/useTheme';
import { ProfileMenu } from '@/components/layout/ProfileMenu';
import climbioSidebarLogo from '@/assets/branding/climbio-logo-new.png';
import { sidebarLabelClass } from '@/components/layout/sidebarStyles';
import { iconFrameClass } from '@/components/ui/IconLabel';
import { BackToTop } from '@/components/common/BackToTop';
import { useLanguage } from '@/hooks/useLanguage';

const navigation = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/applications', label: 'Applications', icon: ClipboardList },
  { href: '/admin/shops', label: 'Shops', icon: Store },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/prompts', label: 'AI Prompt Gallery', icon: Images },
  { href: '/admin/audit-logs', label: 'Audit logs', icon: FileClock },
];

function isCurrent(href: string) {
  return href === '/admin/prompts' ? window.location.pathname.startsWith(href) : window.location.pathname === href;
}

function Brand({ mobile = false }: { mobile?: boolean }) {
  return <a className={cn('block shrink-0', mobile ? 'h-10 w-36' : 'h-[52px] w-[184px]')} href="/admin/dashboard" aria-label="Climbio administration"><img src={climbioSidebarLogo} alt="Climbio" className="h-full w-full object-contain object-left" /></a>;
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('climbio-admin-sidebar-collapsed') === 'true');
  const { theme, toggleTheme } = useTheme();
  const { translate } = useLanguage();
  const currentPage = navigation.find((item) => isCurrent(item.href)) ?? navigation[0];

  const toggleCollapsed = () => setCollapsed((current) => {
    const next = !current;
    localStorage.setItem('climbio-admin-sidebar-collapsed', String(next));
    return next;
  });

  const sidebar = () => (
      <nav className="sidebar-scroll min-h-0 flex-1 space-y-1.5 overflow-y-auto p-3" aria-label="Admin navigation">
        <p className="px-3 pb-2 pt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Administration</p>
        {navigation.map(({ href, label, icon: Icon }) => (
          <a key={href} href={href} aria-current={isCurrent(href) ? 'page' : undefined} className={cn('group relative flex h-[52px] items-center gap-3 rounded-xl px-4 text-sm font-semibold transition', isCurrent(href) ? 'bg-violet-100 text-violet-800 ring-1 ring-inset ring-violet-200 dark:bg-violet-500/20 dark:text-white dark:ring-violet-400/30' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white')}>
            {isCurrent(href) && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-violet-500 dark:bg-violet-400" />}
            <span className={cn('min-w-5', iconFrameClass)} aria-hidden="true"><Icon className={cn('size-[18px] transition', isCurrent(href) ? 'text-violet-600 dark:text-violet-300' : 'text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300')} /></span>
            <span className={sidebarLabelClass}>{translate(label)}</span>
          </a>
        ))}
      </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-40 flex h-[72px] items-center border-b border-slate-300/80 bg-slate-50/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90">
        {!collapsed && <div className="hidden h-full w-[272px] shrink-0 items-center border-r border-slate-300/80 px-5 dark:border-slate-800 lg:flex"><Brand /></div>}
        <div className="flex min-w-0 flex-1 items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation" aria-expanded={mobileOpen}><Menu className="size-5" /></button>
          <div className="lg:hidden"><Brand mobile /></div>
          <div className="hidden items-center gap-3 lg:flex"><button type="button" className="flex size-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800" onClick={toggleCollapsed} aria-label={collapsed ? 'Show sidebar' : 'Hide sidebar'} aria-expanded={!collapsed}>{collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}</button><p className="text-sm font-bold text-slate-900 dark:text-white">{translate(currentPage.label)}</p></div>
          <div className="ml-auto"><ProfileMenu theme={theme} onToggleTheme={toggleTheme} admin /></div>
        </div>
      </header>
      {!collapsed && <aside className="fixed bottom-0 left-0 top-[72px] z-30 hidden w-[272px] flex-col border-r border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950 lg:flex">{sidebar()}</aside>}
      {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" aria-label="Close navigation" onClick={() => setMobileOpen(false)} /><aside className="relative flex h-full w-[min(82vw,18rem)] flex-col bg-slate-50 shadow-2xl dark:bg-slate-950"><div className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800"><Brand /><button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X className="size-5" /></button></div>{sidebar()}</aside></div>}
      <div className={cn(!collapsed && 'lg:pl-[272px]')}>{children}</div>
      <BackToTop />
    </div>
  );
}
