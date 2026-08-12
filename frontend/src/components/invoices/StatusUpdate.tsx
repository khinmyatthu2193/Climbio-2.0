import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { DynamicStatusStepper } from './DynamicStatusStepper';
import { StatusBadge } from './StatusBadge';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/button';
import { invoiceService } from '@/services/invoiceService';
import type { InvoiceStatus, OrderType } from '@/types/invoice';
import { allInvoiceStatuses, canTransition, immediateNextStatus } from '@/utils/invoiceStatus';

const label = (status: InvoiceStatus) => status.replaceAll('_', ' ').toLowerCase();

export function StatusUpdate({ invoiceId, currentStatus, orderType }: { invoiceId: string; currentStatus: InvoiceStatus; orderType: OrderType }) {
  const queryClient = useQueryClient();
  const [pendingStatus, setPendingStatus] = useState<InvoiceStatus | null>(null);
  const nextStatus = immediateNextStatus(currentStatus, orderType);
  const advancedStatuses = allInvoiceStatuses.filter((status) => status !== currentStatus && status !== nextStatus);
  const allowedAdvancedStatuses = advancedStatuses.filter((status) => canTransition(currentStatus, status, orderType));
  const isComplete = currentStatus === 'PAID';
  const isCancelled = currentStatus === 'CANCELLED';
  const update = useMutation({
    mutationFn: (status: InvoiceStatus) => invoiceService.updateStatus(invoiceId, status),
    onSuccess: async () => { setPendingStatus(null); await Promise.all([queryClient.invalidateQueries({ queryKey: ['invoices'] }), queryClient.invalidateQueries({ queryKey: ['dashboard'] })]); },
  });
  const error = axios.isAxiosError<{ error?: string }>(update.error) ? update.error.response?.data?.error : undefined;

  return <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6" aria-labelledby="invoice-status-heading"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 id="invoice-status-heading" className="font-bold text-slate-950 dark:text-white">Order progress</h2><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{orderType.toLowerCase()} order</p></div><StatusBadge status={currentStatus} /></div><div className="mt-6"><DynamicStatusStepper currentStatus={currentStatus} orderType={orderType} /></div>{isComplete || isCancelled ? <div className={`mt-6 rounded-2xl border p-4 text-sm font-semibold ${isComplete ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300' : 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300'}`}>{isComplete ? 'Order completed. Payment has been received and no further action is required.' : 'This order has been cancelled. No further action is available.'}</div> : <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200 pt-5 dark:border-slate-700">{nextStatus && canTransition(currentStatus, nextStatus, orderType) && <Button type="button" disabled={update.isPending} onClick={() => setPendingStatus(nextStatus)}><ArrowRight size={16} />Mark as {label(nextStatus)}</Button>}{allowedAdvancedStatuses.length > 0 && <details className="group relative"><summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">Advanced <ChevronDown size={15} /></summary><div className="absolute left-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-800">{allowedAdvancedStatuses.map((status) => <button key={status} type="button" disabled={update.isPending} onClick={() => setPendingStatus(status)} className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium capitalize text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700">{label(status)}</button>)}</div></details>}</div>}{update.isError && <Alert className="mt-4" tone="error">{error ?? 'Status could not be updated.'}</Alert>}{pendingStatus && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900" role="alertdialog" aria-modal="true"><div className="flex items-center gap-2"><StatusBadge status={currentStatus} /><ArrowRight size={16} className="text-slate-400" /><StatusBadge status={pendingStatus} /></div><h3 className="mt-5 text-lg font-bold">Confirm status update</h3><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Are you sure you want to change status from <strong>{label(currentStatus)}</strong> to <strong>{label(pendingStatus)}</strong>?</p><div className="mt-6 flex justify-end gap-3"><Button type="button" variant="outline" disabled={update.isPending} onClick={() => setPendingStatus(null)}>Go back</Button><Button type="button" variant={pendingStatus === 'CANCELLED' ? 'danger' : 'primary'} disabled={update.isPending} onClick={() => update.mutate(pendingStatus)}>{update.isPending ? 'Updating…' : 'Confirm'}</Button></div></div></div>}</section>;
}
