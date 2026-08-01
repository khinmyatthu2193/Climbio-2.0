import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';

interface InvoiceSummaryProps {
  subtotal: number;
  discount: number;
  total: number;
  money: Intl.NumberFormat;
  editableDiscount?: boolean;
  embedded?: boolean;
  onDiscountChange?: (discount: number) => void;
  className?: string;
}

export function InvoiceSummary({ subtotal, discount, total, money, editableDiscount = false, embedded = false, onDiscountChange, className }: InvoiceSummaryProps) {
  return (
    <section className={cn(
      embedded ? 'border-t border-slate-700 pt-5' : 'rounded-lg border border-slate-700/80 bg-slate-900/80 p-5 shadow-sm',
      className,
    )}>
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-6">
          <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{money.format(subtotal)}</span>
        </div>
        <label className="flex items-center justify-between gap-6">
          <span className="text-slate-500 dark:text-slate-400">Discount</span>
          {editableDiscount ? (
            <Input
              className="h-10 min-h-10 max-w-40 text-right"
              type="number"
              min="0"
              max={subtotal}
              step="0.01"
              value={discount}
              onChange={(event) => onDiscountChange?.(Number(event.target.value))}
            />
          ) : (
            <span className="font-semibold text-slate-900 dark:text-slate-100">- {money.format(discount)}</span>
          )}
        </label>
        <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
          <div className="flex items-end justify-between gap-6">
            <span className="font-bold text-slate-900 dark:text-white">Total</span>
            <span className="text-xl font-black text-violet-600 dark:text-violet-300">{money.format(total)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
