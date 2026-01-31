'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { ExchangeForm } from '@/components/exchange/exchange-form';
import { RatesDisplay } from '@/components/exchange/rates-display';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Exchange Crypto
              <span className="text-blue-500"> Instantly</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Fast, secure, and reliable cryptocurrency exchange
            </p>
          </div>

          {/* Exchange Card */}
          <div className="bg-gray-800 rounded-2xl p-6 md:p-8 shadow-xl border border-gray-700">
            <RatesDisplay />
            <ExchangeForm />
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🔒</div>
              <div className="text-sm text-gray-400">Secure</div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-sm text-gray-400">Fast</div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">💎</div>
              <div className="text-sm text-gray-400">Best Rates</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          © 2024 ODIN Exchange. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
