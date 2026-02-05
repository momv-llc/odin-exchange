import { useState, useEffect, ComponentType } from 'react';
import { cn } from './utils/cn';
import { translations, Language, TranslationKey } from './translations';
import { generateReviews, ExchangeRequest } from './reviewsData';
import { CurrencyTicker } from './components/CurrencyTicker';
import { LocationsSection } from './components/LocationsSection';
import { PaymentMethodsSection } from './components/PaymentMethodsSection';
import { TransfersSection } from './components/TransfersSection';
import { SupportChat } from './components/SupportChat';
import { ScrollToTop } from './components/ScrollToTop';
import { CurrencySelector } from './components/CurrencySelector';
import { LocationSelector } from './components/LocationSelector';

interface Currency {
  symbol: string;
  name: string;
  price: number;
  change: number;
  icon: string;
}

interface PromoCodeInputProps {
  amount: number;
  onApply: (discount: number, promoCode: string) => void;
  onClear: () => void;
}

interface AppProps {
  AuthButtons?: ComponentType;
  PromoCodeInput?: ComponentType<PromoCodeInputProps>;
}

const initialCurrencies: Currency[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: 43250.50, change: 2.34, icon: '₿' },
  { symbol: 'ETH', name: 'Ethereum', price: 2280.75, change: -1.23, icon: 'Ξ' },
  { symbol: 'USDT', name: 'Tether', price: 1.00, change: 0.01, icon: '₮' },
  { symbol: 'USDC', name: 'USD Coin', price: 1.00, change: 0.00, icon: '$' },
  { symbol: 'BNB', name: 'BNB', price: 312.45, change: 0.87, icon: '⬡' },
  { symbol: 'SOL', name: 'Solana', price: 98.65, change: 5.43, icon: '◎' },
  { symbol: 'XRP', name: 'XRP', price: 0.62, change: -0.54, icon: '✕' },
  { symbol: 'ADA', name: 'Cardano', price: 0.52, change: 1.23, icon: '₳' },
  { symbol: 'DOGE', name: 'Dogecoin', price: 0.08, change: 3.45, icon: 'Ð' },
  { symbol: 'LTC', name: 'Litecoin', price: 72.50, change: -0.87, icon: 'Ł' },
  { symbol: 'EUR', name: 'Euro', price: 1.08, change: 0.12, icon: '€' },
  { symbol: 'USD', name: 'US Dollar', price: 1.00, change: 0.00, icon: '$' },
  { symbol: 'GBP', name: 'British Pound', price: 1.27, change: 0.05, icon: '£' },
  { symbol: 'CHF', name: 'Swiss Franc', price: 1.12, change: -0.03, icon: '₣' },
];

export function App({ AuthButtons, PromoCodeInput }: AppProps) {
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [currencies, setCurrencies] = useState<Currency[]>(initialCurrencies);
  const [selectedFrom, setSelectedFrom] = useState<Currency>(initialCurrencies[2]);
  const [selectedTo, setSelectedTo] = useState<Currency>(initialCurrencies[0]);
  const [amountFrom, setAmountFrom] = useState<string>('1000');
  const [amountTo, setAmountTo] = useState<string>('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState<
    Array<{ id: number; from: string; to: string; amount: string; status: 'completed' | 'pending' }>
  >([]);
  const [reviews] = useState(() => generateReviews());
  const [guestMode, setGuestMode] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestWallet, setGuestWallet] = useState('');
  const [exchangeRequests, setExchangeRequests] = useState<ExchangeRequest[]>([]);
  const [currentRequest, setCurrentRequest] = useState<ExchangeRequest | null>(null);
  const [trackingCode, setTrackingCode] = useState('');
  const [trackedRequest, setTrackedRequest] = useState<ExchangeRequest | null>(null);
  const [currentPage, setCurrentPage] = useState<'exchange' | 'reviews' | 'track'>('exchange');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [showFromCurrencySelector, setShowFromCurrencySelector] = useState(false);
  const [showToCurrencySelector, setShowToCurrencySelector] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ id: string; city: string; country: string; flag: string } | null>(null);

  // Reviews state
  const [reviewsPage, setReviewsPage] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [userReviews, setUserReviews] = useState<Array<{ id: number; userName: string; rating: number; comment: string; date: string; isPositive: boolean }>>([]);
  const reviewsPerPage = 15;

  const t = (key: TranslationKey) => translations[currentLang][key];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrencies((prev) =>
        prev.map((currency) => ({
          ...currency,
          price: currency.price * (1 + (Math.random() - 0.5) * 0.002),
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (amountFrom && selectedFrom && selectedTo) {
      const fromAmount = parseFloat(amountFrom);
      const result = (fromAmount * selectedFrom.price) / selectedTo.price;
      setAmountTo(result.toFixed(6));
    }
  }, [amountFrom, selectedFrom, selectedTo]);

  const handleSwap = () => {
    if (!amountFrom || parseFloat(amountFrom) <= 0) return;

    setIsSwapping(true);

    const newTransaction = {
      id: Date.now(),
      from: `${amountFrom} ${selectedFrom.symbol}`,
      to: `${amountTo} ${selectedTo.symbol}`,
      amount: `~$${(parseFloat(amountFrom) * selectedFrom.price).toFixed(2)}`,
      status: 'pending' as const,
    };

    setTransactionHistory((prev) => [newTransaction, ...prev]);

    setTimeout(() => {
      setTransactionHistory((prev) =>
        prev.map((tx) =>
          tx.id === newTransaction.id ? { ...tx, status: 'completed' } : tx
        )
      );
      setIsSwapping(false);
      setAmountFrom('');
      setAmountTo('');
    }, 2000);
  };

  const switchCurrencies = () => {
    const temp = selectedFrom;
    setSelectedFrom(selectedTo);
    setSelectedTo(temp);
    const tempAmount = amountFrom;
    setAmountFrom(amountTo);
    setAmountTo(tempAmount);
  };

  const handleGuestExchange = () => {
    if (!guestEmail || !guestWallet) {
      alert(t('yourEmail') + ' and ' + t('walletAddress') + ' are required');
      return;
    }

    const requestId = 'ODIN' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newRequest: ExchangeRequest = {
      id: requestId,
      email: guestEmail,
      walletAddress: guestWallet,
      fromCurrency: selectedFrom.symbol,
      toCurrency: selectedTo.symbol,
      amount: amountFrom,
      status: 'waiting',
      createdAt: new Date(),
      emailSent: false,
      telegramSent: false
    };

    setExchangeRequests(prev => [newRequest, ...prev]);
    setCurrentRequest(newRequest);

    // Simulate sending email and telegram
    setTimeout(() => {
      setExchangeRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, emailSent: true, telegramSent: true, status: 'processing' as const }
            : req
        )
      );
    }, 2000);

    // Simulate completion
    setTimeout(() => {
      setExchangeRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'completed' as const }
            : req
        )
      );
    }, 10000);

    setGuestEmail('');
    setGuestWallet('');
    setGuestMode(false);
  };

  const trackRequest = () => {
    const request = exchangeRequests.find(req => req.id === trackingCode.toUpperCase());
    setTrackedRequest(request || null);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={cn(i < rating ? 'text-yellow-400' : 'text-slate-600')}>
        ★
      </span>
    ));
  };

  const handleSubmitReview = () => {
    if (!newReviewName.trim() || !newReviewComment.trim()) {
      return;
    }

    const newReview = {
      id: Date.now(),
      userName: newReviewName,
      rating: newReviewRating,
      comment: newReviewComment,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      isPositive: newReviewRating >= 4
    };

    setUserReviews(prev => [newReview, ...prev]);
    setNewReviewName('');
    setNewReviewRating(5);
    setNewReviewComment('');
    setShowReviewForm(false);
  };

  // Combine user reviews with generated reviews
  const allReviews = [...userReviews, ...reviews];
  const totalReviewPages = Math.ceil(allReviews.length / reviewsPerPage);
  const paginatedReviews = allReviews.slice((reviewsPage - 1) * reviewsPerPage, reviewsPage * reviewsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <nav className="border-b border-slate-700/50 backdrop-blur-lg bg-slate-900/70 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold">Ø</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {t('siteName')}
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => setCurrentPage('exchange')}
                className={cn("text-slate-300 hover:text-emerald-400 transition-colors", currentPage === 'exchange' && 'text-emerald-400')}
              >
                {t('exchange')}
              </button>
              <button 
                onClick={() => setCurrentPage('reviews')}
                className={cn("text-slate-300 hover:text-emerald-400 transition-colors", currentPage === 'reviews' && 'text-emerald-400')}
              >
                {t('reviews')}
              </button>
              <button 
                onClick={() => setCurrentPage('track')}
                className={cn("text-slate-300 hover:text-emerald-400 transition-colors", currentPage === 'track' && 'text-emerald-400')}
              >
                {t('trackRequest')}
              </button>
            </div>

            <div className="flex items-center space-x-4">
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
              {AuthButtons ? (
                <AuthButtons />
              ) : (
                <button
                  onClick={() => setGuestMode(!guestMode)}
                  className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                >
                  {guestMode ? t('login') : t('guestExchange')}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Currency Ticker */}
      <CurrencyTicker />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {currentPage === 'exchange' && (
          <>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {t('buySell')}
                </span>
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                {t('tagline')}
              </p>
            </div>

            {guestMode && (
              <div className="max-w-2xl mx-auto mb-8">
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
                  <h3 className="text-xl font-semibold mb-6">{t('guestExchange')}</h3>
                  <p className="text-slate-400 mb-6">{t('guestDesc')}</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">{t('yourEmail')}</label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-slate-700/50 rounded-xl px-4 py-3 border border-slate-600/50 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">{t('walletAddress')}</label>
                      <input
                        type="text"
                        value={guestWallet}
                        onChange={(e) => setGuestWallet(e.target.value)}
                        placeholder="Your wallet address"
                        className="w-full bg-slate-700/50 rounded-xl px-4 py-3 border border-slate-600/50 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <button
                      onClick={handleGuestExchange}
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-medium hover:opacity-90 transition-opacity"
                    >
                      {t('createRequest')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentRequest && (
              <div className="max-w-2xl mx-auto mb-8">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                  <h4 className="text-emerald-400 font-semibold mb-2">{t('requestCreated')}</h4>
                  <p className="text-slate-300 mb-2">{t('requestCodeInfo')} <span className="font-mono bg-slate-700/50 px-2 py-1 rounded">{currentRequest.id}</span></p>
                  <p className="text-slate-400 text-sm">{t('emailSent')}</p>
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-8 items-start mb-12">
              <div id="exchange" className="w-full">
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
                  <div className="mb-6">
                    <label className="block text-slate-400 text-sm mb-2">{t('youSend')}</label>
                    <div className="bg-slate-700/50 rounded-2xl p-4 border border-slate-600/50">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setShowFromCurrencySelector(true)}
                          className="flex items-center space-x-3 bg-slate-600/50 rounded-xl px-4 py-3 hover:bg-slate-600 transition-colors group"
                        >
                          <span className="text-2xl">{selectedFrom.icon}</span>
                          <div className="text-left">
                            <div className="font-semibold">{selectedFrom.symbol}</div>
                            <div className="text-xs text-slate-400">{selectedFrom.name}</div>
                          </div>
                          <svg
                            className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        <input
                          type="number"
                          value={amountFrom}
                          onChange={(e) => setAmountFrom(e.target.value)}
                          placeholder="0.00"
                          className="flex-1 bg-transparent text-right text-2xl font-semibold outline-none placeholder-slate-500"
                        />
                      </div>
                      <div className="mt-2 text-right text-sm text-slate-400">
                        ${(parseFloat(amountFrom || '0') * selectedFrom.price).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center -my-4 relative z-10">
                    <button
                      onClick={switchCurrencies}
                      className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-emerald-500/25"
                    >
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="mb-8 mt-4">
                    <label className="block text-slate-400 text-sm mb-2">{t('youReceive')}</label>
                    <div className="bg-slate-700/30 rounded-2xl p-4 border border-slate-600/30">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setShowToCurrencySelector(true)}
                          className="flex items-center space-x-3 bg-slate-600/30 rounded-xl px-4 py-3 hover:bg-slate-600/50 transition-colors group"
                        >
                          <span className="text-2xl">{selectedTo.icon}</span>
                          <div className="text-left">
                            <div className="font-semibold">{selectedTo.symbol}</div>
                            <div className="text-xs text-slate-400">{selectedTo.name}</div>
                          </div>
                          <svg
                            className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        <input
                          type="text"
                          value={amountTo}
                          readOnly
                          placeholder="0.00"
                          className="flex-1 bg-transparent text-right text-2xl font-semibold outline-none placeholder-slate-500 text-emerald-400"
                        />
                      </div>
                      <div className="mt-2 text-right text-sm text-slate-400">
                        ${(parseFloat(amountTo || '0') * selectedTo.price).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Location Selector */}
                  <div className="mb-4">
                    <label className="block text-slate-400 text-sm mb-2">Location</label>
                    <button
                      onClick={() => setShowLocationSelector(true)}
                      className="w-full flex items-center justify-between bg-slate-700/30 rounded-xl px-4 py-3 border border-slate-600/30 hover:border-emerald-500/50 transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        {selectedLocation ? (
                          <>
                            <span className="text-xl">{selectedLocation.flag}</span>
                            <div className="text-left">
                              <div className="font-medium text-white">{selectedLocation.city}</div>
                              <div className="text-xs text-slate-400">{selectedLocation.country}</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-slate-400">Select pickup location</span>
                          </>
                        )}
                      </div>
                      <svg className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                    <span>{t('exchangeRate')}</span>
                    <span>
                      1 {selectedFrom.symbol} = {(selectedFrom.price / selectedTo.price).toFixed(6)} {selectedTo.symbol}
                    </span>
                  </div>

                  {PromoCodeInput && (
                    <div className="mb-4">
                      <PromoCodeInput
                        amount={parseFloat(amountFrom) * selectedFrom.price || 0}
                        onApply={(discount, code) => {
                          setPromoDiscount(discount);
                          setPromoCode(code);
                        }}
                        onClear={() => {
                          setPromoDiscount(0);
                          setPromoCode('');
                        }}
                      />
                    </div>
                  )}

                  {promoDiscount > 0 && (
                    <div className="flex items-center justify-between text-sm mb-4 p-3 bg-emerald-500/10 rounded-lg">
                      <span className="text-slate-300">Discount ({promoCode})</span>
                      <span className="text-emerald-400 font-medium">-${promoDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <button
                    onClick={handleSwap}
                    disabled={isSwapping}
                    className={cn(
                      'w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-200',
                      isSwapping
                        ? 'bg-slate-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 hover:shadow-lg hover:shadow-emerald-500/25'
                    )}
                  >
                    {isSwapping ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{t('processing')}</span>
                      </div>
                    ) : (
                      t('exchangeNow')
                    )}
                  </button>
                </div>
              </div>

              <div id="markets" className="w-full">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="w-1 h-6 bg-gradient-to-b from-emerald-400 to-cyan-400 rounded-full mr-3"></span>
                  {t('liveMarkets')}
                </h2>

                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-700/30">
                        <tr>
                          <th className="text-left py-4 px-6 text-slate-400 font-medium">{t('asset')}</th>
                          <th className="text-right py-4 px-6 text-slate-400 font-medium">{t('price')}</th>
                          <th className="text-right py-4 px-6 text-slate-400 font-medium">{t('change24h')}</th>
                          <th className="text-right py-4 px-6 text-slate-400 font-medium">{t('action')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {currencies.map((currency) => (
                          <tr
                            key={currency.symbol}
                            className="hover:bg-slate-700/30 transition-colors group"
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-lg">
                                  {currency.icon}
                                </div>
                                <div>
                                  <div className="font-semibold">{currency.symbol}</div>
                                  <div className="text-sm text-slate-400">{currency.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-right font-mono">
                              ${currency.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span
                                className={cn(
                                  'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                                  currency.change >= 0
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : 'bg-red-500/10 text-red-400'
                                )}
                              >
                                {currency.change >= 0 ? '+' : ''}
                                {currency.change.toFixed(2)}%
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={() => {
                                  setSelectedTo(currency);
                                  document.getElementById('exchange')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="px-4 py-2 bg-slate-700/50 rounded-lg text-sm font-medium hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                {t('trade')}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div id="history" className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className="w-1 h-6 bg-gradient-to-b from-emerald-400 to-cyan-400 rounded-full mr-3"></span>
                {t('recentTransactions')}
              </h2>

              {transactionHistory.length === 0 ? (
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center">
                  <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-300 mb-2">{t('noTransactions')}</h3>
                  <p className="text-slate-500">{t('noTransactionsDesc')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactionHistory.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-emerald-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{transaction.from}</span>
                              <svg
                                className="w-4 h-4 text-slate-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                              <span className="font-medium text-emerald-400">{transaction.to}</span>
                            </div>
                            <div className="text-sm text-slate-400">{transaction.amount}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span
                            className={cn(
                              'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                              transaction.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-yellow-500/10 text-yellow-400'
                            )}
                          >
                            <span className="w-2 h-2 rounded-full mr-2 bg-current animate-pulse"></span>
                            {transaction.status === 'completed' ? t('completedStatus') : t('pendingStatus')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Methods Section */}
            <PaymentMethodsSection lang={currentLang} />

            {/* Locations Section */}
            <LocationsSection lang={currentLang} />

            {/* Money Transfers Section */}
            <TransfersSection lang={currentLang} />
          </>
        )}

        {currentPage === 'reviews' && (
          <div>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {t('reviewsTitle')}
                </span>
              </h1>
              <p className="text-slate-400 text-lg mb-8">{t('tagline')}</p>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-6 mt-6">
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 min-w-[150px]">
                  <div className="text-3xl font-bold text-emerald-400">{allReviews.length.toLocaleString()}</div>
                  <div className="text-slate-400 text-sm">{t('totalReviews')}</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 min-w-[150px]">
                  <div className="text-3xl font-bold text-emerald-400">{Math.round(allReviews.filter(r => r.isPositive).length / allReviews.length * 100)}%</div>
                  <div className="text-slate-400 text-sm">{t('positiveReviews')}</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 min-w-[150px]">
                  <div className="text-3xl font-bold text-yellow-400">
                    {(allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length).toFixed(1)}
                  </div>
                  <div className="text-slate-400 text-sm">Average Rating</div>
                </div>
              </div>
            </div>

            {/* Add Review Button */}
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Review</span>
              </button>
            </div>

            {/* Review Form Modal */}
            {showReviewForm && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowReviewForm(false)}>
                <div className="bg-slate-800 rounded-2xl p-8 max-w-lg w-full border border-slate-700 shadow-2xl animate-modalSlideIn" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">Write a Review</h3>
                    <button onClick={() => setShowReviewForm(false)} className="text-slate-400 hover:text-white p-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Name Input */}
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">Your Name</label>
                      <input
                        type="text"
                        value={newReviewName}
                        onChange={(e) => setNewReviewName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full bg-slate-700/50 rounded-xl px-4 py-3 border border-slate-600/50 focus:outline-none focus:border-emerald-400 text-white"
                      />
                    </div>

                    {/* Rating Selection */}
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">Your Rating</label>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setNewReviewRating(star)}
                            className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                          >
                            <span className={star <= newReviewRating ? 'text-yellow-400' : 'text-slate-600'}>★</span>
                          </button>
                        ))}
                        <span className="text-slate-400 ml-2">({newReviewRating}/5)</span>
                      </div>
                    </div>

                    {/* Comment Input */}
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">Your Review</label>
                      <textarea
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        placeholder="Share your experience..."
                        rows={4}
                        className="w-full bg-slate-700/50 rounded-xl px-4 py-3 border border-slate-600/50 focus:outline-none focus:border-emerald-400 text-white resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleSubmitReview}
                      className="w-full py-4 rounded-xl font-semibold text-lg transition-all bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90"
                    >
                      Submit Review
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Grid - 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-emerald-500/30 transition-all hover:shadow-lg hover:shadow-emerald-500/5 card-hover"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                        {review.userName[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{review.userName}</div>
                        <div className="text-xs text-slate-400">{review.date}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 mb-3">
                    {renderStars(review.rating)}
                    <span className={cn(
                      "ml-2 text-xs px-2 py-0.5 rounded-full",
                      review.isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"
                    )}>
                      {review.isPositive ? 'Positive' : 'Neutral'}
                    </span>
                  </div>
                  <p className={cn(
                    "text-sm leading-relaxed",
                    review.isPositive ? "text-slate-300" : "text-slate-400"
                  )}>
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center space-x-2 mt-8">
              <button
                onClick={() => setReviewsPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-lg font-medium transition-colors bg-slate-700/50 text-white hover:bg-slate-600/50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {(() => {
                  const pages = [];
                  const showPages = 5;
                  let start = Math.max(1, reviewsPage - Math.floor(showPages / 2));
                  let end = Math.min(totalReviewPages, start + showPages - 1);

                  if (end - start + 1 < showPages) {
                    start = Math.max(1, end - showPages + 1);
                  }

                  if (start > 1) {
                    pages.push(
                      <button key={1} onClick={() => setReviewsPage(1)} className="w-10 h-10 rounded-lg bg-slate-700/50 text-white hover:bg-slate-600/50">1</button>
                    );
                    if (start > 2) {
                      pages.push(<span key="start-ellipsis" className="text-slate-500 px-2">...</span>);
                    }
                  }

                  for (let i = start; i <= end; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setReviewsPage(i)}
                        className={cn(
                          "w-10 h-10 rounded-lg font-medium transition-colors",
                          i === reviewsPage
                            ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
                            : "bg-slate-700/50 text-white hover:bg-slate-600/50"
                        )}
                      >
                        {i}
                      </button>
                    );
                  }

                  if (end < totalReviewPages) {
                    if (end < totalReviewPages - 1) {
                      pages.push(<span key="end-ellipsis" className="text-slate-500 px-2">...</span>);
                    }
                    pages.push(
                      <button key={totalReviewPages} onClick={() => setReviewsPage(totalReviewPages)} className="w-10 h-10 rounded-lg bg-slate-700/50 text-white hover:bg-slate-600/50">{totalReviewPages}</button>
                    );
                  }

                  return pages;
                })()}
              </div>

              <button
                onClick={() => setReviewsPage(p => Math.min(totalReviewPages, p + 1))}
                className="px-4 py-2 rounded-lg font-medium transition-colors bg-slate-700/50 text-white hover:bg-slate-600/50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Page info */}
            <div className="text-center mt-4 text-slate-400 text-sm">
              Page {reviewsPage} of {totalReviewPages} ({allReviews.length.toLocaleString()} reviews)
            </div>
          </div>
        )}

        {currentPage === 'track' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {t('trackRequest')}
                </span>
              </h1>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl mb-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">{t('requestCode')}</label>
                  <input
                    type="text"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="ODINXXXXXXX"
                    className="w-full bg-slate-700/50 rounded-xl px-4 py-3 border border-slate-600/50 focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <button
                  onClick={trackRequest}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  {t('checkStatus')}
                </button>
              </div>
            </div>

            {trackedRequest && (
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50">
                <h3 className="text-xl font-semibold mb-6">{t('status')}: {trackedRequest.id}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('status')}:</span>
                    <span className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium',
                      trackedRequest.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                      trackedRequest.status === 'processing' ? 'bg-yellow-500/10 text-yellow-400' :
                      trackedRequest.status === 'waiting' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-red-500/10 text-red-400'
                    )}>
                      {trackedRequest.status === 'completed' ? t('completedStatus') :
                       trackedRequest.status === 'processing' ? t('processingStatus') :
                       trackedRequest.status === 'waiting' ? t('waiting') :
                       t('expiredStatus')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span>{trackedRequest.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('exchange')}:</span>
                    <span>{trackedRequest.amount} {trackedRequest.fromCurrency} → {trackedRequest.toCurrency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email sent:</span>
                    <span className={trackedRequest.emailSent ? 'text-emerald-400' : 'text-slate-400'}>
                      {trackedRequest.emailSent ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Telegram sent:</span>
                    <span className={trackedRequest.telegramSent ? 'text-emerald-400' : 'text-slate-400'}>
                      {trackedRequest.telegramSent ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-2xl border border-emerald-500/20 p-6">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('securePrivate')}</h3>
            <p className="text-slate-400 text-sm">{t('secureDesc')}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-2xl border border-emerald-500/20 p-6">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('instantExchange')}</h3>
            <p className="text-slate-400 text-sm">{t('instantDesc')}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-2xl border border-emerald-500/20 p-6">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('bestRatesService')}</h3>
            <p className="text-slate-400 text-sm">{t('bestDesc')}</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-700/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold">Ø</span>
                </div>
                <span className="text-xl font-bold">{t('siteName')}</span>
              </div>
              <p className="text-slate-400 mb-6 max-w-md">
                {t('reliablePlatform')}
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center hover:bg-emerald-500/20 transition-colors">
                  <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center hover:bg-emerald-500/20 transition-colors">
                  <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center hover:bg-emerald-500/20 transition-colors">
                  <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('products')}</h4>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">{t('exchange')}</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">{t('markets')}</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">{t('wallet')}</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">{t('api')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('support')}</h4>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">{t('helpCenter')}</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">{t('fees')}</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">{t('apiDocumentation')}</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">{t('contactUs')}</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700/50 mt-12 pt-8 text-center text-slate-500 text-sm">
            <p>{t('allRights')}</p>
          </div>
        </div>
      </footer>

      {/* Support Chat Widget */}
      <SupportChat lang={currentLang} />

      {/* Scroll to Top Button */}
      <ScrollToTop />

      {/* Currency Selector Modals */}
      <CurrencySelector
        isOpen={showFromCurrencySelector}
        onClose={() => setShowFromCurrencySelector(false)}
        onSelect={(currency) => setSelectedFrom(currency)}
        currencies={currencies}
        selectedCurrency={selectedFrom}
        title={t('youSend')}
      />

      <CurrencySelector
        isOpen={showToCurrencySelector}
        onClose={() => setShowToCurrencySelector(false)}
        onSelect={(currency) => setSelectedTo(currency)}
        currencies={currencies}
        selectedCurrency={selectedTo}
        title={t('youReceive')}
      />

      {/* Location Selector Modal */}
      <LocationSelector
        isOpen={showLocationSelector}
        onClose={() => setShowLocationSelector(false)}
        onSelect={(location) => setSelectedLocation({
          id: location.id,
          city: location.city,
          country: location.country,
          flag: location.flag
        })}
        selectedLocation={selectedLocation ? {
          id: selectedLocation.id,
          country: selectedLocation.country,
          countryCode: '',
          city: selectedLocation.city,
          isAvailable: true,
          flag: selectedLocation.flag
        } : null}
        lang={currentLang}
      />
    </div>
  );
}
