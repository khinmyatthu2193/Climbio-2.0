import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-2xl border bg-white p-6 shadow-sm', className)} {...props} />;
}
