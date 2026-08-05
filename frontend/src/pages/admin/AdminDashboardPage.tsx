import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';
import { Card } from '@/components/common/Card';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { Alert } from '@/components/ui/Alert';
import { ApprovalStatusBadge } from '@/components/common/ApprovalStatusBadge';

export function AdminDashboardPage() {
  const dashboard = useQuery({ queryKey: ['admin-dashboard'], queryFn: adminService.dashboard });
  if (dashboard.isLoading) return <main className="page-container"><LoadingState label="Loading administration dashboard" /></main>;
  if (!dashboard.data) return <main className="page-container"><Alert tone="error">Could not load the administration dashboard.</Alert></main>;
  const cards = [{ label: 'Pending applications', value: dashboard.data.counts.pending }, { label: 'Approved shops', value: dashboard.data.counts.approved }, { label: 'Changes requested', value: dashboard.data.counts.changesRequested }, { label: 'Declined applications', value: dashboard.data.counts.declined }, { label: 'Suspended shops', value: dashboard.data.counts.suspended }];
  return <main className="page-container"><PageHeader eyebrow="Administration" title="Dashboard" description="Review shop applications and platform activity." /><section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{cards.map((card) => <Card key={card.label}><p className="text-sm text-slate-500">{card.label}</p><p className="mt-2 text-3xl font-black">{card.value}</p></Card>)}</section>
    <section className="mt-6 grid gap-6 xl:grid-cols-2"><Card><div className="flex items-center justify-between"><h2 className="font-bold">Recent applications</h2><a className="text-sm font-semibold text-violet-600" href="/admin/applications">View all</a></div><div className="mt-4 divide-y dark:divide-slate-800">{dashboard.data.recentApplications.map((shop) => <a className="flex items-center justify-between gap-3 py-3 hover:text-violet-600" href={`/admin/applications/${shop.id}`} key={shop.id}><span><span className="block font-semibold">{shop.shopName}</span><span className="text-sm text-slate-500">{shop.email}</span></span><ApprovalStatusBadge status={shop.approvalStatus} /></a>)}</div></Card>
      <Card><h2 className="font-bold">Recent admin activity</h2><div className="mt-4 divide-y dark:divide-slate-800">{dashboard.data.recentActivity.map((activity) => <div className="py-3" key={activity.id}><p className="text-sm font-semibold">{activity.action.replace('_', ' ')} · {activity.shop.shopName}</p><p className="mt-1 text-xs text-slate-500">{activity.admin?.name ?? 'System'} · {new Date(activity.createdAt).toLocaleString()}</p></div>)}</div></Card></section>
  </main>;
}
