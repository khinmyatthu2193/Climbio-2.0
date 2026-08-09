import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import type { Theme } from '@/hooks/useTheme';
import type { LandingAuthMode } from '@/pages/LandingPage';
import climbioLogo from '@/assets/branding/climbio-logo.png';

const navigation = [
  { label: 'Features', id: 'features' },
  { label: 'How it works', id: 'how-it-works' },
  { label: 'Security', id: 'security' },
];

export function LandingHeader({ theme, onToggleTheme, onOpenAuth }: { theme: Theme; onToggleTheme: () => void; onOpenAuth: (mode: LandingAuthMode) => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 16);
    updateScrolled();
    window.addEventListener('scroll', updateScrolled, { passive: true });
    return () => window.removeEventListener('scroll', updateScrolled);
  }, []);

  useEffect(() => {
    const sections = navigation.map(({ id }) => document.getElementById(id)).filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection(visible.target.id);
    }, { rootMargin: '-20% 0px -65% 0px', threshold: [0, 0.2, 0.6] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);
  const accountAction = (mode: LandingAuthMode) => { closeMenu(); onOpenAuth(mode); };

  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-all ${scrolled ? 'border-slate-200/90 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-950/95' : 'border-transparent bg-white/75 dark:bg-slate-950/75'}`}>
      <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8" aria-label="Main navigation">
        <a href="/#top" onClick={closeMenu} className="inline-flex shrink-0 rounded-xl focus-visible:ring-offset-4" aria-label="Climbio home, go to top">
          <img src={climbioLogo} alt="Climbio" className="h-12 w-auto object-contain dark:brightness-0 dark:invert" />
        </a>
        <div className="hidden items-center gap-1 lg:flex">
          {navigation.map(({ label, id }) => <a key={id} href={`/#${id}`} aria-current={activeSection === id ? 'location' : undefined} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${activeSection === id ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300' : 'text-slate-600 hover:bg-slate-50 hover:text-violet-700 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-violet-300'}`}>{label}</a>)}
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <LanguageToggle />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button type="button" onClick={() => accountAction('login')} className="min-h-11 rounded-xl px-4 text-sm font-bold text-slate-700 transition hover:bg-violet-50 hover:text-violet-700 dark:text-slate-200 dark:hover:bg-slate-900">Sign in</button>
          <button type="button" onClick={() => accountAction('signup')} className="min-h-11 rounded-xl bg-violet-600 px-5 text-sm font-bold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700">Start free</button>
        </div>
        <button type="button" onClick={() => setMobileMenuOpen((open) => !open)} className="grid size-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 md:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileMenuOpen} aria-controls="landing-mobile-menu">
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>
      {mobileMenuOpen && (
        <div id="landing-mobile-menu" className="border-t border-slate-100 bg-white px-5 py-5 shadow-lg dark:border-slate-800 dark:bg-slate-950 md:hidden">
          <div className="mx-auto grid max-w-7xl gap-1">
            {navigation.map(({ label, id }) => <a key={id} href={`/#${id}`} onClick={closeMenu} className="rounded-xl px-3 py-3 font-semibold text-slate-700 hover:bg-violet-50 dark:text-slate-200 dark:hover:bg-slate-900">{label}</a>)}
            <div className="my-3 flex items-center gap-2 border-y border-slate-100 py-3 dark:border-slate-800"><LanguageToggle /><ThemeToggle theme={theme} onToggle={onToggleTheme} /></div>
            <button type="button" onClick={() => accountAction('login')} className="min-h-11 rounded-xl border border-violet-200 font-bold text-violet-700 dark:border-violet-500/30 dark:text-violet-300">Sign in</button>
            <button type="button" onClick={() => accountAction('signup')} className="min-h-11 rounded-xl bg-violet-600 font-bold text-white">Start free</button>
          </div>
        </div>
      )}
    </header>
  );
}
