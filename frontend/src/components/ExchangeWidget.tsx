import { useState, useEffect } from 'react';
import { Language, translations, TranslationKey } from '../translations';
import { ArrowUpDown, Wallet, TrendingUp, Shield } from 'lucide-react';
import { cn } from '../utils/cn';

interface Currency {
  symbol: string;
  name: string;
  price: number;
  change: number;
  icon: string;
  network?: string;
}

interface ExchangeWidgetProps {
  currentLang: Language;
  onExchangeComplete?: (transaction: any) => void;
}

export function ExchangeWidget({ currentLang, onExchangeComplete }: ExchangeWidgetProps) {
  const t = (key: TranslationKey) => translations[currentLang][key];
  
  const [currencies] = useState<Currency[]>([
    { symbol: 'BTC', name: 'Bitcoin', price: 43250.50, change: 2.34, icon: '₿', network: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum', price: 2280.75, change: -1.23, icon: 'Ξ', network: 'ERC20' },
    { symbol: 'USDT', name: 'Tether', price: 1.00, change: 0.01, icon: '₮', network: 'TRC20' },
    { symbol: 'USDC', name: 'USD Coin', price: 1.00, change: 0.00, icon: '$', network: 'ERC20' },
    { symbol: 'BNB', name: 'BNB', price: 312.45, change: 0.87, icon: '⬡', network: 'BEP20' },
    { symbol: 'SOL', name: 'Solana', price: 98.65, change: 5.43, icon: '◎', network: 'Solana' },
    { symbol: 'XRP', name: 'XRP', price: 0.62, change: -0.54, icon: '✕', network: 'XRP' },
    { symbol: 'ADA', name: 'Cardano', price: 0.58, change: 1.23, icon: '₳', network: 'Cardano' },
    { symbol: 'DOGE', name: 'Dogecoin', price: 0.085, change: 3.21, icon: 'Ð', network: 'Dogecoin' },
    { symbol: 'LTC', name: 'Litecoin', price: 72.50, change: -0.87, icon: 'Ł', network: 'Litecoin' },
  ]);

  const [selectedFrom, setSelectedFrom] = useState<Currency>(currencies[2]);
  const [selectedTo, setSelectedTo] = useState<Currency>(currencies[0]);
  const [amountFrom, setAmountFrom] = useState<string>('1000');
  const [amountTo, setAmountTo] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [email, setEmail] = useState('');
  const [isGuestMode, setIsGuestMode] = useState(false);

  useEffect(() => {
    if (amountFrom && selectedFrom && selectedTo) {
      const fromAmount = parseFloat(amountFrom);
      if (!isNaN(fromAmount)) {
        const result = (fromAmount * selectedFrom.price) / selectedTo.price;
        setAmountTo(result.toFixed(6));
      }
    }
  }, [amountFrom, selectedFrom, selectedTo]);

  const handleSwap = () => {
    if (!amountFrom || parseFloat(amountFrom) <= 0) return;
    if (!walletAddress || !email) {
      alert('Please provide wallet address and email');
      return;
    }

    setIsProcessing(true);

    // Generate unique transaction ID
    const transactionId = 'ODIN' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    const transaction = {
      id: transactionId,
      from: `${amountFrom} ${selectedFrom.symbol}`,
      to: `${amountTo} ${selectedTo.symbol}`,
      amount: `$${(parseFloat(amountFrom) * selectedFrom.price).toFixed(2)}`,
      walletAddress,
      email,
      status: 'processing',
      timestamp: new Date(),
    };

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      if (onExchangeComplete) {
        onExchangeComplete({ ...transaction, status: 'completed' });
      }
      // Reset form
      setAmountFrom('');
      setAmountTo('');
      setWalletAddress('');
      setEmail('');
    }, 3000);
  };

  const switchCurrencies = () => {
    const temp = selectedFrom;
    setSelectedFrom(selectedTo);
    setSelectedTo(temp);
    const tempAmount = amountFrom;
    setAmountFrom(amountTo);
    setAmountTo(tempAmount);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Instant Exchange</h2>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-emerald-400">Secure Exchange</span>
          </div>
        </div>

        {/* Guest Mode Toggle */}
        <div className="bg-slate-700/30 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Exchange as Guest</h3>
              <p className="text-sm text-slate-400">No registration required</p>
            </div>
            <button
              onClick={() => setIsGuestMode(!isGuestMode)}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                isGuestMode 
                  ? "bg-emerald-500 text-white" 
                  : "bg-slate-600 text-slate-300 hover:bg-slate-500"
              )}
            >
              {isGuestMode ? 'Guest Mode ON' : 'Enable Guest'}
            </button>
          </div>
        </div>

        {/* From Currency */}
        <div className="mb-6">
          <label className="block text-slate-400 text-sm mb-2">You Send</label>
          <div className="bg-slate-700/50 rounded-2xl p-4 border border-slate-600/50">
            <div className="flex items-center space-x-4 mb-3">
              <button
                onClick={() => setShowFromDropdown(!showFromDropdown)}
                className="flex items-center space-x-3 bg-slate-600/50 rounded-xl px-4 py-3 hover:bg-slate-600 transition-colors flex-1"
              >
                <span className="text-2xl">{selectedFrom.icon}</span>
                <div className="text-left flex-1">
                  <div className="font-semibold">{selectedFrom.symbol}</div>
                  <div className="text-xs text-slate-400">{selectedFrom.name}</div>
                </div>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
            
            {/* Currency Dropdown */}
            {showFromDropdown && (
              <div className="mt-2 bg-slate-900 border border-slate-700 rounded-xl max-h-60 overflow-y-auto">
                {currencies.map((currency) => (
                  <button
                    key={currency.symbol}
                    onClick={() => {
                      setSelectedFrom(currency);
                      setShowFromDropdown(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-800 transition-colors"
                  >
                    <span className="text-xl">{currency.icon}</span>
                    <div className="text-left flex-1">
                      <div className="font-medium">{currency.symbol}</div>
                      <div className="text-xs text-slate-400">{currency.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm">{formatPrice(currency.price)}</div>
                      <div className={cn(
                        "text-xs",
                        currency.change >= 0 ? "text-emerald-400" : "text-red-400"
                      )}>
                        {currency.change >= 0 ? '+' : ''}{currency.change}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            <div className="mt-2 text-right text-sm text-slate-400">
              {formatPrice(parseFloat(amountFrom || '0') * selectedFrom.price)}
            </div>
          </div>
        </div>

        {/* Switch Button */}
        <div className="flex justify-center -my-4 relative z-10">
          <button
            onClick={switchCurrencies}
            className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-emerald-500/25"
          >
            <ArrowUpDown className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* To Currency */}
        <div className="mb-6 mt-4">
          <label className="block text-slate-400 text-sm mb-2">You Receive</label>
          <div className="bg-slate-700/30 rounded-2xl p-4 border border-slate-600/30">
            <div className="flex items-center space-x-4 mb-3">
              <button
                onClick={() => setShowToDropdown(!showToDropdown)}
                className="flex items-center space-x-3 bg-slate-600/30 rounded-xl px-4 py-3 hover:bg-slate-600/50 transition-colors flex-1"
              >
                <span className="text-2xl">{selectedTo.icon}</span>
                <div className="text-left flex-1">
                  <div className="font-semibold">{selectedTo.symbol}</div>
                  <div className="text-xs text-slate-400">{selectedTo.name}</div>
                </div>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
            
            {/* Currency Dropdown */}
            {showToDropdown && (
              <div className="mt-2 bg-slate-900 border border-slate-700 rounded-xl max-h-60 overflow-y-auto">
                {currencies.map((currency) => (
                  <button
                    key={currency.symbol}
                    onClick={() => {
                      setSelectedTo(currency);
                      setShowToDropdown(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-800 transition-colors"
                  >
                    <span className="text-xl">{currency.icon}</span>
                    <div className="text-left flex-1">
                      <div className="font-medium">{currency.symbol}</div>
                      <div className="text-xs text-slate-400">{currency.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm">{formatPrice(currency.price)}</div>
                      <div className={cn(
                        "text-xs",
                        currency.change >= 0 ? "text-emerald-400" : "text-red-400"
                      )}>
                        {currency.change >= 0 ? '+' : ''}{currency.change}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            <div className="mt-2 text-right text-sm text-slate-400">
              {formatPrice(parseFloat(amountTo || '0') * selectedTo.price)}
            </div>
          </div>
        </div>

        {/* Exchange Rate */}
        <div className="flex items-center justify-between text-sm text-slate-400 mb-6 p-4 bg-slate-700/30 rounded-xl">
          <span>Exchange Rate</span>
          <span className="font-mono">
            1 {selectedFrom.symbol} = {(selectedFrom.price / selectedTo.price).toFixed(6)} {selectedTo.symbol}
          </span>
        </div>

        {/* User Information */}
        {isGuestMode && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-slate-700/50 rounded-xl px-4 py-3 border border-slate-600/50 focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">
                {selectedTo.network} Wallet Address
              </label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder={`Enter your ${selectedTo.network} wallet address`}
                className="w-full bg-slate-700/50 rounded-xl px-4 py-3 border border-slate-600/50 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-slate-700/30 rounded-xl">
            <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <div className="text-xs text-slate-400">Best Rates</div>
          </div>
          <div className="text-center p-3 bg-slate-700/30 rounded-xl">
            <Shield className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <div className="text-xs text-slate-400">Secure</div>
          </div>
          <div className="text-center p-3 bg-slate-700/30 rounded-xl">
            <Wallet className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <div className="text-xs text-slate-400">Instant</div>
          </div>
        </div>

        {/* Exchange Button */}
        <button
          onClick={handleSwap}
          disabled={isProcessing || !amountFrom || parseFloat(amountFrom) <= 0}
          className={cn(
            'w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-200',
            isProcessing || !amountFrom || parseFloat(amountFrom) <= 0
              ? 'bg-slate-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 hover:shadow-lg hover:shadow-emerald-500/25'
          )}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </div>
          ) : (
            'Exchange Now'
          )}
        </button>

        {/* Fee Information */}
        <div className="mt-4 text-center text-xs text-slate-500">
          Network fees may apply • Exchange fee: 0.5% • Min amount: $10
        </div>
      </div>
    </div>
  );
}