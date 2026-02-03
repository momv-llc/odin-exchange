import { useState } from 'react';
import { UserAuthProvider, useUserAuth, AuthModal, ProfileModal, PromoCodeInput } from './auth';
import { App as MainApp } from './App';
import { ABTestingProvider, useABTesting, ABAnalytics } from './abTesting';

function AuthButtons() {
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
      />
    </>
  );
}

function AppWithAuth() {
  const { experiments } = useABTesting();

  // Track page view with A/B experiment context
  useState(() => {
    ABAnalytics.trackPageView('main', experiments);
  });

  return <MainApp AuthButtons={AuthButtons} PromoCodeInput={PromoCodeInput} />;
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
