import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bot,
  Boxes,
  CheckCircle2,
  Menu,
  ReceiptText,
  ShieldCheck,
  Store,
  X,
} from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import climbioLogo from '@/assets/branding/climbio-logo.png';

export type LandingAuthMode = 'login' | 'signup';

export function LandingPage({ initialAuthMode = null }: { initialAuthMode?: LandingAuthMode | null }) {
  const [authMode, setAuthMode] = useState<LandingAuthMode | null>(initialAuthMode);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => setAuthMode(initialAuthMode), [initialAuthMode]);

  useEffect(() => {
    if (!user) return;
    window.location.replace(user.role === 'ADMIN' ? '/admin/dashboard' : user.accountStatus !== 'ACTIVE' || user.approvalStatus !== 'APPROVED' ? '/application' : '/');
  }, [user]);

  useEffect(() => {
    if (!authMode) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [authMode]);

  const openAuth = (mode: LandingAuthMode) => {
    setAuthMode(mode);
    setMobileMenuOpen(false);
    window.history.pushState({}, '', mode === 'login' ? '/account/login' : '/account/signup');
  };

  const closeAuth = () => {
    setAuthMode(null);
    window.history.pushState({}, '', '/');
  };

  if (user) return null;

  const features = [
    { icon: Boxes, title: 'Inventory made simple', description: 'Track products, categories, pricing, and stock levels from one organized workspace.' },
    { icon: ReceiptText, title: 'Professional invoicing', description: 'Create invoices, follow payment status, and export polished PDFs in a few clicks.' },
    { icon: Store, title: 'Your public storefront', description: 'Publish a branded product catalog and share your unique shop link with customers.' },
    { icon: Bot, title: 'AI business guidance', description: 'Turn real sales and inventory data into practical insights and next-step recommendations.' },
  ];

  return (
    <main className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen overflow-hidden bg-[#fbfaff] text-slate-950 transition-colors dark:bg-slate-950 dark:text-white">
        <header className="relative z-30 border-b border-violet-100/80 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
          <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8" aria-label="Main navigation">
            <a href="/" className="inline-flex items-center" aria-label="Climbio home">
              <img src={climbioLogo} alt="Climbio" className="h-14 w-auto object-contain dark:brightness-0 dark:invert" />
            </a>
            <div className="hidden items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300 md:flex">
              <a href="#features" className="transition hover:text-violet-600">Features</a>
              <a href="#how-it-works" className="transition hover:text-violet-600">How it works</a>
              <a href="#security" className="transition hover:text-violet-600">Security</a>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <LanguageToggle />
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <button type="button" onClick={() => openAuth('login')} className="min-h-11 rounded-xl px-4 text-sm font-bold text-slate-700 transition hover:bg-violet-50 hover:text-violet-700 dark:text-slate-200 dark:hover:bg-slate-800">Sign in</button>
              <button type="button" onClick={() => openAuth('signup')} className="min-h-11 rounded-xl bg-violet-600 px-5 text-sm font-bold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700">Start free</button>
            </div>
            <button type="button" onClick={() => setMobileMenuOpen((open) => !open)} className="grid size-11 place-items-center rounded-xl border border-slate-200 sm:hidden dark:border-slate-700" aria-label="Toggle navigation menu" aria-expanded={mobileMenuOpen}>
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </nav>
          {mobileMenuOpen && (
            <div className="border-t border-slate-100 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950 sm:hidden">
              <div className="grid gap-2">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-2 font-semibold">Features</a>
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-2 font-semibold">How it works</a>
                <button type="button" onClick={() => openAuth('login')} className="mt-2 min-h-11 rounded-xl border border-violet-200 font-bold text-violet-700 dark:border-violet-500/30 dark:text-violet-300">Sign in</button>
                <button type="button" onClick={() => openAuth('signup')} className="min-h-11 rounded-xl bg-violet-600 font-bold text-white">Start free</button>
              </div>
            </div>
          )}
        </header>

        <section className="relative">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.16),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(217,70,239,0.12),transparent_35%)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:py-28">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-violet-700 shadow-sm dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300">
                <BarChart3 className="size-4" /> Built for growing businesses
              </div>
              <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[1.08] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
                Run your shop with <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">clarity and confidence.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">Climbio brings inventory, invoices, sales insights, your public store, and an AI business advisor into one simple workspace.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => openAuth('signup')} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-7 font-bold text-white shadow-xl shadow-violet-600/25 transition hover:-translate-y-0.5 hover:shadow-2xl">Create your workspace <ArrowRight className="size-5" /></button>
                <button type="button" onClick={() => openAuth('login')} className="min-h-14 rounded-2xl border border-slate-200 bg-white px-7 font-bold text-slate-800 transition hover:border-violet-300 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white">Sign in to Climbio</button>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                {['Quick setup', 'Secure shop data', 'Mobile friendly'].map((item) => <span key={item} className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-500" />{item}</span>)}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -inset-8 rounded-full bg-violet-400/15 blur-3xl" />
              <div className="relative overflow-hidden rounded-[32px] border border-violet-100 bg-white p-5 shadow-[0_35px_90px_rgba(76,29,149,0.18)] dark:border-slate-700 dark:bg-slate-900 sm:p-7">
                <div className="flex items-center justify-between">
                  <div><p className="text-xs font-bold uppercase tracking-widest text-slate-400">Business overview</p><p className="mt-1 text-xl font-black">Good morning, Shop Owner</p></div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">Live</span>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[['Revenue', '1.28M'], ['Products', '128'], ['Invoices', '36']].map(([label, value]) => <div key={label} className="rounded-2xl bg-violet-50 p-4 dark:bg-slate-800"><p className="text-xs text-slate-500 dark:text-slate-400">{label}</p><p className="mt-2 text-xl font-black">{value}</p></div>)}
                </div>
                <div className="mt-5 rounded-2xl border border-slate-100 p-5 dark:border-slate-800">
                  <div className="flex items-center justify-between"><p className="text-sm font-bold">Sales performance</p><p className="text-xs font-bold text-emerald-600">+18.4%</p></div>
                  <div className="mt-6 flex h-36 items-end gap-3" aria-hidden="true">
                    {[38, 55, 44, 68, 61, 84, 73, 100].map((height, index) => <span key={index} className="flex-1 rounded-t-lg bg-gradient-to-t from-violet-600 to-fuchsia-400" style={{ height: `${height}%`, opacity: 0.55 + index * 0.05 }} />)}
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 p-4 text-white"><Bot className="size-6 shrink-0" /><div><p className="text-sm font-bold">AI recommendation</p><p className="mt-0.5 text-xs text-violet-100">Restock your top-selling products this week.</p></div></div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-white py-24 dark:bg-slate-900/60">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center"><p className="text-sm font-extrabold uppercase tracking-widest text-violet-600 dark:text-violet-300">Everything in one place</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">The tools your business needs to climb</h2><p className="mt-4 leading-7 text-slate-600 dark:text-slate-400">Spend less time switching between tools and more time growing your business.</p></div>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, description }) => <article key={title} className="rounded-3xl border border-slate-100 bg-[#fbfaff] p-6 transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-950/5 dark:border-slate-800 dark:bg-slate-950"><div className="grid size-12 place-items-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"><Icon className="size-6" /></div><h3 className="mt-5 text-lg font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p></article>)}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-6 lg:grid-cols-3">
              {[['01', 'Create your shop', 'Register your business and submit your shop information for a quick platform review.'], ['02', 'Organize your operations', 'Add products, monitor inventory, create invoices, and publish your public catalog.'], ['03', 'Grow with better insight', 'Follow performance from your dashboard and use AI recommendations to plan your next move.']].map(([number, title, description]) => <div key={number} className="relative rounded-3xl border border-violet-100 bg-white p-7 dark:border-slate-800 dark:bg-slate-900"><span className="text-5xl font-black text-violet-100 dark:text-violet-500/20">{number}</span><h3 className="mt-4 text-xl font-black">{title}</h3><p className="mt-3 leading-7 text-slate-600 dark:text-slate-400">{description}</p></div>)}
            </div>
          </div>
        </section>

        <section id="security" className="px-5 pb-24 sm:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 rounded-[32px] bg-slate-950 px-7 py-12 text-white dark:bg-violet-950 sm:px-12 lg:flex-row">
            <div className="max-w-2xl"><div className="flex items-center gap-2 text-violet-300"><ShieldCheck className="size-5" /><span className="text-sm font-bold uppercase tracking-widest">Secure by design</span></div><h2 className="mt-4 text-3xl font-black">Your business data stays yours.</h2><p className="mt-3 leading-7 text-slate-300">Protected sessions, role-based access, approval controls, and isolated shop data keep your workspace secure.</p></div>
            <button type="button" onClick={() => openAuth('signup')} className="inline-flex min-h-14 shrink-0 items-center gap-2 rounded-2xl bg-white px-7 font-bold text-violet-700 transition hover:bg-violet-50">Get started <ArrowRight className="size-5" /></button>
          </div>
        </section>

        <footer className="border-t border-slate-200 py-8 dark:border-slate-800"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 text-sm text-slate-500 sm:flex-row sm:px-8"><p>© {new Date().getFullYear()} Climbio. Built for growing shops.</p><p>Inventory · Invoices · Storefront · AI insights</p></div></footer>
      </div>

      {authMode && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-label={authMode === 'login' ? 'Sign in to Climbio' : 'Create a Climbio account'} onMouseDown={(event) => { if (event.target === event.currentTarget) closeAuth(); }}>
          <div className="relative my-6 w-full max-w-[540px]">
            <button type="button" onClick={closeAuth} className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300" aria-label="Close authentication form"><X className="size-5" /></button>
            {authMode === 'login' ? <LoginForm /> : <RegisterForm />}
            <p className="mt-4 text-center text-sm text-white">
              {authMode === 'login' ? 'Don’t have an account?' : 'Already have an account?'}{' '}
              <button type="button" onClick={() => openAuth(authMode === 'login' ? 'signup' : 'login')} className="font-bold text-violet-200 underline-offset-4 hover:underline">{authMode === 'login' ? 'Create account' : 'Sign in'}</button>
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
