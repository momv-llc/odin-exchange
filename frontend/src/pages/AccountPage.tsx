import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Language } from '../translations';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ProfileModal } from '../auth';
import { useUserAuth } from '../auth/context/UserAuthContext';

interface AccountPageProps {
  currentLang: Language;
  setCurrentLang: (lang: Language) => void;
}

export function AccountPage({ currentLang, setCurrentLang }: AccountPageProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useUserAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar currentLang={currentLang} setCurrentLang={setCurrentLang} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12" />
      <Footer />
      {user && (
        <ProfileModal isOpen onClose={() => navigate('/')} />
      )}
    </div>
  );
}
