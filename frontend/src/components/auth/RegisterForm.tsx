import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { AlertCircle, LoaderCircle, Mail, Phone, UserRound } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/common/Card';
import { AuthInput } from '@/components/auth/AuthInput';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { iconFrameClass } from '@/components/ui/IconLabel';

function registrationError(error: unknown) {
  if (axios.isAxiosError<{ error?: string; details?: Record<string, string[] | undefined> }>(error)) {
    const messages = Object.entries(error.response?.data?.details ?? {}).flatMap(([field, details]) => (details ?? []).map((detail) => `${field}: ${detail}`));
    if (messages.length) return messages.join(' ');
    return error.response?.data?.error ?? 'Unable to reach the server. Please try again.';
  }
  return 'Registration failed. Please try again.';
}

export function RegisterForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', termsAccepted: false });
  const [clientError, setClientError] = useState('');
  const setSession = useAuthStore((state) => state.setSession);
  const register = useMutation({
    mutationFn: authService.register,
    onSuccess: ({ user, accessToken }) => {
      setSession(user, accessToken);
      window.location.replace('/application');
    },
  });
  const update = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setClientError('');
    if (form.password !== form.confirmPassword) return setClientError('Passwords do not match.');
    if (!form.termsAccepted) return setClientError('You must accept the Terms and Privacy Policy.');
    register.mutate({ ...form, termsAccepted: true });
  };

  return (
    <Card className="w-full max-w-[500px] rounded-[28px] border-white bg-white p-8 shadow-[0_24px_70px_rgba(91,56,172,0.12)] dark:border-slate-700/80 dark:bg-slate-900 dark:shadow-black/30 sm:p-9">
      <p className="text-sm font-bold text-violet-600 dark:text-violet-300">STEP 1 OF 2</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Create your account</h1>
      <p className="mb-7 mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">Start with your account details. Your shop application comes next.</p>
      <form className="space-y-4" onSubmit={submit}>
        <AuthInput label="Full name" name="name" autoComplete="name" placeholder="Your full name" value={form.name} onChange={update('name')} icon={<UserRound className="size-[18px]" />} required />
        <AuthInput label="Email address" name="email" autoComplete="email" type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} icon={<Mail className="size-[18px]" />} required />
        <AuthInput label="Phone number" name="phone" autoComplete="tel" type="tel" placeholder="Your phone number" value={form.phone} onChange={update('phone')} icon={<Phone className="size-[18px]" />} required />
        <PasswordInput label="Password" name="password" autoComplete="new-password" placeholder="Create a strong password" value={form.password} onChange={update('password')} required />
        <PasswordInput label="Confirm password" name="confirmPassword" autoComplete="new-password" placeholder="Enter your password again" value={form.confirmPassword} onChange={update('confirmPassword')} required />
        <p className="rounded-xl bg-violet-50 px-3 py-2 text-xs leading-5 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">Use 8+ characters with uppercase, lowercase, and a number.</p>
        <label className="checkbox-label gap-3 text-sm leading-5 text-slate-600 dark:text-slate-300"><input className="size-4 shrink-0 accent-violet-600" type="checkbox" checked={form.termsAccepted} onChange={(event) => setForm((current) => ({ ...current, termsAccepted: event.target.checked }))} required /><span className="control-text">I agree to the Terms of Service and Privacy Policy.</span></label>
        {clientError && <p className="flex gap-2 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300" role="alert"><AlertCircle className="mt-0.5 size-4 shrink-0" />{clientError}</p>}
        {register.isError && <p className="flex gap-2 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300" role="alert"><AlertCircle className="mt-0.5 size-4 shrink-0" />{registrationError(register.error)}</p>}
        <Button className="min-h-[54px] w-full rounded-xl border border-violet-600 bg-violet-600 px-6 text-base shadow-[0_10px_24px_rgba(109,40,217,0.22)] hover:border-violet-700 hover:bg-violet-700 active:scale-[0.99]" disabled={register.isPending}>
          {register.isPending && <span className={iconFrameClass} aria-hidden="true"><LoaderCircle className="block size-[18px] animate-spin" /></span>}
          <span className="leading-5">{register.isPending ? 'Creating account…' : 'Create account'}</span>
        </Button>
      </form>
    </Card>
  );
}
