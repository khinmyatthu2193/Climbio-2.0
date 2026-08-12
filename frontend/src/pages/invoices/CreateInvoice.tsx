import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { CalendarDays, ChevronLeft, MapPin, Package, Plus, Save, Send, Share2, Trash2, Truck, UserRound } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { invoiceService } from '@/services/invoiceService';
import { inventoryService } from '@/services/inventoryService';
import { useAuthStore } from '@/store/authStore';
import type { Product } from '@/types/inventory';

interface LineItem { productId: string; quantity: number }
type SubmitAction = 'draft' | 'send' | 'share';
type DiscountType = 'amount' | 'percentage';
type FormErrors = Partial<Record<'customerName' | 'customerPhone' | 'email' | 'address' | 'city' | 'deliveryDate' | 'items', string>>;

const sampleProducts: Product[] = [
  { id: '10000000-0000-4000-8000-000000000001', userId: 'sample', name: 'Classic Climbing Tee', description: null, image: null, price: '28000', costPrice: '18000', quantity: 18, categoryId: null, category: null, createdAt: '', updatedAt: '' },
  { id: '10000000-0000-4000-8000-000000000002', userId: 'sample', name: 'Chalk Bag — Sandstone', description: null, image: null, price: '35000', costPrice: '22000', quantity: 9, categoryId: null, category: null, createdAt: '', updatedAt: '' },
  { id: '10000000-0000-4000-8000-000000000003', userId: 'sample', name: 'Climbio Water Bottle', description: null, image: null, price: '22000', costPrice: '14000', quantity: 24, categoryId: null, category: null, createdAt: '', updatedAt: '' },
];

const cities = ['Yangon', 'Mandalay', 'Naypyidaw', 'Bago', 'Mawlamyine', 'Taunggyi'];
const fieldClass = 'field-label';
const errorClass = 'mt-1.5 text-xs font-medium text-red-600 dark:text-red-400';

function apiError(error: unknown) {
  if (axios.isAxiosError<{ error?: string }>(error)) return error.response?.data?.error;
  return undefined;
}

export function CreateInvoice() {
  const queryClient = useQueryClient();
  const currency = useAuthStore((state) => state.user?.setting?.currency ?? 'MMK');
  const money = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: currency === 'MMK' ? 0 : 2 }), [currency]);
  const productsQuery = useQuery({ queryKey: ['products'], queryFn: inventoryService.listProducts });
  const availableProducts = productsQuery.data?.length ? productsQuery.data : sampleProducts;
  const usingSamples = !productsQuery.isLoading && !productsQuery.data?.length;

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('amount');
  const [discountValue, setDiscountValue] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<LineItem[]>([{ productId: '', quantity: 1 }]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [action, setAction] = useState<SubmitAction>('share');

  const productsById = useMemo(() => new Map(availableProducts.map((product) => [product.id, product])), [availableProducts]);
  const subtotal = items.reduce((sum, item) => sum + Number(productsById.get(item.productId)?.price ?? 0) * item.quantity, 0);
  const appliedDeliveryFee = deliveryMethod === 'delivery' ? Math.max(0, Number(deliveryFee) || 0) : 0;
  const enteredDiscount = Math.max(0, Number(discountValue) || 0);
  const discountAmount = discountType === 'percentage'
    ? Math.min(subtotal, subtotal * Math.min(100, enteredDiscount) / 100)
    : Math.min(subtotal, enteredDiscount);
  const grandTotal = Math.max(0, subtotal + appliedDeliveryFee - discountAmount);

  const createInvoice = useMutation({
    mutationFn: async () => {
      const invoice = await invoiceService.create({ customerName: customerName.trim(), customerPhone: customerPhone.trim(), discount: discountAmount, orderType: deliveryMethod === 'delivery' ? 'DELIVERY' : 'PICKUP', items });
      if (action !== 'draft') await invoiceService.updateStatus(invoice.id, deliveryMethod === 'delivery' ? 'PROCESSING' : 'READY_FOR_PICKUP');
      return invoice;
    },
    onSuccess: async (invoice) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['invoices'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
      const invoiceUrl = `${window.location.origin}/invoices/${invoice.id}`;
      if (action === 'share' && navigator.share) {
        try { await navigator.share({ title: `Invoice ${invoice.invoiceNumber}`, text: `Invoice for ${customerName}`, url: invoiceUrl }); } catch { /* Sharing was dismissed. */ }
      }
      window.location.assign(`/invoices/${invoice.id}`);
    },
  });

  const validate = () => {
    const next: FormErrors = {};
    if (!customerName.trim()) next.customerName = 'Customer name is required.';
    if (!customerPhone.trim()) next.customerPhone = 'Phone number is required.';
    if (email && !/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address.';
    if (deliveryMethod === 'delivery') {
      if (!address.trim()) next.address = 'Shipping address is required.';
      if (!city) next.city = 'Please select a city.';
    }
    if (!deliveryDate) next.deliveryDate = 'Choose an estimated date.';
    if (!items.length || items.some((item) => !item.productId || item.quantity < 1)) next.items = 'Select a product and valid quantity for every item.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    createInvoice.mutate();
  };

  const setSubmitAction = (nextAction: SubmitAction) => setAction(nextAction);
  const updateItem = (index: number, change: Partial<LineItem>) => setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...change } : item));
  const sectionTitle = (icon: typeof UserRound, title: string, description: string) => {
    const Icon = icon;
    return <div className="mb-5 flex items-start gap-3"><span className="rounded-xl bg-violet-50 p-2.5 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300"><Icon size={19} /></span><div><h2 className="font-bold text-slate-950 dark:text-white">{title}</h2><p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p></div></div>;
  };

  return (
    <main className="page-container pb-28">
      <form className="mx-auto max-w-6xl" onSubmit={submit} noValidate>
        <a href="/invoices" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-violet-600 dark:text-slate-400"><ChevronLeft size={16} /> Back to invoices</a>
        <header className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-semibold text-violet-600 dark:text-violet-300">INVOICES</p><h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Create new invoice</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Add customer, delivery and order details to prepare your invoice.</p></div>
          <span className="w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">Draft invoice</span>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="space-y-5">
            <Card>{sectionTitle(UserRound, 'Customer details', 'Who is this invoice for?')}<div className="grid gap-4 sm:grid-cols-2"><label><span className={fieldClass}>Customer name <b className="text-red-500">*</b></span><Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Aye Aye Mon" aria-invalid={!!errors.customerName} />{errors.customerName && <p className={errorClass}>{errors.customerName}</p>}</label><label><span className={fieldClass}>Phone number <b className="text-red-500">*</b></span><Input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="09 123 456 789" aria-invalid={!!errors.customerPhone} />{errors.customerPhone && <p className={errorClass}>{errors.customerPhone}</p>}</label><label className="sm:col-span-2"><span className={fieldClass}>Email <span className="font-normal text-slate-400">(optional)</span></span><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="customer@example.com" />{errors.email && <p className={errorClass}>{errors.email}</p>}</label></div></Card>

            <Card>{sectionTitle(Truck, 'Delivery details', 'Choose how the customer will receive the order.')}<div className="grid grid-cols-2 gap-3"><label className={`cursor-pointer rounded-xl border p-4 transition ${deliveryMethod === 'pickup' ? 'border-violet-500 bg-violet-50/70 ring-1 ring-violet-500 dark:bg-violet-500/10' : 'border-slate-200 dark:border-slate-700'}`}><input type="radio" name="delivery" value="pickup" checked={deliveryMethod === 'pickup'} onChange={() => setDeliveryMethod('pickup')} className="mr-2 accent-violet-600" /><span className="font-semibold">Pickup</span><p className="mt-1 pl-6 text-xs text-slate-500">Collect from your shop</p></label><label className={`cursor-pointer rounded-xl border p-4 transition ${deliveryMethod === 'delivery' ? 'border-violet-500 bg-violet-50/70 ring-1 ring-violet-500 dark:bg-violet-500/10' : 'border-slate-200 dark:border-slate-700'}`}><input type="radio" name="delivery" value="delivery" checked={deliveryMethod === 'delivery'} onChange={() => setDeliveryMethod('delivery')} className="mr-2 accent-violet-600" /><span className="font-semibold">Delivery</span><p className="mt-1 pl-6 text-xs text-slate-500">Ship to their address</p></label></div>{deliveryMethod === 'delivery' && <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="sm:col-span-2"><span className={fieldClass}>Shipping address <b className="text-red-500">*</b></span><textarea className="control min-h-24 resize-y" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, township, building and unit" />{errors.address && <p className={errorClass}>{errors.address}</p>}</label><label><span className={fieldClass}>City <b className="text-red-500">*</b></span><select className="control" value={city} onChange={(e) => setCity(e.target.value)}><option value="">Select city</option>{cities.map((option) => <option key={option}>{option}</option>)}</select>{errors.city && <p className={errorClass}>{errors.city}</p>}</label><label><span className={fieldClass}>Delivery fee</span><Input type="text" inputMode="numeric" pattern="[0-9]*" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value.replace(/\D/g, ''))} placeholder="Enter fee (e.g., 5000)" aria-label="Delivery fee" /></label></div>}<label className="mt-4 block"><span className={fieldClass}>Estimated {deliveryMethod === 'pickup' ? 'pickup' : 'delivery'} date <b className="text-red-500">*</b></span><div className="relative"><CalendarDays className="pointer-events-none absolute left-3.5 top-3 text-slate-400" size={18} /><Input className="pl-11" type="date" min={new Date().toISOString().split('T')[0]} value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} /></div>{errors.deliveryDate && <p className={errorClass}>{errors.deliveryDate}</p>}</label></Card>

            <Card>{sectionTitle(Package, 'Order items', 'Select products from your inventory.')} {usingSamples && <Alert className="mb-4" tone="info">Showing sample products because your inventory is empty. Add inventory products before creating a live invoice.</Alert>} {productsQuery.isError && <Alert className="mb-4" tone="error">Products could not be loaded. Sample products are shown for preview only.</Alert>}<div className="space-y-3">{items.map((item, index) => { const product = productsById.get(item.productId); const selected = new Set(items.filter((_, i) => i !== index).map((line) => line.productId)); return <div key={index} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-800/40 md:grid-cols-[minmax(190px,1fr)_90px_120px_120px_40px] md:items-end"><label><span className="field-label text-xs">Product</span><select className="control" value={item.productId} onChange={(e) => updateItem(index, { productId: e.target.value, quantity: 1 })}><option value="">Select a product</option>{availableProducts.map((option) => <option key={option.id} value={option.id} disabled={selected.has(option.id) || option.quantity === 0}>{option.name} · {option.quantity} left</option>)}</select></label><label><span className="field-label text-xs">Quantity</span><Input type="number" min="1" max={product?.quantity} value={item.quantity} onChange={(e) => updateItem(index, { quantity: Math.max(1, Number(e.target.value)) })} /></label><div><span className="field-label text-xs">Price</span><div className="flex h-11 items-center text-sm font-semibold">{money.format(Number(product?.price ?? 0))}</div></div><div><span className="field-label text-xs">Total</span><div className="flex h-11 items-center text-sm font-bold text-slate-950 dark:text-white">{money.format(Number(product?.price ?? 0) * item.quantity)}</div></div><Button type="button" size="sm" variant="ghost" className="h-11 w-10 px-0 text-red-500" onClick={() => setItems((current) => current.filter((_, i) => i !== index))} disabled={items.length === 1} aria-label="Remove item"><Trash2 size={17} /></Button></div>; })}</div>{errors.items && <p className={errorClass}>{errors.items}</p>}<Button type="button" variant="outline" className="mt-4 w-full border-dashed" onClick={() => setItems((current) => [...current, { productId: '', quantity: 1 }])}><Plus size={17} /> Add item</Button></Card>

            <Card>{sectionTitle(MapPin, 'Order notes', 'Add any special instructions or helpful details.')}<textarea className="control min-h-28 resize-y" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} placeholder="Packing requests, delivery instructions, payment details…" /><p className="mt-2 text-right text-xs text-slate-400">{notes.length}/500</p></Card>
          </div>

          <Card className="lg:sticky lg:top-6"><h2 className="text-lg font-bold text-slate-950 dark:text-white">Invoice summary</h2><p className="mt-1 text-sm text-slate-500">Review your totals before creating.</p><div className="mt-6 space-y-4 text-sm"><div className="flex justify-between"><span className="text-slate-500">Subtotal</span><strong>{money.format(subtotal)}</strong></div><div className="flex justify-between"><span className="text-slate-500">Delivery fee</span><strong>{money.format(appliedDeliveryFee)}</strong></div><div><span className="field-label">Discount</span><div className="mb-2 grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800" role="group" aria-label="Discount type"><button type="button" onClick={() => { setDiscountType('amount'); setDiscountValue(''); }} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${discountType === 'amount' ? 'bg-white text-violet-700 shadow-sm dark:bg-slate-700 dark:text-violet-300' : 'text-slate-500 dark:text-slate-400'}`}>Amount</button><button type="button" onClick={() => { setDiscountType('percentage'); setDiscountValue(''); }} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${discountType === 'percentage' ? 'bg-white text-violet-700 shadow-sm dark:bg-slate-700 dark:text-violet-300' : 'text-slate-500 dark:text-slate-400'}`}>Percentage</button></div><div className="relative"><Input type="text" inputMode="decimal" value={discountValue} onChange={(e) => { const next = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'); setDiscountValue(discountType === 'percentage' && Number(next) > 100 ? '100' : next); }} placeholder={discountType === 'percentage' ? 'Enter discount (e.g., 10)' : 'Enter amount (e.g., 5000)'} className="pr-16 text-right" aria-label={`Discount ${discountType}`} /><span className="pointer-events-none absolute right-3 top-3 text-xs font-semibold text-slate-400">{discountType === 'percentage' ? '%' : currency}</span></div>{discountAmount > 0 && <p className="mt-2 text-right text-xs text-emerald-600 dark:text-emerald-400">You save {money.format(discountAmount)}</p>}</div><div className="border-t border-slate-200 pt-5 dark:border-slate-700"><div className="mb-3 flex justify-between"><span className="text-slate-500">Discount</span><strong className="text-emerald-600 dark:text-emerald-400">− {money.format(discountAmount)}</strong></div><div className="flex items-end justify-between"><span className="font-bold">Grand total</span><strong className="text-2xl text-violet-600 dark:text-violet-300">{money.format(grandTotal)}</strong></div></div></div>{createInvoice.isError && <Alert className="mt-5" tone="error">{apiError(createInvoice.error) ?? 'Invoice could not be created.'}</Alert>}<p className="mt-5 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">Customer email, delivery details and notes are included in this form design. The current invoice API stores customer, item and discount fields.</p></Card>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/95"><div className="mx-auto flex max-w-6xl flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="submit" variant="outline" disabled={createInvoice.isPending || usingSamples} onClick={() => setSubmitAction('draft')}><Save size={17} /> Save as draft</Button><Button type="submit" variant="outline" disabled={createInvoice.isPending || usingSamples} onClick={() => setSubmitAction('send')}><Send size={17} /> Send to customer</Button><Button type="submit" disabled={createInvoice.isPending || usingSamples} onClick={() => setSubmitAction('share')}><Share2 size={17} /> {createInvoice.isPending ? 'Creating…' : 'Create & share'}</Button></div></div>
      </form>
    </main>
  );
}
