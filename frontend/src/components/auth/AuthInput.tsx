import type { InputHTMLAttributes, ReactNode } from 'react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: ReactNode;
}

export function AuthInput({ label, icon, id, ...props }: AuthInputProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <label className="block" htmlFor={inputId}>
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-3.5 top-1/2 flex size-5 -translate-y-[calc(50%+2.5px)] items-center justify-center text-slate-400 dark:text-slate-500">{icon}</span>
        <input
          {...props}
          id={inputId}
          className="min-h-[54px] w-full rounded-2xl border border-slate-200 bg-[#edf3ff] py-3 pl-11 pr-4 text-sm text-slate-900 shadow-inner shadow-slate-900/[0.02] transition placeholder:text-slate-400 hover:border-violet-300 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-violet-500 dark:focus:border-violet-400 dark:focus:bg-slate-950 dark:focus:ring-violet-500/15"
        />
      </span>
    </label>
  );
}
