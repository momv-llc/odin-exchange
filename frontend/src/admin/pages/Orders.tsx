import { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
} from 'lucide-react';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-400',
  APPROVED: 'bg-blue-500/10 text-blue-400',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400',
  REJECTED: 'bg-red-500/10 text-red-400',
  EXPIRED: 'bg-slate-500/10 text-slate-400',
  CANCELLED: 'bg-slate-500/10 text-slate-400',
};

export function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    loadOrders();
  }, [meta.page, status]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const params: any = { page: meta.page, limit: meta.limit };
      if (status) params.status = status;
      if (search) params.search = search;

      const result = await api.getOrders(params);
      setOrders(result.data || []);
      setMeta(result.meta || meta);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setMeta(prev => ({ ...prev, page: 1 }));
    loadOrders();
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await api.approveOrder(id);
      loadOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to approve order:', error);
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) return;
    setActionLoading(id);
    try {
      await api.rejectOrder(id, rejectReason);
      loadOrders();
      setSelectedOrder(null);
      setRejectReason('');
    } catch (error) {
      console.error('Failed to reject order:', error);
    } finally {
      setActionLoading('');
    }
  };

  const handleComplete = async (id: string) => {
    setActionLoading(id);
    try {
      await api.completeOrder(id);
      loadOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to complete order:', error);
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Orders</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by code, email..."
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
            />
          </div>
        </form>

        <select
          value={status}
          onChange={e => {
            setStatus(e.target.value);
            setMeta(prev => ({ ...prev, page: 1 }));
          }}
          className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-400"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="COMPLETED">Completed</option>
          <option value="REJECTED">Rejected</option>
          <option value="EXPIRED">Expired</option>
        </select>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Code</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Exchange</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Client</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Status</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Date</th>
                    <th className="text-right py-4 px-6 text-slate-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-mono text-white">{order.code}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-white">
                          {order.fromAmount} {order.fromCurrency?.code}
                        </div>
                        <div className="text-sm text-slate-400">
                          → {order.toAmount} {order.toCurrency?.code}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-white">{order.clientEmail}</div>
                        <div className="text-sm text-slate-400 truncate max-w-[200px]">
                          {order.clientWallet}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {order.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(order.id)}
                                disabled={actionLoading === order.id}
                                className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg disabled:opacity-50"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setSelectedOrder({ ...order, showReject: true })}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {order.status === 'APPROVED' && (
                            <button
                              onClick={() => handleComplete(order.id)}
                              disabled={actionLoading === order.id}
                              className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/20 disabled:opacity-50"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {orders.length === 0 && (
              <div className="text-center py-12 text-slate-400">No orders found</div>
            )}

            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/50">
                <div className="text-sm text-slate-400">
                  Showing {(meta.page - 1) * meta.limit + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setMeta(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={meta.page === 1}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-slate-400">
                    Page {meta.page} of {meta.totalPages}
                  </span>
                  <button
                    onClick={() => setMeta(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={meta.page === meta.totalPages}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">Order Details</h2>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setRejectReason('');
                }}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-400">Code</div>
                  <div className="font-mono text-white">{selectedOrder.code}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Status</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[selectedOrder.status]}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-slate-400">From</div>
                  <div className="text-white">{selectedOrder.fromAmount} {selectedOrder.fromCurrency?.code}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">To</div>
                  <div className="text-white">{selectedOrder.toAmount} {selectedOrder.toCurrency?.code}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-slate-400">Email</div>
                  <div className="text-white">{selectedOrder.clientEmail}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-slate-400">Wallet</div>
                  <div className="text-white break-all">{selectedOrder.clientWallet}</div>
                </div>
              </div>

              {selectedOrder.showReject && (
                <div className="mt-4">
                  <label className="block text-sm text-slate-400 mb-2">Rejection Reason</label>
                  <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                    rows={3}
                    placeholder="Enter reason for rejection..."
                  />
                  <button
                    onClick={() => handleReject(selectedOrder.id)}
                    disabled={!rejectReason.trim() || actionLoading === selectedOrder.id}
                    className="mt-3 w-full py-2.5 bg-red-500/10 text-red-400 rounded-lg font-medium hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {actionLoading === selectedOrder.id ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      'Reject Order'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
