import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';
import { Card } from '@/components/common/Card';
import { LoadingState } from '@/components/common/LoadingState';
import { PageHeader } from '@/components/common/PageHeader';
import { Alert } from '@/components/ui/Alert';

type AuditItem = { id: string; action: string; previousStatus: string | null; nextStatus: string | null; feedback: string | null; createdAt: string; shop: { shopName: string; email: string }; admin: { name: string } | null };
export function AdminAuditLogsPage() {
  const logs = useQuery({ queryKey: ['admin-audit-logs'], queryFn: () => adminService.auditLogs({}) as Promise<{ items: AuditItem[] }> });
  return <main className="page-container"><PageHeader eyebrow="Administration" title="Audit logs" description="Immutable history of application reviews and status changes." />{logs.isLoading ? <LoadingState label="Loading audit logs" /> : logs.isError || !logs.data ? <Alert className="mt-6" tone="error">Could not load audit logs.</Alert> : <Card className="mt-6 overflow-x-auto p-0"><table className="w-full min-w-[760px] text-left"><thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800"><tr><th className="px-5 py-4">Action</th><th className="px-5 py-4">Shop</th><th className="px-5 py-4">Admin</th><th className="px-5 py-4">Time</th></tr></thead><tbody className="divide-y dark:divide-slate-800">{logs.data.items.map((item) => <tr key={item.id}><td className="px-5 py-4"><p className="font-semibold">{item.action.replace('_', ' ')}</p>{item.feedback && <p className="max-w-sm truncate text-sm text-slate-500">{item.feedback}</p>}</td><td className="px-5 py-4">{item.shop.shopName}</td><td className="px-5 py-4">{item.admin?.name ?? 'Shop owner'}</td><td className="px-5 py-4 text-sm">{new Date(item.createdAt).toLocaleString()}</td></tr>)}</tbody></table></Card>}</main>;
}
