import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, ChevronDown, Image, Languages, LockKeyhole, X } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/common/PageHeader';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { useLanguage } from '@/hooks/useLanguage';
import type { Currency } from '@/types/auth';

function Accordion({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <Card className="p-0 sm:p-0"><button type="button" className="flex w-full items-center gap-3 p-5 text-left sm:p-6" onClick={() => setOpen((current) => !current)} aria-expanded={open}><span className="rounded-xl bg-violet-50 p-2.5 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">{icon}</span><span className="flex-1 font-bold text-slate-950 dark:text-white">{title}</span><ChevronDown className={`size-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} /></button>{open && <div className="border-t border-slate-100 p-5 dark:border-slate-800 sm:p-6">{children}</div>}</Card>;
}

export function ProfilePage() {
  const { language, setLanguage, translate } = useLanguage();
  const user = useAuthStore((state) => state.user)!;
  const setUser = useAuthStore((state) => state.setUser);
  const [profile, setProfile] = useState({ name: user.name, shopName: user.shopName, phone: user.phone ?? '', shopAddress: user.shopAddress ?? '', currency: user.setting?.currency ?? 'MMK' as Currency, invoiceFooter: user.setting?.invoiceFooter ?? '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const profileMutation = useMutation({ mutationFn: authService.updateProfile, onSuccess: setUser });
  const logoMutation = useMutation({ mutationFn: authService.uploadLogo, onSuccess: setUser });
  const passwordMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => { setPasswordOpen(false); setPasswords({ currentPassword: '', newPassword: '' }); setPasswordSaved(true); },
  });

  useEffect(() => {
    if (!passwordSaved) return;
    const timer = window.setTimeout(() => setPasswordSaved(false), 3500);
    return () => window.clearTimeout(timer);
  }, [passwordSaved]);

  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    profileMutation.mutate({ ...profile, phone: profile.phone || null, shopAddress: profile.shopAddress || null, invoiceFooter: profile.invoiceFooter || null });
  };

  return <main className="page-container"><div className="mx-auto max-w-4xl"><PageHeader eyebrow="Account" title="Profile & shop settings" description="Manage your business identity, preferences, and account security." actions={<Badge className="bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">{user.role}</Badge>} />
    <Card className="mt-6"><div className="mb-6"><h2 className="text-lg font-bold">Business profile</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Keep your shop and invoice information up to date.</p></div><form className="grid gap-4 sm:grid-cols-2" onSubmit={saveProfile}><label><span className="field-label">Name</span><Input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required /></label><label><span className="field-label">Shop name</span><Input value={profile.shopName} onChange={(event) => setProfile({ ...profile, shopName: event.target.value })} required /></label><label><span className="field-label">Phone</span><Input value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} placeholder="Phone" /></label><label><span className="field-label">Shop address</span><Input value={profile.shopAddress} onChange={(event) => setProfile({ ...profile, shopAddress: event.target.value })} placeholder="Shop address" /></label><label><span className="field-label">Currency</span><select className="control" value={profile.currency} onChange={(event) => setProfile({ ...profile, currency: event.target.value as Currency })}><option value="MMK">MMK</option><option value="USD">USD</option><option value="THB">THB</option></select></label><label className="sm:col-span-2"><span className="field-label">Invoice footer</span><textarea className="control min-h-24 resize-y" value={profile.invoiceFooter} onChange={(event) => setProfile({ ...profile, invoiceFooter: event.target.value })} placeholder="Invoice footer" /></label><div className="sm:col-span-2">{profileMutation.isSuccess && <Alert className="mb-3" tone="success">Profile saved.</Alert>}{profileMutation.isError && <Alert className="mb-3" tone="error">Could not save your profile.</Alert>}<Button type="submit" disabled={profileMutation.isPending}>{profileMutation.isPending ? 'Saving…' : 'Save changes'}</Button></div></form></Card>

    <div className="mt-5 space-y-3"><Accordion title={translate('Application language')} icon={<Languages size={19} />}><p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{translate('Choose the language used throughout your workspace.')}</p><div className="grid grid-cols-2 gap-3">{(['en', 'my'] as const).map((option) => <button key={option} type="button" onClick={() => setLanguage(option)} className={`rounded-xl border p-3 text-sm font-bold transition ${language === option ? 'border-violet-500 bg-violet-50 text-violet-700 ring-1 ring-violet-500 dark:bg-violet-500/10 dark:text-violet-300' : 'border-slate-200 text-slate-600 hover:border-violet-300 dark:border-slate-700 dark:text-slate-300'}`}>{option === 'en' ? translate('English') : translate('Myanmar')}</button>)}</div></Accordion>
      <Accordion title="Shop logo" icon={<Image size={19} />}>{user.shopLogo && <img className="mb-4 size-24 rounded-2xl border border-slate-200 object-cover" src={user.shopLogo} alt="Shop logo" />}<Input aria-label="Upload shop logo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) logoMutation.mutate(file); }} /><p className="mt-2 text-xs text-slate-500">JPG, PNG, or WebP. Maximum 2 MB.</p>{logoMutation.isPending && <p className="mt-2 text-sm text-violet-600">Uploading…</p>}{logoMutation.isError && <Alert className="mt-3" tone="error">Logo upload failed. Check the Storage bucket configuration.</Alert>}</Accordion>
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><span className="rounded-xl bg-slate-100 p-2.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><LockKeyhole size={19} /></span><div><h2 className="font-bold">Password & security</h2><p className="mt-1 text-sm text-slate-500">Update your account password securely.</p></div></div><Button type="button" variant="outline" onClick={() => setPasswordOpen(true)}>Change password</Button></Card></div>
  </div>

  {passwordOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && !passwordMutation.isPending && setPasswordOpen(false)}><div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900" role="dialog" aria-modal="true" aria-labelledby="password-modal-title"><div className="flex items-start justify-between"><div><h2 id="password-modal-title" className="text-xl font-black">Change password</h2><p className="mt-1 text-sm text-slate-500">Choose a strong password for your account.</p></div><button type="button" className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setPasswordOpen(false)} disabled={passwordMutation.isPending} aria-label="Close"><X size={18} /></button></div><form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); passwordMutation.mutate(passwords); }}><label><span className="field-label">Current password</span><Input type="password" autoComplete="current-password" value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} required /></label><label><span className="field-label">New password</span><Input type="password" autoComplete="new-password" value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} required /></label>{passwordMutation.isError && <Alert tone="error">Password change failed. Check your current password and requirements.</Alert>}<div className="flex justify-end gap-3 pt-2"><Button type="button" variant="outline" onClick={() => setPasswordOpen(false)} disabled={passwordMutation.isPending}>Cancel</Button><Button type="submit" disabled={passwordMutation.isPending}>{passwordMutation.isPending ? 'Updating…' : 'Update password'}</Button></div></form></div></div>}
  {passwordSaved && <div className="fixed right-4 top-4 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-emerald-200 bg-white p-4 shadow-2xl dark:border-emerald-500/30 dark:bg-slate-900" role="status"><CheckCircle2 className="mt-0.5 shrink-0 text-emerald-500" size={19} /><div><p className="font-bold">Password updated</p><p className="mt-1 text-sm text-slate-500">Your new password has been saved successfully.</p></div></div>}
  </main>;
}
