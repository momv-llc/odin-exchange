import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { UserAuthProvider, useUserAuth, AuthModal } from './auth';
import { ABTestingProvider, useABTesting, ABAnalytics } from './abTesting';
import { Language } from './translations';
import { Home } from './pages/Home';
import { Reviews } from './pages/Reviews';
import { TrackRequest } from './pages/TrackRequest';
import { KycVerification } from './pages/KycVerification';
import { ReferralProgram } from './pages/ReferralProgram';
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

function AuthButtons({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const { isLoading } = useUserAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (isLoading) {
    return <div className="w-20 h-10 bg-slate-700/50 rounded-lg animate-pulse" />;
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => {
            setAuthMode('login');
            setShowAuthModal(true);
          }}
          className="px-4 py-2 text-slate-300 hover:text-white transition-colors text-sm"
        >
          Sign In
        </button>
        <button
          onClick={() => {
            setAuthMode('register');
            setShowAuthModal(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Sign Up
        </button>
      </div>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        onSuccess={onAuthSuccess}
      />
    </>
  );
}

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const { experiments } = useABTesting();
  const { isAuthenticated } = useUserAuth();
  const [currentLang, setCurrentLang] = useState<Language>('en');

  useEffect(() => {
    ABAnalytics.trackPageView(location.pathname, experiments);
  }, [location.pathname, experiments]);

  const handleAuthSuccess = () => {
    const state = location.state as { from?: string } | null;
    if (state?.from) {
      navigate(state.from, { replace: true });
      return;
    }
    navigate('/account', { replace: true });
  };

  const commonProps = {
    currentLang,
    setCurrentLang,
    AuthButtons: () => <AuthButtons onAuthSuccess={handleAuthSuccess} />,
  };

  return (
    <Routes>
      <Route path="/" element={<Home {...commonProps} />} />
      <Route path="/exchange" element={<Navigate to="/" replace />} />
      <Route path="/reviews" element={<Reviews {...commonProps} />} />
      <Route path="/track" element={<TrackRequest {...commonProps} />} />
      <Route path="/track/:code" element={<TrackRequest {...commonProps} />} />
      <Route path="/kyc" element={<KycVerification />} />
      <Route path="/referral" element={<ReferralProgram />} />
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
        element={
          isAuthenticated ? (
            <AccountPage currentLang={currentLang} setCurrentLang={setCurrentLang} />
          ) : (
            <Navigate to="/login" replace state={{ from: '/account' }} />
          )
        }
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
