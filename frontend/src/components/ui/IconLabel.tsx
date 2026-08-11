import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export const iconFrameClass = 'flex size-5 shrink-0 items-center justify-center';

export function IconLabel({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return <span className="icon-text-control gap-2"><span className={iconFrameClass} aria-hidden="true"><Icon className="size-[18px]" /></span><span className="control-text">{children}</span></span>;
}
