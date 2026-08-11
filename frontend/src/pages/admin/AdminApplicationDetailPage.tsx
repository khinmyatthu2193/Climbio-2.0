import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';
import type { ApplicationReviewAction } from '@/types/admin';
import { ApprovalStatusBadge } from '@/components/common/ApprovalStatusBadge';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/common/Card';
import { LoadingState } from '@/components/common/LoadingState';
import { PageHeader } from '@/components/common/PageHeader';

const applicationActions: Array<{ value: ApplicationReviewAction; label: string }> = [
  { value: 'APPROVE', label: 'Approve' },
  { value: 'REQUEST_CHANGES', label: 'Request Changes' },
  { value: 'DECLINE', label: 'Decline' },
];

export function AdminApplicationDetailPage({ shopId }: { shopId: string }) {
  const queryClient = useQueryClient();
  const detail = useQuery({ queryKey: ['admin-application', shopId], queryFn: () => adminService.application(shopId) });
  const [action, setAction] = useState<ApplicationReviewAction>('APPROVE');
  const [feedback, setFeedback] = useState('');
  const review = useMutation({ mutationFn: () => adminService.action(shopId, { action, feedback: feedback || undefined }), onSuccess: async () => { setFeedback(''); await Promise.all([queryClient.invalidateQueries({ queryKey: ['admin-application', shopId] }), queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] }), queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })]); } });
  if (detail.isLoading) return <main className="page-container"><LoadingState label="Loading application" /></main>;
  if (!detail.data) return <main className="page-container"><Alert tone="error">Application could not be found.</Alert></main>;
  const shop = detail.data;
  const reviewable = shop.approvalStatus === 'PENDING' || shop.approvalStatus === 'CHANGES_REQUESTED';
  const requiresFeedback = action === 'REQUEST_CHANGES' || action === 'DECLINE';

  return <main className="page-container max-w-5xl"><PageHeader eyebrow="Administration" title={shop.shopName} description={`Application submitted ${new Date(shop.submittedAt).toLocaleString()}`} actions={<ApprovalStatusBadge status={shop.approvalStatus} />} />
    <div className={`mt-6 grid gap-6 ${reviewable ? 'lg:grid-cols-[1.2fr_.8fr]' : ''}`}><div className="space-y-6"><Card><h2 className="font-bold">Shop & owner information</h2><dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-slate-500">Owner</dt><dd className="font-semibold">{shop.name}</dd></div><div><dt className="text-slate-500">Owner role</dt><dd className="font-semibold">{shop.ownerRole ?? 'Not provided'}</dd></div><div><dt className="text-slate-500">Account email</dt><dd className="font-semibold">{shop.email}</dd></div><div><dt className="text-slate-500">Business email</dt><dd className="font-semibold">{shop.businessEmail ?? 'Not provided'}</dd></div><div><dt className="text-slate-500">Business phone</dt><dd className="font-semibold">{shop.businessPhone ?? 'Not provided'}</dd></div><div><dt className="text-slate-500">Category</dt><dd className="font-semibold">{shop.businessCategory ?? 'Not provided'}</dd></div><div><dt className="text-slate-500">Address</dt><dd className="font-semibold">{shop.shopAddress ?? 'Not provided'}, {shop.cityTownship ?? ''}</dd></div><div><dt className="text-slate-500">Registration number</dt><dd className="font-semibold">{shop.businessRegistrationNumber ?? 'Not provided'}</dd></div><div className="sm:col-span-2"><dt className="text-slate-500">Description</dt><dd className="font-semibold">{shop.businessDescription ?? 'Not provided'}</dd></div><div><dt className="text-slate-500">Facebook / website</dt><dd className="font-semibold">{shop.websiteUrl ? <a className="text-violet-600 hover:underline" href={shop.websiteUrl} target="_blank" rel="noreferrer">Open link</a> : 'Not provided'}</dd></div><div><dt className="text-slate-500">Verification document</dt><dd className="font-semibold">{shop.verificationDocument ? <a className="text-violet-600 hover:underline" href={shop.verificationDocument} target="_blank" rel="noreferrer">View document</a> : 'Not provided'}</dd></div></dl></Card>
      <Card><h2 className="font-bold">Review history</h2><div className="mt-4 space-y-4">{shop.reviewsReceived.length ? shop.reviewsReceived.map((reviewItem) => <div className="border-l-2 border-violet-300 pl-4" key={reviewItem.id}><p className="text-sm font-semibold">{reviewItem.action.replace('_', ' ')} <span className="font-normal text-slate-500">by {reviewItem.admin?.name ?? 'Shop owner'}</span></p><p className="mt-1 text-xs text-slate-500">{new Date(reviewItem.createdAt).toLocaleString()}</p>{reviewItem.feedback && <p className="mt-2 text-sm">{reviewItem.feedback}</p>}</div>) : <p className="text-sm text-slate-500">No review activity yet.</p>}</div></Card></div>
      {reviewable && <Card className="h-fit"><h2 className="font-bold">Application review</h2><label className="mt-4 block text-sm font-medium">Action<select className="control mt-1.5" value={action} onChange={(event) => setAction(event.target.value as ApplicationReviewAction)}>{applicationActions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label><label className="mt-4 block text-sm font-medium">Feedback {requiresFeedback && <span className="text-red-600">required</span>}<textarea className="control mt-1.5 min-h-28 resize-y" value={feedback} onChange={(event) => setFeedback(event.target.value)} maxLength={5000} /></label><Button className="mt-5 w-full" disabled={review.isPending || (requiresFeedback && !feedback.trim())} onClick={() => review.mutate()}>{review.isPending ? 'Saving…' : 'Apply action'}</Button>{review.isError && <Alert className="mt-4" tone="error">The action could not be completed. Check the current status and try again.</Alert>}</Card>}
    </div>
  </main>;
}
