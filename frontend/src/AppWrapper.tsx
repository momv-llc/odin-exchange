import { useEffect, useState } from 'react';
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

function ProtectedAccountRoute({ currentLang, setCurrentLang }: { currentLang: Language; setCurrentLang: (lang: Language) => void }) {
  const { isAuthenticated, isLoading } = useUserAuth();
  const location = useLocation();

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

  return <AccountPage currentLang={currentLang} setCurrentLang={setCurrentLang} />;
}

function AppRoutes() {
  const location = useLocation();
  const { experiments } = useABTesting();
  const [currentLang, setCurrentLang] = useState<Language>('en');

  useEffect(() => {
    ABAnalytics.trackPageView(location.pathname, experiments);
  }, [location.pathname, experiments]);

  return (
    <Routes>
      <Route path="/" element={<Home currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/exchange" element={<Navigate to="/" replace />} />
      <Route path="/reviews" element={<Reviews currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/track" element={<TrackRequest currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/track/:code" element={<TrackRequest currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/kyc" element={<KycVerification currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/referral" element={<ReferralProgram currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/referrals" element={<Navigate to="/referral" replace />} />
      <Route path="/affiliate" element={<Navigate to="/referral" replace />} />
      <Route path="/wallet" element={<Navigate to="/account" replace />} />
      <Route path="/terms" element={<TermsOfService currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/privacy" element={<PrivacyPolicy currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/aml" element={<AMLPolicy currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/exchange-rules" element={<ExchangeRules currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/risk" element={<Navigate to="/exchange-rules" replace />} />
      <Route path="/login" element={<AuthPage currentLang={currentLang} setCurrentLang={setCurrentLang} mode="login" />} />
      <Route path="/register" element={<AuthPage currentLang={currentLang} setCurrentLang={setCurrentLang} mode="register" />} />
      <Route
        path="/account"
        element={<ProtectedAccountRoute currentLang={currentLang} setCurrentLang={setCurrentLang} />}
      />
      <Route path="/integrations" element={<Integrations currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/payment-systems" element={<PaymentSystems currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/analytics" element={<AnalyticsInfo currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/exchange-rates" element={<ExchangeRatesInfo currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/push-notifications" element={<PushNotificationsPage currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/markets" element={<Navigate to="/" replace />} />
      <Route path="/api" element={<Navigate to="/" replace />} />
      <Route path="/business" element={<Navigate to="/" replace />} />
      <Route path="/help" element={<Navigate to="/" replace />} />
      <Route path="/fees" element={<Navigate to="/" replace />} />
      <Route path="/api-docs" element={<Navigate to="/" replace />} />
      <Route path="/contact" element={<Navigate to="/" replace />} />
      <Route path="/compliance" element={<Navigate to="/" replace />} />
      <Route path="/licenses" element={<Navigate to="/" replace />} />
      <Route path="/certificates" element={<Navigate to="/" replace />} />
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
