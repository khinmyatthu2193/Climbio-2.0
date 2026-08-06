import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { AlertCircle, LoaderCircle, Mail } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/common/Card';
import { AuthInput } from '@/components/auth/AuthInput';
import { PasswordInput } from '@/components/auth/PasswordInput';

function loginError(error: unknown) {
  if (axios.isAxiosError<{ error?: string; details?: Record<string, string[] | undefined> }>(error)) {
    if (error.response?.status === 401) return 'Wrong password. Please try again.';
    const messages = Object.entries(error.response?.data?.details ?? {}).flatMap(([field, details]) => (details ?? []).map((detail) => `${field}: ${detail}`));
    if (messages.length) return messages.join(' ');
    return error.response?.data?.error ?? 'Unable to reach the server. Please try again.';
  }
  return 'Login failed. Please try again.';
}

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const setSession = useAuthStore((state) => state.setSession);
  const login = useMutation({
    mutationFn: authService.login,
    onSuccess: ({ user, accessToken }) => setSession(user, accessToken),
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <Card className="w-full max-w-[500px] rounded-[28px] border-white bg-white p-8 shadow-[0_24px_70px_rgba(91,56,172,0.12)] dark:border-slate-700/80 dark:bg-slate-900 dark:shadow-black/30 sm:p-9">
      <p className="text-sm font-extrabold text-violet-600 dark:text-violet-300">WELCOME BACK</p>
      <h1 className="mt-2 text-[32px] font-black tracking-[-0.035em] text-slate-950 dark:text-white">Sign in to Climbio</h1>
      <p className="mb-8 mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">Enter your details to continue managing your business.</p>
      <form className="space-y-5" onSubmit={submit}>
        <AuthInput label="Email address" name="email" autoComplete="email" type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} icon={<Mail className="size-[18px]" />} required />
        <PasswordInput label="Password" name="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        {login.isError && <p className="flex gap-2 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300" role="alert"><AlertCircle className="mt-0.5 size-4 shrink-0" />{loginError(login.error)}</p>}
        <Button className="min-h-[54px] w-full rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-base shadow-xl shadow-violet-600/25 hover:from-violet-700 hover:to-purple-700 active:scale-[0.99]" disabled={login.isPending}>
          {login.isPending && <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />}
          {login.isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </Card>
  );
}
