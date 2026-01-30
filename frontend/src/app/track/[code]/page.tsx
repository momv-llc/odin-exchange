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
