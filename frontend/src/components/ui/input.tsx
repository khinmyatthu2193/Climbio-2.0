import type { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('w-full rounded-lg border bg-white px-3 py-2 outline-none ring-primary focus:ring-2', className)} {...props} />;
}
