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
        <span className="input-icon-frame left-3.5 w-5">{icon}</span>
        <input
          {...props}
          id={inputId}
          className="auth-control pl-11 pr-4"
        />
      </span>
    </label>
  );
}
