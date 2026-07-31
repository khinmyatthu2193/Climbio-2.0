import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Download,
  EllipsisVertical,
  Eye,
  FilePenLine,
  FilePlus2,
  FileText,
  ReceiptText,
  Search,
  Trash2,
} from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/invoices/StatusBadge';
import { invoiceService } from '@/services/invoiceService';
import { useAuthStore } from '@/store/authStore';
import type { Invoice, InvoiceStatus } from '@/types/invoice';

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';
type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

const statusOptions: Array<{ value: 'ALL' | InvoiceStatus; label: string }> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'PAID', label: 'Paid' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SENT', label: 'Sent' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function InvoiceActions({ invoice, downloading, deleting, onDownload, onDelete }: {
  invoice: Invoice;
  downloading: boolean;
  deleting: boolean;
  onDownload: () => void;
  onDelete: () => void;
}) {
  const itemClass = 'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700';

  return (
    <details className="group relative" onClick={(event) => event.stopPropagation()}>
      <summary className="grid size-9 cursor-pointer list-none place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-white" aria-label={`Actions for ${invoice.invoiceNumber}`}>
        <EllipsisVertical className="size-4" />
      </summary>
      <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <a className={itemClass} href={`/invoices/${invoice.id}`}><Eye className="size-4" /> View invoice</a>
        <a className={itemClass} href={`/invoices/${invoice.id}`}><FilePenLine className="size-4" /> Edit invoice</a>
        <button className={itemClass} type="button" disabled={downloading} onClick={onDownload}>
          <Download className="size-4" /> {downloading ? 'Preparing…' : 'Download PDF'}
        </button>
        <button className={`${itemClass} text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10`} type="button" disabled={deleting} onClick={onDelete}>
          <Trash2 className="size-4" /> {deleting ? 'Deleting…' : 'Delete invoice'}
        </button>
      </div>
    </details>
  );
}

export function InvoiceList() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const invoices = useQuery({ queryKey: ['invoices'], queryFn: invoiceService.list });
  const currency = user?.setting?.currency ?? 'MMK';
  const money = new Intl.NumberFormat(undefined, { style: 'currency', currency });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | InvoiceStatus>('ALL');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState(false);

  const removeInvoice = useMutation({
    mutationFn: invoiceService.remove,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['invoices'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
    },
  });

  const summary = useMemo(() => {
    const data = invoices.data ?? [];
    return {
      total: data.length,
      paid: data.filter((invoice) => invoice.status === 'PAID').length,
      pending: data.filter((invoice) => invoice.status === 'DRAFT' || invoice.status === 'SENT').length,
      sales: data.filter((invoice) => invoice.status === 'PAID').reduce((sum, invoice) => sum + Number(invoice.total), 0),
    };
  }, [invoices.data]);

  const filteredInvoices = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    const week = startOfDay(now);
    week.setDate(week.getDate() - (week.getDay() === 0 ? 6 : week.getDay() - 1));
    const month = new Date(now.getFullYear(), now.getMonth(), 1);
    const term = search.trim().toLowerCase();

    return [...(invoices.data ?? [])].filter((invoice) => {
      const matchesSearch = !term || [invoice.id, invoice.invoiceNumber, invoice.customerName, invoice.customerPhone ?? '']
        .some((value) => value.toLowerCase().includes(term));
      const matchesStatus = status === 'ALL' || invoice.status === status;
      const createdAt = new Date(invoice.createdAt);
      let matchesDate = true;
      if (dateFilter === 'today') matchesDate = createdAt >= today;
      if (dateFilter === 'week') matchesDate = createdAt >= week;
      if (dateFilter === 'month') matchesDate = createdAt >= month;
      if (dateFilter === 'custom') {
        const from = customFrom ? new Date(`${customFrom}T00:00:00`) : null;
        const to = customTo ? new Date(`${customTo}T23:59:59.999`) : null;
        matchesDate = (!from || createdAt >= from) && (!to || createdAt <= to);
      }
      return matchesSearch && matchesStatus && matchesDate;
    }).sort((left, right) => {
      if (sort === 'oldest') return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
      if (sort === 'highest') return Number(right.total) - Number(left.total);
      if (sort === 'lowest') return Number(left.total) - Number(right.total);
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });
  }, [customFrom, customTo, dateFilter, invoices.data, search, sort, status]);

  const downloadPdf = async (invoice: Invoice) => {
    if (!user) return;
    setDownloadingId(invoice.id);
    setDownloadError(false);
    try {
      const [fullInvoice, { pdf }, { InvoicePdfDocument }] = await Promise.all([
        invoiceService.get(invoice.id),
        import('@react-pdf/renderer'),
        import('@/components/invoices/InvoicePdfDocument'),
      ]);
      const blob = await pdf(<InvoicePdfDocument invoice={fullInvoice} shop={user} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError(true);
    } finally {
      setDownloadingId(null);
    }
  };

  const deleteInvoice = (invoice: Invoice) => {
    if (window.confirm(`Delete ${invoice.invoiceNumber}? This action cannot be undone.`)) removeInvoice.mutate(invoice.id);
  };

  const hasActiveFilters = search || status !== 'ALL' || dateFilter !== 'all';
  const clearFilters = () => {
    setSearch('');
    setStatus('ALL');
    setDateFilter('all');
    setCustomFrom('');
    setCustomTo('');
  };

  return (
    <main className="page-container">
      <PageHeader eyebrow="Sales" title="Invoices" description="Review sales history, customer details, and payment status." actions={
        <a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-violet-700" href="/invoices/new"><FilePlus2 className="size-4" /> Create invoice</a>
      } />

      {invoices.isError && <Alert className="mt-6" tone="error">Could not load invoices. Please refresh and try again.</Alert>}
      {downloadError && <Alert className="mt-6" tone="error">PDF could not be generated. Please try again.</Alert>}
      {removeInvoice.isError && <Alert className="mt-6" tone="error">Invoice could not be deleted.</Alert>}

      {!invoices.isLoading && !invoices.isError && (
        <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Invoice summary">
          {[
            { label: 'Total invoices', value: summary.total.toLocaleString(), icon: FileText, tone: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300' },
            { label: 'Paid invoices', value: summary.paid.toLocaleString(), icon: CircleDollarSign, tone: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300' },
            { label: 'Pending / Draft', value: summary.pending.toLocaleString(), icon: Clock3, tone: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300' },
            { label: 'Total sales amount', value: money.format(summary.sales), icon: ReceiptText, tone: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300' },
          ].map(({ label, value, icon: Icon, tone }) => (
            <Card className="flex items-center gap-3 p-4" key={label}>
              <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></span>
              <span className="min-w-0"><span className="block text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span><strong className="mt-1 block truncate text-lg">{value}</strong></span>
            </Card>
          ))}
        </section>
      )}

      <Card className="mt-6 p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_180px_180px_180px]">
          <label className="relative">
            <span className="sr-only">Search invoices</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input className="control pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search invoices or customers..." />
          </label>
          <select className="control" value={status} onChange={(event) => setStatus(event.target.value as 'ALL' | InvoiceStatus)} aria-label="Filter by status">
            {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select className="control" value={dateFilter} onChange={(event) => setDateFilter(event.target.value as DateFilter)} aria-label="Filter by date">
            <option value="all">All time</option><option value="today">Today</option><option value="week">This week</option><option value="month">This month</option><option value="custom">Custom date range</option>
          </select>
          <select className="control" value={sort} onChange={(event) => setSort(event.target.value as SortOption)} aria-label="Sort invoices">
            <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="highest">Highest amount</option><option value="lowest">Lowest amount</option>
          </select>
        </div>
        {dateFilter === 'custom' && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:max-w-xl">
            <label><span className="mb-1 block text-xs font-medium text-slate-500">From</span><input className="control" type="date" value={customFrom} max={customTo || undefined} onChange={(event) => setCustomFrom(event.target.value)} /></label>
            <label><span className="mb-1 block text-xs font-medium text-slate-500">To</span><input className="control" type="date" value={customTo} min={customFrom || undefined} onChange={(event) => setCustomTo(event.target.value)} /></label>
          </div>
        )}
      </Card>

      <Card className="mt-4 p-0">
        {invoices.isLoading && <LoadingState label="Loading invoices" rows={5} />}
        {invoices.data?.length === 0 && <EmptyState icon={<ReceiptText className="size-6" />} title="No invoices yet" description="Create your first invoice to record a sale and track payment." action={<a className="font-semibold text-primary hover:underline" href="/invoices/new">Create your first invoice</a>} />}
        {!!invoices.data?.length && filteredInvoices.length === 0 && <EmptyState icon={<Search className="size-6" />} title="No matching invoices" description="Try changing your search or filters." action={hasActiveFilters ? <button className="font-semibold text-primary hover:underline" onClick={clearFilters}>Clear all filters</button> : undefined} />}
        {filteredInvoices.length > 0 && (
          <>
            <div className="divide-y dark:divide-slate-800 sm:hidden">
              {filteredInvoices.map((invoice) => (
                <article className="p-4" key={invoice.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div><a className="font-semibold text-primary hover:underline" href={`/invoices/${invoice.id}`}>{invoice.invoiceNumber}</a><p className="mt-1 text-sm font-medium">{invoice.customerName}</p><p className="text-xs text-slate-500">{invoice.customerPhone || 'No phone'}</p></div>
                    <div className="flex items-center gap-1"><StatusBadge status={invoice.status} /><InvoiceActions invoice={invoice} downloading={downloadingId === invoice.id} deleting={removeInvoice.isPending && removeInvoice.variables === invoice.id} onDownload={() => downloadPdf(invoice)} onDelete={() => deleteInvoice(invoice)} /></div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-500 dark:text-slate-400"><span>{new Date(invoice.createdAt).toLocaleDateString()}</span><span>{invoice._count?.items ?? 0} item(s)</span><strong className="text-right text-sm text-slate-900 dark:text-white">{money.format(Number(invoice.total))}</strong></div>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[860px] text-left">
                <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-400"><tr><th className="px-5 py-4">Invoice ID</th><th className="px-5 py-4">Customer</th><th className="px-5 py-4">Date</th><th className="px-5 py-4">Items</th><th className="px-5 py-4">Total</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Actions</th></tr></thead>
                <tbody className="divide-y dark:divide-slate-800">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-5 py-4"><a className="font-semibold text-primary hover:underline" href={`/invoices/${invoice.id}`}>{invoice.invoiceNumber}</a></td>
                      <td className="px-5 py-4"><p className="font-medium">{invoice.customerName}</p><p className="text-xs text-slate-500 dark:text-slate-400">{invoice.customerPhone || 'No phone'}</p></td>
                      <td className="px-5 py-4 text-sm">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4 text-sm">{invoice._count?.items ?? 0}</td>
                      <td className="px-5 py-4 font-semibold">{money.format(Number(invoice.total))}</td>
                      <td className="px-5 py-4"><StatusBadge status={invoice.status} /></td>
                      <td className="px-5 py-4"><div className="flex justify-end"><InvoiceActions invoice={invoice} downloading={downloadingId === invoice.id} deleting={removeInvoice.isPending && removeInvoice.variables === invoice.id} onDownload={() => downloadPdf(invoice)} onDelete={() => deleteInvoice(invoice)} /></div></td>
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
