'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';

export default function TrackPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const trimmedCode = code.trim().toUpperCase();
    
    if (!trimmedCode) {
      setError('Please enter an order code');
      return;
    }
    
    if (!trimmedCode.startsWith('ODIN-')) {
      setError('Invalid order code format. Should start with ODIN-');
      return;
    }
    
    router.push(`/track/${trimmedCode}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-700">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🔍</div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Track Your Order
              </h1>
              <p className="text-gray-400 text-sm">
                Enter your order code to check the status
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ODIN-XXXXXX-XXXXXX"
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-4 border border-gray-600 focus:border-blue-500 text-center font-mono text-lg tracking-wider"
                  maxLength={20}
                />
                {error && (
                  <p className="text-red-400 text-sm mt-2 text-center">{error}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg transition"
              >
                Track Order
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <a
                href="/"
                className="block text-center text-blue-400 hover:text-blue-300 transition"
              >
                ← Create New Order
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
