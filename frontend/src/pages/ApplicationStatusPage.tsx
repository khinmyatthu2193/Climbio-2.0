import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/button';
import { ApprovalStatusBadge } from '@/components/common/ApprovalStatusBadge';
import { Card } from '@/components/common/Card';
import { LoadingState } from '@/components/common/LoadingState';
import { PageHeader } from '@/components/common/PageHeader';
import { shopApplicationService } from '@/services/shopApplicationService';
import { useAuthStore } from '@/store/authStore';

export function ApplicationStatusPage() {
  const queryClient = useQueryClient();
  const application = useQuery({ queryKey: ['shop-application'], queryFn: shopApplicationService.get });
  const [form, setForm] = useState({ name: '', shopName: '', phone: '', shopAddress: '' });
  const setUser = useAuthStore((state) => state.setUser);
  useEffect(() => { if (application.data) setForm({ name: application.data.name, shopName: application.data.shopName, phone: application.data.phone ?? '', shopAddress: application.data.shopAddress ?? '' }); }, [application.data]);
  const update = useMutation({ mutationFn: shopApplicationService.update, onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['shop-application'] }) });
  const resubmit = useMutation({ mutationFn: shopApplicationService.resubmit, onSuccess: async (data) => { setUser({ ...useAuthStore.getState().user!, approvalStatus: data.approvalStatus, submittedAt: data.submittedAt }); await queryClient.invalidateQueries({ queryKey: ['shop-application'] }); } });
  if (application.isLoading) return <main className="page-container"><Card className="mt-8 p-0"><LoadingState label="Loading application" /></Card></main>;
  if (!application.data) return <main className="page-container"><Alert className="mt-8" tone="error">Could not load your application.</Alert></main>;
  const editable = application.data.approvalStatus === 'CHANGES_REQUESTED';
  const feedback = application.data.reviewsReceived.filter((review) => review.feedback);
  return <main className="page-container max-w-4xl"><PageHeader eyebrow="Shop application" title="Application status" description="You can sign in while your application is reviewed. Business tools become available after approval." actions={<ApprovalStatusBadge status={application.data.approvalStatus} />} />
    {application.data.approvalStatus === 'DECLINED' && <Alert className="mt-6" tone="error">This application was declined. Please contact support if you need assistance.</Alert>}
    {application.data.approvalStatus === 'SUSPENDED' && <Alert className="mt-6" tone="error">This shop is suspended. Please contact support for further information.</Alert>}
    <Card className="mt-6"><h2 className="text-lg font-bold">Application details</h2><p className="mt-1 text-sm text-slate-500">Submitted {new Date(application.data.submittedAt).toLocaleString()}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2"><label><span className="mb-1 block text-sm font-medium">Owner name</span><input className="control" disabled={!editable} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label><span className="mb-1 block text-sm font-medium">Shop name</span><input className="control" disabled={!editable} value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} /></label><label><span className="mb-1 block text-sm font-medium">Phone</span><input className="control" disabled={!editable} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label><label><span className="mb-1 block text-sm font-medium">Address</span><input className="control" disabled={!editable} value={form.shopAddress} onChange={(e) => setForm({ ...form, shopAddress: e.target.value })} /></label></div>
      {editable && <div className="mt-5 flex flex-wrap gap-3"><Button variant="outline" disabled={update.isPending} onClick={() => update.mutate({ ...form, phone: form.phone || null, shopAddress: form.shopAddress || null })}>{update.isPending ? 'Saving…' : 'Save changes'}</Button><Button disabled={resubmit.isPending} onClick={() => resubmit.mutate()}>{resubmit.isPending ? 'Resubmitting…' : 'Resubmit application'}</Button></div>}
      {(update.isError || resubmit.isError) && <Alert className="mt-4" tone="error">Your application could not be updated. Please try again.</Alert>}
    </Card>
    <Card className="mt-6"><h2 className="text-lg font-bold">Admin feedback & history</h2>{feedback.length ? <div className="mt-4 space-y-4">{application.data.reviewsReceived.map((review) => <div className="border-l-2 border-violet-300 pl-4" key={review.id}><div className="flex flex-wrap items-center gap-2"><ApprovalStatusBadge status={(review.nextStatus ?? application.data.approvalStatus)} /><span className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleString()}</span></div>{review.feedback && <p className="mt-2 text-sm leading-6">{review.feedback}</p>}</div>)}</div> : <p className="mt-3 text-sm text-slate-500">No feedback has been recorded yet.</p>}</Card>
  </main>;
}
