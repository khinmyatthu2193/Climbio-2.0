import type { InvoiceStatus } from '@/types/invoice';
import { cn } from '@/utils/cn';

const styles: Record<InvoiceStatus, string> = {
  DRAFT: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-700/70 dark:text-slate-200',
  SENT: 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-300',
  PAID: 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300',
  OVERDUE: 'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300',
  CANCELLED: 'border-red-200 bg-red-100 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300',
};

const dots: Record<InvoiceStatus, string> = {
  DRAFT: 'bg-slate-400',
  SENT: 'bg-blue-400',
  PAID: 'bg-emerald-400',
  OVERDUE: 'bg-amber-400',
  CANCELLED: 'bg-red-400',
};

export function StatusBadge({ status, className }: { status: InvoiceStatus; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold', styles[status], className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', dots[status])} aria-hidden="true" />
      <span className="translate-y-px leading-none">{status}</span>
    </span>
  );
}
