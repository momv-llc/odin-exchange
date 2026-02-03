'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api/client';

const schema = z.object({
  fromAmount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Must be positive'),
  clientEmail: z.string().email('Invalid email address'),
  clientPhone: z.string().optional(),
  clientWallet: z
    .string()
    .min(20, 'Wallet address must be at least 20 characters')
    .max(255, 'Wallet address too long'),
});

type FormData = z.infer<typeof schema>;

interface Currency {
  code: string;
  name: string;
  type: 'CRYPTO' | 'FIAT';
  minAmount: string;
  maxAmount: string;
}

interface Rate {
  rate: number;
  effectiveRate: number;
}

// Default currencies if API fails
const defaultCurrencies: Currency[] = [
  { code: 'BTC', name: 'Bitcoin', type: 'CRYPTO', minAmount: '0.001', maxAmount: '10' },
  { code: 'ETH', name: 'Ethereum', type: 'CRYPTO', minAmount: '0.01', maxAmount: '100' },
  { code: 'USDT', name: 'Tether', type: 'CRYPTO', minAmount: '10', maxAmount: '100000' },
  { code: 'USD', name: 'US Dollar', type: 'FIAT', minAmount: '10', maxAmount: '100000' },
  { code: 'EUR', name: 'Euro', type: 'FIAT', minAmount: '10', maxAmount: '100000' },
];

export function ExchangeForm() {
  const navigate = useNavigate();
  
  const [currencies, setCurrencies] = useState<Currency[]>(defaultCurrencies);
  const [fromCurrency, setFromCurrency] = useState('BTC');
  const [toCurrency, setToCurrency] = useState('USD');
  const [rate, setRate] = useState<Rate | null>(null);
  const [loadingRate, setLoadingRate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fromAmount: '',
      clientEmail: '',
      clientPhone: '',
      clientWallet: '',
    },
  });

  const fromAmount = watch('fromAmount');

  // Calculate receive amount
  const toAmount = useMemo(() => {
    if (!fromAmount || !rate?.effectiveRate) return '0.00';
    const amount = parseFloat(fromAmount);
    if (isNaN(amount) || amount <= 0) return '0.00';
    return (amount * rate.effectiveRate).toFixed(2);
  }, [fromAmount, rate]);

  // Fetch currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await api.get('/currencies');
        if (response.data.data?.length > 0) {
          setCurrencies(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching currencies:', err);
        // Use defaults
      }
    };
    fetchCurrencies();
  }, []);

  // Fetch rate when currencies change
  useEffect(() => {
    const fetchRate = async () => {
      if (!fromCurrency || !toCurrency) return;
      
      setLoadingRate(true);
      try {
        const response = await api.get(`/rates/pair?from=${fromCurrency}&to=${toCurrency}`);
        if (response.data.data?.effectiveRate) {
          setRate(response.data.data);
        } else {
          // Mock rate if not available
          setRate({ rate: 67500, effectiveRate: 67162.5 });
        }
      } catch (err) {
        console.error('Error fetching rate:', err);
        // Mock rate
        setRate({ rate: 67500, effectiveRate: 67162.5 });
      } finally {
        setLoadingRate(false);
      }
    };

    fetchRate();
    const interval = setInterval(fetchRate, 30000);
    return () => clearInterval(interval);
  }, [fromCurrency, toCurrency]);

  const cryptoCurrencies = currencies.filter((c) => c.type === 'CRYPTO');
  const fiatCurrencies = currencies.filter((c) => c.type === 'FIAT');

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await api.post('/orders', {
        fromCurrency,
        toCurrency,
        fromAmount: parseFloat(data.fromAmount),
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone || undefined,
        clientWallet: data.clientWallet,
      });

      const orderCode = response.data.data?.code;
      if (orderCode) {
        navigate(`/track/${orderCode}`);
      } else {
        setSubmitError('Order created but no code received');
      }
    } catch (err: any) {
      console.error('Error creating order:', err);
      const message = err.response?.data?.message || 'Failed to create order. Please try again.';
      setSubmitError(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Currency Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* From */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">You Send</label>
          <div className="flex gap-2">
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 min-w-[100px]"
            >
              {cryptoCurrencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
            <input
              {...register('fromAmount')}
              type="number"
              step="any"
              min="0"
              placeholder="0.00"
              className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500"
            />
          </div>
          {errors.fromAmount && (
            <p className="text-red-400 text-sm mt-1">{errors.fromAmount.message}</p>
          )}
        </div>

        {/* To */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">You Receive</label>
          <div className="flex gap-2">
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 min-w-[100px]"
            >
              {fiatCurrencies.map((c) => (
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
      <div className="text-center py-3 bg-gray-700/50 rounded-lg">
        {loadingRate ? (
          <span className="text-gray-400">Loading rate...</span>
        ) : rate ? (
          <>
            <span className="text-gray-400">Rate: </span>
            <span className="text-white font-medium">
              1 {fromCurrency} = {rate.effectiveRate?.toFixed(2)} {toCurrency}
            </span>
            <span className="text-gray-500 text-sm ml-2">(incl. 0.5% fee)</span>
          </>
        ) : (
          <span className="text-gray-400">Rate unavailable</span>
        )}
      </div>

      {/* Contact Details */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Email Address *</label>
          <input
            {...register('clientEmail')}
            type="email"
            placeholder="your@email.com"
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500"
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
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Your Crypto Wallet *</label>
          <input
            {...register('clientWallet')}
            type="text"
            placeholder="Enter your wallet address"
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 font-mono text-sm"
          />
          {errors.clientWallet && (
            <p className="text-red-400 text-sm mt-1">{errors.clientWallet.message}</p>
          )}
        </div>
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg">
          <p className="text-red-400 text-center text-sm">{submitError}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting || !rate}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
            Creating Order...
          </>
        ) : (
          'Create Exchange Order'
        )}
      </button>
    </form>
  );
}
