import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Download } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { InvoiceSummary } from '@/components/invoices/InvoiceSummary';
import { StatusBadge } from '@/components/invoices/StatusBadge';
import { StatusUpdateToast } from '@/components/invoices/StatusUpdateToast';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/button';
import { invoiceService } from '@/services/invoiceService';
import { useAuthStore } from '@/store/authStore';
import type { InvoiceStatus } from '@/types/invoice';
import { useLanguage, type Language } from '@/hooks/useLanguage';

const statuses: InvoiceStatus[] = ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'];
const statusLabels: Record<Language, Record<InvoiceStatus, string>> = {
  en: { DRAFT: 'Draft', SENT: 'Sent', PAID: 'Paid', OVERDUE: 'Overdue', CANCELLED: 'Cancelled' },
  my: { DRAFT: 'မူကြမ်း', SENT: 'ပို့ပြီး', PAID: 'ပေးချေပြီး', OVERDUE: 'ငွေပေးချေရန်ကျော်လွန်', CANCELLED: 'ပယ်ဖျက်ပြီး' },
};

interface ToastState {
  tone: 'success' | 'error';
  title: string;
  description: string;
}

export function InvoiceDetail({ invoiceId }: { invoiceId: string }) {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const currency = user?.setting?.currency ?? 'MMK';
  const money = new Intl.NumberFormat(undefined, { style: 'currency', currency });
  const invoice = useQuery({ queryKey: ['invoices', invoiceId], queryFn: () => invoiceService.get(invoiceId) });
  const [status, setStatus] = useState<InvoiceStatus | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<InvoiceStatus | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const updateStatus = useMutation({
    mutationFn: (nextStatus: InvoiceStatus) => invoiceService.updateStatus(invoiceId, nextStatus),
    onSuccess: async (_, nextStatus) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['invoices'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
      setStatus(nextStatus);
      setToast(language === 'my'
        ? { tone: 'success', title: 'ဘောက်ချာအခြေအနေ ပြောင်းပြီးပါပြီ', description: `ယခု ${statusLabels.my[nextStatus]} အဖြစ် သတ်မှတ်ထားပါသည်။` }
        : { tone: 'success', title: 'Invoice status updated', description: `Invoice is now marked as ${statusLabels.en[nextStatus]}.` });
    },
    onError: (error) => {
      const serverMessage = axios.isAxiosError<{ error?: string }>(error) ? error.response?.data?.error : undefined;
      setToast(language === 'my'
        ? { tone: 'error', title: 'အခြေအနေကို မပြောင်းနိုင်ပါ', description: serverMessage ?? 'ထပ်မံကြိုးစားပါ။' }
        : { tone: 'error', title: 'Status could not be updated', description: serverMessage ?? 'Please try again.' });
    },
  });
  const selectedStatus = status ?? invoice.data?.status ?? 'DRAFT';

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const requestStatusUpdate = () => {
    if (selectedStatus === invoice.data?.status) return;
    if (selectedStatus === 'CANCELLED' && invoice.data?.status !== 'CANCELLED') {
      setPendingStatus(selectedStatus);
      return;
    }
    updateStatus.mutate(selectedStatus);
  };

  const downloadPdf = async () => {
    if (!invoice.data || !user) return;
    setDownloading(true);
    setDownloadError(false);
    try {
      const [{ pdf }, { InvoicePdfDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/invoices/InvoicePdfDocument'),
      ]);
      const blob = await pdf(<InvoicePdfDocument invoice={invoice.data} shop={user} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoice.data.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError(true);
    } finally {
      setDownloading(false);
    }
  };

  if (invoice.isLoading) return <main className="page-container"><Card className="animate-pulse text-slate-500">Loading invoice...</Card></main>;
  if (invoice.isError || !invoice.data) return <main className="page-container"><Alert tone="error">Invoice could not be loaded.</Alert></main>;

  return (
    <main className="page-container">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-violet-600 dark:text-violet-300">Invoice</p>
            <h1 className="mt-2 break-all text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">{invoice.data.invoiceNumber}</h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Created {new Date(invoice.data.createdAt).toLocaleString()}</p>
          </div>
          <div className="grid gap-2 sm:flex sm:items-end">
            <label className="min-w-40">
              <span className="mb-1.5 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                Status <StatusBadge status={invoice.data.status} />
              </span>
              <select className="control min-w-40" value={selectedStatus} onChange={(event) => setStatus(event.target.value as InvoiceStatus)}>
                {statuses.map((option) => <option key={option} value={option}>{statusLabels[language][option]}</option>)}
              </select>
            </label>
            <Button disabled={updateStatus.isPending || selectedStatus === invoice.data.status} onClick={requestStatusUpdate}>
              {updateStatus.isPending ? 'Updating...' : 'Update status'}
            </Button>
            <Button type="button" variant="outline" disabled={downloading} onClick={downloadPdf}>
              <Download size={16} aria-hidden="true" />
              {downloading ? 'Preparing...' : 'Download PDF'}
            </Button>
          </div>
        </div>

        <Card className="mt-6 p-4 sm:p-5">
          <h2 className="text-sm font-semibold uppercase text-slate-500 dark:text-slate-400">Customer</h2>
          <p className="mt-3 font-semibold text-slate-900 dark:text-slate-100">{invoice.data.customerName}</p>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{invoice.data.customerPhone || 'No phone number'}</p>
        </Card>

        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                <tr><th className="px-5 py-4">Product</th><th className="px-5 py-4">Price</th><th className="px-5 py-4">Quantity</th><th className="px-5 py-4 text-right">Total</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {invoice.data.items?.map((item, index) => (
                  <tr className={index % 2 ? 'bg-slate-50/70 dark:bg-slate-800/20' : undefined} key={item.id}>
                    <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">{item.productName}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{money.format(Number(item.price))}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{item.quantity}</td>
                    <td className="px-5 py-4 text-right font-semibold text-slate-950 dark:text-white">{money.format(Number(item.price) * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="mt-4 ml-auto w-full max-w-md">
          <InvoiceSummary
            subtotal={Number(invoice.data.subtotal)}
            discount={Number(invoice.data.discount)}
            total={Number(invoice.data.total)}
            money={money}
            discountPercentage={Number(invoice.data.subtotal) > 0 ? Number(invoice.data.discount) / Number(invoice.data.subtotal) * 100 : 0}
          />
        </div>
        {downloadError && <Alert className="mt-3" tone="error">PDF could not be generated. Check the shop logo URL and try again.</Alert>}
      </div>

      {toast && <StatusUpdateToast {...toast} />}
      {pendingStatus && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900" role="alertdialog" aria-modal="true" aria-labelledby="status-dialog-title" aria-describedby="status-dialog-description">
            <h2 id="status-dialog-title" className="text-lg font-semibold text-slate-950 dark:text-white">Change invoice status?</h2>
            <p id="status-dialog-description" className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Are you sure you want to change this invoice status?</p>
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setPendingStatus(null)}>Cancel</Button>
              <Button type="button" className="bg-red-600 hover:bg-red-500" onClick={() => { updateStatus.mutate(pendingStatus); setPendingStatus(null); }}>Confirm</Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
