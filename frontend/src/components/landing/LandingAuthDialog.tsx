import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import type { LandingAuthMode } from '@/pages/LandingPage';

export function LandingAuthDialog({ mode, onClose, onChangeMode }: { mode: LandingAuthMode | null; onClose: () => void; onChangeMode: (mode: LandingAuthMode) => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mode) return undefined;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', handleKeyDown); previouslyFocused?.focus(); };
  }, [mode, onClose]);

  if (!mode) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/65 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="landing-auth-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="relative my-6 w-full max-w-[540px]">
        <span id="landing-auth-title" className="sr-only">{mode === 'login' ? 'Sign in to Climbio' : 'Create a Climbio account'}</span>
        <button ref={closeButtonRef} type="button" onClick={onClose} className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300" aria-label="Close authentication form"><X className="size-5" /></button>
        {mode === 'login' ? <LoginForm /> : <RegisterForm />}
        <p className="mt-4 text-center text-sm text-white">{mode === 'login' ? 'Don’t have an account?' : 'Already have an account?'}{' '}<button type="button" onClick={() => onChangeMode(mode === 'login' ? 'signup' : 'login')} className="font-bold text-violet-200 underline-offset-4 hover:underline">{mode === 'login' ? 'Create account' : 'Sign in'}</button></p>
      </div>
    </div>
  );
}
