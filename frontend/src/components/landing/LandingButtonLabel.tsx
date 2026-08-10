import type { ReactNode } from 'react';

export function LandingButtonLabel({ children }: { children: ReactNode }) {
  return <span className="translate-y-px leading-none">{children}</span>;
}
