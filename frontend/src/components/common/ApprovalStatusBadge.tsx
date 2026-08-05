import { Badge } from '@/components/ui/Badge';
import type { ShopApprovalStatus } from '@/types/auth';

const styles: Record<ShopApprovalStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  CHANGES_REQUESTED: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300',
  DECLINED: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300',
  SUSPENDED: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
};

export function ApprovalStatusBadge({ status }: { status: ShopApprovalStatus }) {
  return <Badge className={styles[status]}>{status.replace('_', ' ')}</Badge>;
}
