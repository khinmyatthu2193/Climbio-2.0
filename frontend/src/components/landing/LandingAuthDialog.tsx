import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import type { LandingAuthMode } from '@/pages/LandingPage';

export function LandingAuthDialog({ mode, onClose, onChangeMode }: { mode: LandingAuthMode | null; onClose: () => void; onChangeMode: (mode: LandingAuthMode) => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mode) return undefined;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', handleKeyDown); previouslyFocused?.focus(); };
  }, [mode, onClose]);

  if (!mode) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-stone-950/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="landing-auth-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={dialogRef} tabIndex={-1} className="relative my-6 w-full max-w-[500px] outline-none">
        <span id="landing-auth-title" className="sr-only">{mode === 'login' ? 'Sign in to Climbio' : 'Create a Climbio account'}</span>
        <button type="button" onClick={onClose} className="absolute right-5 top-5 z-10 grid size-9 place-items-center rounded-full bg-stone-100 text-stone-500 transition hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400" aria-label="Close authentication form">
          <X className="size-4" />
        </button>
        {mode === 'login' ? <LoginForm /> : <RegisterForm />}
        <p className="mt-4 text-center text-sm text-stone-400">{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}<button type="button" onClick={() => onChangeMode(mode === 'login' ? 'signup' : 'login')} className="font-medium text-violet-300 hover:underline">{mode === 'login' ? 'Create account' : 'Sign in'}</button></p>
      </div>
    </div>
  );
}
