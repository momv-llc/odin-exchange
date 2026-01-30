'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function RatesDisplay() {
  const { data: rates, isLoading } = useQuery({
    queryKey: ['rates'],
    queryFn: () => api.get('/rates').then((r) => r.data.data),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center gap-6 mb-6 py-2">
        <div className="animate-pulse bg-gray-700 h-6 w-32 rounded"></div>
        <div className="animate-pulse bg-gray-700 h-6 w-32 rounded"></div>
      </div>
    );
  }

  if (!rates || rates.length === 0) {
    return null;
  }

  return (
    <div className="flex justify-center gap-8 mb-6 py-2 border-b border-gray-700">
      {rates.map((rate: any) => (
        <div key={rate.symbol} className="text-center">
          <span className="text-gray-400 text-sm">
            {rate.symbol.replace('USDT', '/USD')}
          </span>
          <span className="ml-2 text-white font-semibold">
            ${parseFloat(rate.rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      ))}
    </div>
  );
}
