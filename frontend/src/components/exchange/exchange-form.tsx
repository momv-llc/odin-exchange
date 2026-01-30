'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';

const schema = z.object({
  fromAmount: z.string().min(1, 'Required').transform(Number).pipe(z.number().positive('Must be positive')),
  clientEmail: z.string().email('Invalid email'),
  clientPhone: z.string().optional(),
  clientWallet: z.string().min(20, 'Invalid wallet address').max(255),
});

type FormData = z.infer<typeof schema>;

export function ExchangeForm() {
  const router = useRouter();
  const [fromCurrency, setFromCurrency] = useState('BTC');
  const [toCurrency, setToCurrency] = useState('USD');

  const { data: currencies } = useQuery({
    queryKey: ['currencies'],
    queryFn: () => api.get('/currencies').then((r) => r.data.data),
  });

  const { data: rate } = useQuery({
    queryKey: ['rate', fromCurrency, toCurrency],
    queryFn: () => api.get(`/rates/pair?from=${fromCurrency}&to=${toCurrency}`).then((r) => r.data.data),
    enabled: !!fromCurrency && !!toCurrency,
    refetchInterval: 30000,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const fromAmount = watch('fromAmount');
  const toAmount = fromAmount && rate?.effectiveRate
    ? (Number(fromAmount) * rate.effectiveRate).toFixed(2)
    : '0.00';

  const createOrder = useMutation({
    mutationFn: (data: FormData) =>
      api.post('/orders', { ...data, fromCurrency, toCurrency }).then((r) => r.data.data),
    onSuccess: (data) => {
      router.push(`/track/${data.code}`);
    },
  });

  const onSubmit = (data: FormData) => {
    createOrder.mutate(data);
  };

  const cryptoCurrencies = currencies?.filter((c: any) => c.type === 'CRYPTO') || [];
  const fiatCurrencies = currencies?.filter((c: any) => c.type === 'FIAT') || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Currency Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">You Send</label>
          <div className="flex gap-2">
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600"
            >
              {cryptoCurrencies.map((c: any) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
            <input
              {...register('fromAmount')}
              type="number"
              step="any"
              placeholder="0.00"
              className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600"
            />
          </div>
          {errors.fromAmount && (
            <p className="text-red-400 text-sm mt-1">{errors.fromAmount.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">You Receive</label>
          <div className="flex gap-2">
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600"
            >
              {fiatCurrencies.map((c: any) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
            <div className="flex-1 bg-gray-600 text-white rounded-lg px-4 py-3 border border-gray-600 flex items-center">
              <span className="text-xl font-semibold">{toAmount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Display */}
      {rate && (
        <div className="text-center py-2 bg-gray-700/50 rounded-lg">
          <span className="text-gray-400">Rate: </span>
          <span className="text-white font-medium">
            1 {fromCurrency} = {rate.effectiveRate?.toFixed(2)} {toCurrency}
          </span>
          <span className="text-gray-500 text-sm ml-2">(incl. 0.5% fee)</span>
        </div>
      )}

      {/* Contact Details */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Email Address</label>
          <input
            {...register('clientEmail')}
            type="email"
            placeholder="your@email.com"
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600"
          />
          {errors.clientEmail && (
            <p className="text-red-400 text-sm mt-1">{errors.clientEmail.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Phone (Optional)</label>
          <input
            {...register('clientPhone')}
            type="tel"
            placeholder="+1 234 567 8900"
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Your Crypto Wallet</label>
          <input
            {...register('clientWallet')}
            placeholder="Enter your wallet address"
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 font-mono text-sm"
          />
          {errors.clientWallet && (
            <p className="text-red-400 text-sm mt-1">{errors.clientWallet.message}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={createOrder.isPending}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition flex items-center justify-center gap-2"
      >
        {createOrder.isPending ? (
          <>
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
            Creating Order...
          </>
        ) : (
          'Create Exchange Order'
        )}
      </button>

      {/* Error Message */}
      {createOrder.isError && (
        <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg">
          <p className="text-red-400 text-center">
            Failed to create order. Please try again.
          </p>
        </div>
      )}
    </form>
  );
}
