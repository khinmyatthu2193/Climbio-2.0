import type { ReactNode } from 'react';
import { iconFrameClass } from '@/components/ui/IconLabel';

export const landingIconTextFrameClass = iconFrameClass;

export function LandingButtonLabel({ children }: { children: ReactNode }) {
  return <span className="control-text">{children}</span>;
}
