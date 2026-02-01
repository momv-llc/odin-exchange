import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

interface Admin {
  id: string;
  email: string;
  role: string;
  is2faEnabled: boolean;
}

interface AuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ requiresTwoFactor?: boolean; tempToken?: string }>;
  verify2FA: (tempToken: string, code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = api.getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const profile = await api.getProfile();
      setAdmin(profile);
    } catch {
      api.setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const result = await api.login(email, password);

    if (result.requiresTwoFactor) {
      return { requiresTwoFactor: true, tempToken: result.tempToken };
    }

    api.setToken(result.accessToken);
    const profile = await api.getProfile();
    setAdmin(profile);
    return {};
  };

  const verify2FA = async (tempToken: string, code: string) => {
    const result = await api.verify2FA(tempToken, code);
    api.setToken(result.accessToken);
    const profile = await api.getProfile();
    setAdmin(profile);
  };

  const logout = () => {
    api.setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isLoading,
        isAuthenticated: !!admin,
        login,
        verify2FA,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
