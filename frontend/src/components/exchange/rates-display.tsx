'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api/client';

interface Rate {
  symbol: string;
  rate: number;
  effectiveRate: number;
}

export function RatesDisplay() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await api.get('/rates');
        setRates(response.data.data || []);
        setError(false);
      } catch (err) {
        console.error('Error fetching rates:', err);
        setError(true);
        // Use mock data if API fails
        setRates([
          { symbol: 'BTCUSD', rate: 67500, effectiveRate: 67162.5 },
          { symbol: 'ETHUSD', rate: 3500, effectiveRate: 3482.5 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center gap-8 mb-6 py-3 border-b border-gray-700">
        <div className="animate-pulse bg-gray-700 h-6 w-32 rounded"></div>
        <div className="animate-pulse bg-gray-700 h-6 w-32 rounded"></div>
      </div>
    );
  }

  if (rates.length === 0) {
    return null;
  }

  return (
    <div className="flex justify-center gap-8 mb-6 py-3 border-b border-gray-700">
      {rates.map((rate) => {
        const pair = rate.symbol.replace('USDT', '').replace('USD', '') + '/USD';
        return (
          <div key={rate.symbol} className="text-center">
            <span className="text-gray-400 text-sm">{pair}</span>
            <span className="ml-2 text-white font-semibold">
              ${rate.rate?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || '0.00'}
            </span>
            {error && <span className="text-yellow-500 text-xs ml-1">*</span>}
          </div>
        );
      })}
    </div>
  );
}
