import { BarChart3, Boxes, CheckCircle2, ReceiptText, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuthStore } from '@/store/authStore';
import climbioLogo from '@/assets/branding/climbio-logo.png';

export function AuthPage({ register }: { register: boolean }) {
  const user = useAuthStore((state) => state.user);
  const { theme, toggleTheme } = useTheme();
  const { language } = useLanguage();
  const isBurmese = language === 'my';

  if (user) {
    window.location.replace(user.role === 'ADMIN' ? '/admin/dashboard' : user.accountStatus !== 'ACTIVE' || user.approvalStatus !== 'APPROVED' ? '/application' : '/');
    return null;
  }
  return (
    <main className={theme === 'dark' ? 'dark' : ''}>
      <div className="relative min-h-screen overflow-hidden bg-[#fbfaff] px-5 py-5 transition-colors duration-300 dark:bg-slate-950 sm:px-8 lg:px-12">
        <div className="pointer-events-none absolute -left-28 top-1/3 size-80 rounded-full bg-violet-200/25 blur-3xl dark:bg-violet-600/10" />
        <div className="pointer-events-none absolute -right-20 bottom-0 size-96 rounded-full bg-fuchsia-200/30 blur-3xl dark:bg-fuchsia-600/10" />

        <div className="relative mx-auto flex max-w-[1320px] justify-end gap-2">
          <LanguageToggle />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>

        <div className="relative mx-auto grid min-h-[calc(100vh-76px)] max-w-[1320px] items-center gap-10 py-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-10">
          <section className="hidden">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-xs font-bold text-violet-700 shadow-sm shadow-violet-100 dark:border-violet-500/25 dark:bg-violet-500/10 dark:text-violet-300">
              <Sparkles className="size-4" /> {isBurmese ? 'တိုးတက်နေသော လုပ်ငန်းများအတွက်' : 'Built for growing shops'}
            </div>
            <h1 className="mt-7 max-w-[600px] text-5xl font-black leading-[1.24] tracking-[-0.04em] text-slate-950 dark:text-white xl:text-[58px]">
              {isBurmese ? (
                <>သင့်လုပ်ငန်းကို တစ်နေရာတည်းမှ <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">ထိရောက်စွာ စီမံခန့်ခွဲပါ။</span></>
              ) : (
                <>Run your business from <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">one focused workspace.</span></>
              )}
            </h1>
            <p className="mt-7 max-w-[560px] text-lg leading-8 text-slate-500 dark:text-slate-300">
              {isBurmese ? 'ကုန်ပစ္စည်း၊ စာရင်းအင်း၊ ငွေတောင်းခံလွှာနှင့် အွန်လိုင်းဆိုင်ကို တစ်နေရာတည်းမှ လွယ်ကူစွာ စီမံနိုင်ပါသည်။' : 'Keep products, invoices, inventory, and your public store working together as your business grows.'}
            </p>
            <div className="mt-9 space-y-4 text-[15px] font-medium text-slate-600 dark:text-slate-300">
              {(isBurmese
                ? ['ကုန်ပစ္စည်းနှင့် စတော့ကို အချိန်နှင့်တပြေးညီ စီမံနိုင်ခြင်း', 'မျှဝေရန် အသင့်ရှိသော အွန်လိုင်းဆိုင်စာမျက်နှာ', 'လုပ်ငန်းဒေတာများကို လုံခြုံစွာ ကာကွယ်ထားခြင်း']
                : ['Simple inventory and sales tracking', 'A public catalog ready to share', 'Secure access to your business data']
              ).map((item) => (
                <div className="flex items-center gap-3" key={item}><CheckCircle2 className="size-5 shrink-0 text-emerald-500" />{item}</div>
              ))}
            </div>
          </section>

          <section className="hidden py-8 lg:block" aria-label="Climbio business workspace preview">
            <div className="relative max-w-[590px] overflow-hidden rounded-[36px] border border-violet-100 bg-white p-8 shadow-[0_30px_80px_rgba(139,92,246,0.16)] dark:border-slate-800 dark:bg-slate-950 dark:shadow-[0_30px_80px_rgba(49,46,129,0.24)] xl:p-10">
              <div className="absolute -right-24 -top-24 size-72 rounded-full bg-violet-300/35 blur-3xl dark:bg-violet-500/45" />
              <div className="absolute -bottom-24 -left-16 size-64 rounded-full bg-fuchsia-300/25 blur-3xl dark:bg-fuchsia-600/30" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-bold tracking-wide text-violet-700 dark:border-white/15 dark:bg-white/10 dark:text-violet-100">
                    <Sparkles className="size-3.5 text-violet-500 dark:text-violet-300" /> {isBurmese ? 'CLIMBIO လုပ်ငန်းစီမံခန့်ခွဲမှု' : 'CLIMBIO BUSINESS HUB'}
                  </div>
                  <div className="grid size-10 place-items-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-white/10 dark:text-violet-200"><TrendingUp className="size-5" /></div>
                </div>
                <h1 className="mt-7 max-w-[470px] text-4xl font-black leading-tight tracking-[-0.04em] text-slate-950 dark:text-white xl:text-[48px]">
                  {isBurmese ? 'မိတ်ဆွေတို့ရဲ့ လုပ်ငန်းကို Climbio နဲ့အတူ ချဲ့ထွင်လိုက်ပါ။' : 'See the important parts of your business, clearly.'}
                </h1>
                <p className="mt-4 max-w-[455px] text-base leading-7 text-slate-600 dark:text-slate-300">
                  {isBurmese ? 'အရောင်းစာရင်း၊ ကုန်ပစ္စည်းစာရင်းနဲ့ ဘောင်ချာတွေကို တစ်နေရာတည်းမှာ လွယ်ကူစွာ စီမံလိုက်ပါ။' : 'Track sales, stock, and invoices from one calm, connected workspace.'}
                </p>

                <div className="mt-8 rounded-3xl border border-violet-100 bg-violet-50/80 p-5 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.08]">
                  <div className="flex items-center justify-between">
                    <div><p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{isBurmese ? 'ယနေ့အခြေအနေ' : 'TODAY AT A GLANCE'}</p><p className="mt-1 text-lg font-bold text-slate-950 dark:text-white">{isBurmese ? 'သင့်လုပ်ငန်းအကျဉ်းချုပ်' : 'Your business snapshot'}</p></div>
                    <div className="rounded-xl bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">+18.4%</div>
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <Snapshot label={isBurmese ? 'ရောင်းအား' : 'Revenue'} value="1.28M" icon={BarChart3} />
                    <Snapshot label={isBurmese ? 'ကုန်ပစ္စည်း' : 'Products'} value="128" icon={Boxes} />
                    <Snapshot label={isBurmese ? 'ဘောင်ချာ' : 'Invoices'} value="36" icon={ReceiptText} />
                  </div>
                  <div className="mt-5 flex h-16 items-end gap-2" aria-hidden="true">
                    {[38, 56, 43, 72, 59, 88, 76, 100].map((height, index) => <span key={index} className="flex-1 rounded-t-md bg-gradient-to-t from-violet-500 to-fuchsia-400" style={{ height: `${height}%`, opacity: 0.45 + index * 0.07 }} />)}
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300"><CheckCircle2 className="size-5 shrink-0 text-emerald-500 dark:text-emerald-400" /> {isBurmese ? 'သင့်လုပ်ငန်းအတွက် လုံခြုံပြီး အသင့်ဖြစ်နေပါသည်။' : 'Secure, simple, and ready for your business.'}</div>
              </div>
            </div>
          </section>

          <section className="mx-auto flex w-full max-w-[500px] flex-col items-center">
            <a className="mb-5 rounded-2xl transition hover:scale-[1.02]" href="/" aria-label="Climbio home">
              <img className="h-24 w-auto object-contain drop-shadow-sm dark:brightness-0 dark:invert sm:h-28" src={climbioLogo} alt="Climbio" />
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

function Snapshot({ label, value, icon: Icon }: { label: string; value: string; icon: typeof BarChart3 }) {
  return (
    <div className="rounded-2xl bg-white/80 p-3 shadow-sm shadow-violet-950/[0.03] dark:bg-slate-900/50 dark:shadow-none">
      <Icon className="size-4 text-violet-600 dark:text-violet-300" />
      <p className="mt-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black tracking-tight text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
