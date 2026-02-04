import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminLayout } from './components/Layout';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { OrdersPage } from './pages/Orders';
import { UsersPage } from './pages/Users';
import { ReviewsPage } from './pages/Reviews';
import { PromoPage } from './pages/Promo';
import { Locations as LocationsPage } from './pages/Locations';
import { PaymentMethods as PaymentMethodsPage } from './pages/PaymentMethods';
import { Transfers as TransfersPage } from './pages/Transfers';
import Analytics from './pages/Analytics';
import { AuditLogPage } from './pages/AuditLog';
import AnalyticsPage from './pages/Analytics';
import { KycPage } from './pages/Kyc';
import { ReferralsPage } from './pages/Referrals';

function AdminRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/admin" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <AdminLayout>
            <DashboardPage />
          </AdminLayout>
        }
      />
      <Route
        path="/orders"
        element={
          <AdminLayout>
            <OrdersPage />
          </AdminLayout>
        }
      />
      <Route
        path="/users"
        element={
          <AdminLayout>
            <UsersPage />
          </AdminLayout>
        }
      />
      <Route
        path="/reviews"
        element={
          <AdminLayout>
            <ReviewsPage />
          </AdminLayout>
        }
      />
      <Route
        path="/promo"
        element={
          <AdminLayout>
            <PromoPage />
          </AdminLayout>
        }
      />
      <Route
        path="/locations"
        element={
          <AdminLayout>
            <LocationsPage />
          </AdminLayout>
        }
      />
      <Route
        path="/payment-methods"
        element={
          <AdminLayout>
            <PaymentMethodsPage />
          </AdminLayout>
        }
      />
      <Route
        path="/transfers"
        element={
          <AdminLayout>
            <TransfersPage />
          </AdminLayout>
        }
      />
      <Route
        path="/analytics"
        element={
          <AdminLayout>
            <Analytics />
        path="/audit"
        element={
          <AdminLayout>
            <AuditLogPage />
        path="/analytics"
        element={
          <AdminLayout>
            <AnalyticsPage />
          </AdminLayout>
        }
      />
      <Route
        path="/kyc"
        element={
          <AdminLayout>
            <KycPage />
          </AdminLayout>
        }
      />
      <Route
        path="/referrals"
        element={
          <AdminLayout>
            <ReferralsPage />
          </AdminLayout>
        }
      />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export function AdminApp() {
  return (
    <AuthProvider>
      <AdminRoutes />
    </AuthProvider>
  );
}

export default AdminApp;
