import { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  Ban,
  CheckCircle,
  X,
  Mail,
  Phone,
  ShoppingCart,
  MessageSquare,
} from 'lucide-react';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-400',
  INACTIVE: 'bg-slate-500/10 text-slate-400',
  BANNED: 'bg-red-500/10 text-red-400',
};

export function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    loadUsers();
  }, [meta.page, status]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const params: any = { page: meta.page, limit: meta.limit };
      if (status) params.status = status;
      if (search) params.search = search;

      const result = await api.getUsers(params);
      setUsers(result.data || []);
      setMeta(result.meta || meta);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setMeta(prev => ({ ...prev, page: 1 }));
    loadUsers();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      await api.updateUserStatus(id, newStatus);
      loadUsers();
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to update user status:', error);
    } finally {
      setActionLoading('');
    }
  };

  const loadUserDetails = async (id: string) => {
    try {
      const user = await api.getUser(id);
      setSelectedUser(user);
    } catch (error) {
      console.error('Failed to load user details:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Users</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by email, name..."
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
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="BANNED">Banned</option>
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
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">User</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Status</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Verified</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Orders</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Joined</th>
                    <th className="text-right py-4 px-6 text-slate-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="text-white">{user.email}</div>
                        <div className="text-sm text-slate-400">
                          {user.firstName} {user.lastName}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[user.status]}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {user.isVerified ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <X className="w-5 h-5 text-slate-500" />
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        {user._count?.orders || 0}
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => loadUserDetails(user.id)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {user.status === 'ACTIVE' ? (
                            <button
                              onClick={() => handleStatusChange(user.id, 'BANNED')}
                              disabled={actionLoading === user.id}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg disabled:opacity-50"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                              disabled={actionLoading === user.id}
                              className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <div className="text-center py-12 text-slate-400">No users found</div>
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
                  <span className="text-slate-400">Page {meta.page} of {meta.totalPages}</span>
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

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-400">Email</div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-white">{selectedUser.email}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Phone</div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-white">{selectedUser.phone || 'N/A'}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Name</div>
                  <div className="text-white">{selectedUser.firstName} {selectedUser.lastName}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Status</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[selectedUser.status]}`}>
                    {selectedUser.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <ShoppingCart className="w-5 h-5 text-emerald-400" />
                    <span className="text-slate-400">Orders</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{selectedUser._count?.orders || 0}</div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                    <span className="text-slate-400">Reviews</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{selectedUser._count?.reviews || 0}</div>
                </div>
              </div>

              {selectedUser.orders?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-3">Recent Orders</h3>
                  <div className="space-y-2">
                    {selectedUser.orders.map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
                        <span className="font-mono text-white">{order.code}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[order.status] || 'bg-slate-500/10 text-slate-400'}`}>
                          {order.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
