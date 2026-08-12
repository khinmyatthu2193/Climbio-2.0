import { Languages } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export function LanguageToggle() {
  const { language, toggleLanguage, translate } = useLanguage();
  const label = language === 'en' ? 'Switch to Burmese' : 'Switch to English';
  return <button type="button" onClick={toggleLanguage} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border border-violet-200/70 bg-white/80 px-3 text-sm font-bold text-slate-700 shadow-sm backdrop-blur transition hover:border-violet-300 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-violet-500 dark:hover:text-violet-300" aria-label={translate(label)} title={translate(label)}><Languages className="size-4" /><span>{language === 'en' ? 'မြန်မာ' : 'EN'}</span></button>;
}
