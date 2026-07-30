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

export default function App() {
  useAuthBootstrap();
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/login') return <AuthPage register={false} />;
  if (path === '/register') return <AuthPage register />;
  if (path === '/profile') return <ProtectedRoute><ProfilePage /></ProtectedRoute>;
  if (path === '/products') return <ProtectedRoute><ProductList /></ProtectedRoute>;
  if (path === '/products/new') return <ProtectedRoute><ProductForm /></ProtectedRoute>;
  if (path === '/invoices') return <ProtectedRoute><InvoiceList /></ProtectedRoute>;
  if (path === '/invoices/new') return <ProtectedRoute><CreateInvoice /></ProtectedRoute>;
  const invoiceDetail = path.match(/^\/invoices\/([0-9a-f-]+)$/i);
  if (invoiceDetail) return <ProtectedRoute><InvoiceDetail invoiceId={invoiceDetail[1]} /></ProtectedRoute>;
  const productEdit = path.match(/^\/products\/([0-9a-f-]+)\/edit$/i);
  if (productEdit) return <ProtectedRoute><ProductForm productId={productEdit[1]} /></ProtectedRoute>;
  return <ProtectedRoute><DashboardPage /></ProtectedRoute>;
}
