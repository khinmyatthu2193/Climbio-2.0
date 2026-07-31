import type { HTMLAttributes, ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/utils/cn';

type AlertTone = 'info' | 'success' | 'error';

const tones = {
  info: { style: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-200', icon: Info },
  success: { style: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200', icon: CheckCircle2 },
  error: { style: 'border-red-200 bg-red-50 text-red-900 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-200', icon: AlertCircle },
};

export function Alert({ tone = 'info', children, className, ...props }: HTMLAttributes<HTMLDivElement> & { tone?: AlertTone; children: ReactNode }) {
  const Icon = tones[tone].icon;
  return (
    <div className={cn('flex gap-3 rounded-xl border p-4 text-sm', tones[tone].style, className)} role={tone === 'error' ? 'alert' : 'status'} {...props}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
