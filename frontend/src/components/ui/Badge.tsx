import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export function Badge({ className, children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold leading-4 text-slate-700 dark:bg-slate-800 dark:text-slate-200', className)} {...props}>{children}</span>;
}
