import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { AlertCircle, LoaderCircle, Mail, Phone, Store, UserRound } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/common/Card';
import { AuthInput } from '@/components/auth/AuthInput';
import { PasswordInput } from '@/components/auth/PasswordInput';

function registrationError(error: unknown) {
  if (axios.isAxiosError<{ error?: string }>(error)) return error.response?.data?.error ?? 'Unable to reach the server. Please try again.';
  return 'Registration failed. Please try again.';
}

export function RegisterForm() {
  const [form, setForm] = useState({ name: '', shopName: '', email: '', phone: '', password: '' });
  const setSession = useAuthStore((state) => state.setSession);
  const register = useMutation({
    mutationFn: authService.register,
    onSuccess: ({ user, accessToken }) => setSession(user, accessToken),
  });
  const update = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    register.mutate({ ...form, phone: form.phone || undefined });
  };

  return (
    <Card className="w-full max-w-lg rounded-3xl border-white/80 bg-white/90 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/90 dark:shadow-black/30 sm:p-8">
      <p className="text-sm font-bold text-violet-600 dark:text-violet-300">GET STARTED</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Create your workspace</h1>
      <p className="mb-7 mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">Set up your shop and start organizing your business today.</p>
      <form className="space-y-4" onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthInput label="Your name" name="name" autoComplete="name" placeholder="Your full name" value={form.name} onChange={update('name')} icon={<UserRound className="size-[18px]" />} required />
          <AuthInput label="Shop name" name="shopName" placeholder="Your business name" value={form.shopName} onChange={update('shopName')} icon={<Store className="size-[18px]" />} required />
        </div>
        <AuthInput label="Email address" name="email" autoComplete="email" type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} icon={<Mail className="size-[18px]" />} required />
        <AuthInput label="Phone number" name="phone" autoComplete="tel" type="tel" placeholder="Optional" value={form.phone} onChange={update('phone')} icon={<Phone className="size-[18px]" />} />
        <PasswordInput label="Password" name="password" autoComplete="new-password" placeholder="Create a strong password" value={form.password} onChange={update('password')} required />
        <p className="rounded-xl bg-violet-50 px-3 py-2 text-xs leading-5 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">Use 8+ characters with uppercase, lowercase, and a number.</p>
        {register.isError && <p className="flex gap-2 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300" role="alert"><AlertCircle className="mt-0.5 size-4 shrink-0" />{registrationError(register.error)}</p>}
        <Button className="min-h-12 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-base shadow-lg shadow-violet-600/20 hover:from-violet-700 hover:to-purple-700 active:scale-[0.99]" disabled={register.isPending}>
          {register.isPending && <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />}
          {register.isPending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </Card>
  );
}
