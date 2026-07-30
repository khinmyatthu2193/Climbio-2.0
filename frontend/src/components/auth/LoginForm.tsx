import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/common/Card';

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
    <Card className="w-full max-w-md">
      <h1 className="text-2xl font-bold">Welcome back</h1>
      <p className="mb-6 mt-1 text-sm text-slate-600">Manage your business in one calm workspace.</p>
      <form className="space-y-4" onSubmit={submit}>
        <Input aria-label="Email" autoComplete="email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input aria-label="Password" autoComplete="current-password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {login.isError && <p className="text-sm text-red-600">Login failed. Check your details and try again.</p>}
        <Button className="w-full" disabled={login.isPending}>{login.isPending ? 'Signing in…' : 'Sign in'}</Button>
      </form>
    </Card>
  );
}
