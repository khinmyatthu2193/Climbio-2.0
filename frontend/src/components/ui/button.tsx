import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn('rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50', className)} {...props} />;
}
