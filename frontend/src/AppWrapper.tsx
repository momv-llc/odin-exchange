import { useEffect, useState, type ComponentType } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ABAnalytics, ABTestingProvider, useABTesting } from './abTesting';
import { ABTestingDashboard } from './abTesting/ABTestingDashboard';
import { AuthModal, ProfileModal, UserAuthProvider, useUserAuth } from './auth';
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
import type { Language } from './translations';

interface AuthButtonsProps {
  onAuthSuccess: () => void;
}

function AuthButtons({ onAuthSuccess }: AuthButtonsProps) {
  const { user, isAuthenticated, isLoading } = useUserAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (isLoading) {
    return <div className="w-20 h-10 bg-slate-700/50 rounded-lg animate-pulse" />;
  }

  if (isAuthenticated && user) {
    return (
      <>
        <button
          onClick={() => setShowProfileModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors"
        >
          <span className="text-sm text-white">{user.firstName || user.email.split('@')[0]}</span>
        </button>
        <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
      </>
    );
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
  const { experiments } = useABTesting();
  const [currentLang, setCurrentLang] = useState<Language>('en');

  useEffect(() => {
    ABAnalytics.trackPageView(location.pathname, experiments);
  }, [location.pathname, experiments]);

  const AuthButtonsComponent: ComponentType = () => <AuthButtons onAuthSuccess={() => undefined} />;

  const pageProps = {
    currentLang,
    setCurrentLang,
    AuthButtons: AuthButtonsComponent,
  };

  return (
    <Routes>
      <Route path="/" element={<Home {...pageProps} />} />
      <Route path="/exchange" element={<Navigate to="/" replace />} />
      <Route path="/reviews" element={<Reviews {...pageProps} />} />
      <Route path="/track" element={<TrackRequest {...pageProps} />} />
      <Route path="/track/:code" element={<TrackRequest {...pageProps} />} />
      <Route path="/kyc" element={<KycVerification {...pageProps} />} />
      <Route path="/referral" element={<ReferralProgram {...pageProps} />} />
      <Route path="/referrals" element={<ReferralProgram {...pageProps} />} />
      <Route path="/affiliate" element={<Navigate to="/referral" replace />} />
      <Route path="/wallet" element={<Navigate to="/account" replace />} />
      <Route path="/terms" element={<TermsOfService currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/privacy" element={<PrivacyPolicy currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/aml" element={<AMLPolicy currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/exchange-rules" element={<ExchangeRules currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/risk" element={<Navigate to="/exchange-rules" replace />} />
      <Route path="/login" element={<AuthPage currentLang={currentLang} setCurrentLang={setCurrentLang} mode="login" />} />
      <Route path="/register" element={<AuthPage currentLang={currentLang} setCurrentLang={setCurrentLang} mode="register" />} />
      <Route path="/account" element={<AccountPage currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/integrations" element={<Integrations currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/payment-systems" element={<PaymentSystems currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/analytics" element={<AnalyticsInfo currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/exchange-rates" element={<ExchangeRatesInfo currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/push-notifications" element={<PushNotificationsPage currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/ab-testing" element={<ABTestingDashboard />} />
      <Route path="/account-settings" element={<Account />} />
      <Route path="/markets" element={<Navigate to="/" replace />} />
      <Route path="/api" element={<Navigate to="/" replace />} />
      <Route path="/business" element={<Navigate to="/" replace />} />
      <Route path="/help" element={<Navigate to="/" replace />} />
      <Route path="/fees" element={<Navigate to="/" replace />} />
      <Route path="/api-docs" element={<Navigate to="/" replace />} />
      <Route path="/contact" element={<Navigate to="/" replace />} />
      <Route path="/compliance" element={<Navigate to="/aml" replace />} />
      <Route path="/licenses" element={<Navigate to="/terms" replace />} />
      <Route path="/certificates" element={<Navigate to="/privacy" replace />} />
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
