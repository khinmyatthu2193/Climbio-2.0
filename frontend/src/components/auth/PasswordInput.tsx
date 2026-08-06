import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export function PasswordInput({ label, id, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const inputId = id ?? props.name ?? 'password';

  return (
    <label className="block" htmlFor={inputId}>
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      <span className="relative block">
        <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate-400 dark:text-slate-500" aria-hidden="true" />
        <input
          {...props}
          id={inputId}
          type={visible ? 'text' : 'password'}
          className="min-h-[54px] w-full rounded-2xl border border-slate-200 bg-[#edf3ff] py-3 pl-11 pr-12 text-sm text-slate-900 shadow-inner shadow-slate-900/[0.02] transition placeholder:text-slate-400 hover:border-violet-300 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-violet-500 dark:focus:border-violet-400 dark:focus:bg-slate-950 dark:focus:ring-violet-500/15"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-xl text-slate-400 transition hover:bg-violet-50 hover:text-violet-700 dark:text-slate-500 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="size-[18px]" aria-hidden="true" /> : <Eye className="size-[18px]" aria-hidden="true" />}
        </button>
      </span>
    </label>
  );
}
