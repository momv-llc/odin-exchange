import { ComponentType, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Language } from '../translations';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Search, CheckCircle, Clock, AlertCircle, XCircle, Calendar, Wallet, ArrowRight } from 'lucide-react';
import { api } from '../lib/api/client';

interface OrderResponse {
  code: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: string;
  toAmount: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

interface TrackRequestProps {
  currentLang: Language;
  setCurrentLang: (lang: Language) => void;
  AuthButtons?: ComponentType;
}

export function TrackRequest({ currentLang, setCurrentLang }: TrackRequestProps) {
  const { code } = useParams<{ code?: string }>();
  const [trackingCode, setTrackingCode] = useState(code || '');
  const [trackedRequest, setTrackedRequest] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrder = async (orderCode: string) => {
    if (!orderCode.trim()) {
      setError('Please enter a tracking code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.get(`/orders/${orderCode.trim().toUpperCase()}`);
      const order = response.data?.data ?? response.data;
      setTrackedRequest(order);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'No request found with this code.';
      setTrackedRequest(null);
      setError(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (code) {
      fetchOrder(code);
    }
  }, [code]);

  const handleTrack = async () => {
    await fetchOrder(trackingCode);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-6 h-6 text-emerald-400" />;
      case 'APPROVED':
      case 'PENDING':
        return <Clock className="w-6 h-6 text-yellow-400" />;
      case 'REJECTED':
      case 'CANCELLED':
        return <XCircle className="w-6 h-6 text-red-400" />;
      case 'EXPIRED':
        return <AlertCircle className="w-6 h-6 text-blue-400" />;
      default:
        return <Clock className="w-6 h-6 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'APPROVED':
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'EXPIRED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const formatDateTime = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar currentLang={currentLang} setCurrentLang={setCurrentLang} AuthButtons={AuthButtons} />
      
      <Navbar currentLang={currentLang} setCurrentLang={setCurrentLang} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Track Your Exchange Request
            </span>
          </h1>
          <p className="text-slate-400 text-lg">
            Enter your request code to check the current status of your exchange
          </p>
        </div>

        {/* Tracking Form */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Request Code</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={trackingCode}
                  onChange={e => setTrackingCode(e.target.value)}
                  placeholder="Enter your tracking code"
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleTrack}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? 'Tracking...' : 'Track Request'}
            </button>
          </div>
        </div>

        {/* Tracking Result */}
        {trackedRequest && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-1">Request {trackedRequest.code}</h2>
                <p className="text-slate-400">Created {formatDateTime(trackedRequest.createdAt)}</p>
              </div>
              <div className={`px-4 py-2 rounded-full border ${getStatusColor(trackedRequest.status)} flex items-center space-x-2`}>
                {getStatusIcon(trackedRequest.status)}
                <span className="font-medium">{trackedRequest.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-400">You Send</span>
                  <Wallet className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {trackedRequest.fromAmount} {trackedRequest.fromCurrency}
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-400">You Receive</span>
                  <ArrowRight className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {trackedRequest.toAmount} {trackedRequest.toCurrency}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center space-x-3 text-slate-400">
              <Calendar className="w-5 h-5" />
              <span>Expires at {formatDateTime(trackedRequest.expiresAt)}</span>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
