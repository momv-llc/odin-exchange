import { ComponentType, useState } from 'react';
import { Language } from '../translations';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Search, CheckCircle, Clock, AlertCircle, XCircle, Mail, Send, Calendar, User } from 'lucide-react';

interface ExchangeRequest {
  id: string;
  email: string;
  walletAddress: string;
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  status: 'waiting' | 'processing' | 'completed' | 'expired';
  createdAt: Date;
  emailSent: boolean;
  telegramSent: boolean;
  estimatedTime?: string;
  completedAt?: Date;
}

interface TrackRequestProps {
  currentLang: Language;
  setCurrentLang: (lang: Language) => void;
  AuthButtons?: ComponentType;
}

export function TrackRequest({ currentLang, setCurrentLang, AuthButtons }: TrackRequestProps) {
  const [trackingCode, setTrackingCode] = useState('');
  const [trackedRequest, setTrackedRequest] = useState<ExchangeRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock database of requests
  const mockRequests: ExchangeRequest[] = [
    {
      id: 'ODIN123456789',
      email: 'john.doe@example.com',
      walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      fromCurrency: 'BTC',
      toCurrency: 'ETH',
      amount: '0.5',
      status: 'completed',
      createdAt: new Date('2024-01-15T10:30:00'),
      emailSent: true,
      telegramSent: true,
      completedAt: new Date('2024-01-15T10:35:00')
    },
    {
      id: 'ODIN987654321',
      email: 'jane.smith@example.com',
      walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4Db45',
      fromCurrency: 'USDT',
      toCurrency: 'BTC',
      amount: '2500',
      status: 'processing',
      createdAt: new Date('2024-01-15T14:20:00'),
      emailSent: true,
      telegramSent: true,
      estimatedTime: '5-10 minutes'
    },
    {
      id: 'ODIN456789123',
      email: 'mike.wilson@example.com',
      walletAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      fromCurrency: 'ETH',
      toCurrency: 'SOL',
      amount: '2.5',
      status: 'waiting',
      createdAt: new Date('2024-01-15T16:45:00'),
      emailSent: false,
      telegramSent: false,
      estimatedTime: '15-20 minutes'
    }
  ];

  const handleTrack = async () => {
    if (!trackingCode.trim()) {
      setError('Please enter a tracking code');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      const request = mockRequests.find(req => 
        req.id.toLowerCase() === trackingCode.toUpperCase()
      );

      if (request) {
        setTrackedRequest(request);
      } else {
        setError('No request found with this code. Please check and try again.');
      }
      setIsLoading(false);
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-emerald-400" />;
      case 'processing':
        return <Clock className="w-6 h-6 text-yellow-400" />;
      case 'waiting':
        return <AlertCircle className="w-6 h-6 text-blue-400" />;
      case 'expired':
        return <XCircle className="w-6 h-6 text-red-400" />;
      default:
        return <Clock className="w-6 h-6 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'processing':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'waiting':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'expired':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar currentLang={currentLang} setCurrentLang={setCurrentLang} AuthButtons={AuthButtons} />
      
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
              <label className="block text-slate-400 text-sm mb-2">Request Code</label>
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                    placeholder="Enter your request code (e.g., ODIN123456789)"
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 rounded-xl border border-slate-600/50 focus:outline-none focus:border-emerald-400 text-white placeholder-slate-500"
                  />
                </div>
                <button
                  onClick={handleTrack}
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>Track Request</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400">{error}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Request Details */}
        {trackedRequest && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Request Details</h2>
              <div className={`flex items-center space-x-3 px-4 py-2 rounded-xl border ${getStatusColor(trackedRequest.status)}`}>
                {getStatusIcon(trackedRequest.status)}
                <span className="font-medium capitalize">{trackedRequest.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Exchange Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                    <span>Exchange Details</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                      <span className="text-slate-400">Request ID</span>
                      <span className="font-mono text-emerald-400">{trackedRequest.id}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                      <span className="text-slate-400">Exchange</span>
                      <span className="font-medium">
                        {trackedRequest.amount} {trackedRequest.fromCurrency} → {trackedRequest.toCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                      <span className="text-slate-400">Created</span>
                      <span>{formatDateTime(trackedRequest.createdAt)}</span>
                    </div>
                    {trackedRequest.completedAt && (
                      <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                        <span className="text-slate-400">Completed</span>
                        <span className="text-emerald-400">{formatDateTime(trackedRequest.completedAt)}</span>
                      </div>
                    )}
                    {trackedRequest.estimatedTime && (
                      <div className="flex justify-between items-center py-3">
                        <span className="text-slate-400">Estimated Time</span>
                        <span className="text-blue-400">{trackedRequest.estimatedTime}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* User & Notification Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>User Information</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                      <span className="text-slate-400">Email</span>
                      <span>{trackedRequest.email}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                      <span className="text-slate-400">Wallet Address</span>
                      <span className="font-mono text-sm max-w-[200px] truncate">{trackedRequest.walletAddress}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                    <Send className="w-5 h-5" />
                    <span>Notifications</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Email Sent</span>
                      </div>
                      <span className={trackedRequest.emailSent ? 'text-emerald-400' : 'text-slate-400'}>
                        {trackedRequest.emailSent ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <div className="flex items-center space-x-2">
                        <Send className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Telegram Sent</span>
                      </div>
                      <span className={trackedRequest.telegramSent ? 'text-emerald-400' : 'text-slate-400'}>
                        {trackedRequest.telegramSent ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Status Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Request Created</div>
                    <div className="text-sm text-slate-400">{formatDateTime(trackedRequest.createdAt)}</div>
                  </div>
                </div>
                
                {trackedRequest.status !== 'waiting' && (
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Processing Started</div>
                      <div className="text-sm text-slate-400">Exchange is being processed</div>
                    </div>
                  </div>
                )}
                
                {trackedRequest.status === 'completed' && (
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Exchange Completed</div>
                      <div className="text-sm text-slate-400">
                        {trackedRequest.completedAt && formatDateTime(trackedRequest.completedAt)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button className="flex-1 px-6 py-3 bg-slate-700/50 rounded-xl hover:bg-slate-600/50 transition-colors">
                Download Receipt
              </button>
              <button className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        )}

        {/* Help Section */}
        {!trackedRequest && (
          <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
            <div className="space-y-3 text-slate-400">
              <p>• Your request code was sent to your email when you created the exchange</p>
              <p>• Request codes follow the format: ODIN followed by 9 digits</p>
              <p>• If you can't find your code, check your spam folder or contact support</p>
              <p>• For immediate assistance, use our live chat or call +1 (555) 123-4567</p>
            </div>
          </div>
        )}
      </main>

      <Footer currentLang={currentLang} />
    </div>
  );
}
