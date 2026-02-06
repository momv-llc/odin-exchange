import { ReactNode, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { UserAuthProvider, useUserAuth } from './auth';
import { ABTestingProvider, useABTesting, ABAnalytics } from './abTesting';
import { Language } from './translations';
import { Home } from './pages/Home';
import { Reviews } from './pages/Reviews';
import { TrackRequest } from './pages/TrackRequest';
import { KycVerification } from './pages/KycVerification';
import { ReferralProgram } from './pages/ReferralProgram';
import { AccountPage } from './pages/AccountPage';
import { AuthPage } from './pages/AuthPage';
import { Integrations } from './pages/Integrations';
import { PaymentSystems } from './pages/PaymentSystems';
import { AnalyticsInfo } from './pages/AnalyticsInfo';
import { ExchangeRatesInfo } from './pages/ExchangeRatesInfo';
import { PushNotificationsPage } from './pages/PushNotifications';
import { TermsOfService } from './pages/Legall/Legal_TermsOfService';
import { PrivacyPolicy } from './pages/Legall/Legal_PrivacyPolicy';
import { AMLPolicy } from './pages/Legall/Legal_AMLPolicy';
import { ExchangeRules } from './pages/Legall/Legal_ExchangeRules';

function AuthButtons() {
  const { isAuthenticated, user, logout } = useUserAuth();

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-300 hidden sm:block">{user?.email}</span>
        <a href="/account" className="px-4 py-2 text-sm text-white bg-slate-700/70 rounded-lg hover:bg-slate-600/70">
          Profile
        </a>
        <button
          type="button"
          onClick={() => void logout()}
          className="px-4 py-2 text-sm text-white bg-rose-500/80 rounded-lg hover:bg-rose-500"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <a href="/login" className="px-4 py-2 text-slate-300 hover:text-white transition-colors text-sm">
        Sign In
      </a>
      <a href="/register" className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity">
        Sign Up
      </a>
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useUserAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const location = useLocation();
  const { experiments } = useABTesting();
  const [currentLang, setCurrentLang] = useState<Language>('en');

  useEffect(() => {
    ABAnalytics.trackPageView(location.pathname, experiments);
  }, [location.pathname, experiments]);

  const pageProps = { currentLang, setCurrentLang, AuthButtons };

  return (
    <Routes>
      <Route path="/" element={<Home {...pageProps} />} />
      <Route path="/exchange" element={<Navigate to="/" replace />} />
      <Route path="/reviews" element={<Reviews {...pageProps} />} />
      <Route path="/track" element={<TrackRequest currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/track/:code" element={<TrackRequest currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/kyc" element={<KycVerification />} />
      <Route path="/referral" element={<ReferralProgram />} />
      <Route path="/affiliate" element={<Navigate to="/referral" replace />} />
      <Route path="/terms" element={<TermsOfService currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/privacy" element={<PrivacyPolicy currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/aml" element={<AMLPolicy currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/exchange-rules" element={<ExchangeRules currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/risk" element={<Navigate to="/exchange-rules" replace />} />
      <Route path="/login" element={<AuthPage currentLang={currentLang} setCurrentLang={setCurrentLang} mode="login" />} />
      <Route path="/register" element={<AuthPage currentLang={currentLang} setCurrentLang={setCurrentLang} mode="register" />} />
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <AccountPage currentLang={currentLang} setCurrentLang={setCurrentLang} />
          </ProtectedRoute>
        }
      />
      <Route path="/integrations" element={<Integrations currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/payment-systems" element={<PaymentSystems currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/analytics" element={<AnalyticsInfo currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/exchange-rates" element={<ExchangeRatesInfo currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/push-notifications" element={<PushNotificationsPage currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function AppWrapper() {
  return (
    <ABTestingProvider>
      <UserAuthProvider>
        <AppRoutes />
      </UserAuthProvider>
    </ABTestingProvider>
  );
}

export default AppWrapper;
