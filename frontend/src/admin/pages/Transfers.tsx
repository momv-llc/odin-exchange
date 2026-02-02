import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';

interface Transfer {
  id: string;
  code: string;
  senderName: string;
  senderPhone: string;
  senderEmail?: string;
  recipientName: string;
  recipientPhone: string;
  amount: number;
  currency: string;
  fee: number;
  totalAmount: number;
  status: string;
  adminNotes?: string;
  createdAt: string;
  completedAt?: string;
  recipientCity: {
    nameEn: string;
    country: {
      nameEn: string;
      flagEmoji?: string;
    };
  };
}

interface Stats {
  totalCount: number;
  pendingCount: number;
  completedCount: number;
  totalVolume: number;
}

const statuses = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'PROCESSING', label: 'Processing', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-emerald-500/20 text-emerald-400' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-500/20 text-red-400' },
  { value: 'FAILED', label: 'Failed', color: 'bg-red-500/20 text-red-400' },
];

export function Transfers() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  useEffect(() => {
    loadData();
    loadStats();
  }, [filterStatus, pagination.page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      const data = await adminApi.get(`/admin/transfers?${params.toString()}`);
      setTransfers(data.data);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }));
    } catch (error) {
      console.error('Failed to load transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await adminApi.get('/admin/transfers/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    loadData();
  };

  const handleStatusUpdate = async () => {
    if (!selectedTransfer || !newStatus) return;

    try {
      await adminApi.put(`/admin/transfers/${selectedTransfer.id}/status`, {
        status: newStatus,
        adminNotes: adminNotes || undefined,
      });
      setShowModal(false);
      setSelectedTransfer(null);
      setNewStatus('');
      setAdminNotes('');
      loadData();
      loadStats();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const openStatusModal = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setNewStatus(transfer.status);
    setAdminNotes(transfer.adminNotes || '');
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    return statuses.find(s => s.value === status)?.color || 'bg-slate-500/20 text-slate-400';
  };

  const getStatusLabel = (status: string) => {
    return statuses.find(s => s.value === status)?.label || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Money Transfers</h1>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-sm">Total Transfers</div>
            <div className="text-2xl font-bold text-white">{stats.totalCount}</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-sm">Pending</div>
            <div className="text-2xl font-bold text-yellow-400">{stats.pendingCount}</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-sm">Completed</div>
            <div className="text-2xl font-bold text-emerald-400">{stats.completedCount}</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-sm">Total Volume</div>
            <div className="text-2xl font-bold text-white">
              ${Number(stats.totalVolume).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
          className="bg-slate-700 text-white px-4 py-2 rounded-lg"
        >
          <option value="">All Statuses</option>
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
        <div className="flex-1 flex space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code, name, or phone..."
            className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg"
          >
            Search
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-8 text-slate-400">Loading...</div>
      ) : (
        <div className="bg-slate-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="text-left py-3 px-4 text-slate-300">Code</th>
                <th className="text-left py-3 px-4 text-slate-300">Sender</th>
                <th className="text-left py-3 px-4 text-slate-300">Recipient</th>
                <th className="text-left py-3 px-4 text-slate-300">Destination</th>
                <th className="text-left py-3 px-4 text-slate-300">Amount</th>
                <th className="text-left py-3 px-4 text-slate-300">Status</th>
                <th className="text-left py-3 px-4 text-slate-300">Date</th>
                <th className="text-left py-3 px-4 text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((transfer) => (
                <tr key={transfer.id} className="border-t border-slate-700">
                  <td className="py-3 px-4">
                    <span className="font-mono text-emerald-400">{transfer.code}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-white">{transfer.senderName}</div>
                    <div className="text-sm text-slate-400">{transfer.senderPhone}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-white">{transfer.recipientName}</div>
                    <div className="text-sm text-slate-400">{transfer.recipientPhone}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {transfer.recipientCity.country.flagEmoji} {transfer.recipientCity.nameEn}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-white font-medium">
                      {transfer.amount.toLocaleString()} {transfer.currency}
                    </div>
                    <div className="text-sm text-slate-400">
                      Fee: {transfer.fee} | Total: {transfer.totalAmount}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(transfer.status)}`}>
                      {getStatusLabel(transfer.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-sm">
                    {formatDate(transfer.createdAt)}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => openStatusModal(transfer)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-slate-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Status Update Modal */}
      {showModal && selectedTransfer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">
              Update Transfer Status
            </h2>
            <div className="mb-4 p-4 bg-slate-700/50 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Transfer Code</div>
              <div className="font-mono text-emerald-400">{selectedTransfer.code}</div>
              <div className="text-sm text-slate-400 mt-2 mb-1">Amount</div>
              <div className="text-white">
                {selectedTransfer.totalAmount} {selectedTransfer.currency}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg"
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-1">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg h-24 resize-none"
                  placeholder="Add notes about this update..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transfers;
