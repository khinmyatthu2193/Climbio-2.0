import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const { translate } = useLanguage();
  useEffect(() => {
    const update = () => setVisible(window.scrollY > 420);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  if (!visible) return null;
  return <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-5 right-5 z-40 grid size-12 place-items-center rounded-full border border-violet-400/30 bg-violet-600 text-white shadow-[0_12px_30px_rgba(109,40,217,0.3)] transition hover:-translate-y-0.5 hover:bg-violet-700 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 sm:bottom-7 sm:right-7" aria-label={translate('Back to top')} title={translate('Back to top')}><ArrowUp className="size-5" /></button>;
}
