import { useQuery } from '@tanstack/react-query';
import { FilePlus2, ReceiptText } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/invoices/StatusBadge';
import { invoiceService } from '@/services/invoiceService';
import { useAuthStore } from '@/store/authStore';

export function InvoiceList() {
  const invoices = useQuery({ queryKey: ['invoices'], queryFn: invoiceService.list });
  const currency = useAuthStore((state) => state.user?.setting?.currency ?? 'MMK');
  const money = new Intl.NumberFormat(undefined, { style: 'currency', currency });

  return (
    <main className="page-container">
      <PageHeader eyebrow="Sales" title="Invoices" description="Review sales history, customer details, and payment status." actions={
        <a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-violet-700" href="/invoices/new"><FilePlus2 className="size-4" /> Create invoice</a>
      } />
      {invoices.isError && <Alert className="mt-6" tone="error">Could not load invoices. Please refresh and try again.</Alert>}
      <Card className="mt-6 overflow-hidden p-0">
        {invoices.isLoading && <LoadingState label="Loading invoices" rows={5} />}
        {invoices.data?.length === 0 && <EmptyState icon={<ReceiptText className="size-6" />} title="No invoices yet" description="Create your first invoice to record a sale and track payment." action={<a className="font-semibold text-primary hover:underline" href="/invoices/new">Create your first invoice</a>} />}
        {!!invoices.data?.length && (
          <>
            <div className="divide-y sm:hidden">
              {invoices.data.map((invoice) => (
                <a className="block p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/50" href={`/invoices/${invoice.id}`} key={invoice.id}>
                  <div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-primary">{invoice.invoiceNumber}</p><p className="mt-1 text-sm font-medium">{invoice.customerName}</p></div><StatusBadge status={invoice.status} /></div>
                  <div className="mt-4 flex items-end justify-between"><div className="text-xs text-slate-500 dark:text-slate-400"><p>{new Date(invoice.createdAt).toLocaleDateString()}</p><p>{invoice._count?.items ?? 0} item(s)</p></div><p className="font-bold">{money.format(Number(invoice.total))}</p></div>
                </a>
              ))}
            </div>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-400"><tr><th className="px-5 py-4">Invoice</th><th className="px-5 py-4">Customer</th><th className="px-5 py-4">Date</th><th className="px-5 py-4">Items</th><th className="px-5 py-4">Total</th><th className="px-5 py-4">Status</th></tr></thead>
                <tbody className="divide-y">
                  {invoices.data.map((invoice) => (
                    <tr key={invoice.id} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50" onClick={() => window.location.assign(`/invoices/${invoice.id}`)}>
                      <td className="px-5 py-4 font-semibold text-primary">{invoice.invoiceNumber}</td>
                      <td className="px-5 py-4"><p className="font-medium">{invoice.customerName}</p><p className="text-xs text-slate-500 dark:text-slate-400">{invoice.customerPhone || 'No phone'}</p></td>
                      <td className="px-5 py-4 text-sm">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4 text-sm">{invoice._count?.items ?? 0}</td>
                      <td className="px-5 py-4 font-semibold">{money.format(Number(invoice.total))}</td>
                      <td className="px-5 py-4"><StatusBadge status={invoice.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </main>
  );
}
