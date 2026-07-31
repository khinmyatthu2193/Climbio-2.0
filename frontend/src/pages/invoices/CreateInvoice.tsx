import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/Alert';
import { PageHeader } from '@/components/common/PageHeader';
import { invoiceService } from '@/services/invoiceService';
import { inventoryService } from '@/services/inventoryService';
import { useAuthStore } from '@/store/authStore';

interface LineItem {
  productId: string;
  quantity: number;
}

function apiError(error: unknown) {
  if (axios.isAxiosError<{ error?: string }>(error)) return error.response?.data?.error;
  return undefined;
}

export function CreateInvoice() {
  const queryClient = useQueryClient();
  const currency = useAuthStore((state) => state.user?.setting?.currency ?? 'MMK');
  const money = new Intl.NumberFormat(undefined, { style: 'currency', currency });
  const products = useQuery({ queryKey: ['products'], queryFn: inventoryService.listProducts });
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState(0);
  const [items, setItems] = useState<LineItem[]>([{ productId: '', quantity: 1 }]);

  const productsById = useMemo(
    () => new Map(products.data?.map((product) => [product.id, product]) ?? []),
    [products.data],
  );
  const subtotal = items.reduce((sum, item) => {
    const product = productsById.get(item.productId);
    return sum + (product ? Number(product.price) * item.quantity : 0);
  }, 0);
  const total = Math.max(0, subtotal - discount);

  const createInvoice = useMutation({
    mutationFn: invoiceService.create,
    onSuccess: async (invoice) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['invoices'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
      window.location.assign(`/invoices/${invoice.id}`);
    },
  });

  const updateItem = (index: number, change: Partial<LineItem>) =>
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...change } : item));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    createInvoice.mutate({ customerName, customerPhone, discount, items });
  };

  return (
    <main className="page-container">
      <form className="max-w-5xl" onSubmit={submit}>
        <PageHeader eyebrow="Invoices" title="Create invoice" description="Select products and record a new customer sale." />

        <Card className="mt-8">
          <h2 className="mb-4 text-lg font-bold">Customer information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-1 block text-sm font-medium">Customer name</span>
              <Input value={customerName} onChange={(event) => setCustomerName(event.target.value)} maxLength={100} required />
            </label>
            <label>
              <span className="mb-1 block text-sm font-medium">Phone</span>
              <Input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} maxLength={30} />
            </label>
          </div>
        </Card>

        <Card className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Products</h2>
            <Button type="button" onClick={() => setItems((current) => [...current, { productId: '', quantity: 1 }])}>
              Add item
            </Button>
          </div>
          {products.isError && <p className="text-sm text-red-600">Products could not be loaded.</p>}
          <div className="space-y-3">
            {items.map((item, index) => {
              const product = productsById.get(item.productId);
              const selectedElsewhere = new Set(items.filter((_, itemIndex) => itemIndex !== index).map((line) => line.productId));
              return (
                <div className="grid gap-3 rounded-xl border bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60 sm:grid-cols-[1fr_120px_130px_auto] sm:items-end" key={index}>
                  <label>
                    <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Product</span>
                    <select
                      className="control"
                      value={item.productId}
                      onChange={(event) => updateItem(index, { productId: event.target.value, quantity: 1 })}
                      required
                    >
                      <option value="">Select product</option>
                      {products.data?.map((option) => (
                        <option key={option.id} value={option.id} disabled={selectedElsewhere.has(option.id) || option.quantity === 0}>
                          {option.name} ({option.quantity} in stock)
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Quantity</span>
                    <Input
                      type="number"
                      min="1"
                      max={product?.quantity}
                      value={item.quantity}
                      onChange={(event) => updateItem(index, { quantity: Number(event.target.value) })}
                      required
                    />
                  </label>
                  <div>
                    <p className="mb-1 text-xs font-medium text-slate-600">Line total</p>
                    <p className="rounded-lg px-3 py-2 font-semibold">{money.format((product ? Number(product.price) : 0) * item.quantity)}</p>
                  </div>
                  <Button
                    type="button"
                    className="bg-red-600"
                    disabled={items.length === 1}
                    onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                  >
                    Remove
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="mt-6 ml-auto max-w-md">
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><strong>{money.format(subtotal)}</strong></div>
            <label className="flex items-center justify-between gap-6">
              <span className="text-slate-600">Discount</span>
              <Input className="max-w-40 text-right" type="number" min="0" max={subtotal} step="0.01" value={discount} onChange={(event) => setDiscount(Number(event.target.value))} />
            </label>
            <div className="flex justify-between border-t pt-3 text-lg"><strong>Total</strong><strong>{money.format(total)}</strong></div>
          </div>
        </Card>

        {createInvoice.isError && (
          <Alert className="mt-4" tone="error">{apiError(createInvoice.error) ?? 'Invoice could not be created.'}</Alert>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <a className="rounded-xl border px-4 py-2 font-medium hover:bg-white dark:border-slate-700 dark:hover:bg-slate-800" href="/invoices">Cancel</a>
          <Button type="submit" disabled={createInvoice.isPending || products.isLoading}>
            {createInvoice.isPending ? 'Creating…' : 'Create invoice'}
          </Button>
        </div>
      </form>
    </main>
  );
}
