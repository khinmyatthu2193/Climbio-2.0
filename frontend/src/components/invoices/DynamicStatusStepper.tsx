import { Check } from 'lucide-react';
import type { InvoiceStatus, OrderType } from '@/types/invoice';
import { invoiceWorkflows } from '@/utils/invoiceStatus';
import { cn } from '@/utils/cn';
import { useLanguage } from '@/hooks/useLanguage';

export function DynamicStatusStepper({ currentStatus, orderType }: { currentStatus: InvoiceStatus; orderType: OrderType }) {
  const { translate } = useLanguage();
  const steps = invoiceWorkflows[orderType];
  const currentIndex = currentStatus === 'CANCELLED' ? -1 : steps.indexOf(currentStatus);
  return <div className="overflow-x-auto pb-1" aria-label={`${orderType.toLowerCase()} order progress`}><ol className="flex min-w-[600px] items-start">{steps.map((step, index) => { const complete = currentIndex > index; const current = currentIndex === index; return <li key={step} className="relative flex flex-1 flex-col items-center text-center before:absolute before:left-0 before:right-1/2 before:top-4 before:h-0.5 before:bg-slate-200 first:before:hidden after:absolute after:left-1/2 after:right-0 after:top-4 after:h-0.5 after:bg-slate-200 last:after:hidden dark:before:bg-slate-700 dark:after:bg-slate-700"><span className={cn('relative z-10 grid size-8 place-items-center rounded-full border-2 bg-white text-xs font-bold transition dark:bg-slate-900', complete && 'border-violet-600 bg-violet-600 text-white dark:bg-violet-600', current && 'border-violet-600 text-violet-700 ring-4 ring-violet-100 dark:text-violet-300 dark:ring-violet-500/15', !complete && !current && 'border-slate-300 text-slate-400 dark:border-slate-600')}>{complete ? <Check size={15} /> : index + 1}</span><span className={cn('mt-2 max-w-28 text-xs font-semibold', current || complete ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500')}>{translate(step)}</span></li>; })}</ol>{currentStatus === 'CANCELLED' && <p className="mt-3 text-center text-sm font-semibold text-red-600 dark:text-red-400">{translate('Cancelled')}</p>}</div>;
}
