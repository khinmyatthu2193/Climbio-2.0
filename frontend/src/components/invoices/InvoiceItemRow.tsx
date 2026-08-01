import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Product } from '@/types/inventory';

interface InvoiceItemRowProps {
  productId: string;
  quantity: number;
  product?: Product;
  products?: Product[];
  selectedElsewhere: Set<string>;
  money: Intl.NumberFormat;
  canRemove: boolean;
  onChange: (change: { productId?: string; quantity?: number }) => void;
  onRemove: () => void;
}

export function InvoiceItemRow({ productId, quantity, product, products, selectedElsewhere, money, canRemove, onChange, onRemove }: InvoiceItemRowProps) {
  const price = product ? Number(product.price) : 0;

  return (
    <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/45 lg:grid-cols-[minmax(220px,1fr)_96px_120px_140px_44px] lg:items-center">
      <label>
        <span className="mb-1 block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Product</span>
        <select className="control min-h-10 py-2" value={productId} onChange={(event) => onChange({ productId: event.target.value, quantity: 1 })} required>
          <option value="">Select product</option>
          {products?.map((option) => (
            <option key={option.id} value={option.id} disabled={selectedElsewhere.has(option.id) || option.quantity === 0}>
              {option.name} ({option.quantity} in stock)
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="mb-1 block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Qty</span>
        <Input className="min-h-10 py-2" type="number" min="1" max={product?.quantity} value={quantity} onChange={(event) => onChange({ quantity: Number(event.target.value) })} required />
      </label>
      <div>
        <span className="mb-1 block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Price</span>
        <p className="min-h-10 rounded-lg border border-transparent px-1 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{money.format(price)}</p>
      </div>
      <div>
        <span className="mb-1 block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Total</span>
        <p className="min-h-10 rounded-lg px-1 py-2 text-sm font-bold text-slate-950 dark:text-white">{money.format(price * quantity)}</p>
      </div>
      <Button type="button" variant="ghost" size="sm" className="h-10 w-10 justify-self-end rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10" disabled={!canRemove} onClick={onRemove} aria-label="Remove item">
        <Trash2 size={16} aria-hidden="true" />
      </Button>
    </div>
  );
}
