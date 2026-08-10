import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import type { Theme } from '@/hooks/useTheme';
import type { LandingAuthMode } from '@/pages/LandingPage';
import { LandingButtonLabel } from '@/components/landing/LandingButtonLabel';
import { LandingLogo } from '@/components/landing/LandingLogo';

const links = [
  { label: 'Product', id: 'product' },
  { label: 'Workflow', id: 'workflow' },
  { label: 'AI', id: 'ai' },
  { label: 'Security', id: 'security' },
];

export function FloatingNavbar({ theme, onToggleTheme, onOpenAuth }: { theme: Theme; onToggleTheme: () => void; onOpenAuth: (mode: LandingAuthMode) => void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = links.map(({ id }) => document.getElementById(id)).filter((item): item is HTMLElement => Boolean(item));
    const observer = new IntersectionObserver((entries) => {
      const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (current) setActive(current.target.id);
    }, { rootMargin: '-18% 0px -68% 0px', threshold: [0, 0.2, 0.5] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const account = (mode: LandingAuthMode) => { setOpen(false); onOpenAuth(mode); };
  return <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4">
    <nav className={`mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 rounded-2xl border px-4 backdrop-blur-xl transition-all sm:px-5 ${scrolled ? 'border-slate-200/90 bg-white/95 shadow-[0_14px_40px_rgba(15,23,42,0.10)] dark:border-violet-400/15 dark:bg-[#0b0e1a]/95' : 'border-white/70 bg-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-[#0b0e1a]/75'}`} aria-label="Main navigation">
      <a href="/#top" onClick={() => setOpen(false)} className="inline-flex shrink-0 rounded-lg" aria-label="Climbio home"><LandingLogo /></a>
      <div className="hidden items-center gap-1 lg:flex">{links.map(({ label, id }) => <a key={id} href={`/#${id}`} aria-current={active === id ? 'location' : undefined} className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${active === id ? 'bg-violet-600/10 text-violet-700 dark:text-violet-300' : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'}`}>{label}</a>)}</div>
      <div className="hidden items-center gap-2 md:flex"><LanguageToggle /><ThemeToggle theme={theme} onToggle={onToggleTheme} /><button type="button" onClick={() => account('login')} className="inline-flex min-h-10 items-center justify-center rounded-lg px-3 text-sm font-semibold text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"><LandingButtonLabel>Sign in</LandingButtonLabel></button><button type="button" onClick={() => account('signup')} className="inline-flex min-h-10 items-center justify-center rounded-lg bg-violet-600 px-4 text-sm font-bold text-white shadow-lg shadow-violet-900/15 transition hover:bg-violet-500"><LandingButtonLabel>Get started</LandingButtonLabel></button></div>
      <button type="button" onClick={() => setOpen((value) => !value)} className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white md:hidden dark:border-white/10 dark:bg-white/5" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open} aria-controls="floating-mobile-nav">{open ? <X className="size-5" /> : <Menu className="size-5" />}</button>
    </nav>
    {open && <div id="floating-mobile-nav" className="mx-auto mt-2 max-w-[1240px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-[#0b0e1a] md:hidden"><div className="grid gap-1">{links.map(({ label, id }) => <a key={id} href={`/#${id}`} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-semibold text-slate-700 hover:bg-violet-50 dark:text-slate-200 dark:hover:bg-white/5">{label}</a>)}<div className="my-2 flex flex-wrap items-center gap-2 border-y border-slate-100 py-3 dark:border-white/10"><LanguageToggle /><ThemeToggle theme={theme} onToggle={onToggleTheme} /></div><button type="button" onClick={() => account('login')} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 font-semibold dark:border-white/10"><LandingButtonLabel>Sign in</LandingButtonLabel></button><button type="button" onClick={() => account('signup')} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-violet-600 font-bold text-white"><LandingButtonLabel>Get started</LandingButtonLabel></button></div></div>}
  </header>;
}
