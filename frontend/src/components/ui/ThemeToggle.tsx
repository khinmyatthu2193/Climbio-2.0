import { Moon, Sun } from 'lucide-react';
import type { Theme } from '@/hooks/useTheme';

export function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex size-11 items-center justify-center rounded-2xl border border-violet-200/70 bg-white/80 text-slate-600 shadow-sm backdrop-blur transition hover:border-violet-300 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:text-violet-300"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? <Sun className="size-5" aria-hidden="true" /> : <Moon className="size-5" aria-hidden="true" />}
    </button>
  );
}
