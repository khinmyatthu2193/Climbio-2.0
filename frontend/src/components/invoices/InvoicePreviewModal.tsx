import { PDFViewer } from '@react-pdf/renderer';
import { X } from 'lucide-react';
import { InvoicePdfDocument } from './InvoicePdfDocument';
import type { User } from '@/types/auth';
import type { Invoice } from '@/types/invoice';

const sampleInvoice: Invoice = {
  id: 'preview', userId: 'preview', invoiceNumber: 'INV-PREVIEW', customerName: 'John Smith / မောင်အောင်',
  customerPhone: '+95 9 123 456 789', customerEmail: 'customer@example.com', shippingAddress: 'Mandalay',
  deliveryFee: '2000', notes: 'Invoice preview', subtotal: '50000', discount: '2000', total: '50000',
  status: 'PENDING', orderType: 'DELIVERY', createdAt: new Date().toISOString(),
  items: [{ id: 'preview-item', invoiceId: 'preview', productId: null, productName: 'Sample Product / နမူနာပစ္စည်း', quantity: 2, price: '25000' }],
};

export function InvoicePreviewModal({ user, onClose }: { user: User; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 bg-slate-950/75 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-labelledby="invoice-preview-title">
    <div className="mx-auto flex h-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700"><div><h2 id="invoice-preview-title" className="font-bold">Invoice preview</h2><p className="text-xs text-slate-500">This uses the same renderer as the downloaded PDF.</p></div><button type="button" className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={onClose} aria-label="Close invoice preview"><X size={18} /></button></header>
      <PDFViewer className="min-h-0 flex-1 border-0" showToolbar>{<InvoicePdfDocument invoice={sampleInvoice} shop={user} />}</PDFViewer>
    </div>
  </div>;
}
