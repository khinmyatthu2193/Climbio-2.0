import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Boxes, Package, WalletCards } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/authService';
import { dashboardService } from '@/services/dashboardService';
import { useAuthStore } from '@/store/authStore';

export function DashboardPage() {
  const { user, clearSession } = useAuthStore();
  const dashboard = useQuery({ queryKey: ['dashboard', 'summary'], queryFn: dashboardService.summary });
  const currency = user?.setting?.currency ?? 'MMK';
  const currencyFormatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'MMK' ? 0 : 2,
  });
  const compactCurrency = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  });
  const logout = async () => { try { await authService.logout(); } finally { clearSession(); } };

  const cards = [
    { label: 'Total Products', value: dashboard.data?.totalProducts, icon: Package, tone: 'bg-emerald-100 text-emerald-700' },
    { label: 'Total Stock Quantity', value: dashboard.data?.totalStock, icon: Boxes, tone: 'bg-sky-100 text-sky-700' },
    { label: 'Low Stock Products', value: dashboard.data?.lowStockCount, icon: AlertTriangle, tone: 'bg-amber-100 text-amber-700' },
    {
      label: 'Total Sales Revenue',
      value: dashboard.data ? currencyFormatter.format(dashboard.data.totalRevenue) : undefined,
      icon: WalletCards,
      tone: 'bg-violet-100 text-violet-700',
    },
  ];

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <nav className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xl font-black text-primary">Climbio</span>
          <div className="flex flex-wrap items-center gap-3">
            <a className="font-medium text-primary" href="/products">Inventory</a>
            <a className="font-medium text-primary" href="/invoices">Invoices</a>
            <a className="font-medium text-primary" href="/profile">Profile</a>
            <Button onClick={logout}>Log out</Button>
          </div>
        </nav>

        <section className="mt-12">
          <p className="font-medium text-primary">{user?.role.toLowerCase()} workspace</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Good to see you, {user?.name}.</h1>
          <p className="mt-3 text-slate-600">Here is what is happening in {user?.shopName} today.</p>
        </section>

        {dashboard.isError && (
          <Card className="mt-8 border-red-200 bg-red-50 text-red-700">
            Dashboard data could not be loaded. Please refresh and try again.
          </Card>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, icon: Icon, tone }) => (
            <Card key={label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-bold">{value ?? (dashboard.isLoading ? '…' : '0')}</p>
              </div>
              <div className={`rounded-2xl p-3 ${tone}`}><Icon aria-hidden="true" size={24} /></div>
            </Card>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="mb-6">
              <h2 className="text-lg font-bold">Product Stock</h2>
              <p className="text-sm text-slate-500">Products with the highest available quantity</p>
            </div>
            {dashboard.data?.productStock.length === 0 ? (
              <div className="grid h-72 place-items-center text-sm text-slate-500">Add products to see stock levels.</div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboard.data?.productStock ?? []} margin={{ left: -20, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} interval={0} tickFormatter={(name) => String(name).slice(0, 12)} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip cursor={{ fill: '#ecfdf5' }} />
                    <Bar dataKey="quantity" name="Stock" fill="#237a57" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <Card>
            <div className="mb-6">
              <h2 className="text-lg font-bold">Sales Overview</h2>
              <p className="text-sm text-slate-500">Paid invoice revenue over the last six months</p>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboard.data?.salesOverview ?? []} margin={{ left: 4, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(value) => compactCurrency.format(Number(value))} />
                  <Tooltip formatter={(value) => [currencyFormatter.format(Number(value ?? 0)), 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#237a57" strokeWidth={3} dot={{ fill: '#237a57', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
