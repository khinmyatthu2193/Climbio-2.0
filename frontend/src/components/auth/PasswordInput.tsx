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
        <span className="input-icon-frame left-3.5 w-5"><LockKeyhole className="size-[18px]" aria-hidden="true" /></span>
        <input
          {...props}
          id={inputId}
          type={visible ? 'text' : 'password'}
          className="auth-control pl-11 pr-12"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute inset-y-0 right-2 my-auto grid size-9 place-items-center rounded-xl text-slate-400 transition hover:bg-violet-50 hover:text-violet-700 dark:text-slate-500 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="size-[18px]" aria-hidden="true" /> : <Eye className="size-[18px]" aria-hidden="true" />}
        </button>
      </span>
    </label>
  );
}
