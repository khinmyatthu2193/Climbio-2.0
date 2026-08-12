import { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { StatusBadge } from './StatusBadge';
import type { Invoice } from '@/types/invoice';

export interface InvoiceTemplateShop {
  name: string;
  logo?: string | null;
  phone?: string | null;
  address?: string | null;
  currency: 'MMK' | 'USD' | 'THB';
}

interface InvoiceTemplateProps {
  invoice: Invoice;
  shop: InvoiceTemplateShop;
  publicUrl: string;
}

const textOrDash = (value?: string | null) => value?.trim() || '—';

export const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(function InvoiceTemplate({ invoice, shop, publicUrl }, ref) {
  const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: shop.currency, maximumFractionDigits: shop.currency === 'MMK' ? 0 : 2 });
  const deliveryFee = Number(invoice.deliveryFee ?? 0);
  const grandTotal = Number(invoice.total) + deliveryFee;

  return <div ref={ref} className="invoice-template overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-sm [font-family:Inter,'Noto_Sans_Myanmar','Myanmar_Text',sans-serif]">
    <header className="grid gap-6 bg-gradient-to-r from-violet-700 to-indigo-700 p-6 text-white sm:grid-cols-[1fr_auto] sm:p-8">
      <div className="flex items-center gap-4">{shop.logo ? <img className="size-16 rounded-2xl border-2 border-white/30 bg-white object-cover" src={shop.logo} alt={`${shop.name} logo`} crossOrigin="anonymous" /> : <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/15 text-2xl font-black ring-1 ring-white/25">{shop.name.charAt(0).toUpperCase() || 'C'}</span>}<div><h2 className="text-xl font-black sm:text-2xl">{shop.name}</h2>{shop.phone && <p className="mt-1 text-sm text-violet-100">{shop.phone}</p>}{shop.address && <p className="mt-1 max-w-md text-sm leading-5 text-violet-100">{shop.address}</p>}</div></div>
      <div className="sm:text-right"><p className="text-3xl font-black tracking-wide">INVOICE</p><p className="mt-2 font-bold">{invoice.invoiceNumber}</p><p className="mt-1 text-sm text-violet-100">{new Date(invoice.createdAt).toLocaleDateString()}</p></div>
    </header>

    <div className="p-5 sm:p-8">
      <section className="grid gap-6 rounded-2xl bg-slate-50 p-5 sm:grid-cols-[1fr_auto]">
        <div><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">Customer</p><div className="mt-3 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2"><div><span className="block text-xs text-slate-400">Name</span><strong>{textOrDash(invoice.customerName)}</strong></div><div><span className="block text-xs text-slate-400">Phone</span><span>{textOrDash(invoice.customerPhone)}</span></div><div><span className="block text-xs text-slate-400">Email</span><span>{textOrDash(invoice.customerEmail)}</span></div><div><span className="block text-xs text-slate-400">Address</span><span>{textOrDash(invoice.shippingAddress)}</span></div></div></div>
        <div className="sm:min-w-40 sm:text-right"><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Delivery method</p><p className="mt-2 font-bold capitalize">{invoice.orderType.toLowerCase()}</p><div className="mt-3 flex sm:justify-end"><StatusBadge status={invoice.status} /></div></div>
      </section>

      <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200"><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-slate-100 text-xs font-black uppercase tracking-wide text-slate-500"><tr><th className="w-12 px-4 py-3 text-center">#</th><th className="px-4 py-3">Product</th><th className="px-4 py-3 text-center">Qty</th><th className="px-4 py-3 text-right">Price</th><th className="px-4 py-3 text-right">Total</th></tr></thead><tbody className="divide-y divide-slate-100">{invoice.items?.map((item, index) => <tr key={item.id}><td className="px-4 py-4 text-center text-slate-400">{index + 1}</td><td className="px-4 py-4 font-semibold">{item.productName}</td><td className="px-4 py-4 text-center">{item.quantity}</td><td className="px-4 py-4 text-right text-slate-600">{money.format(Number(item.price))}</td><td className="px-4 py-4 text-right font-bold">{money.format(Number(item.price) * item.quantity)}</td></tr>)}</tbody></table></div></section>

      <section className="mt-7 grid gap-6 sm:grid-cols-[1fr_320px]">
        <div><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Order notes</p><p className="mt-2 min-h-16 whitespace-pre-wrap text-sm leading-6 text-slate-600">{textOrDash(invoice.notes)}</p></div>
        <div className="rounded-2xl border border-slate-200 p-5 text-sm"><div className="flex justify-between py-1.5 text-slate-500"><span>Subtotal</span><span>{money.format(Number(invoice.subtotal))}</span></div><div className="flex justify-between py-1.5 text-slate-500"><span>Delivery fee</span><span>{money.format(deliveryFee)}</span></div><div className="flex justify-between py-1.5 text-slate-500"><span>Discount</span><span>− {money.format(Number(invoice.discount))}</span></div><div className="mt-3 flex items-end justify-between border-t border-slate-200 pt-4"><span className="font-black">Grand total</span><span className="text-xl font-black text-violet-700">{money.format(grandTotal)}</span></div></div>
      </section>

      <footer className="mt-8 flex flex-col items-center justify-between gap-5 border-t border-slate-200 pt-6 text-center sm:flex-row sm:text-left"><div><p className="font-black text-slate-800">Thank you for your purchase!</p><p className="mt-1 text-xs text-slate-400">Scan the QR code to view the latest invoice status.</p></div><div className="rounded-xl border border-slate-200 bg-white p-2"><QRCodeSVG value={publicUrl} size={76} level="M" aria-label="Public invoice QR code" /></div></footer>
    </div>
  </div>;
});
