import climbioLogo from '@/assets/branding/climbio-logo.png';

export function LandingLogo({ footer = false }: { footer?: boolean }) {
  return (
    <span className={`relative block shrink-0 overflow-hidden ${footer ? 'h-11 w-[165px]' : 'h-10 w-[150px]'}`}>
      <img
        src={climbioLogo}
        alt="Climbio"
        className={`absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 dark:brightness-0 dark:invert ${footer ? 'w-[286px]' : 'w-[260px]'}`}
      />
    </span>
  );
}
