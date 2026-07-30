import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { StatusBadge } from '@/components/invoices/StatusBadge';
import { Button } from '@/components/ui/button';
import { invoiceService } from '@/services/invoiceService';
import { useAuthStore } from '@/store/authStore';
import type { InvoiceStatus } from '@/types/invoice';

const statuses: InvoiceStatus[] = ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'];

export function InvoiceDetail({ invoiceId }: { invoiceId: string }) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const currency = user?.setting?.currency ?? 'MMK';
  const money = new Intl.NumberFormat(undefined, { style: 'currency', currency });
  const invoice = useQuery({ queryKey: ['invoices', invoiceId], queryFn: () => invoiceService.get(invoiceId) });
  const [status, setStatus] = useState<InvoiceStatus | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const updateStatus = useMutation({
    mutationFn: (nextStatus: InvoiceStatus) => invoiceService.updateStatus(invoiceId, nextStatus),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['invoices'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
    },
  });
  const selectedStatus = status ?? invoice.data?.status ?? 'DRAFT';

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

  if (invoice.isLoading) return <main className="grid min-h-screen place-items-center"><p>Loading invoice…</p></main>;
  if (invoice.isError || !invoice.data) return <main className="grid min-h-screen place-items-center text-red-600"><p>Invoice could not be loaded.</p></main>;

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <a className="text-sm font-semibold text-primary hover:underline" href="/invoices">← Invoices</a>
            <div className="mt-2 flex items-center gap-3">
              <h1 className="text-3xl font-bold">{invoice.data.invoiceNumber}</h1>
              <StatusBadge status={invoice.data.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">{new Date(invoice.data.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" className="flex items-center gap-2 bg-slate-700" disabled={downloading} onClick={downloadPdf}>
              <Download size={16} aria-hidden="true" />
              {downloading ? 'Preparing…' : 'Download PDF'}
            </Button>
            <select className="rounded-lg border bg-white px-3 py-2" value={selectedStatus} onChange={(event) => setStatus(event.target.value as InvoiceStatus)}>
              {statuses.map((option) => <option key={option}>{option}</option>)}
            </select>
            <Button disabled={updateStatus.isPending || selectedStatus === invoice.data.status} onClick={() => updateStatus.mutate(selectedStatus)}>
              Update status
            </Button>
          </div>
        </div>

        <Card className="mt-8">
          <h2 className="text-lg font-bold">Customer</h2>
          <p className="mt-3 font-semibold">{invoice.data.customerName}</p>
          <p className="text-sm text-slate-500">{invoice.data.customerPhone || 'No phone number'}</p>
        </Card>

        <Card className="mt-6 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
              <thead className="border-b bg-emerald-50/60 text-xs uppercase text-slate-500">
                <tr><th className="px-5 py-4">Product</th><th className="px-5 py-4">Price</th><th className="px-5 py-4">Quantity</th><th className="px-5 py-4 text-right">Total</th></tr>
              </thead>
              <tbody className="divide-y">
                {invoice.data.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-4 font-medium">{item.productName}</td>
                    <td className="px-5 py-4">{money.format(Number(item.price))}</td>
                    <td className="px-5 py-4">{item.quantity}</td>
                    <td className="px-5 py-4 text-right font-semibold">{money.format(Number(item.price) * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="mt-6 ml-auto max-w-sm">
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{money.format(Number(invoice.data.subtotal))}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Discount</span><span>− {money.format(Number(invoice.data.discount))}</span></div>
            <div className="flex justify-between border-t pt-3 text-lg font-bold"><span>Total</span><span>{money.format(Number(invoice.data.total))}</span></div>
          </div>
        </Card>
        {updateStatus.isError && <p className="mt-3 text-right text-sm text-red-600">Status could not be updated.</p>}
        {downloadError && <p className="mt-3 text-right text-sm text-red-600">PDF could not be generated. Check the shop logo URL and try again.</p>}
      </div>
    </main>
  );
}
