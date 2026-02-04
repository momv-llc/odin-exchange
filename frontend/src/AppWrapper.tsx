import { ReactNode, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { UserAuthProvider, useUserAuth, AuthModal, ProfileModal } from './auth';
import { ABTestingProvider, useABTesting, ABAnalytics } from './abTesting';
import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { UserAuthProvider } from './auth';
import { ABTestingProvider, useABTesting, ABAnalytics } from './abTesting';
import { Language } from './translations';
import { Home } from './pages/Home';
import { Reviews } from './pages/Reviews';
import { TrackRequest } from './pages/TrackRequest';
import { KycVerification } from './pages/KycVerification';
import { ReferralProgram } from './pages/ReferralProgram';
import { Account } from './pages/Account';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { Language } from './translations';

function AuthButtons({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const { user, isAuthenticated, isLoading } = useUserAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (isLoading) {
    return <div className="w-20 h-10 bg-slate-700/50 rounded-lg animate-pulse" />;
  }
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

function AppRoutes() {
  const location = useLocation();
  const { experiments } = useABTesting();
  const [currentLang, setCurrentLang] = useState<Language>('en');

  useEffect(() => {
    ABAnalytics.trackPageView(location.pathname, experiments);
  }, [location.pathname, experiments]);

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

function AppWithAuth() {
  const { experiments } = useABTesting();

  // Track page view with A/B experiment context
  useEffect(() => {
    ABAnalytics.trackPageView('main', experiments);
  }, [experiments]);

  const [currentLang, setCurrentLang] = useState<Language>('en');
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuthSuccess = () => {
    const state = location.state as { from?: string } | null;
    if (state?.from) {
      navigate(state.from, { replace: true });
      return;
    }
    navigate('/account');
  };

  const AuthButtonsComponent = () => <AuthButtons onAuthSuccess={handleAuthSuccess} />;

  const pageProps = {
    currentLang,
    setCurrentLang,
    AuthButtons: AuthButtonsComponent,
  };

  const PageFrame = ({ children }: { children: ReactNode }) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar currentLang={currentLang} setCurrentLang={setCurrentLang} AuthButtons={AuthButtonsComponent} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">{children}</main>
      <Footer />
    </div>
  );

  const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated, isLoading } = useUserAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return <Navigate to="/" replace state={{ from: location.pathname }} />;
    }

    return <>{children}</>;
  };

  return (
    <Routes>
      <Route path="/" element={<Home {...pageProps} />} />
      <Route path="/reviews" element={<Reviews {...pageProps} />} />
      <Route path="/track" element={<TrackRequest {...pageProps} />} />
      <Route
        path="/kyc"
        element={
          <PageFrame>
            <KycVerification />
          </PageFrame>
        }
      />
      <Route
        path="/referrals"
        element={
          <PageFrame>
            <ReferralProgram />
          </PageFrame>
        }
      />
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <PageFrame>
              <Account />
            </PageFrame>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Handler for A/B conversion events - can be connected to analytics service
const handleABConversion = (
  experimentId: string,
  variant: string,
  eventName: string,
  metadata?: Record<string, unknown>
) => {
  // In production, send to analytics service (GA, Mixpanel, Amplitude, etc.)
  console.log('[Analytics] A/B Conversion:', { experimentId, variant, eventName, metadata });

  // Example: Send to backend API
  // fetch('/api/analytics/ab-conversion', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ experimentId, variant, eventName, metadata, timestamp: new Date() })
  // });
};

    <Routes>
      <Route path="/" element={<Home currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/exchange" element={<Navigate to="/" replace />} />
      <Route path="/reviews" element={<Reviews currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/track" element={<TrackRequest currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/track/:code" element={<TrackRequest currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/kyc" element={<KycVerification currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/referral" element={<ReferralProgram currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/affiliate" element={<Navigate to="/referral" replace />} />
      <Route path="/wallet" element={<Navigate to="/account" replace />} />
      <Route path="/terms" element={<TermsOfService currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/privacy" element={<PrivacyPolicy currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/aml" element={<AMLPolicy currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/risk" element={<ExchangeRules currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/login" element={<AuthPage currentLang={currentLang} setCurrentLang={setCurrentLang} mode="login" />} />
      <Route path="/register" element={<AuthPage currentLang={currentLang} setCurrentLang={setCurrentLang} mode="register" />} />
      <Route path="/account" element={<AccountPage currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
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
