import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Language = 'en' | 'my';

const burmese: Record<string, string> = {
  'Overview': 'အနှစ်ချုပ်', 'Products': 'ကုန်ပစ္စည်းများ', 'Invoices': 'ဘောင်ချာများ', 'AI Advisor': 'AI အကြံပေး',
  'Public store': 'အများမြင်ဆိုင်', 'Settings': 'ဆက်တင်များ', 'Workspace': 'လုပ်ငန်းခွင်', 'Log out': 'ထွက်ရန်',
  'View store': 'ဆိုင်ကြည့်ရန်', 'Expand sidebar': 'ဘေးဘား ချဲ့ရန်', 'Collapse sidebar': 'ဘေးဘား ချုံ့ရန်',
  'Close navigation': 'မီနူးပိတ်ရန်', 'Open navigation': 'မီနူးဖွင့်ရန်', 'Primary navigation': 'အဓိက မီနူး',
  'Switch to light mode': 'အလင်းမုဒ်သို့ ပြောင်းရန်', 'Switch to dark mode': 'အမှောင်မုဒ်သို့ ပြောင်းရန်',
  'Switch to Burmese': 'မြန်မာဘာသာသို့ ပြောင်းရန်', 'Switch to English': 'အင်္ဂလိပ်ဘာသာသို့ ပြောင်းရန်',
  'Built for growing shops': 'တိုးတက်နေသောဆိုင်များအတွက်',
  'Your business, organized in one': 'သင့်လုပ်ငန်းကို တစ်နေရာတည်းတွင်', 'calm workspace.': 'အဆင်ပြေစွာ စီမံပါ။',
  'Keep products, invoices, inventory, and your public store working together as your business grows.': 'ကုန်ပစ္စည်း၊ ဘောင်ချာ၊ စတော့နှင့် အများမြင်ဆိုင်ကို လုပ်ငန်းတိုးတက်လာသည်နှင့်အမျှ တစ်နေရာတည်းတွင် စီမံပါ။',
  'Simple inventory and sales tracking': 'ရိုးရှင်းသော စတော့နှင့် အရောင်းခြေရာခံမှု', 'A public catalog ready to share': 'မျှဝေရန်အဆင်သင့် ကုန်ပစ္စည်းစာရင်း',
  'Secure access to your business data': 'သင့်လုပ်ငန်းဒေတာကို လုံခြုံစွာ ဝင်ရောက်နိုင်ခြင်း', 'Already have an account?': 'အကောင့်ရှိပြီးသားလား?',
  'Donâ€™t have an account?': 'အကောင့်မရှိသေးဘူးလား?', 'Don’t have an account?': 'အကောင့်မရှိသေးဘူးလား?',
  'Sign in': 'ဝင်ရန်', 'Create account': 'အကောင့်ဖွင့်ရန်', 'Your workspace is protected with secure authentication.': 'သင့်လုပ်ငန်းခွင်ကို လုံခြုံသော အတည်ပြုစနစ်ဖြင့် ကာကွယ်ထားပါသည်။',
  'Dashboard': 'ပင်မစာမျက်နှာ', 'Sales': 'အရောင်း', 'Inventory': 'စတော့', 'Profile': 'ကိုယ်ရေးအချက်အလက်',
  'Create product': 'ကုန်ပစ္စည်းဖန်တီးရန်', 'Create invoice': 'ဘောင်ချာဖန်တီးရန်', 'Save changes': 'ပြောင်းလဲမှုများ သိမ်းရန်',
  'Cancel': 'မလုပ်တော့ပါ', 'Delete': 'ဖျက်ရန်', 'Edit': 'ပြင်ရန်', 'Add product': 'ကုန်ပစ္စည်းထည့်ရန်',
  'Search products...': 'ကုန်ပစ္စည်းများ ရှာရန်...', 'Search invoices or customers...': 'ဘောင်ချာ သို့မဟုတ် ဝယ်ယူသူ ရှာရန်...',
  'Search invoices': 'ဘောင်ချာများ ရှာရန်', 'Sort invoices': 'ဘောင်ချာများ စီရန်', 'Status': 'အခြေအနေ', 'Date': 'ရက်စွဲ',
  'All': 'အားလုံး', 'All time': 'အချိန်အားလုံး', 'Today': 'ယနေ့', 'This week': 'ဤအပတ်', 'This month': 'ဤလ', 'Custom': 'စိတ်ကြိုက်', 'From': 'မှ', 'To': 'အထိ',
  'Newest first': 'အသစ်ဆုံး အရင်', 'Oldest first': 'အဟောင်းဆုံး အရင်', 'Highest amount': 'ပမာဏ အများဆုံး', 'Lowest amount': 'ပမာဏ အနည်းဆုံး',
  'Invoice ID': 'ဘောင်ချာ အမှတ်', 'Customer': 'ဝယ်ယူသူ', 'Items': 'ပစ္စည်းများ', 'Total': 'စုစုပေါင်း', 'Actions': 'လုပ်ဆောင်ချက်များ',
  'Total invoices': 'ဘောင်ချာ စုစုပေါင်း', 'Paid invoices': 'ပေးချေပြီး ဘောင်ချာများ', 'Pending / Draft': 'စောင့်ဆိုင်း / မူကြမ်း', 'Total sales amount': 'အရောင်းပမာဏ စုစုပေါင်း',
  'No invoices yet': 'ဘောင်ချာ မရှိသေးပါ', 'No matching invoices': 'ကိုက်ညီသော ဘောင်ချာ မရှိပါ', 'No phone': 'ဖုန်းနံပါတ် မရှိပါ',
  'Loading invoices': 'ဘောင်ချာများ ဖွင့်နေသည်', 'Loading products': 'ကုန်ပစ္စည်းများ ဖွင့်နေသည်', 'Loading...': 'ဖွင့်နေသည်...',
  'PAID': 'ပေးချေပြီး', 'PENDING': 'စောင့်ဆိုင်းနေသည်', 'DRAFT': 'မူကြမ်း', 'CANCELLED': 'ပယ်ဖျက်ပြီး',
  'Product name': 'ကုန်ပစ္စည်းအမည်', 'Description': 'ဖော်ပြချက်', 'Price': 'ဈေးနှုန်း', 'Quantity': 'အရေအတွက်', 'Category': 'အမျိုးအစား',
  'Customer name': 'ဝယ်ယူသူအမည်', 'Customer phone': 'ဝယ်ယူသူ ဖုန်းနံပါတ်', 'Notes': 'မှတ်ချက်များ',
  'Email address': 'အီးမေးလ်လိပ်စာ', 'Password': 'စကားဝှက်', 'Name': 'အမည်', 'Shop name': 'ဆိုင်အမည်',
  'Welcome back': 'ပြန်လည်ကြိုဆိုပါသည်', 'Sign in to your account': 'သင့်အကောင့်သို့ ဝင်ရန်', 'Create your account': 'သင့်အကောင့် ဖန်တီးရန်',
  'AI business advisor': 'AI လုပ်ငန်းအကြံပေး', 'Ask anything about your business': 'သင့်လုပ်ငန်းအကြောင်း မေးမြန်းနိုင်ပါသည်',
  'Send': 'ပို့ရန်', 'Close': 'ပိတ်ရန်', 'Back': 'နောက်သို့', 'Continue': 'ဆက်လုပ်ရန်', 'Required': 'လိုအပ်သည်',
};
const english = Object.fromEntries(Object.entries(burmese).map(([source, translated]) => [translated, source]));

function translateText(value: string, language: Language) {
  const leading = value.match(/^\s*/)?.[0] ?? '';
  const trailing = value.match(/\s*$/)?.[0] ?? '';
  const core = value.slice(leading.length, value.length - trailing.length);
  const dictionary = language === 'my' ? burmese : english;
  return `${leading}${dictionary[core] ?? core}${trailing}`;
}

type LanguageContextValue = { language: Language; toggleLanguage: () => void; translate: (value: string) => string };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem('climbio-language') === 'my' ? 'my' : 'en');

  useEffect(() => {
    localStorage.setItem('climbio-language', language);
    document.documentElement.lang = language === 'my' ? 'my' : 'en';
    document.documentElement.dataset.language = language;

    const translateElement = (element: Element) => {
      for (const attribute of ['placeholder', 'title', 'aria-label']) {
        const value = element.getAttribute(attribute);
        if (value) element.setAttribute(attribute, translateText(value, language));
      }
      element.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && node.nodeValue) node.nodeValue = translateText(node.nodeValue, language);
        else if (node.nodeType === Node.ELEMENT_NODE) translateElement(node as Element);
      });
    };
    const root = document.getElementById('root');
    if (!root) return;
    translateElement(root);
    const observer = new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.nodeValue) node.nodeValue = translateText(node.nodeValue, language);
      if (node.nodeType === Node.ELEMENT_NODE) translateElement(node as Element);
    })));
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [language]);

  const value = useMemo(() => ({
    language,
    toggleLanguage: () => setLanguage((current) => current === 'en' ? 'my' : 'en'),
    translate: (text: string) => translateText(text, language),
  }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
