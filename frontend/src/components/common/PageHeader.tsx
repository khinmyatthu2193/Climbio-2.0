import type { ReactNode } from 'react';

export function PageHeader({ eyebrow, title, description, actions }: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-1 text-sm font-semibold text-violet-700 dark:text-violet-300">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
