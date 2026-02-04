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
import { AuthPage } from './pages/AuthPage';
import { AccountPage } from './pages/AccountPage';
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
      <Route path="/exchange-rules" element={<ExchangeRules currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
      <Route path="/risk" element={<Navigate to="/exchange-rules" replace />} />
      <Route path="/login" element={<AuthPage currentLang={currentLang} setCurrentLang={setCurrentLang} mode="login" />} />
      <Route path="/register" element={<AuthPage currentLang={currentLang} setCurrentLang={setCurrentLang} mode="register" />} />
      <Route path="/account" element={<AccountPage currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
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
