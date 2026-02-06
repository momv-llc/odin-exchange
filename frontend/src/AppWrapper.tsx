import { ReactNode, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { UserAuthProvider, useUserAuth } from './auth';
import { ABTestingProvider, ABAnalytics, useABTesting } from './abTesting';
import { Language } from './translations';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Reviews } from './pages/Reviews';
import { TrackRequest } from './pages/TrackRequest';
import { KycVerification } from './pages/KycVerification';
import { ReferralProgram } from './pages/ReferralProgram';
import { Account } from './pages/Account';
import { AuthPage } from './pages/AuthPage';
import { AccountPage } from './pages/AccountPage';
import { Integrations } from './pages/Integrations';
import { PaymentSystems } from './pages/PaymentSystems';
import { AnalyticsInfo } from './pages/AnalyticsInfo';
import { ExchangeRatesInfo } from './pages/ExchangeRatesInfo';
import { PushNotificationsPage } from './pages/PushNotifications';
import { TermsOfService } from './pages/Legall/Legal_TermsOfService';
import { PrivacyPolicy } from './pages/Legall/Legal_PrivacyPolicy';
import { AMLPolicy } from './pages/Legall/Legal_AMLPolicy';
import { ExchangeRules } from './pages/Legall/Legal_ExchangeRules';

function AppWithProviders() {
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const { experiments } = useABTesting();
  const { isAuthenticated, isLoading } = useUserAuth();
  const location = useLocation();

  useEffect(() => {
    ABAnalytics.trackPageView(location.pathname, experiments);
  }, [location.pathname, experiments]);

  const pageProps = { currentLang, setCurrentLang };

  const PageFrame = ({ children }: { children: ReactNode }) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar currentLang={currentLang} setCurrentLang={setCurrentLang} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">{children}</main>
      <Footer currentLang={currentLang} />
    </div>
  );

  const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return <>{children}</>;
  };

  return (
    <Routes>
      <Route path="/" element={<Home {...pageProps} />} />
      <Route path="/exchange" element={<Navigate to="/" replace />} />
      <Route path="/reviews" element={<Reviews {...pageProps} />} />
      <Route path="/track" element={<TrackRequest {...pageProps} />} />
      <Route path="/track/:code" element={<TrackRequest {...pageProps} />} />
      <Route path="/kyc" element={<PageFrame><KycVerification /></PageFrame>} />
      <Route path="/referrals" element={<PageFrame><ReferralProgram /></PageFrame>} />
      <Route path="/referral" element={<Navigate to="/referrals" replace />} />
      <Route path="/terms" element={<TermsOfService {...pageProps} />} />
      <Route path="/privacy" element={<PrivacyPolicy {...pageProps} />} />
      <Route path="/aml" element={<AMLPolicy {...pageProps} />} />
      <Route path="/exchange-rules" element={<ExchangeRules {...pageProps} />} />
      <Route path="/risk" element={<Navigate to="/exchange-rules" replace />} />
      <Route path="/login" element={<AuthPage {...pageProps} mode="login" />} />
      <Route path="/register" element={<AuthPage {...pageProps} mode="register" />} />
      <Route path="/account" element={<ProtectedRoute><PageFrame><Account /></PageFrame></ProtectedRoute>} />
      <Route path="/account-page" element={<AccountPage {...pageProps} />} />
      <Route path="/integrations" element={<Integrations {...pageProps} />} />
      <Route path="/payment-systems" element={<PaymentSystems {...pageProps} />} />
      <Route path="/analytics" element={<AnalyticsInfo {...pageProps} />} />
      <Route path="/exchange-rates" element={<ExchangeRatesInfo {...pageProps} />} />
      <Route path="/push-notifications" element={<PushNotificationsPage {...pageProps} />} />
      <Route path="/wallet" element={<Navigate to="/account" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function AppWrapper() {
  return (
    <ABTestingProvider>
      <UserAuthProvider>
        <AppWithProviders />
      </UserAuthProvider>
    </ABTestingProvider>
  );
}

export default AppWrapper;
