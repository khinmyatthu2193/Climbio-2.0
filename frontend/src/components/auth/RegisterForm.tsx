import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/common/Card';

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
    <Card className="w-full max-w-md">
      <h1 className="text-2xl font-bold">Create your workspace</h1>
      <p className="mb-6 mt-1 text-sm text-slate-600">Start organizing your shop with Climbio.</p>
      <form className="space-y-3" onSubmit={submit}>
        <Input aria-label="Your name" autoComplete="name" placeholder="Your name" value={form.name} onChange={update('name')} required />
        <Input aria-label="Shop name" placeholder="Shop name" value={form.shopName} onChange={update('shopName')} required />
        <Input aria-label="Email" autoComplete="email" type="email" placeholder="Email" value={form.email} onChange={update('email')} required />
        <Input aria-label="Phone" autoComplete="tel" placeholder="Phone (optional)" value={form.phone} onChange={update('phone')} />
        <Input aria-label="Password" autoComplete="new-password" type="password" placeholder="Password" value={form.password} onChange={update('password')} required />
        <p className="text-xs text-slate-500">Use 8+ characters with uppercase, lowercase, and a number.</p>
        {register.isError && <p className="text-sm text-red-600">Registration failed. Review your details and try again.</p>}
        <Button className="w-full" disabled={register.isPending}>{register.isPending ? 'Creating…' : 'Create account'}</Button>
      </form>
    </Card>
  );
}
