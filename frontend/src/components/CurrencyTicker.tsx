import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api/client';

interface LiveRateResponse {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number | string;
  change24h?: number | string | null;
  source?: string;
}

interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  icon: string;
  type: 'crypto' | 'fiat' | 'commodity';
}

const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP'];
const FIAT_PAIRS = ['EUR/USD', 'GBP/USD', 'USD/RUB', 'USD/UAH', 'USD/CHF'];
const COMMODITY_SYMBOLS = ['XAU', 'XAG', 'OIL'];

const NAME_MAP: Record<string, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  USDT: 'Tether',
  BNB: 'BNB',
  SOL: 'Solana',
  XRP: 'XRP',
  EUR: 'Euro',
  GBP: 'Pound',
  USD: 'US Dollar',
  RUB: 'Ruble',
  UAH: 'Hryvnia',
  CHF: 'Franc',
  XAU: 'Gold',
  XAG: 'Silver',
  OIL: 'Brent',
};

const ICON_MAP: Record<string, string> = {
  BTC: '₿',
  ETH: 'Ξ',
  USDT: '₮',
  BNB: '⬡',
  SOL: '◎',
  XRP: '✕',
  EUR: '€',
  GBP: '£',
  USD: '$',
  RUB: '₽',
  UAH: '₴',
  CHF: 'Fr',
  XAU: '🥇',
  XAG: '🥈',
  OIL: '🛢️',
};

const CRYPTO_REFRESH_MS = 60 * 1000;
const FIAT_REFRESH_MS = 60 * 60 * 1000;

const getRateType = (rate: LiveRateResponse): TickerItem['type'] => {
  const base = rate.baseCurrency.toUpperCase();

  if (COMMODITY_SYMBOLS.includes(base)) {
    return 'commodity';
  }

  if (rate.source === 'FIXER') {
    return 'fiat';
  }

  return 'crypto';
};

const buildSymbol = (base: string, quote: string, type: TickerItem['type']) => {
  if (type === 'crypto' || type === 'commodity') {
    return base;
  }

  return `${base}/${quote}`;
};

const normalizeRates = (rates: LiveRateResponse[]) => {
  return rates
    .map((rate) => {
      const base = rate.baseCurrency.toUpperCase();
      const quote = rate.quoteCurrency.toUpperCase();
      const type = getRateType(rate);
      const symbol = buildSymbol(base, quote, type);
      const price = Number(rate.rate);
      const change = Number(rate.change24h ?? 0);

      if (!Number.isFinite(price)) {
        return null;
      }

      return {
        symbol,
        name: NAME_MAP[base] ?? base,
        price,
        change: Number.isFinite(change) ? change : 0,
        icon: ICON_MAP[base] ?? '●',
        type,
      } as TickerItem;
    })
    .filter((item): item is TickerItem => Boolean(item));
};

const sortTickerData = (items: TickerItem[]) => {
  const typeOrder: Record<TickerItem['type'], number> = {
    crypto: 0,
    fiat: 1,
    commodity: 2,
  };

  return [...items].sort((a, b) => {
    if (typeOrder[a.type] !== typeOrder[b.type]) {
      return typeOrder[a.type] - typeOrder[b.type];
    }

    if (a.type === 'crypto') {
      return CRYPTO_SYMBOLS.indexOf(a.symbol) - CRYPTO_SYMBOLS.indexOf(b.symbol);
    }

    if (a.type === 'commodity') {
      return COMMODITY_SYMBOLS.indexOf(a.symbol) - COMMODITY_SYMBOLS.indexOf(b.symbol);
    }

    return FIAT_PAIRS.indexOf(a.symbol) - FIAT_PAIRS.indexOf(b.symbol);
  });
};

export function CurrencyTicker() {
  const [tickerData, setTickerData] = useState<TickerItem[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);

  const fetchLiveRates = async () => {
    const response = await api.get<LiveRateResponse[]>('/exchange-rates/live');
    return Array.isArray(response.data) ? response.data : [];
  };

  const updateTickerData = (items: TickerItem[], typesToReplace: TickerItem['type'][]) => {
    setTickerData((prev) => {
      const retained = prev.filter((item) => !typesToReplace.includes(item.type));
      return sortTickerData([...retained, ...items]);
    });
  };

  const updateCryptoRates = async (isActive: () => boolean) => {
    try {
      const rates = await fetchLiveRates();
      if (!isActive()) {
        return;
      }
      const normalized = normalizeRates(rates).filter(
        (rate) => rate.type === 'crypto' && CRYPTO_SYMBOLS.includes(rate.symbol)
      );
      updateTickerData(normalized, ['crypto']);
    } catch (error) {
      console.error('Failed to fetch crypto rates:', error);
    }
  };

  const updateFiatRates = async (isActive: () => boolean) => {
    try {
      const rates = await fetchLiveRates();
      if (!isActive()) {
        return;
      }
      const normalized = normalizeRates(rates).filter((rate) => {
        if (rate.type === 'commodity') {
          return COMMODITY_SYMBOLS.includes(rate.symbol);
        }

        return rate.type === 'fiat' && FIAT_PAIRS.includes(rate.symbol);
      });
      updateTickerData(normalized, ['fiat', 'commodity']);
    } catch (error) {
      console.error('Failed to fetch fiat rates:', error);
    }
  };

  useEffect(() => {
    let active = true;
    const isActive = () => active;

    updateCryptoRates(isActive);
    updateFiatRates(isActive);

    const cryptoInterval = setInterval(() => updateCryptoRates(isActive), CRYPTO_REFRESH_MS);
    const fiatInterval = setInterval(() => updateFiatRates(isActive), FIAT_REFRESH_MS);

    return () => {
      active = false;
      clearInterval(cryptoInterval);
      clearInterval(fiatInterval);
    };
  }, []);

  const formatPrice = (price: number, type: string) => {
    if (type === 'crypto') {
      return price >= 1000
        ? price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : price.toFixed(4);
    }
    return price.toFixed(type === 'fiat' ? 4 : 2);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'crypto': return 'text-cyan-400';
      case 'fiat': return 'text-emerald-400';
      case 'commodity': return 'text-amber-400';
      default: return 'text-white';
    }
  };

  // Duplicate items for seamless loop
  const duplicatedData = [...tickerData, ...tickerData];

  return (
    <div
      className="bg-slate-950/90 border-b border-slate-800/50 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative flex items-center h-10">
        {/* Gradient overlays for smooth edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

        <div
          ref={tickerRef}
          className={`flex items-center whitespace-nowrap ${isPaused ? 'animate-none' : 'animate-ticker'}`}
          style={{
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          {duplicatedData.map((item, index) => (
            <div
              key={`${item.symbol}-${index}`}
              className="flex items-center px-4 border-r border-slate-800/30 hover:bg-slate-800/30 transition-colors cursor-pointer"
            >
              <span className="text-lg mr-2">{item.icon}</span>
              <span className={`font-medium mr-2 ${getTypeColor(item.type)}`}>
                {item.symbol}
              </span>
              <span className="text-white font-mono mr-2">
                ${formatPrice(item.price, item.type)}
              </span>
              <span
                className={`text-sm font-medium ${
                  item.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-ticker {
          animation: ticker 60s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default CurrencyTicker;
