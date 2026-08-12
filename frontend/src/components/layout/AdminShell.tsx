import { useState, type ReactNode } from 'react';
import { BarChart3, ClipboardList, FileClock, Menu, PanelLeftClose, Store, Users, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTheme } from '@/hooks/useTheme';
import { ProfileMenu } from '@/components/layout/ProfileMenu';
import climbioSidebarLogo from '@/assets/branding/climbio-for-sidenavbar.png';
import { sidebarLabelClass } from '@/components/layout/sidebarStyles';
import { iconFrameClass } from '@/components/ui/IconLabel';

const navigation = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/applications', label: 'Applications', icon: ClipboardList },
  { href: '/admin/shops', label: 'Shops', icon: Store },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/audit-logs', label: 'Audit logs', icon: FileClock },
];

function isCurrent(href: string) {
  return window.location.pathname === href;
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('climbio-admin-sidebar-collapsed') === 'true');
  const { theme, toggleTheme } = useTheme();
  const currentPage = navigation.find((item) => isCurrent(item.href)) ?? navigation[0];

  const toggleCollapsed = () => setCollapsed((current) => {
    const next = !current;
    localStorage.setItem('climbio-admin-sidebar-collapsed', String(next));
    return next;
  });

  const sidebar = (compact = false) => (
    <>
      <div className={cn('flex h-[76px] items-center border-b border-slate-200 pt-4 transition-all dark:border-slate-800/80', compact ? 'justify-center px-2' : 'justify-between gap-3 px-4')}>
        {compact ? (
          <button className="flex w-9 min-w-0 items-center overflow-hidden rounded-xl transition-all" onClick={toggleCollapsed} aria-label="Expand sidebar" title="Expand sidebar">
            <span className="relative block size-9 overflow-hidden"><img src={climbioSidebarLogo} alt="" className="absolute -left-3 -top-[23px] w-[135px] max-w-none dark:brightness-0 dark:invert" /></span>
          </button>
        ) : (
          <a className="flex w-[184px] min-w-0 items-center overflow-hidden rounded-xl" href="/admin/dashboard" aria-label="Climbio administration">
            <span className="relative block h-[52px] w-[184px] overflow-hidden"><img src={climbioSidebarLogo} alt="Climbio" className="absolute -left-6 -top-[54px] w-60 max-w-none dark:brightness-0 dark:invert" /></span>
          </a>
        )}
        {!compact && <button className="hidden shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-violet-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white lg:block" onClick={toggleCollapsed} aria-label="Collapse sidebar" title="Collapse sidebar"><PanelLeftClose className="size-5" /></button>}
        <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X className="size-5" /></button>
      </div>
      <nav className="sidebar-scroll min-h-0 flex-1 space-y-1.5 overflow-y-auto p-3" aria-label="Admin navigation">
        {!compact && <p className="px-3 pb-2 pt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Administration</p>}
        {navigation.map(({ href, label, icon: Icon }) => (
          <a key={href} href={href} title={compact ? label : undefined} aria-current={isCurrent(href) ? 'page' : undefined} className={cn('group relative flex h-[52px] items-center rounded-xl text-sm font-semibold transition', compact ? 'justify-center px-2' : 'gap-3 px-4', isCurrent(href) ? 'bg-violet-100 text-violet-800 ring-1 ring-inset ring-violet-200 dark:bg-violet-500/20 dark:text-white dark:ring-violet-400/30' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white')}>
            {isCurrent(href) && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-violet-500 dark:bg-violet-400" />}
            <span className={cn('min-w-5', iconFrameClass)} aria-hidden="true"><Icon className={cn('size-[18px] transition', isCurrent(href) ? 'text-violet-600 dark:text-violet-300' : 'text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300')} /></span>
            {!compact && <span className={sidebarLabelClass}>{label}</span>}
          </a>
        ))}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <aside className={cn('fixed inset-y-0 left-0 z-40 hidden flex-col bg-white shadow-[1px_0_0_0_rgb(226_232_240)] transition-[width] duration-200 dark:bg-slate-950 dark:shadow-none lg:flex', collapsed ? 'w-[88px]' : 'w-[272px]')}>{sidebar(collapsed)}</aside>
      {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" aria-label="Close navigation" onClick={() => setMobileOpen(false)} /><aside className="relative flex h-full w-[min(82vw,18rem)] flex-col bg-white shadow-2xl dark:bg-slate-950">{sidebar(false)}</aside></div>}
      <div className={cn('transition-[padding] duration-200', collapsed ? 'lg:pl-[88px]' : 'lg:pl-[272px]')}>
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 sm:px-6 lg:px-8">
          <button className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu className="size-5" /></button>
          <div className="hidden items-center gap-3 lg:flex"><div><p className="text-xs font-medium text-slate-500 dark:text-slate-400">Platform <span className="mx-1 text-slate-300 dark:text-slate-600">/</span> Administration</p><p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">{currentPage.label}</p></div></div>
          <ProfileMenu theme={theme} onToggleTheme={toggleTheme} admin />
        </header>
        {children}
      </div>
    </div>
  );
}
