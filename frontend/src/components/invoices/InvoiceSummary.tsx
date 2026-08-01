import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';

interface InvoiceSummaryProps {
  subtotal: number;
  discount: number;
  total: number;
  money: Intl.NumberFormat;
  discountPercentage?: number;
  editableDiscount?: boolean;
  embedded?: boolean;
  onDiscountPercentageChange?: (discountPercentage: number) => void;
  className?: string;
}

export function InvoiceSummary({ subtotal, discount, total, money, discountPercentage = 0, editableDiscount = false, embedded = false, onDiscountPercentageChange, className }: InvoiceSummaryProps) {
  return (
    <section className={cn(
      embedded ? 'border-t border-slate-200 pt-5 dark:border-slate-700' : 'rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80',
      className,
    )}>
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-6">
          <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{money.format(subtotal)}</span>
        </div>
        <label className="flex items-center justify-between gap-6">
          <span className="text-slate-500 dark:text-slate-400">Discount{!editableDiscount && discountPercentage > 0 ? ` (${discountPercentage.toFixed(2).replace(/\.00$/, '')}%)` : ''}</span>
          {editableDiscount ? (
            <div className="relative max-w-40">
              <Input
                className="h-10 min-h-10 pr-9 text-right"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={discountPercentage}
                onChange={(event) => onDiscountPercentageChange?.(Math.min(100, Math.max(0, Number(event.target.value))))}
                aria-label="Discount percentage"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">%</span>
            </div>
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
