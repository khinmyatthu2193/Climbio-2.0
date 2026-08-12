import { Banknote, Box, CheckCircle2, CircleDashed, Clock3, XCircle, type LucideIcon } from 'lucide-react';
import type { InvoiceStatus } from '@/types/invoice';
import { cn } from '@/utils/cn';
import { useLanguage } from '@/hooks/useLanguage';

const statusDesign: Record<InvoiceStatus, { icon: LucideIcon; label: string; className: string }> = {
  PENDING: { icon: Clock3, label: 'Pending', className: 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-500/30 dark:bg-yellow-500/15 dark:text-yellow-300' },
  PROCESSING: { icon: CircleDashed, label: 'Processing', className: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-300' },
  SHIPPED: { icon: Box, label: 'Shipped', className: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-300' },
  DELIVERED: { icon: CheckCircle2, label: 'Delivered', className: 'border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/15 dark:text-green-300' },
  READY_FOR_PICKUP: { icon: Box, label: 'Ready for pickup', className: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-300' },
  PICKED_UP: { icon: CheckCircle2, label: 'Picked up', className: 'border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/15 dark:text-green-300' },
  PAID: { icon: Banknote, label: 'Paid', className: 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/15 dark:text-emerald-200' },
  CANCELLED: { icon: XCircle, label: 'Cancelled', className: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300' },
};

export function StatusBadge({ status, className }: { status: InvoiceStatus; className?: string }) {
  const { translate } = useLanguage();
  const design = statusDesign[status];
  const Icon = design.icon;
  return <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold', design.className, className)}><Icon size={13} aria-hidden="true" /><span className="leading-4">{translate(status)}</span></span>;
}
