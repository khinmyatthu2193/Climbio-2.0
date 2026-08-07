import {
  Bot,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Store,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { PageHeader } from '@/components/common/PageHeader';

type Guide = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  steps: string[];
  link?: { label: string; href: string };
};

const guides: Guide[] = [
  {
    id: 'getting-started',
    title: 'Getting started',
    description: 'Prepare your workspace before recording your first sale.',
    icon: Store,
    steps: [
      'Open Settings and confirm your shop name, phone number, address, and currency.',
      'Upload your shop logo so it appears consistently across your business materials.',
      'Add an invoice footer for payment instructions, contact details, or a short thank-you note.',
    ],
    link: { label: 'Open settings', href: '/profile' },
  },
  {
    id: 'dashboard',
    title: 'Dashboard and reports',
    description: 'See the health of your shop at a glance.',
    icon: LayoutDashboard,
    steps: [
      'Use the summary cards to review revenue, product count, stock on hand, and low-stock items.',
      'Change the sales chart period to compare recent performance over 7 days, 30 days, or 6 months.',
      'Review inventory levels and top products, then export a report when you need a shareable copy.',
    ],
    link: { label: 'Go to dashboard', href: '/' },
  },
  {
    id: 'products',
    title: 'Products and inventory',
    description: 'Build your catalog and keep stock quantities accurate.',
    icon: Package,
    steps: [
      'Select Products, then Add product and enter its name, price, stock quantity, and category.',
      'Add a clear product image and description, and enable public visibility when it should appear in your store.',
      'Use search, category, and stock filters to find items. Edit a product whenever its price or quantity changes.',
      'Check low-stock and out-of-stock indicators regularly so you can restock before missing sales.',
    ],
    link: { label: 'Manage products', href: '/products' },
  },
  {
    id: 'invoices',
    title: 'Invoices and sales',
    description: 'Create a sale, track payment, and provide a professional invoice.',
    icon: FileText,
    steps: [
      'Select Invoices, choose Create invoice, and enter the customer details.',
      'Add one or more products, confirm quantities and prices, then review the total before saving.',
      'Move the invoice through Draft, Sent, Paid, or Cancelled as the sale progresses.',
      'Open an invoice to download or print its PDF. Stock and dashboard totals reflect recorded sales.',
    ],
    link: { label: 'View invoices', href: '/invoices' },
  },
  {
    id: 'public-store',
    title: 'Public store',
    description: 'Share a customer-facing catalog without giving access to your workspace.',
    icon: ShoppingBag,
    steps: [
      'Open Public store to preview the shop details and products customers will see.',
      'Only active, publicly visible products are displayed, so review each product before sharing your link.',
      'Copy your public store link or QR code and share it through social media, chat, or printed materials.',
    ],
    link: { label: 'View public store tools', href: '/my-store' },
  },
  {
    id: 'ai-advisor',
    title: 'AI Advisor',
    description: 'Turn your existing shop records into practical business insights.',
    icon: Bot,
    steps: [
      'Keep products, inventory, and paid invoices up to date—the advisor bases its answers on these records.',
      'Select Analyze My Business for an overview of sales, stock, customers, and items needing attention.',
      'Ask a specific question, such as which products need restocking or how recent sales are performing.',
      'Treat recommendations as decision support and confirm important business choices against your records.',
    ],
    link: { label: 'Open AI Advisor', href: '/ai-advisor' },
  },
  {
    id: 'account',
    title: 'Account and security',
    description: 'Keep your profile secure and your preferences current.',
    icon: Settings,
    steps: [
      'Use Settings to update your profile, shop information, preferred currency, logo, and invoice footer.',
      'When changing your password, enter the current password and a secure new password. You will be asked to sign in again.',
      'Use the language and theme controls in the top bar to adjust the workspace display on this device.',
      'Always log out when using a shared computer.',
    ],
    link: { label: 'Manage account', href: '/profile' },
  },
];

export function UserManualPage() {
  return (
    <main className="page-container">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          eyebrow="Help center"
          title="Climbio user manual"
          description="A practical guide to setting up your shop, managing daily work, and getting the most from Climbio."
        />

        <Card className="mt-6 overflow-hidden bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white dark:border-violet-500/40 dark:from-violet-700 dark:to-fuchsia-800">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-100">Recommended setup</p>
              <h2 className="mt-2 text-2xl font-bold">Start selling in three steps</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-violet-100">Complete your shop profile, add your products, then create an invoice. Your dashboard and AI insights become more useful as you keep these records current.</p>
            </div>
            <div className="grid gap-2 text-sm font-semibold sm:grid-cols-3 lg:grid-cols-1">
              {['Complete shop settings', 'Add products and stock', 'Create your first invoice'].map((step) => (
                <div key={step} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 ring-1 ring-inset ring-white/15">
                  <CheckCircle2 className="size-4 shrink-0 text-violet-100" /> {step}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <nav className="mt-6" aria-label="Manual sections">
          <p className="mb-3 text-sm font-bold text-slate-900 dark:text-white">Jump to a section</p>
          <div className="flex flex-wrap gap-2">
            {guides.map(({ id, title }) => (
              <a key={id} href={`#${id}`} className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:border-violet-300 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:text-violet-300">
                {title}
              </a>
            ))}
          </div>
        </nav>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {guides.map(({ id, title, description, icon: Icon, steps, link }) => (
            <Card key={id} id={id} className="scroll-mt-24">
              <div className="flex items-start gap-4">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
                </div>
              </div>
              <ol className="mt-5 space-y-3">
                {steps.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{index + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              {link && <a href={link.href} className="mt-5 inline-flex text-sm font-bold text-violet-700 hover:text-violet-900 dark:text-violet-300 dark:hover:text-violet-200">{link.label} →</a>}
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
