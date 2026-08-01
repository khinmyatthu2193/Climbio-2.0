import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatusUpdateToastProps {
  tone: 'success' | 'error';
  title: string;
  description: string;
}

export function StatusUpdateToast({ tone, title, description }: StatusUpdateToastProps) {
  const isSuccess = tone === 'success';

  return (
    <div
      className={cn(
        'fixed right-4 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm gap-3 rounded-lg border bg-white p-4 shadow-2xl dark:bg-slate-900',
        isSuccess ? 'border-emerald-200 dark:border-emerald-500/30' : 'border-red-200 dark:border-red-500/30',
      )}
      role="status"
      aria-live="polite"
    >
      {isSuccess ? <CheckCircle2 className="mt-0.5 text-emerald-500" size={18} /> : <XCircle className="mt-0.5 text-red-500" size={18} />}
      <div>
        <p className="text-sm font-bold text-slate-950 dark:text-white">{title}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
  );
}
