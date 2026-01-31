'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { api } from '@/lib/api/client';

interface Order {
  id: string;
  code: string;
  status: string;
  fromAmount: string;
  toAmount: string;
  fromCurrency: string;
  toCurrency: string;
  lockedRate: string;
  createdAt: string;
  expiresAt: string;
}

const statusConfig: Record<string, { color: string; bg: string; icon: string; text: string }> = {
  PENDING: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: '⏳', text: 'Pending Review' },
  APPROVED: { color: 'text-blue-400', bg: 'bg-blue-500/20', icon: '✅', text: 'Approved' },
  COMPLETED: { color: 'text-green-400', bg: 'bg-green-500/20', icon: '🎉', text: 'Completed' },
  REJECTED: { color: 'text-red-400', bg: 'bg-red-500/20', icon: '❌', text: 'Rejected' },
  EXPIRED: { color: 'text-gray-400', bg: 'bg-gray-500/20', icon: '⏰', text: 'Expired' },
  CANCELLED: { color: 'text-gray-400', bg: 'bg-gray-500/20', icon: '🚫', text: 'Cancelled' },
};

export default function OrderPage() {
  const params = useParams();
  const code = params.code as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/orders/${code}`);
        setOrder(response.data.data);
      } catch (err: any) {
        console.error('Error fetching order:', err);
        if (err.response?.status === 404) {
          setError('Order not found. Please check your order code.');
        } else {
          setError('Failed to load order. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchOrder();
      // Refresh every 30 seconds
      const interval = setInterval(fetchOrder, 30000);
      return () => clearInterval(interval);
    }
  }, [code]);

  const status = order ? statusConfig[order.status] || statusConfig.PENDING : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto">
          {/* Loading */}
          {loading && (
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Loading order...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 text-center">
              <div className="text-6xl mb-4">😕</div>
              <h2 className="text-xl font-bold text-white mb-2">Order Not Found</h2>
              <p className="text-gray-400 mb-6">{error}</p>
              <div className="space-y-3">
                <a
                  href={`/track/${code}`}
                  onClick={() => window.location.reload()}
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Try Again
                </a>
                <a
                  href="/track"
                  className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition"
                >
                  Enter Different Code
                </a>
              </div>
            </div>
          )}

          {/* Order Details */}
          {!loading && !error && order && status && (
            <div className="bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-700">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-gray-400 text-sm">Order Code</p>
                  <p className="text-white font-mono font-bold text-lg">{order.code}</p>
                </div>
                <div className={`px-4 py-2 rounded-full ${status.bg}`}>
                  <span className={`${status.color} font-medium`}>
                    {status.icon} {status.text}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">You Send</span>
                  <span className="text-white font-semibold text-lg">
                    {order.fromAmount} {order.fromCurrency}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">You Receive</span>
                  <span className="text-green-400 font-semibold text-lg">
                    {order.toAmount} {order.toCurrency}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Exchange Rate</span>
                  <span className="text-white">
                    1 {order.fromCurrency} = {order.lockedRate} {order.toCurrency}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Created</span>
                  <span className="text-white">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>

                {order.status === 'PENDING' && order.expiresAt && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-700">
                    <span className="text-gray-400">Expires</span>
                    <span className="text-yellow-400">
                      {new Date(order.expiresAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Status Message */}
              <div className={`mt-6 p-4 rounded-lg ${status.bg}`}>
                {order.status === 'PENDING' && (
                  <p className="text-yellow-400 text-sm">
                    ⏳ Your order is being reviewed. You will receive an email once approved.
                  </p>
                )}
                {order.status === 'APPROVED' && (
                  <p className="text-blue-400 text-sm">
                    ✅ Your order is approved! Please complete the payment as instructed.
                  </p>
                )}
                {order.status === 'COMPLETED' && (
                  <p className="text-green-400 text-sm">
                    🎉 Your order is complete! Thank you for using ODIN Exchange.
                  </p>
                )}
                {order.status === 'REJECTED' && (
                  <p className="text-red-400 text-sm">
                    ❌ Your order was rejected. Please contact support for more information.
                  </p>
                )}
                {order.status === 'EXPIRED' && (
                  <p className="text-gray-400 text-sm">
                    ⏰ This order has expired. Please create a new order.
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 pt-6 border-t border-gray-700 space-y-3">
                <a
                  href="/"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition text-center"
                >
                  Create New Order
                </a>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition"
                >
                  Refresh Status
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
