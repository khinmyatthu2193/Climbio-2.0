import type { InvoiceStatus } from '@/types/invoice';

const styles: Record<InvoiceStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  SENT: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  PAID: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  OVERDUE: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${styles[status]}`}>{status}</span>;
}
