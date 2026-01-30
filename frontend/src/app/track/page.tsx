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
