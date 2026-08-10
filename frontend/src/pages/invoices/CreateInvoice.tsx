import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { PageHeader } from '@/components/common/PageHeader';
import { InvoiceItemRow } from '@/components/invoices/InvoiceItemRow';
import { InvoiceSummary } from '@/components/invoices/InvoiceSummary';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/button';
import { IconLabel } from '@/components/ui/IconLabel';
import { Input } from '@/components/ui/input';
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
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [items, setItems] = useState<LineItem[]>([{ productId: '', quantity: 1 }]);

  const productsById = useMemo(
    () => new Map(products.data?.map((product) => [product.id, product]) ?? []),
    [products.data],
  );
  const subtotal = items.reduce((sum, item) => {
    const product = productsById.get(item.productId);
    return sum + (product ? Number(product.price) * item.quantity : 0);
  }, 0);
  const discount = Number((subtotal * discountPercentage / 100).toFixed(2));
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
      <form className="mx-auto max-w-6xl" onSubmit={submit}>
        <PageHeader eyebrow="Invoices" title="Create invoice" description="Select products and record a new customer sale." />

        <Card className="mt-6 p-4 sm:p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">Customer information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Customer name</span>
              <Input value={customerName} onChange={(event) => setCustomerName(event.target.value)} maxLength={100} required />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Phone</span>
              <Input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} maxLength={30} />
            </label>
          </div>
        </Card>

        <Card className="mt-4 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Invoice items</h2>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Add products and set their quantities.</p>
            </div>
            <Button type="button" variant="outline" onClick={() => setItems((current) => [...current, { productId: '', quantity: 1 }])}>
              <IconLabel icon={Plus}>Add item</IconLabel>
            </Button>
          </div>
          {products.isError && <p className="text-sm text-red-500">Products could not be loaded.</p>}
          <div className="space-y-2">
            {items.map((item, index) => {
              const product = productsById.get(item.productId);
              const selectedElsewhere = new Set(items.filter((_, itemIndex) => itemIndex !== index).map((line) => line.productId));
              return (
                <InvoiceItemRow
                  key={index}
                  productId={item.productId}
                  quantity={item.quantity}
                  product={product}
                  products={products.data}
                  selectedElsewhere={selectedElsewhere}
                  money={money}
                  canRemove={items.length > 1}
                  onChange={(change) => updateItem(index, change)}
                  onRemove={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                />
              );
            })}
          </div>
          <InvoiceSummary
            className="mt-5 ml-auto w-full md:max-w-md"
            subtotal={subtotal}
            discount={discount}
            total={total}
            money={money}
            discountPercentage={discountPercentage}
            editableDiscount
            embedded
            onDiscountPercentageChange={setDiscountPercentage}
          />
        </Card>

        {createInvoice.isError && (
          <Alert className="mt-4" tone="error">{apiError(createInvoice.error) ?? 'Invoice could not be created.'}</Alert>
        )}
        <div className="sticky bottom-0 z-20 mt-6 flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/90 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
          <a className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white hover:text-slate-950 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white" href="/invoices">Cancel</a>
          <Button type="submit" disabled={createInvoice.isPending || products.isLoading}>
            {createInvoice.isPending ? 'Creating...' : 'Create invoice'}
          </Button>
        </div>
      </form>
    </main>
  );
}
