import type { ReactNode } from 'react';
import { iconFrameClass } from '@/components/ui/IconLabel';

export const landingIconTextFrameClass = `${iconFrameClass} -translate-y-1`;

export function LandingButtonLabel({ children }: { children: ReactNode }) {
  return <span className="leading-none">{children}</span>;
}
