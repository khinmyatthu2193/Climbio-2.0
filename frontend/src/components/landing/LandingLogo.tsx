import climbioLogo from '@/assets/branding/climbio-logo-new.png';

export function LandingLogo({ footer = false }: { footer?: boolean }) {
  return (
    <span className={`block shrink-0 ${footer ? 'h-11 w-[165px]' : 'h-10 w-[150px]'}`}>
      <img
        src={climbioLogo}
        alt="Climbio"
        className="h-full w-full object-contain object-left"
      />
    </span>
  );
}
