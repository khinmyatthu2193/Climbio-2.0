import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthBootstrap } from '@/hooks/useAuthBootstrap';
import { AuthPage } from '@/pages/AuthPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ProductForm } from '@/pages/products/ProductForm';
import { ProductList } from '@/pages/products/ProductList';
import { CreateInvoice } from '@/pages/invoices/CreateInvoice';
import { InvoiceDetail } from '@/pages/invoices/InvoiceDetail';
import { InvoiceList } from '@/pages/invoices/InvoiceList';
import { PublicShop } from '@/pages/public/PublicShop';
import { MyPublicStore } from '@/pages/store/MyPublicStore';
import { AppShell } from '@/components/layout/AppShell';
import { useTheme } from '@/hooks/useTheme';

export default function App() {
  useTheme();
  useAuthBootstrap();
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/login') return <AuthPage register={false} />;
  if (path === '/register') return <AuthPage register />;
  const publicShop = path.match(/^\/shop\/([a-z0-9-]+)$/i);
  if (publicShop) return <PublicShop slug={publicShop[1].toLowerCase()} />;
  const protectedPage = (page: React.ReactNode, roles?: Array<'ADMIN' | 'MANAGER' | 'STAFF'>) => (
    <ProtectedRoute roles={roles}><AppShell>{page}</AppShell></ProtectedRoute>
  );
  if (path === '/profile') return protectedPage(<ProfilePage />);
  if (path === '/my-store') return protectedPage(<MyPublicStore />, ['ADMIN']);
  if (path === '/products') return protectedPage(<ProductList />);
  if (path === '/products/new') return protectedPage(<ProductForm />);
  if (path === '/invoices') return protectedPage(<InvoiceList />);
  if (path === '/invoices/new') return protectedPage(<CreateInvoice />);
  const invoiceDetail = path.match(/^\/invoices\/([0-9a-f-]+)$/i);
  if (invoiceDetail) return protectedPage(<InvoiceDetail invoiceId={invoiceDetail[1]} />);
  const productEdit = path.match(/^\/products\/([0-9a-f-]+)\/edit$/i);
  if (productEdit) return protectedPage(<ProductForm productId={productEdit[1]} />);
  return protectedPage(<DashboardPage />);
}
