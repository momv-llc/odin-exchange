import { ReactNode, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { UserAuthProvider, useUserAuth, AuthModal, ProfileModal } from './auth';
import { ABTestingProvider, useABTesting, ABAnalytics } from './abTesting';
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

  if (isAuthenticated && user) {
    return (
      <>
        <button
          onClick={() => setShowProfileModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center text-sm font-bold">
            {user.firstName?.[0] || user.email[0].toUpperCase()}
          </div>
          <span className="text-white text-sm hidden md:block">
            {user.firstName || user.email.split('@')[0]}
          </span>
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

export function AppWrapper() {
  return (
    <ABTestingProvider onConversion={handleABConversion}>
      <UserAuthProvider>
        <AppWithAuth />
      </UserAuthProvider>
    </ABTestingProvider>
  );
}

export default AppWrapper;
