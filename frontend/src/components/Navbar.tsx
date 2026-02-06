import { ComponentType, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Language, translations, TranslationKey } from '../translations';
import { Menu, X, Globe, Shield, Zap, UserCheck, Gift } from 'lucide-react';
import { AuthModal, ProfileModal, useUserAuth } from '../auth';

interface NavbarProps {
  currentLang: Language;
  setCurrentLang: (lang: Language) => void;
  AuthButtons?: ComponentType;
}

export function Navbar({ currentLang, setCurrentLang, AuthButtons }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { user, isAuthenticated, isLoading } = useUserAuth();
  const location = useLocation();

  const t = (key: TranslationKey) => translations[currentLang][key];

  const navigation = [
    { name: t('exchange'), href: '/', icon: Zap },
    { name: t('reviews'), href: '/reviews', icon: Shield },
    { name: t('trackRequest'), href: '/track', icon: Globe },
    { name: t('kyc'), href: '/kyc', icon: UserCheck },
    { name: t('referrals'), href: '/referrals', icon: Gift },
  ];

  const isActive = (path: string) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));

  const authControl = AuthButtons ? (
    <AuthButtons />
  ) : isLoading ? (
    <div className="w-20 h-10 bg-slate-700/50 rounded-lg animate-pulse" />
  ) : isAuthenticated && user ? (
    <button
      onClick={() => setShowProfileModal(true)}
      className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors"
    >
      <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center text-sm font-bold">
        {user.firstName?.[0] || user.email[0].toUpperCase()}
      </div>
      <span className="text-white text-sm hidden md:block">{user.firstName || user.email.split('@')[0]}</span>
    </button>
  ) : (
    <button
      onClick={() => {
        setAuthMode('login');
        setShowAuthModal(true);
      }}
      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-medium transition-colors"
    >
      {t('login')}
    </button>
  );

  return (
    <nav className="border-b border-slate-700/50 backdrop-blur-lg bg-slate-900/70 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <span className="text-xl font-bold">Ø</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{t('siteName')}</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 text-slate-300 hover:text-emerald-400 transition-colors ${isActive(item.href) ? 'text-emerald-400' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <select
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value as Language)}
              className="bg-slate-700/50 text-slate-300 px-3 py-2 rounded-lg border border-slate-600/50 focus:outline-none focus:border-emerald-400"
            >
              <option value="en">EN</option>
              <option value="de">DE</option>
              <option value="ru">RU</option>
              <option value="ua">UA</option>
            </select>
            {authControl}
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-slate-300 hover:text-white p-2">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 px-4 py-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:text-emerald-400 hover:bg-slate-800/50 transition-colors ${
                  isActive(item.href) ? 'text-emerald-400 bg-slate-800/50' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <select
            value={currentLang}
            onChange={(e) => setCurrentLang(e.target.value as Language)}
            className="w-full bg-slate-700/50 text-slate-300 px-4 py-3 rounded-lg border border-slate-600/50"
          >
            <option value="en">EN</option>
            <option value="de">DE</option>
            <option value="ru">RU</option>
            <option value="ua">UA</option>
          </select>
          <div onClick={() => setIsMenuOpen(false)}>{authControl}</div>
        </div>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode={authMode} />
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </nav>
  );
}
