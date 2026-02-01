import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Lock, Mail, Shield } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, verify2FA } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [needs2FA, setNeeds2FA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.requiresTwoFactor) {
        setNeeds2FA(true);
        setTempToken(result.tempToken || '');
      } else {
        navigate('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await verify2FA(tempToken, code);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || '2FA verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-white">O</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-slate-400 mt-2">ODIN Exchange</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {!needs2FA ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handle2FA} className="space-y-6">
              <div className="text-center mb-4">
                <Shield className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                <p className="text-slate-300">Enter your 2FA code</p>
              </div>

              <div>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white text-center text-2xl tracking-widest placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Verify'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setNeeds2FA(false);
                  setTempToken('');
                  setCode('');
                }}
                className="w-full py-2 text-slate-400 hover:text-white transition-colors"
              >
                Back to login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
