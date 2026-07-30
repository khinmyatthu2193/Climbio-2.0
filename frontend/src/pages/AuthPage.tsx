import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuthStore } from '@/store/authStore';

export function AuthPage({ register }: { register: boolean }) {
  const user = useAuthStore((state) => state.user);
  if (user) {
    window.location.replace('/');
    return null;
  }
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#dff5e9,transparent_45%)] p-6">
      <div className="flex w-full flex-col items-center gap-3">
        {register ? <RegisterForm /> : <LoginForm />}
        <a className="text-sm font-medium text-primary hover:underline" href={register ? '/login' : '/register'}>
          {register ? 'Already have an account? Sign in' : 'New to Climbio? Create an account'}
        </a>
      </div>
    </main>
  );
}
