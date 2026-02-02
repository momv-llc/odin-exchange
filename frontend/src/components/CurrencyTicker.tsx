import { useState, useEffect, useRef } from 'react';

interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  icon: string;
  type: 'crypto' | 'fiat' | 'commodity';
}

const initialTickerData: TickerItem[] = [
  // Crypto
  { symbol: 'BTC', name: 'Bitcoin', price: 97500.50, change: 2.34, icon: '₿', type: 'crypto' },
  { symbol: 'ETH', name: 'Ethereum', price: 3280.75, change: -1.23, icon: 'Ξ', type: 'crypto' },
  { symbol: 'USDT', name: 'Tether', price: 1.00, change: 0.01, icon: '₮', type: 'crypto' },
  { symbol: 'BNB', name: 'BNB', price: 612.45, change: 0.87, icon: '⬡', type: 'crypto' },
  { symbol: 'SOL', name: 'Solana', price: 198.65, change: 5.43, icon: '◎', type: 'crypto' },
  { symbol: 'XRP', name: 'XRP', price: 2.62, change: -0.54, icon: '✕', type: 'crypto' },
  // Fiat currencies
  { symbol: 'EUR/USD', name: 'Euro', price: 1.0842, change: 0.12, icon: '€', type: 'fiat' },
  { symbol: 'GBP/USD', name: 'Pound', price: 1.2651, change: -0.08, icon: '£', type: 'fiat' },
  { symbol: 'USD/RUB', name: 'Ruble', price: 89.45, change: 0.34, icon: '₽', type: 'fiat' },
  { symbol: 'USD/UAH', name: 'Hryvnia', price: 41.25, change: 0.15, icon: '₴', type: 'fiat' },
  { symbol: 'USD/CHF', name: 'Franc', price: 0.8823, change: -0.21, icon: 'Fr', type: 'fiat' },
  // Commodities
  { symbol: 'XAU', name: 'Gold', price: 2045.30, change: 0.45, icon: '🥇', type: 'commodity' },
  { symbol: 'XAG', name: 'Silver', price: 23.15, change: -0.32, icon: '🥈', type: 'commodity' },
  { symbol: 'OIL', name: 'Brent', price: 82.45, change: 1.23, icon: '🛢️', type: 'commodity' },
];

export function CurrencyTicker() {
  const [tickerData, setTickerData] = useState<TickerItem[]>(initialTickerData);
  const [isPaused, setIsPaused] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerData((prev) =>
        prev.map((item) => ({
          ...item,
          price: item.type === 'crypto'
            ? item.price * (1 + (Math.random() - 0.5) * 0.002)
            : item.price * (1 + (Math.random() - 0.5) * 0.0005),
          change: item.change + (Math.random() - 0.5) * 0.1,
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
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
