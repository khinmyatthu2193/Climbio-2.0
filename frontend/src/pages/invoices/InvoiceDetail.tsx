import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Share2 } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { InvoiceTemplate } from '@/components/invoices/InvoiceTemplate';
import { StatusUpdate } from '@/components/invoices/StatusUpdate';
import { ShareInvoiceModal } from '@/components/invoices/ShareInvoiceModal';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/button';
import { invoiceService } from '@/services/invoiceService';
import { useAuthStore } from '@/store/authStore';

export function InvoiceDetail({ invoiceId }: { invoiceId: string }) {
  const user = useAuthStore((state) => state.user);
  const invoice = useQuery({ queryKey: ['invoices', invoiceId], queryFn: () => invoiceService.get(invoiceId) });
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const invoiceExportRef = useRef<HTMLDivElement>(null);

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
          <div className="flex flex-wrap gap-2"><Button type="button" onClick={() => setShareOpen(true)}><Share2 size={16} aria-hidden="true" />Share</Button><Button type="button" variant="outline" disabled={downloading} onClick={downloadPdf}><Download size={16} aria-hidden="true" />{downloading ? 'Preparing...' : 'Download PDF'}</Button></div>
        </div>

        <div className="mt-6"><StatusUpdate invoiceId={invoiceId} currentStatus={invoice.data.status} orderType={invoice.data.orderType} /></div>

        <div className="mt-5"><InvoiceTemplate ref={invoiceExportRef} invoice={invoice.data} publicUrl={`${window.location.origin}/invoice/${invoice.data.id}`} shop={{ name: user?.shopName || 'Climbio', logo: user?.shopLogo, phone: user?.phone, address: user?.shopAddress, currency: user?.setting?.currency ?? 'MMK', footerText: user?.setting?.invoiceFooter, themeColor: user?.setting?.invoiceThemeColor, watermarkType: user?.setting?.watermarkType, watermarkImageUrl: user?.setting?.watermarkImageUrl, watermarkEmoji: user?.setting?.watermarkEmoji, watermarkOpacity: user?.setting?.watermarkOpacity, watermarkPosition: user?.setting?.watermarkPosition, watermarkSize: user?.setting?.watermarkSize, watermarkRotation: user?.setting?.watermarkRotation }} /></div>
        {downloadError && <Alert className="mt-3" tone="error">PDF could not be generated. Check the shop logo URL and try again.</Alert>}
      </div>
      <ShareInvoiceModal open={shareOpen} onClose={() => setShareOpen(false)} invoice={invoice.data} invoiceRef={invoiceExportRef} />
    </main>
  );
}
