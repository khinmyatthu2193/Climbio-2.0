import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import type { Currency } from '@/types/auth';

export function ProfilePage() {
  const user = useAuthStore((state) => state.user)!;
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [profile, setProfile] = useState({
    name: user.name,
    shopName: user.shopName,
    phone: user.phone ?? '',
    shopAddress: user.shopAddress ?? '',
    currency: user.setting?.currency ?? 'MMK' as Currency,
    invoiceFooter: user.setting?.invoiceFooter ?? '',
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const profileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: setUser,
  });
  const passwordMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => { clearSession(); window.location.replace('/login'); },
  });
  const logoMutation = useMutation({ mutationFn: authService.uploadLogo, onSuccess: setUser });
  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    profileMutation.mutate({
      ...profile,
      phone: profile.phone || null,
      shopAddress: profile.shopAddress || null,
      invoiceFooter: profile.invoiceFooter || null,
    });
  };
  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div><a className="text-sm font-medium text-primary" href="/">← Dashboard</a><h1 className="mt-2 text-3xl font-bold">Profile & shop settings</h1></div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-primary">{user.role}</span>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <h2 className="mb-4 text-lg font-bold">Business profile</h2>
            <form className="space-y-3" onSubmit={saveProfile}>
              <Input aria-label="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
              <Input aria-label="Shop name" value={profile.shopName} onChange={(e) => setProfile({ ...profile, shopName: e.target.value })} required />
              <Input aria-label="Phone" placeholder="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              <Input aria-label="Shop address" placeholder="Shop address" value={profile.shopAddress} onChange={(e) => setProfile({ ...profile, shopAddress: e.target.value })} />
              <select className="w-full rounded-lg border bg-white px-3 py-2" value={profile.currency} onChange={(e) => setProfile({ ...profile, currency: e.target.value as Currency })}>
                <option value="MMK">MMK</option><option value="USD">USD</option><option value="THB">THB</option>
              </select>
              <textarea className="min-h-24 w-full rounded-lg border px-3 py-2" placeholder="Invoice footer" value={profile.invoiceFooter} onChange={(e) => setProfile({ ...profile, invoiceFooter: e.target.value })} />
              {profileMutation.isSuccess && <p className="text-sm text-green-700">Profile saved.</p>}
              {profileMutation.isError && <p className="text-sm text-red-600">Could not save your profile.</p>}
              <Button disabled={profileMutation.isPending}>{profileMutation.isPending ? 'Saving…' : 'Save changes'}</Button>
            </form>
          </Card>
          <div className="space-y-6">
            <Card>
              <h2 className="mb-4 text-lg font-bold">Shop logo</h2>
              {user.shopLogo && <img className="mb-4 h-20 w-20 rounded-xl object-cover" src={user.shopLogo} alt="Shop logo" />}
              <Input aria-label="Upload shop logo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) logoMutation.mutate(file);
              }} />
              <p className="mt-2 text-xs text-slate-500">JPG, PNG, or WebP. Maximum 2 MB.</p>
              {logoMutation.isPending && <p className="mt-2 text-sm">Uploading…</p>}
              {logoMutation.isError && <p className="mt-2 text-sm text-red-600">Logo upload failed. Check the Storage bucket configuration.</p>}
            </Card>
            <Card>
              <h2 className="mb-4 text-lg font-bold">Change password</h2>
              <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); passwordMutation.mutate(passwords); }}>
                <Input type="password" autoComplete="current-password" placeholder="Current password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
                <Input type="password" autoComplete="new-password" placeholder="New password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required />
                {passwordMutation.isError && <p className="text-sm text-red-600">Password change failed. Check your current password and requirements.</p>}
                <Button disabled={passwordMutation.isPending}>{passwordMutation.isPending ? 'Updating…' : 'Change password'}</Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
