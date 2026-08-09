import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function IconLabel({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return <><span className="flex size-5 shrink-0 items-center justify-center leading-none" aria-hidden="true"><Icon className="block size-[18px] shrink-0" /></span><span className="leading-none">{children}</span></>;
}
