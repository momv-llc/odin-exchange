import { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, TrendingDown } from 'lucide-react';

interface Currency {
  symbol: string;
  name: string;
  price: number;
  change?: number;
  icon: string;
  network?: string;
}

interface CurrencySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (currency: Currency) => void;
  currencies: Currency[];
  selectedCurrency?: Currency;
  title?: string;
}

const cryptoIcons: Record<string, string> = {
  BTC: '₿',
  ETH: 'Ξ',
  USDT: '₮',
  USDC: '$',
  BNB: '⬡',
  SOL: '◎',
  XRP: '✕',
  ADA: '₳',
  DOGE: 'Ð',
  LTC: 'Ł',
  EUR: '€',
  USD: '$',
  GBP: '£',
  CHF: '₣',
  RUB: '₽',
  UAH: '₴',
};

export function CurrencySelector({
  isOpen,
  onClose,
  onSelect,
  currencies,
  selectedCurrency,
  title = 'Select Currency'
}: CurrencySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'crypto' | 'fiat'>('crypto');
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const cryptoCurrencies = currencies.filter(c =>
    ['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'LTC'].includes(c.symbol)
  );

  const fiatCurrencies = currencies.filter(c =>
    ['EUR', 'USD', 'GBP', 'CHF', 'RUB', 'UAH'].includes(c.symbol)
  );

  const displayCurrencies = activeTab === 'crypto' ? cryptoCurrencies : fiatCurrencies;

  const filteredCurrencies = displayCurrencies.filter(
    (currency) =>
      currency.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (currency: Currency) => {
    onSelect(currency);
    onClose();
    setSearchQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl animate-modalSlideIn overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or symbol..."
              className="w-full bg-slate-700/50 text-white placeholder-slate-400 pl-10 pr-4 py-3 rounded-xl border border-slate-600/50 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-2 mx-4 mt-2 bg-slate-700/30 rounded-lg">
          <button
            onClick={() => setActiveTab('crypto')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'crypto'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Crypto
          </button>
          <button
            onClick={() => setActiveTab('fiat')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'fiat'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Fiat
          </button>
        </div>

        {/* Currency List */}
        <div className="max-h-80 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
          {filteredCurrencies.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No currencies found
            </div>
          ) : (
            filteredCurrencies.map((currency) => (
              <button
                key={currency.symbol}
                onClick={() => handleSelect(currency)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                  selectedCurrency?.symbol === currency.symbol
                    ? 'bg-emerald-500/20 border border-emerald-500/50'
                    : 'bg-slate-700/30 hover:bg-slate-700/50 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-lg">
                    {cryptoIcons[currency.symbol] || currency.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-white">{currency.symbol}</div>
                    <div className="text-sm text-slate-400">{currency.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-white">
                    ${currency.price.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: currency.price < 1 ? 4 : 2
                    })}
                  </div>
                  {currency.change !== undefined && (
                    <div className={`flex items-center justify-end text-sm ${
                      currency.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {currency.change >= 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {currency.change >= 0 ? '+' : ''}{currency.change.toFixed(2)}%
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Popular section */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="text-xs text-slate-400 mb-2">Popular</div>
          <div className="flex flex-wrap gap-2">
            {['BTC', 'ETH', 'USDT', 'EUR', 'USD'].map((symbol) => {
              const currency = currencies.find(c => c.symbol === symbol);
              if (!currency) return null;
              return (
                <button
                  key={symbol}
                  onClick={() => handleSelect(currency)}
                  className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center space-x-1"
                >
                  <span>{cryptoIcons[symbol]}</span>
                  <span>{symbol}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CurrencySelector;
