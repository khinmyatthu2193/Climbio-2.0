import { Languages } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { LandingButtonLabel } from '@/components/landing/LandingButtonLabel';
import { iconTextOpticalFrameClass } from '@/components/ui/IconLabel';

export function LanguageToggle() {
  const { language, toggleLanguage, translate } = useLanguage();
  const switchingToBurmese = language === 'en';
  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border border-violet-200/70 bg-white/80 px-3 text-sm font-bold text-slate-700 shadow-sm backdrop-blur transition hover:border-violet-300 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-violet-500 dark:hover:text-violet-300"
      aria-label={translate(switchingToBurmese ? 'Switch to Burmese' : 'Switch to English')}
      title={translate(switchingToBurmese ? 'Switch to Burmese' : 'Switch to English')}
    >
      <span className={iconTextOpticalFrameClass} aria-hidden="true"><Languages className="block size-4" /></span>
      <LandingButtonLabel>{switchingToBurmese ? 'မြန်မာ' : 'EN'}</LandingButtonLabel>
    </button>
  );
}
