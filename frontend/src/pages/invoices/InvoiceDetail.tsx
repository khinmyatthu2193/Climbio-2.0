import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { InvoiceSummary } from '@/components/invoices/InvoiceSummary';
import { StatusUpdate } from '@/components/invoices/StatusUpdate';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/button';
import { invoiceService } from '@/services/invoiceService';
import { useAuthStore } from '@/store/authStore';

export function InvoiceDetail({ invoiceId }: { invoiceId: string }) {
  const user = useAuthStore((state) => state.user);
  const currency = user?.setting?.currency ?? 'MMK';
  const money = new Intl.NumberFormat(undefined, { style: 'currency', currency });
  const invoice = useQuery({ queryKey: ['invoices', invoiceId], queryFn: () => invoiceService.get(invoiceId) });
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

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
          <div><p className="text-sm font-semibold text-violet-600 dark:text-violet-300">Invoice</p><h1 className="mt-2 break-all text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">{invoice.data.invoiceNumber}</h1><p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Created {new Date(invoice.data.createdAt).toLocaleString()}</p></div>
          <Button type="button" variant="outline" disabled={downloading} onClick={downloadPdf}><Download size={16} aria-hidden="true" />{downloading ? 'Preparing...' : 'Download PDF'}</Button>
        </div>

        <div className="mt-6"><StatusUpdate invoiceId={invoiceId} currentStatus={invoice.data.status} orderType={invoice.data.orderType} /></div>

        <Card className="mt-4 p-4 sm:p-5"><h2 className="text-sm font-semibold uppercase text-slate-500 dark:text-slate-400">Customer</h2><p className="mt-3 font-semibold text-slate-900 dark:text-slate-100">{invoice.data.customerName}</p><p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{invoice.data.customerPhone || 'No phone number'}</p></Card>

        <Card className="mt-4 overflow-hidden p-0"><div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400"><tr><th className="px-5 py-4">Product</th><th className="px-5 py-4">Price</th><th className="px-5 py-4">Quantity</th><th className="px-5 py-4 text-right">Total</th></tr></thead><tbody className="divide-y divide-slate-200 dark:divide-slate-800">{invoice.data.items?.map((item, index) => <tr className={index % 2 ? 'bg-slate-50/70 dark:bg-slate-800/20' : undefined} key={item.id}><td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">{item.productName}</td><td className="px-5 py-4 text-slate-600 dark:text-slate-300">{money.format(Number(item.price))}</td><td className="px-5 py-4 text-slate-600 dark:text-slate-300">{item.quantity}</td><td className="px-5 py-4 text-right font-semibold text-slate-950 dark:text-white">{money.format(Number(item.price) * item.quantity)}</td></tr>)}</tbody></table></div></Card>

        <div className="mt-4 ml-auto w-full max-w-md"><InvoiceSummary subtotal={Number(invoice.data.subtotal)} discount={Number(invoice.data.discount)} total={Number(invoice.data.total)} money={money} discountPercentage={Number(invoice.data.subtotal) > 0 ? Number(invoice.data.discount) / Number(invoice.data.subtotal) * 100 : 0} /></div>
        {downloadError && <Alert className="mt-3" tone="error">PDF could not be generated. Check the shop logo URL and try again.</Alert>}
      </div>
    </main>
  );
}
