import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export function EmptyState({ title, description, action, icon }: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center sm:py-16">
      <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
        {icon ?? <Inbox className="size-6" aria-hidden="true" />}
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
