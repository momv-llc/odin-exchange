#!/bin/bash
cd "$(dirname "$0")/.."

echo "Creating frontend files..."

#=== package.json ===
cat > frontend/package.json << 'EOF'
{
  "name": "odin-exchange-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.4",
    "@tanstack/react-query": "^5.17.0",
    "axios": "^1.6.5",
    "clsx": "^2.1.0",
    "lucide-react": "^0.309.0",
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.49.3",
    "tailwind-merge": "^2.2.0",
    "zod": "^3.22.4",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "autoprefixer": "^10.4.17",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.1.0",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3"
  }
}
EOF

#=== tsconfig.json ===
cat > frontend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

#=== next.config.js ===
cat > frontend/next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
module.exports = {
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://localhost:3000/api/:path*' }
    ];
  },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
      ],
    }];
  },
};
EOF

#=== tailwind.config.js ===
cat > frontend/tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
      },
    },
  },
  plugins: [],
};
EOF

#=== postcss.config.js ===
cat > frontend/postcss.config.js << 'EOF'
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };
EOF

#=== .env.example ===
cat > frontend/.env.example << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
EOF

cp frontend/.env.example frontend/.env.local

#=== App Layout ===
cat > frontend/src/app/layout.tsx << 'EOF'
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'ODIN Exchange', template: '%s | ODIN Exchange' },
  description: 'Fast and secure cryptocurrency exchange',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
EOF

#=== Global CSS ===
cat > frontend/src/app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-900 text-white;
}

input, select {
  @apply outline-none focus:ring-2 focus:ring-blue-500;
}
EOF

#=== Providers ===
cat > frontend/src/app/providers.tsx << 'EOF'
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30000,
          refetchOnWindowFocus: false,
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
EOF

#=== Home Page ===
cat > frontend/src/app/page.tsx << 'EOF'
import { ExchangeForm } from '@/components/exchange/exchange-form';
import { RatesDisplay } from '@/components/exchange/rates-display';
import { Header } from '@/components/layout/header';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Exchange Crypto Instantly
            </h1>
            <p className="text-gray-400 text-lg">
              Fast, secure, and reliable cryptocurrency exchange
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
            <RatesDisplay />
            <ExchangeForm />
          </div>
        </div>
      </main>
    </div>
  );
}
EOF

#=== Track Page ===
mkdir -p "frontend/src/app/track/[code]"
cat > "frontend/src/app/track/[code]/page.tsx" << 'EOF'
'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { Header } from '@/components/layout/header';

const statusConfig: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'bg-yellow-500', label: 'Pending' },
  APPROVED: { color: 'bg-blue-500', label: 'Approved' },
  COMPLETED: { color: 'bg-green-500', label: 'Completed' },
  REJECTED: { color: 'bg-red-500', label: 'Rejected' },
  EXPIRED: { color: 'bg-gray-500', label: 'Expired' },
  CANCELLED: { color: 'bg-gray-500', label: 'Cancelled' },
};

export default function TrackOrderPage() {
  const { code } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['order', code],
    queryFn: () => api.get(`/orders/${code}`).then((r) => r.data.data),
    refetchInterval: 15000,
    enabled: !!code,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto">
          {isLoading && (
            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading order...</p>
            </div>
          )}

          {error && (
            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <p className="text-red-400 text-xl">Order not found</p>
              <p className="text-gray-400 mt-2">Please check your order code</p>
              <Link href="/" className="inline-block mt-4 text-blue-400 hover:text-blue-300">
                ← Back to Exchange
              </Link>
            </div>
          )}

          {data && (
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">Order Status</h1>
                <span className={`px-3 py-1 rounded-full text-white text-sm ${statusConfig[data.status]?.color || 'bg-gray-500'}`}>
                  {statusConfig[data.status]?.label || data.status}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-gray-700">
                  <span className="text-gray-400">Order Code</span>
                  <span className="text-white font-mono font-bold">{data.code}</span>
                </div>

                <div className="flex justify-between py-3 border-b border-gray-700">
                  <span className="text-gray-400">You Send</span>
                  <span className="text-white font-semibold">
                    {data.fromAmount} {data.fromCurrency}
                  </span>
                </div>

                <div className="flex justify-between py-3 border-b border-gray-700">
                  <span className="text-gray-400">You Receive</span>
                  <span className="text-green-400 font-semibold">
                    {data.toAmount} {data.toCurrency}
                  </span>
                </div>

                <div className="flex justify-between py-3 border-b border-gray-700">
                  <span className="text-gray-400">Exchange Rate</span>
                  <span className="text-white">
                    1 {data.fromCurrency} = {data.lockedRate} {data.toCurrency}
                  </span>
                </div>

                <div className="flex justify-between py-3 border-b border-gray-700">
                  <span className="text-gray-400">Created</span>
                  <span className="text-white">
                    {new Date(data.createdAt).toLocaleString()}
                  </span>
                </div>

                {data.expiresAt && data.status === 'PENDING' && (
                  <div className="flex justify-between py-3 border-b border-gray-700">
                    <span className="text-gray-400">Expires</span>
                    <span className="text-yellow-400">
                      {new Date(data.expiresAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
                {data.status === 'PENDING' && (
                  <p className="text-yellow-400 text-sm">
                    ⏳ Your order is being reviewed. You will receive an email once approved.
                  </p>
                )}
                {data.status === 'APPROVED' && (
                  <p className="text-blue-400 text-sm">
                    ✅ Your order is approved! Please complete the payment.
                  </p>
                )}
                {data.status === 'COMPLETED' && (
                  <p className="text-green-400 text-sm">
                    🎉 Your order is complete! Thank you for using ODIN Exchange.
                  </p>
                )}
                {data.status === 'REJECTED' && (
                  <p className="text-red-400 text-sm">
                    ❌ Your order was rejected. Please contact support for more information.
                  </p>
                )}
              </div>

              <Link
                href="/"
                className="block mt-6 text-center text-blue-400 hover:text-blue-300 transition"
              >
                ← Create New Order
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
EOF

#=== Components ===
mkdir -p frontend/src/components/layout

cat > frontend/src/components/layout/header.tsx << 'EOF'
import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-white hover:text-blue-400 transition">
          ODIN Exchange
        </Link>
        <nav className="flex gap-6">
          <Link href="/" className="text-gray-300 hover:text-white transition">
            Exchange
          </Link>
          <Link href="/track" className="text-gray-300 hover:text-white transition">
            Track Order
          </Link>
        </nav>
      </div>
    </header>
  );
}
EOF

cat > frontend/src/components/exchange/rates-display.tsx << 'EOF'
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
EOF

cat > frontend/src/components/exchange/exchange-form.tsx << 'EOF'
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
EOF

#=== API Client ===
cat > frontend/src/lib/api/client.ts << 'EOF'
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      // Optionally redirect to login
    }
    return Promise.reject(error);
  }
);
EOF

#=== Track Input Page ===
cat > frontend/src/app/track/page.tsx << 'EOF'
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';

export default function TrackPage() {
  const [code, setCode] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      router.push(`/track/${code.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h1 className="text-2xl font-bold text-white mb-6 text-center">
              Track Your Order
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Order Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="ODIN-XXXXXX-XXXXXX"
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 font-mono text-center text-lg"
                />
              </div>
              <button
                type="submit"
                disabled={!code.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
              >
                Track Order
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
EOF

echo "Frontend files created!"