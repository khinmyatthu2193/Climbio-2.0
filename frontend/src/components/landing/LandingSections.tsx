import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  Bot,
  Boxes,
  CheckCircle2,
  FileText,
  Home,
  KeyRound,
  LockKeyhole,
  MessagesSquare,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Store,
  TrendingUp,
  UserCheck,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import type { LandingAuthMode } from '@/pages/LandingPage';
import climbioLogo from '@/assets/branding/climbio-logo.png';

type AuthAction = { onOpenAuth: (mode: LandingAuthMode) => void };
const container = 'mx-auto w-full max-w-7xl px-5 sm:px-8';

function SectionHeading({ eyebrow, title, description, align = 'center' }: { eyebrow?: string; title: string; description: string; align?: 'center' | 'left' }) {
  return <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>{eyebrow && <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-300">{eyebrow}</p>}<h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-slate-950 dark:text-white sm:text-4xl">{title}</h2><p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">{description}</p></div>;
}

export function HeroSection({ onOpenAuth }: AuthAction) {
  return <section id="top" className="landing-section relative">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.15),transparent_34%),radial-gradient(circle_at_82%_65%,rgba(217,70,239,0.10),transparent_32%)]" />
    <div className={`${container} relative grid items-center gap-14 py-16 sm:py-20 lg:grid-cols-[1.04fr_0.96fr] lg:py-28`}>
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-xs font-extrabold tracking-[0.12em] text-violet-700 shadow-sm dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300"><TrendingUp className="size-4" /> BUILT FOR GROWING BUSINESSES</div>
        <h1 className="mt-7 max-w-3xl text-[clamp(2.8rem,7vw,4.5rem)] font-black leading-[1.05] tracking-[-0.05em]">Run your shop<br />with <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">clarity</span> and<br /><span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">confidence.</span></h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">Manage inventory, invoices, sales insights, your public storefront, and AI-powered business guidance from one secure workspace.</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => onOpenAuth('signup')} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-7 font-bold text-white shadow-xl shadow-violet-600/25 transition hover:-translate-y-0.5 hover:bg-violet-700">Create your workspace <ArrowRight className="size-5" /></button><button type="button" onClick={() => onOpenAuth('login')} className="min-h-14 rounded-2xl border border-slate-200 bg-white px-7 font-bold text-slate-800 transition hover:border-violet-300 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white">Sign in to Climbio</button></div>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-600 dark:text-slate-400">{['Quick setup', 'Secure shop data', 'Mobile friendly'].map((item) => <span key={item} className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-500" />{item}</span>)}</div>
      </div>
      <DashboardPreview />
    </div>
  </section>;
}

function DashboardPreview() {
  return <div className="relative mx-auto w-full max-w-xl" aria-label="Climbio dashboard preview">
    <div className="absolute -inset-8 rounded-full bg-violet-400/15 blur-3xl" />
    <div className="relative overflow-hidden rounded-[28px] border border-violet-100 bg-white p-4 shadow-[0_30px_80px_rgba(76,29,149,0.16)] dark:border-slate-700 dark:bg-slate-900 sm:p-7">
      <div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Business Overview</p><p className="mt-1 text-lg font-black sm:text-xl">Good morning, Shop Owner</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">Demo preview</span></div>
      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">{[[WalletCards, 'Revenue', '1.28M'], [Boxes, 'Products', '128'], [ReceiptText, 'Invoices', '36']].map(([Icon, label, value]) => { const MetricIcon = Icon as typeof Boxes; return <div key={String(label)} className="min-w-0 rounded-2xl bg-violet-50 p-3 dark:bg-slate-800 sm:p-4"><MetricIcon className="size-4 text-violet-600 dark:text-violet-300" /><p className="mt-3 truncate text-[10px] text-slate-500 dark:text-slate-400 sm:text-xs">{String(label)}</p><p className="mt-1 text-lg font-black sm:text-xl">{String(value)}</p></div>; })}</div>
      <div className="mt-4 rounded-2xl border border-slate-100 p-4 dark:border-slate-800 sm:p-5"><div className="flex items-center justify-between"><p className="text-sm font-bold">Sales Performance</p><p className="text-xs font-bold text-emerald-600">+18.4%</p></div><div className="mt-5 flex h-28 items-end gap-2 sm:h-36 sm:gap-3" aria-hidden="true">{[38, 55, 44, 68, 61, 84, 73, 100].map((height, index) => <span key={index} className="flex-1 rounded-t-md bg-gradient-to-t from-violet-600 to-fuchsia-400 motion-safe:transition-all" style={{ height: `${height}%`, opacity: 0.55 + index * 0.05 }} />)}</div></div>
      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 p-4 text-white"><Bot className="size-6 shrink-0" /><div><p className="text-sm font-bold">AI Recommendation</p><p className="mt-0.5 text-xs leading-5 text-violet-100">Restock your top-selling products this week.</p></div></div>
    </div>
  </div>;
}

const featureCards = [
  { icon: Boxes, title: 'Inventory made simple', description: 'Manage products, categories, pricing, stock levels, and product images from one organized workspace.' },
  { icon: ReceiptText, title: 'Professional invoicing', description: 'Create invoices, manage invoice status, track sales, and generate polished PDFs.' },
  { icon: BarChart3, title: 'Understand your business', description: 'See revenue, sales performance, inventory information, and important business metrics at a glance.' },
  { icon: Store, title: 'Your public storefront', description: 'Publish your approved shop through a shareable storefront and let customers browse your active products.' },
  { icon: Bot, title: 'AI business guidance', description: 'Turn real shop sales and inventory data into practical insights and next-step recommendations.' },
  { icon: MessagesSquare, title: 'Ask Climbio', description: 'Ask business questions using an AI assistant that understands the context of your shop.' },
];

export function FeaturesSection() {
  return <section id="features" className="landing-section bg-white py-20 dark:bg-slate-900/55 sm:py-24"><div className={container}><SectionHeading eyebrow="Everything in one place" title="The tools your business needs to climb" description="Spend less time switching between tools and more time growing your business." /><div className="mt-12 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3">{featureCards.map(({ icon: Icon, title, description }) => <article key={title} className="h-full rounded-3xl border border-slate-100 bg-[#fbfaff] p-6 transition motion-safe:hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-950/5 dark:border-slate-800 dark:bg-slate-950"><div className="grid size-12 place-items-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"><Icon className="size-6" /></div><h3 className="mt-5 text-lg font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p></article>)}</div></div></section>;
}

const steps = [
  { title: 'Create your account', description: 'Register your business and provide your basic shop information.' },
  { title: 'Submit your shop', description: 'Your application is sent to the Climbio administrator for platform review.' },
  { title: 'Get approved', description: 'Once approved, your secure business workspace and management tools become available.', note: 'If changes are requested, update your shop information and resubmit it for review.' },
  { title: 'Manage and grow', description: 'Add products, manage inventory, create invoices, publish your storefront, track performance, and use AI insights.' },
];

export function HowItWorksSection() {
  return <section id="how-it-works" className="landing-section py-20 sm:py-24"><div className={container}><SectionHeading title="From registration to running your shop" description="Climbio keeps onboarding simple while protecting the platform through business review and approval." /><div className="relative mt-14 grid gap-5 lg:grid-cols-4"><div className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-px bg-violet-200 lg:block dark:bg-violet-500/30" />{steps.map((step, index) => <article key={step.title} className="relative rounded-3xl border border-violet-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><span className="relative z-10 grid size-14 place-items-center rounded-full border-4 border-[#fbfaff] bg-violet-600 text-sm font-black text-white dark:border-slate-950">{String(index + 1).padStart(2, '0')}</span><h3 className="mt-5 text-xl font-black">{step.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{step.description}</p>{step.note && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">{step.note}</p>}</article>)}</div></div></section>;
}

export function WorkflowSection() {
  const vertical = [[Boxes, 'Products'], [PackageCheck, 'Inventory'], [ReceiptText, 'Invoices'], [TrendingUp, 'Sales Data'], [BarChart3, 'Dashboard'], [Bot, 'AI Insights']];
  return <section className="bg-violet-50/70 py-20 dark:bg-violet-950/15 sm:py-24"><div className={container}><SectionHeading title="One workspace. One connected workflow." description="Every part of Climbio works together, so updates in your daily operations become useful business insight." /><div className="mt-12 grid items-center gap-10 lg:grid-cols-[1fr_auto_1fr]"><div className="grid gap-2">{vertical.map(([Icon, label], index) => { const FlowIcon = Icon as typeof Boxes; return <div key={String(label)} className="contents"><div className="mx-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><span className="grid size-10 place-items-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"><FlowIcon className="size-5" /></span><span className="font-bold">{String(label)}</span></div>{index < vertical.length - 1 && <ArrowDown className="mx-auto size-5 text-violet-400" />}</div>; })}</div><ArrowRight className="mx-auto hidden size-7 text-violet-400 lg:block" /><div className="mx-auto w-full max-w-md rounded-3xl border border-violet-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-3"><Boxes className="size-6 text-violet-600" /><p className="font-black">Products</p></div><ArrowDown className="ml-1.5 my-3 size-5 text-violet-400" /><div className="flex items-center gap-3"><Store className="size-6 text-violet-600" /><p className="font-black">Public Storefront</p></div><ArrowDown className="ml-1.5 my-3 size-5 text-violet-400" /><div className="flex items-center gap-3"><UsersRound className="size-6 text-emerald-600" /><p className="font-black">Customers</p></div><p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-400">Active products become visible in your approved public shop, where customers can browse without creating an account.</p></div></div></div></section>;
}

const securityItems = [[KeyRound, 'Secure authentication', 'Protected sessions and secure password storage.'], [UserCheck, 'Role-based access', 'Access is limited according to each account role.'], [ShieldCheck, 'Shop approval controls', 'Business tools unlock only after administrator review.'], [LockKeyhole, 'Isolated shop data', 'Each business workspace accesses only its own records.']];
export function SecuritySection({ onOpenAuth }: AuthAction) {
  return <section id="security" className="landing-section py-20 sm:py-24"><div className={container}><div className="overflow-hidden rounded-[32px] bg-slate-950 px-6 py-10 text-white shadow-2xl shadow-slate-950/10 sm:px-10 lg:px-14 lg:py-14"><div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]"><div><div className="inline-flex items-center gap-2 text-violet-300"><ShieldCheck className="size-5" /><span className="text-sm font-bold uppercase tracking-widest">Secure by design</span></div><h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Your business data stays yours.</h2><p className="mt-4 leading-7 text-slate-300">Climbio protects each shop workspace through secure authentication, role-based access, approval controls, and isolated business data.</p><button type="button" onClick={() => onOpenAuth('signup')} className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-6 font-bold text-violet-700 transition hover:bg-violet-50">Get started <ArrowRight className="size-5" /></button></div><div className="grid gap-4 sm:grid-cols-2">{securityItems.map(([Icon, title, description]) => { const SecurityIcon = Icon as typeof KeyRound; return <article key={String(title)} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5"><SecurityIcon className="size-5 text-violet-300" /><h3 className="mt-4 font-bold">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{String(description)}</p></article>; })}</div></div></div></div></section>;
}

const audiences = [[ShoppingBag, 'Online Sellers', 'Keep products, stock, sales, and customer-facing catalogs organized.'], [Store, 'Retail Shops', 'Manage daily inventory and invoicing from one workspace.'], [Home, 'Home Businesses', 'Create professional invoices and share products without building a separate website.'], [FileText, 'Small Service Businesses', 'Track business activity and use insights to make better decisions.']];
export function AudienceSection() {
  return <section className="bg-white py-20 dark:bg-slate-900/55 sm:py-24"><div className={container}><SectionHeading title="Built for small businesses that want to grow" description="Climbio keeps essential business tools practical and approachable for everyday owners." /><div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{audiences.map(([Icon, title, description]) => { const AudienceIcon = Icon as typeof Store; return <article key={String(title)} className="rounded-3xl border border-slate-100 p-6 dark:border-slate-800"><AudienceIcon className="size-7 text-violet-600 dark:text-violet-300" /><h3 className="mt-5 text-lg font-black">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{String(description)}</p></article>; })}</div></div></section>;
}

export function FinalCTA({ onOpenAuth }: AuthAction) {
  return <section className="px-5 py-20 sm:px-8"><div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-slate-950 px-6 py-14 text-center text-white sm:px-10"><div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-violet-600/30 blur-3xl" /><div className="relative mx-auto max-w-3xl"><h2 className="text-3xl font-black tracking-tight sm:text-4xl">Ready to run your shop with more clarity?</h2><p className="mt-4 text-lg leading-8 text-slate-300">Create your Climbio workspace and bring your products, invoices, storefront, insights, and business tools together.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><button type="button" onClick={() => onOpenAuth('signup')} className="min-h-13 rounded-xl bg-white px-7 font-bold text-violet-700 hover:bg-violet-50">Start free</button><button type="button" onClick={() => onOpenAuth('login')} className="min-h-13 rounded-xl border border-white/20 px-7 font-bold text-white hover:bg-white/10">Sign in</button></div></div></div></section>;
}

export function LandingFooter({ onOpenAuth }: AuthAction) {
  return <footer className="border-t border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-950"><div className={`${container} grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]`}><div><a href="/#top" className="inline-flex rounded-xl" aria-label="Climbio home"><img src={climbioLogo} alt="Climbio" className="h-12 w-auto dark:brightness-0 dark:invert" /></a><p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Smart business tools for growing SMEs.</p></div><div><h2 className="text-sm font-black uppercase tracking-wider">Explore</h2><div className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-400"><a href="/#features" className="hover:text-violet-600">Features</a><a href="/#how-it-works" className="hover:text-violet-600">How it works</a><a href="/#security" className="hover:text-violet-600">Security</a></div></div><div><h2 className="text-sm font-black uppercase tracking-wider">Account</h2><div className="mt-4 grid justify-items-start gap-3 text-sm"><button type="button" onClick={() => onOpenAuth('login')} className="text-slate-600 hover:text-violet-600 dark:text-slate-400">Sign in</button><button type="button" onClick={() => onOpenAuth('signup')} className="text-slate-600 hover:text-violet-600 dark:text-slate-400">Create account</button></div></div></div><div className={`${container} mt-10 border-t border-slate-100 pt-6 text-sm text-slate-500 dark:border-slate-800`}>© 2026 Climbio. Built for growing shops.</div></footer>;
}
