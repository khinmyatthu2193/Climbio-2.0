import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';
import { Card } from '@/components/common/Card';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { Alert } from '@/components/ui/Alert';

export function AdminUsersPage() {
  const [search, setSearch] = useState(''); const users = useQuery({ queryKey: ['admin-users', search], queryFn: () => adminService.users({ search }) });
  return <main className="page-container"><PageHeader eyebrow="Administration" title="Users" description="View platform accounts without exposing credentials or session data." /><Card className="mt-6"><input className="control" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users" /></Card>{users.isLoading ? <LoadingState label="Loading users" /> : users.isError || !users.data ? <Alert className="mt-4" tone="error">Could not load users.</Alert> : <Card className="mt-4 overflow-x-auto p-0"><table className="w-full min-w-[680px] text-left"><thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800"><tr><th className="px-5 py-4">User</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">Account</th><th className="px-5 py-4">Created</th></tr></thead><tbody className="divide-y dark:divide-slate-800">{users.data.items.map((user) => <tr key={user.id}><td className="px-5 py-4"><p className="font-semibold">{user.name}</p><p className="text-sm text-slate-500">{user.email}</p></td><td className="px-5 py-4">{user.role}</td><td className="px-5 py-4">{user.accountStatus}</td><td className="px-5 py-4 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></Card>}</main>;
}
