import type { InvoiceStatus } from '@/types/invoice';

const styles: Record<InvoiceStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  SENT: 'bg-sky-100 text-sky-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  OVERDUE: 'bg-amber-100 text-amber-800',
  CANCELLED: 'bg-red-100 text-red-700',
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${styles[status]}`}>{status}</span>;
}
