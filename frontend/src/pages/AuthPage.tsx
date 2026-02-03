import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Language } from '../translations';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AuthModal } from '../auth';
import { useUserAuth } from '../auth/context/UserAuthContext';

interface AuthPageProps {
  currentLang: Language;
  setCurrentLang: (lang: Language) => void;
  mode: 'login' | 'register';
}

export function AuthPage({ currentLang, setCurrentLang, mode }: AuthPageProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/account', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar currentLang={currentLang} setCurrentLang={setCurrentLang} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12" />
      <Footer />
      <AuthModal
        isOpen
        onClose={() => navigate('/')}
        initialMode={mode}
      />
    </div>
  );
}
