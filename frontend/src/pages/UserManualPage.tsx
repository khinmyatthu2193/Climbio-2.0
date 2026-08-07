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
import { useLanguage } from '@/hooks/useLanguage';
import loginScreenshot from '@/assets/manual/login.png';
import dashboardScreenshot from '@/assets/manual/dashboard.png';
import inventoryScreenshot from '@/assets/manual/inventory.png';
import invoiceScreenshot from '@/assets/manual/invoice.png';
import publicStoreScreenshot from '@/assets/manual/public-store.png';
import aiAdvisorScreenshot from '@/assets/manual/ai-advisor.png';
import settingsScreenshot from '@/assets/manual/settings.png';

type Guide = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  steps: string[];
  screenshot: string;
  screenshotCaption: string;
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
    screenshot: loginScreenshot,
    screenshotCaption: 'Climbio sign-in page',
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
    screenshot: dashboardScreenshot,
    screenshotCaption: 'Dashboard overview and business metrics',
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
    screenshot: inventoryScreenshot,
    screenshotCaption: 'Product list and inventory management',
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
    screenshot: invoiceScreenshot,
    screenshotCaption: 'Invoice creation and management',
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
    screenshot: publicStoreScreenshot,
    screenshotCaption: 'Customer view of the public product catalog',
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
    screenshot: aiAdvisorScreenshot,
    screenshotCaption: 'AI business analysis and recommendations',
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
    screenshot: settingsScreenshot,
    screenshotCaption: 'Profile and shop settings',
    link: { label: 'Manage account', href: '/profile' },
  },
];

const burmeseGuides: Record<string, Pick<Guide, 'title' | 'description' | 'steps' | 'screenshotCaption'> & { linkLabel: string }> = {
  'getting-started': {
    title: 'စတင်အသုံးပြုခြင်း',
    description: 'ပထမဆုံးရောင်းချမှု မမှတ်တမ်းတင်မီ သင့်လုပ်ငန်းခွင်ကို ပြင်ဆင်ပါ။',
    steps: [
      'ဆက်တင်များကို ဖွင့်ပြီး ဆိုင်အမည်၊ ဖုန်းနံပါတ်၊ လိပ်စာနှင့် ငွေကြေးအမျိုးအစားတို့ကို စစ်ဆေးပါ။',
      'လုပ်ငန်းဆိုင်ရာ စာရွက်စာတမ်းများတွင် တစ်သမတ်တည်း ဖော်ပြနိုင်ရန် ဆိုင်လိုဂိုကို တင်ပါ။',
      'ငွေပေးချေမှုညွှန်ကြားချက်၊ ဆက်သွယ်ရန်အချက်အလက် သို့မဟုတ် ကျေးဇူးတင်စကားတိုကို ဘောက်ချာအောက်ခြေတွင် ထည့်ပါ။',
    ],
    screenshotCaption: 'Climbio အကောင့်ဝင်ရန် စာမျက်နှာ',
    linkLabel: 'ဆက်တင်များကို ဖွင့်ရန်',
  },
  dashboard: {
    title: 'ဒက်ရှ်ဘုတ်နှင့် အစီရင်ခံစာများ',
    description: 'သင့်ဆိုင်၏ လုပ်ငန်းအခြေအနေကို တစ်ချက်ကြည့်ရုံဖြင့် သိရှိပါ။',
    steps: [
      'ဝင်ငွေ၊ ကုန်ပစ္စည်းအရေအတွက်၊ လက်ကျန်စတော့နှင့် စတော့နည်းပစ္စည်းများကို အနှစ်ချုပ်ကတ်များမှ ကြည့်ပါ။',
      'လတ်တလောစွမ်းဆောင်ရည်ကို နှိုင်းယှဉ်ရန် အရောင်းဇယားကာလကို ၇ ရက်၊ ၃၀ ရက် သို့မဟုတ် ၆ လသို့ ပြောင်းပါ။',
      'စတော့အဆင့်နှင့် ရောင်းအားကောင်းသောပစ္စည်းများကို စစ်ဆေးပြီး မျှဝေရန်လိုအပ်သည့်အခါ အစီရင်ခံစာထုတ်ယူပါ။',
    ],
    screenshotCaption: 'ဒက်ရှ်ဘုတ်နှင့် လုပ်ငန်းအချက်အလက်များ',
    linkLabel: 'ဒက်ရှ်ဘုတ်သို့ သွားရန်',
  },
  products: {
    title: 'ကုန်ပစ္စည်းနှင့် စတော့',
    description: 'ကုန်ပစ္စည်းစာရင်းတည်ဆောက်ပြီး စတော့အရေအတွက်ကို တိကျစွာ ထိန်းသိမ်းပါ။',
    steps: [
      'ကုန်ပစ္စည်းများကို ရွေးပါ၊ ထို့နောက် ကုန်ပစ္စည်းထည့်ရန်ကို နှိပ်ပြီး အမည်၊ ဈေးနှုန်း၊ စတော့အရေအတွက်နှင့် အမျိုးအစားကို ဖြည့်ပါ။',
      'ရှင်းလင်းသောပုံနှင့် ဖော်ပြချက်ထည့်ပြီး ဆိုင်တွင်ပြသလိုပါက အများမြင်နိုင်မှုကို ဖွင့်ပါ။',
      'ပစ္စည်းရှာရန် ရှာဖွေမှု၊ အမျိုးအစားနှင့် စတော့စစ်ထုတ်မှုများကို သုံးပါ။ ဈေးနှုန်း သို့မဟုတ် အရေအတွက်ပြောင်းသည့်အခါ ပြင်ဆင်ပါ။',
      'အရောင်းမလွတ်စေရန် စတော့နည်းနှင့် စတော့ကုန် အမှတ်အသားများကို ပုံမှန်စစ်ဆေးပါ။',
    ],
    screenshotCaption: 'ကုန်ပစ္စည်းစာရင်းနှင့် စတော့စီမံခန့်ခွဲမှု',
    linkLabel: 'ကုန်ပစ္စည်းများ စီမံရန်',
  },
  invoices: {
    title: 'ဘောက်ချာနှင့် အရောင်း',
    description: 'အရောင်းဖန်တီး၊ ငွေပေးချေမှုခြေရာခံပြီး ပရော်ဖက်ရှင်နယ်ဘောက်ချာ ထုတ်ပေးပါ။',
    steps: [
      'ဘောက်ချာများကို ရွေးပြီး ဘောက်ချာဖန်တီးရန်ကို နှိပ်ကာ ဝယ်ယူသူအချက်အလက် ဖြည့်ပါ။',
      'ကုန်ပစ္စည်းတစ်ခု သို့မဟုတ် အများအပြားထည့်ပြီး အရေအတွက်နှင့် ဈေးနှုန်းကို စစ်ဆေးကာ မသိမ်းမီ စုစုပေါင်းကို ပြန်ကြည့်ပါ။',
      'အရောင်းအခြေအနေအလိုက် ဘောက်ချာကို မူကြမ်း၊ ပို့ပြီး၊ ပေးချေပြီး သို့မဟုတ် ပယ်ဖျက်ပြီးအဖြစ် ပြောင်းပါ။',
      'PDF ဒေါင်းလုဒ် သို့မဟုတ် ပရင့်ထုတ်ရန် ဘောက်ချာကို ဖွင့်ပါ။ စတော့နှင့် ဒက်ရှ်ဘုတ်စုစုပေါင်းများသည် မှတ်တမ်းတင်ထားသော အရောင်းကို ထင်ဟပ်ပါသည်။',
    ],
    screenshotCaption: 'ဘောက်ချာဖန်တီးခြင်းနှင့် စီမံခန့်ခွဲမှု',
    linkLabel: 'ဘောက်ချာများ ကြည့်ရန်',
  },
  'public-store': {
    title: 'အများမြင်ဆိုင်',
    description: 'လုပ်ငန်းခွင်ဝင်ရောက်ခွင့်မပေးဘဲ ဝယ်ယူသူများအတွက် ကုန်ပစ္စည်းစာရင်းကို မျှဝေပါ။',
    steps: [
      'ဝယ်ယူသူများမြင်ရမည့် ဆိုင်အချက်အလက်နှင့် ကုန်ပစ္စည်းများကို အစမ်းကြည့်ရန် အများမြင်ဆိုင်ကို ဖွင့်ပါ။',
      'အသုံးပြုနေပြီး အများမြင်နိုင်သော ကုန်ပစ္စည်းများသာ ပြသသောကြောင့် လင့်ခ်မမျှဝေမီ ပစ္စည်းတစ်ခုချင်းစီကို စစ်ဆေးပါ။',
      'အများမြင်ဆိုင်လင့်ခ် သို့မဟုတ် QR ကုဒ်ကို ကူးယူပြီး လူမှုကွန်ရက်၊ စကားပြောအက်ပ် သို့မဟုတ် ပုံနှိပ်ပစ္စည်းများမှ မျှဝေပါ။',
    ],
    screenshotCaption: 'ဝယ်ယူသူမြင်ရသည့် အများမြင်ကုန်ပစ္စည်းစာရင်း',
    linkLabel: 'အများမြင်ဆိုင် ကိရိယာများကြည့်ရန်',
  },
  'ai-advisor': {
    title: 'AI အကြံပေး',
    description: 'လက်ရှိဆိုင်မှတ်တမ်းများမှ အသုံးဝင်သော လုပ်ငန်းအချက်အလက်များ ရယူပါ။',
    steps: [
      'AI အကြံပေးသည် ဤမှတ်တမ်းများကို အခြေခံသောကြောင့် ကုန်ပစ္စည်း၊ စတော့နှင့် ပေးချေပြီးဘောက်ချာများကို အမြဲနောက်ဆုံးအခြေအနေဖြစ်အောင် ထားပါ။',
      'အရောင်း၊ စတော့၊ ဝယ်ယူသူနှင့် ဂရုပြုရန်အချက်များ၏ အနှစ်ချုပ်ကို ရယူရန် ကျွန်ုပ်၏လုပ်ငန်းကို သုံးသပ်ရန်ကို ရွေးပါ။',
      'မည်သည့်ပစ္စည်းများ ပြန်ဖြည့်ရမည် သို့မဟုတ် လတ်တလောအရောင်းမည်သို့ရှိသည် စသည့် တိကျသောမေးခွန်းကို မေးပါ။',
      'အကြံပြုချက်များကို ဆုံးဖြတ်ချက်အထောက်အကူအဖြစ် သုံးပြီး အရေးကြီးသော လုပ်ငန်းဆုံးဖြတ်ချက်များကို သင့်မှတ်တမ်းများနှင့် ပြန်လည်စစ်ဆေးပါ။',
    ],
    screenshotCaption: 'AI လုပ်ငန်းသုံးသပ်ချက်နှင့် အကြံပြုချက်များ',
    linkLabel: 'AI အကြံပေးကို ဖွင့်ရန်',
  },
  account: {
    title: 'အကောင့်နှင့် လုံခြုံရေး',
    description: 'သင့်ပရိုဖိုင်ကို လုံခြုံစေပြီး စိတ်ကြိုက်ဆက်တင်များကို နောက်ဆုံးအခြေအနေဖြစ်အောင် ထားပါ။',
    steps: [
      'ပရိုဖိုင်၊ ဆိုင်အချက်အလက်၊ ငွေကြေး၊ လိုဂိုနှင့် ဘောက်ချာအောက်ခြေစာသားကို ပြင်ရန် ဆက်တင်များကို သုံးပါ။',
      'စကားဝှက်ပြောင်းရာတွင် လက်ရှိစကားဝှက်နှင့် လုံခြုံသော စကားဝှက်အသစ်ကို ထည့်ပါ။ ထို့နောက် ပြန်လည်ဝင်ရောက်ရပါမည်။',
      'ဤစက်ပေါ်ရှိ လုပ်ငန်းခွင်မြင်ကွင်းကို ချိန်ညှိရန် အပေါ်ဘားရှိ ဘာသာစကားနှင့် အပြင်အဆင်ခလုတ်များကို သုံးပါ။',
      'အများသုံးကွန်ပျူတာ အသုံးပြုပြီးတိုင်း အမြဲထွက်ပါ။',
    ],
    screenshotCaption: 'ပရိုဖိုင်နှင့် ဆိုင်ဆက်တင်များ',
    linkLabel: 'အကောင့် စီမံရန်',
  },
};

const pageCopy = {
  en: {
    eyebrow: 'Help center', title: 'Climbio user manual', description: 'A practical guide to setting up your shop, managing daily work, and getting the most from Climbio.',
    recommended: 'Recommended setup', setupTitle: 'Start selling in three steps', setupDescription: 'Complete your shop profile, add your products, then create an invoice. Your dashboard and AI insights become more useful as you keep these records current.',
    checklist: ['Complete shop settings', 'Add products and stock', 'Create your first invoice'], jump: 'Jump to a section', navLabel: 'Manual sections', screenshotHint: 'Select the image to view it full size',
  },
  my: {
    eyebrow: 'အကူအညီစင်တာ', title: 'Climbio အသုံးပြုသူလမ်းညွှန်', description: 'သင့်ဆိုင်ကို ပြင်ဆင်ခြင်း၊ နေ့စဉ်လုပ်ငန်းများ စီမံခြင်းနှင့် Climbio ကို အကောင်းဆုံးအသုံးချခြင်းအတွက် လက်တွေ့လမ်းညွှန်။',
    recommended: 'အကြံပြုထားသော ပြင်ဆင်မှု', setupTitle: 'အဆင့်သုံးဆင့်ဖြင့် စတင်ရောင်းချပါ', setupDescription: 'ဆိုင်ပရိုဖိုင်ကို ဖြည့်စွက်ပါ၊ ကုန်ပစ္စည်းများထည့်ပါ၊ ထို့နောက် ဘောက်ချာတစ်စောင် ဖန်တီးပါ။ မှတ်တမ်းများကို နောက်ဆုံးအခြေအနေဖြစ်အောင် ထားလျှင် ဒက်ရှ်ဘုတ်နှင့် AI အချက်အလက်များ ပိုမိုအသုံးဝင်လာပါမည်။',
    checklist: ['ဆိုင်ဆက်တင်များ ဖြည့်စွက်ပါ', 'ကုန်ပစ္စည်းနှင့် စတော့ထည့်ပါ', 'ပထမဆုံးဘောက်ချာ ဖန်တီးပါ'], jump: 'ကဏ္ဍတစ်ခုသို့ သွားရန်', navLabel: 'လမ်းညွှန်ကဏ္ဍများ', screenshotHint: 'ပုံအပြည့်အစုံကြည့်ရန် ပုံကိုနှိပ်ပါ',
  },
};

export function UserManualPage() {
  const { language } = useLanguage();
  const copy = pageCopy[language];
  const localizedGuides = language === 'my' ? guides.map((guide) => {
    const translated = burmeseGuides[guide.id];
    return { ...guide, ...translated, link: guide.link ? { ...guide.link, label: translated.linkLabel } : undefined };
  }) : guides;

  return (
    <main className="page-container">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
        />

        <Card className="mt-6 overflow-hidden bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white dark:border-violet-500/40 dark:from-violet-700 dark:to-fuchsia-800">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-100">{copy.recommended}</p>
              <h2 className="mt-2 text-2xl font-bold">{copy.setupTitle}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-violet-100">{copy.setupDescription}</p>
            </div>
            <div className="grid gap-2 text-sm font-semibold sm:grid-cols-3 lg:grid-cols-1">
              {copy.checklist.map((step) => (
                <div key={step} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 ring-1 ring-inset ring-white/15">
                  <CheckCircle2 className="size-4 shrink-0 text-violet-100" /> {step}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <nav className="mt-6" aria-label={copy.navLabel}>
          <p className="mb-3 text-sm font-bold text-slate-900 dark:text-white">{copy.jump}</p>
          <div className="flex flex-wrap gap-2">
            {localizedGuides.map(({ id, title }) => (
              <a key={id} href={`#${id}`} className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:border-violet-300 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:text-violet-300">
                {title}
              </a>
            ))}
          </div>
        </nav>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {localizedGuides.map(({ id, title, description, icon: Icon, steps, screenshot, screenshotCaption, link }) => (
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
              <figure className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
                <a href={screenshot} target="_blank" rel="noreferrer" aria-label={`${screenshotCaption}. ${copy.screenshotHint}`}>
                  <img
                    src={screenshot}
                    alt={screenshotCaption}
                    loading="lazy"
                    className="aspect-video w-full object-cover object-top transition duration-300 hover:scale-[1.02]"
                  />
                </a>
                <figcaption className="border-t border-slate-200 px-3 py-2.5 text-xs leading-5 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{screenshotCaption}</span>
                  <span className="ml-1">— {copy.screenshotHint}</span>
                </figcaption>
              </figure>
              {link && <a href={link.href} className="mt-5 inline-flex text-sm font-bold text-violet-700 hover:text-violet-900 dark:text-violet-300 dark:hover:text-violet-200">{link.label} →</a>}
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
