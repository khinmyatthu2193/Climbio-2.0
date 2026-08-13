import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthBootstrap } from '@/hooks/useAuthBootstrap';
import { LandingPage } from '@/pages/LandingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ProductForm } from '@/pages/products/ProductForm';
import { ProductList } from '@/pages/products/ProductList';
import { CreateInvoice } from '@/pages/invoices/CreateInvoice';
import { InvoiceDetail } from '@/pages/invoices/InvoiceDetail';
import { InvoiceList } from '@/pages/invoices/InvoiceList';
import { PublicShop } from '@/pages/public/PublicShop';
import { PublicInvoice } from '@/pages/public/PublicInvoice';
import { MyPublicStore } from '@/pages/store/MyPublicStore';
import { AppShell } from '@/components/layout/AppShell';
import { useTheme } from '@/hooks/useTheme';
import { AIAdvisorPage } from '@/pages/AIAdvisorPage';
import { AIChatPage } from '@/pages/AIChatPage';
import { ApplicationStatusPage } from '@/pages/ApplicationStatusPage';
import { AdminShell } from '@/components/layout/AdminShell';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminApplicationsPage } from '@/pages/admin/AdminApplicationsPage';
import { AdminApplicationDetailPage } from '@/pages/admin/AdminApplicationDetailPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminAuditLogsPage } from '@/pages/admin/AdminAuditLogsPage';
import { UserManualPage } from '@/pages/UserManualPage';
import type { Role } from '@/types/auth';
import { useAuthStore } from '@/store/authStore';

export default function App() {
  useTheme();
  useAuthBootstrap();
  const { user, initialized } = useAuthStore();
  const [path, setPath] = useState(() => window.location.pathname.replace(/\/+$/, '') || '/');

  useEffect(() => {
    const updatePath = () => setPath(window.location.pathname.replace(/\/+$/, '') || '/');
    const handleLinkClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest('a');
      if (!link || link.target || link.hasAttribute('download')) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname && destination.search === window.location.search && destination.hash === window.location.hash) return;

      if (destination.pathname === window.location.pathname && destination.search === window.location.search && destination.hash) {
        event.preventDefault();
        window.history.pushState({}, '', destination);
        document.getElementById(destination.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      event.preventDefault();
      window.history.pushState({}, '', destination);
      updatePath();
      if (destination.hash) document.getElementById(destination.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.scrollTo({ top: 0, behavior: 'instant' });
    };

    window.addEventListener('popstate', updatePath);
    document.addEventListener('click', handleLinkClick);
    return () => {
      window.removeEventListener('popstate', updatePath);
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  if (path === '/account/login') return <LandingPage initialAuthMode="login" />;
  if (path === '/account/signup') return <LandingPage initialAuthMode="signup" />;
  if (path === '/' && initialized && !user) return <LandingPage />;
  const publicShop = path.match(/^\/shop\/([a-z0-9-]+)$/i);
  if (publicShop) return <PublicShop slug={publicShop[1].toLowerCase()} />;
  const publicInvoice = path.match(/^\/invoice\/([0-9a-f-]+)$/i);
  if (publicInvoice) return <PublicInvoice invoiceId={publicInvoice[1]} />;
  if (initialized && user?.role === 'ADMIN' && !path.startsWith('/admin')) {
    window.location.replace('/admin/dashboard');
    return null;
  }
  const protectedPage = (page: React.ReactNode, roles?: Role[], requireApproved = false) => (
    <ProtectedRoute roles={roles} requireApproved={requireApproved}><AppShell>{page}</AppShell></ProtectedRoute>
  );
  const adminPage = (page: React.ReactNode) => <ProtectedRoute roles={['ADMIN']}><AdminShell>{page}</AdminShell></ProtectedRoute>;
  if (path === '/admin/dashboard') return adminPage(<AdminDashboardPage />);
  if (path === '/admin/applications') return adminPage(<AdminApplicationsPage />);
  if (path === '/admin/shops') return adminPage(<AdminApplicationsPage mode="shops" />);
  if (path === '/admin/users') return adminPage(<AdminUsersPage />);
  if (path === '/admin/audit-logs') return adminPage(<AdminAuditLogsPage />);
  const adminApplication = path.match(/^\/admin\/applications\/([0-9a-f-]+)$/i);
  if (adminApplication) return adminPage(<AdminApplicationDetailPage shopId={adminApplication[1]} />);
  if (path === '/application') return <ProtectedRoute><ApplicationStatusPage /></ProtectedRoute>;
  if (path === '/profile') return protectedPage(<ProfilePage />, undefined, true);
  if (path === '/my-store') return protectedPage(<MyPublicStore />, undefined, true);
  if (path === '/ai-advisor') return protectedPage(<AIAdvisorPage />, undefined, true);
  if (path === '/ai-chat') return protectedPage(<AIChatPage />, undefined, true);
  if (path === '/user-manual') return protectedPage(<UserManualPage />, undefined, true);
  if (path === '/products') return protectedPage(<ProductList />, undefined, true);
  if (path === '/products/new') return protectedPage(<ProductForm />, undefined, true);
  if (path === '/invoices') return protectedPage(<InvoiceList />, undefined, true);
  if (path === '/invoices/new') return protectedPage(<CreateInvoice />, undefined, true);
  const invoiceDetail = path.match(/^\/invoices\/([0-9a-f-]+)$/i);
  if (invoiceDetail) return protectedPage(<InvoiceDetail invoiceId={invoiceDetail[1]} />, undefined, true);
  const productEdit = path.match(/^\/products\/([0-9a-f-]+)\/edit$/i);
  if (productEdit) return protectedPage(<ProductForm productId={productEdit[1]} />, undefined, true);
  return protectedPage(<DashboardPage />, undefined, true);
}
