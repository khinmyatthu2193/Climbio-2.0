import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/common/Card';
import { StatusBadge } from '@/components/invoices/StatusBadge';
import { invoiceService } from '@/services/invoiceService';
import { useAuthStore } from '@/store/authStore';

export function InvoiceList() {
  const invoices = useQuery({ queryKey: ['invoices'], queryFn: invoiceService.list });
  const currency = useAuthStore((state) => state.user?.setting?.currency ?? 'MMK');
  const money = new Intl.NumberFormat(undefined, { style: 'currency', currency });

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <a className="text-sm font-semibold text-primary hover:underline" href="/">← Dashboard</a>
            <h1 className="mt-2 text-3xl font-bold">Invoices</h1>
            <p className="mt-1 text-slate-600">Review sales history and payment status.</p>
          </div>
          <a className="rounded-lg bg-primary px-4 py-2 text-center font-medium text-primary-foreground hover:opacity-90" href="/invoices/new">
            Create invoice
          </a>
        </header>

        <Card className="mt-8 overflow-hidden p-0">
          {invoices.isLoading && <p className="p-6 text-slate-600">Loading invoices…</p>}
          {invoices.isError && <p className="p-6 text-red-600">Could not load invoices.</p>}
          {invoices.data?.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-lg font-semibold">No invoices yet</p>
              <p className="mt-1 text-sm text-slate-500">Create your first invoice to record a sale.</p>
            </div>
          )}
          {!!invoices.data?.length && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b bg-emerald-50/60 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Invoice</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Items</th>
                    <th className="px-5 py-4">Total</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoices.data.map((invoice) => (
                    <tr key={invoice.id} className="cursor-pointer hover:bg-slate-50" onClick={() => window.location.assign(`/invoices/${invoice.id}`)}>
                      <td className="px-5 py-4 font-semibold text-primary">{invoice.invoiceNumber}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium">{invoice.customerName}</p>
                        <p className="text-xs text-slate-500">{invoice.customerPhone || 'No phone'}</p>
                      </td>
                      <td className="px-5 py-4 text-sm">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4 text-sm">{invoice._count?.items ?? 0}</td>
                      <td className="px-5 py-4 font-semibold">{money.format(Number(invoice.total))}</td>
                      <td className="px-5 py-4"><StatusBadge status={invoice.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
