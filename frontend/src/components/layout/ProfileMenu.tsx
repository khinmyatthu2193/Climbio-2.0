import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ExternalLink, Languages, LogOut, Moon, Settings, Sun, UserRound } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { useLanguage } from '@/hooks/useLanguage';
import type { Theme } from '@/hooks/useTheme';

export function ProfileMenu({ theme, onToggleTheme, admin = false }: { theme: Theme; onToggleTheme: () => void; admin?: boolean }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { user, clearSession } = useAuthStore();
  const { language, setLanguage, translate } = useLanguage();

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', escape); };
  }, [open]);

  const logout = async () => {
    try { await authService.logout(); } finally { clearSession(); window.location.replace('/account/login'); }
  };
  const menuItem = 'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700';

  return <div className="relative" ref={rootRef}><button type="button" onClick={() => setOpen((current) => !current)} className="flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-violet-500 dark:hover:bg-slate-700" aria-expanded={open} aria-haspopup="menu"><span className="grid size-8 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-black text-white">{user?.shopLogo ? <img className="size-full object-cover" src={user.shopLogo} alt="" /> : user?.name?.charAt(0).toUpperCase()}</span><span className="hidden max-w-32 truncate text-sm font-bold text-slate-800 dark:text-white sm:block">{user?.name}</span><ChevronDown className={`size-4 text-slate-400 transition ${open ? 'rotate-180' : ''}`} /></button>
    {open && <div className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-800" role="menu"><div className="flex items-center gap-3 border-b border-slate-100 p-3 dark:border-slate-700"><span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 font-black text-white">{user?.shopLogo ? <img className="size-full object-cover" src={user.shopLogo} alt="" /> : user?.name?.charAt(0).toUpperCase()}</span><div className="min-w-0"><p className="truncate font-bold text-slate-950 dark:text-white">{user?.name}</p><p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p><p className="mt-0.5 truncate text-xs font-semibold text-violet-600 dark:text-violet-300">{admin ? translate('Administrator') : user?.shopName}</p></div></div>
      <div className="p-1"><a className={menuItem} href="/profile" onClick={() => setOpen(false)}><UserRound size={17} />{translate('Profile & shop settings')}</a>{!admin && <a className={menuItem} href="/my-store" onClick={() => setOpen(false)}><ExternalLink size={17} />{translate('View store')}</a>}</div>
      <div className="border-y border-slate-100 p-2 dark:border-slate-700"><p className="mb-2 px-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{translate('User preferences')}</p><div className="flex items-center justify-between gap-3 rounded-xl px-2 py-2"><span className="flex items-center gap-2 text-sm font-semibold"><Languages size={17} />{translate('Language')}</span><div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-900"><button type="button" onClick={() => setLanguage('en')} className={`rounded-md px-2.5 py-1 text-xs font-bold ${language === 'en' ? 'bg-white text-violet-700 shadow-sm dark:bg-slate-700 dark:text-violet-300' : 'text-slate-500'}`}>EN</button><button type="button" onClick={() => setLanguage('my')} className={`rounded-md px-2.5 py-1 text-xs font-bold ${language === 'my' ? 'bg-white text-violet-700 shadow-sm dark:bg-slate-700 dark:text-violet-300' : 'text-slate-500'}`}>မြန်မာ</button></div></div><button type="button" onClick={onToggleTheme} className={menuItem}>{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}<span className="flex-1">{translate(theme === 'dark' ? 'Light mode' : 'Dark mode')}</span><span className="text-xs text-slate-400">{translate(theme === 'dark' ? 'Light' : 'Dark')}</span></button><a className={menuItem} href="/profile" onClick={() => setOpen(false)}><Settings size={17} />{translate('All preferences')}</a></div>
      <div className="p-1"><button type="button" onClick={logout} className={`${menuItem} text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10`}><LogOut size={17} />{translate('Log out')}</button></div></div>}
  </div>;
}
