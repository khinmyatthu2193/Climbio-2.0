import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/common/PageHeader';
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
    <main className="page-container">
      <div className="max-w-5xl">
        <PageHeader eyebrow="Account" title="Profile & shop settings" description="Manage your business identity, preferences, and account security." actions={<Badge className="bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">{user.role}</Badge>} />
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <h2 className="mb-4 text-lg font-bold">Business profile</h2>
            <form className="space-y-3" onSubmit={saveProfile}>
              <Input aria-label="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
              <Input aria-label="Shop name" value={profile.shopName} onChange={(e) => setProfile({ ...profile, shopName: e.target.value })} required />
              <Input aria-label="Phone" placeholder="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              <Input aria-label="Shop address" placeholder="Shop address" value={profile.shopAddress} onChange={(e) => setProfile({ ...profile, shopAddress: e.target.value })} />
              <select className="control" value={profile.currency} onChange={(e) => setProfile({ ...profile, currency: e.target.value as Currency })}>
                <option value="MMK">MMK</option><option value="USD">USD</option><option value="THB">THB</option>
              </select>
              <textarea className="control min-h-24 resize-y" placeholder="Invoice footer" value={profile.invoiceFooter} onChange={(e) => setProfile({ ...profile, invoiceFooter: e.target.value })} />
              {profileMutation.isSuccess && <Alert tone="success">Profile saved.</Alert>}
              {profileMutation.isError && <Alert tone="error">Could not save your profile.</Alert>}
              <Button type="submit" disabled={profileMutation.isPending}>{profileMutation.isPending ? 'Saving…' : 'Save changes'}</Button>
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
                <Button type="submit" disabled={passwordMutation.isPending}>{passwordMutation.isPending ? 'Updating…' : 'Change password'}</Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
