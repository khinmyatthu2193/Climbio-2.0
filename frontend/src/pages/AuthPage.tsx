import { CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import climbioLogo from '@/assets/branding/climbio-logo.png';

export function AuthPage({ register }: { register: boolean }) {
  const user = useAuthStore((state) => state.user);
  const { theme, toggleTheme } = useTheme();

  if (user) {
    window.location.replace('/');
    return null;
  }
  return (
    <main className={theme === 'dark' ? 'dark' : ''}>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 px-4 py-5 transition-colors duration-300 dark:from-slate-950 dark:via-slate-950 dark:to-violet-950 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -left-24 top-1/4 size-72 rounded-full bg-violet-300/25 blur-3xl dark:bg-violet-600/10" />
        <div className="pointer-events-none absolute -right-24 bottom-0 size-80 rounded-full bg-fuchsia-300/20 blur-3xl dark:bg-fuchsia-600/10" />

        <div className="relative mx-auto flex max-w-6xl justify-end gap-2">
          <LanguageToggle />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>

        <div className="relative mx-auto grid min-h-[calc(100vh-76px)] max-w-6xl items-center gap-10 py-5 lg:grid-cols-[0.9fr_1.1fr] lg:py-10">
          <section className="hidden px-6 lg:block">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/70 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-violet-700 shadow-sm backdrop-blur dark:border-violet-500/25 dark:bg-violet-500/10 dark:text-violet-300">
              <Sparkles className="size-3.5" /> Built for growing shops
            </div>
            <h1 className="mt-6 max-w-lg text-4xl font-black leading-tight tracking-tight text-slate-950 dark:text-white xl:text-5xl">
              Your business, organized in one <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">calm workspace.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600 dark:text-slate-300">
              Keep products, invoices, inventory, and your public store working together as your business grows.
            </p>
            <div className="mt-8 space-y-4 text-sm font-medium text-slate-700 dark:text-slate-300">
              {['Simple inventory and sales tracking', 'A public catalog ready to share', 'Secure access to your business data'].map((item) => (
                <div className="flex items-center gap-3" key={item}><CheckCircle2 className="size-5 text-emerald-500" />{item}</div>
              ))}
            </div>
          </section>

          <section className="mx-auto flex w-full max-w-lg flex-col items-center">
            <a className="mb-4 rounded-2xl transition hover:scale-[1.02]" href="/" aria-label="Climbio home">
              <img className="h-20 w-auto object-contain drop-shadow-sm dark:brightness-0 dark:invert sm:h-24" src={climbioLogo} alt="Climbio" />
            </a>
            {register ? <RegisterForm /> : <LoginForm />}
            <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-400">
              {register ? 'Already have an account?' : 'Don’t have an account?'}{' '}
              <a className="font-bold text-violet-700 underline-offset-4 hover:underline dark:text-violet-300" href={register ? '/login' : '/register'}>
                {register ? 'Sign in' : 'Create account'}
              </a>
            </p>
            <p className="mt-5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500"><ShieldCheck className="size-4" /> Your workspace is protected with secure authentication.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
