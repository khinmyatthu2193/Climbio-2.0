import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';
import type { ShopApprovalStatus } from '@/types/auth';
import { ApprovalStatusBadge } from '@/components/common/ApprovalStatusBadge';
import { Card } from '@/components/common/Card';
import { LoadingState } from '@/components/common/LoadingState';
import { PageHeader } from '@/components/common/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/button';

export function AdminApplicationsPage({ mode = 'applications' }: { mode?: 'applications' | 'shops' }) {
  const [search, setSearch] = useState(''); const [status, setStatus] = useState<ShopApprovalStatus | undefined>(); const [sort, setSort] = useState<'submittedAt' | 'shopName'>('submittedAt'); const [page, setPage] = useState(1);
  const request = { page, pageSize: 20, search, status, sort };
  const applications = useQuery({ queryKey: ['admin', mode, request], queryFn: () => mode === 'shops' ? adminService.shops(request) : adminService.applications(request) });
  const title = mode === 'shops' ? 'Shops' : 'Applications';
  return <main className="page-container"><PageHeader eyebrow="Administration" title={title} description={mode === 'shops' ? 'Browse shop accounts and their current approval state.' : 'Review new and resubmitted shop applications.'} />
    <Card className="mt-6"><div className="grid gap-3 sm:grid-cols-[1fr_12rem_12rem]"><input className="control" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search shop, owner, or email" /><select className="control" value={status ?? ''} onChange={(e) => { setStatus(e.target.value as ShopApprovalStatus || undefined); setPage(1); }}><option value="">All statuses</option>{(['PENDING', 'APPROVED', 'CHANGES_REQUESTED', 'DECLINED', 'SUSPENDED'] as const).map((value) => <option key={value} value={value}>{value.replace('_', ' ')}</option>)}</select><select className="control" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}><option value="submittedAt">Newest submission</option><option value="shopName">Shop name</option></select></div></Card>
    {applications.isLoading ? <Card className="mt-4 p-0"><LoadingState label={`Loading ${title.toLowerCase()}`} /></Card> : applications.isError || !applications.data ? <Alert className="mt-4" tone="error">Could not load {title.toLowerCase()}.</Alert> : <Card className="mt-4 overflow-x-auto p-0"><table className="w-full min-w-[720px] text-left"><thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800"><tr><th className="px-5 py-4">Shop</th><th className="px-5 py-4">Owner</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Submitted</th><th className="px-5 py-4" /></tr></thead><tbody className="divide-y dark:divide-slate-800">{applications.data.items.map((shop) => <tr key={shop.id}><td className="px-5 py-4 font-semibold">{shop.shopName}</td><td className="px-5 py-4"><p>{shop.name}</p><p className="text-sm text-slate-500">{shop.email}</p></td><td className="px-5 py-4"><ApprovalStatusBadge status={shop.approvalStatus} /></td><td className="px-5 py-4 text-sm">{new Date(shop.submittedAt).toLocaleDateString()}</td><td className="px-5 py-4 text-right"><a className="font-semibold text-violet-600 hover:underline" href={`/admin/applications/${shop.id}`}>Review</a></td></tr>)}</tbody></table><div className="flex items-center justify-between border-t p-4 text-sm"><span>{applications.data.total} total</span><div className="flex gap-2"><Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button><Button size="sm" variant="outline" disabled={page * applications.data.pageSize >= applications.data.total} onClick={() => setPage(page + 1)}>Next</Button></div></div></Card>}
  </main>;
}
