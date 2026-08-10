import type { ReactNode } from 'react';

export function LandingButtonLabel({ children }: { children: ReactNode }) {
  return <span className="leading-none">{children}</span>;
}
