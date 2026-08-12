import { useQuery } from '@tanstack/react-query';
import { Clock3, MapPin, Phone, ReceiptText } from 'lucide-react';
import { DynamicStatusStepper } from '@/components/invoices/DynamicStatusStepper';
import { StatusBadge } from '@/components/invoices/StatusBadge';
import { invoiceService } from '@/services/invoiceService';

export function PublicInvoice({ invoiceId }: { invoiceId: string }) {
  const result = useQuery({
    queryKey: ['public-invoice', invoiceId],
    queryFn: () => invoiceService.getPublic(invoiceId),
    retry: 1,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });

  if (result.isLoading) return <main className="grid min-h-screen place-items-center bg-slate-50"><div className="text-center"><div className="mx-auto size-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" /><p className="mt-4 text-sm text-slate-500">Opening invoice…</p></div></main>;
  if (result.isError || !result.data) return <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-center"><div><ReceiptText className="mx-auto text-slate-300" size={48} /><h1 className="mt-4 text-2xl font-black text-slate-900">Invoice unavailable</h1><p className="mt-2 text-slate-500">This invoice link may be invalid or no longer available.</p></div></main>;

  const { invoice, shop } = result.data;
  const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: shop.currency, maximumFractionDigits: shop.currency === 'MMK' ? 0 : 2 });
  return <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:py-12"><div className="mx-auto max-w-3xl"><header className="mb-6 flex flex-col gap-5 rounded-3xl bg-gradient-to-br from-violet-700 to-indigo-700 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between sm:p-8"><div className="flex items-center gap-4">{shop.shopLogo ? <img className="size-16 rounded-2xl border-2 border-white/30 object-cover" src={shop.shopLogo} alt={`${shop.shopName} logo`} /> : <span className="grid size-16 place-items-center rounded-2xl bg-white/15 text-2xl font-black">{shop.shopName.charAt(0)}</span>}<div><p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-200">Invoice from</p><h1 className="mt-1 text-2xl font-black">{shop.shopName}</h1></div></div><div className="sm:text-right"><p className="text-xl font-black">{invoice.invoiceNumber}</p><p className="mt-1 text-sm text-violet-200">{new Date(invoice.createdAt).toLocaleDateString()}</p></div></header>

    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Live order status</p><p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400"><Clock3 size={13} />Updates automatically</p></div><StatusBadge status={invoice.status} className="px-3 py-1.5" /></div><div className="mt-7"><DynamicStatusStepper currentStatus={invoice.status} orderType={invoice.orderType} /></div></section>

    <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="grid gap-5 border-b border-slate-200 pb-6 sm:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Customer</p><p className="mt-2 font-bold">{invoice.customerName}</p><p className="mt-1 text-sm text-slate-500">{invoice.customerPhone || 'No phone number'}</p></div><div className="sm:text-right"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Order type</p><p className="mt-2 font-bold capitalize">{invoice.orderType.toLowerCase()}</p></div></div><div className="mt-6 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead className="text-xs uppercase text-slate-400"><tr><th className="pb-3">Item</th><th className="pb-3 text-center">Qty</th><th className="pb-3 text-right">Price</th><th className="pb-3 text-right">Total</th></tr></thead><tbody className="divide-y divide-slate-100">{invoice.items?.map((item) => <tr key={item.id}><td className="py-4 font-semibold">{item.productName}</td><td className="py-4 text-center text-slate-500">{item.quantity}</td><td className="py-4 text-right text-slate-500">{money.format(Number(item.price))}</td><td className="py-4 text-right font-bold">{money.format(Number(item.price) * item.quantity)}</td></tr>)}</tbody></table></div><div className="ml-auto mt-6 max-w-sm space-y-3 border-t border-slate-200 pt-5 text-sm"><div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{money.format(Number(invoice.subtotal))}</span></div><div className="flex justify-between text-slate-500"><span>Discount</span><span>− {money.format(Number(invoice.discount))}</span></div><div className="flex justify-between border-t border-slate-200 pt-4 text-lg font-black"><span>Total</span><span className="text-violet-700">{money.format(Number(invoice.total))}</span></div></div></section>

    <footer className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-500">{shop.invoiceFooter || `Thank you for choosing ${shop.shopName}.`}<div className="mt-3 flex flex-wrap justify-center gap-4 text-xs">{shop.phone && <a className="inline-flex items-center gap-1 hover:text-violet-700" href={`tel:${shop.phone}`}><Phone size={13} />{shop.phone}</a>}{shop.shopAddress && <span className="inline-flex items-center gap-1"><MapPin size={13} />{shop.shopAddress}</span>}</div><p className="mt-4 text-xs text-slate-400">Powered by <strong className="text-violet-600">Climbio</strong></p></footer>
  </div></main>;
}
