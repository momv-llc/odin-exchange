import { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Edit,
  Trash2,
  X,
  Tag,
} from 'lucide-react';

const typeLabels: Record<string, string> = {
  DISCOUNT_PERCENT: 'Percentage Discount',
  DISCOUNT_FIXED: 'Fixed Discount',
  BONUS: 'Bonus',
};

export function PromoPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    type: 'DISCOUNT_PERCENT',
    value: '',
    description: '',
    minAmount: '',
    maxUses: '',
    validFrom: '',
    validUntil: '',
  });

  useEffect(() => {
    loadPromos();
    loadStats();
  }, [meta.page]);

  const loadPromos = async () => {
    setIsLoading(true);
    try {
      const result = await api.getPromos({ page: meta.page, limit: meta.limit });
      setPromos(result.data || []);
      setMeta(result.meta || meta);
    } catch (error) {
      console.error('Failed to load promos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await api.getPromoStats();
      setStats(result);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('submit');
    try {
      const data = {
        ...formData,
        value: parseFloat(formData.value),
        minAmount: formData.minAmount ? parseFloat(formData.minAmount) : undefined,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
      };

      if (editingPromo) {
        await api.updatePromo(editingPromo.id, data);
      } else {
        await api.createPromo(data);
      }

      loadPromos();
      loadStats();
      closeModal();
    } catch (error) {
      console.error('Failed to save promo:', error);
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;
    setActionLoading(id);
    try {
      await api.deletePromo(id);
      loadPromos();
      loadStats();
    } catch (error) {
      console.error('Failed to delete promo:', error);
    } finally {
      setActionLoading('');
    }
  };

  const openModal = (promo?: any) => {
    if (promo) {
      setEditingPromo(promo);
      setFormData({
        code: promo.code,
        type: promo.type,
        value: promo.value.toString(),
        description: promo.description || '',
        minAmount: promo.minAmount?.toString() || '',
        maxUses: promo.maxUses?.toString() || '',
        validFrom: promo.validFrom?.split('T')[0] || '',
        validUntil: promo.validUntil?.split('T')[0] || '',
      });
    } else {
      setEditingPromo(null);
      setFormData({
        code: '',
        type: 'DISCOUNT_PERCENT',
        value: '',
        description: '',
        minAmount: '',
        maxUses: '',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPromo(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Promo Codes</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          <span>Create Promo</span>
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-slate-400">Total Promos</div>
          </div>
          <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/20 p-4">
            <div className="text-2xl font-bold text-emerald-400">{stats.active}</div>
            <div className="text-sm text-slate-400">Active</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <div className="text-2xl font-bold text-white">{stats.totalUsages}</div>
            <div className="text-sm text-slate-400">Total Uses</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <div className="text-2xl font-bold text-white">${Number(stats.totalDiscount || 0).toFixed(2)}</div>
            <div className="text-sm text-slate-400">Total Discount</div>
          </div>
        </div>
      )}

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
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Type</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Value</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Usage</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Valid Until</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Status</th>
                    <th className="text-right py-4 px-6 text-slate-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {promos.map(promo => {
                    const isExpired = new Date(promo.validUntil) < new Date();
                    const isActive = promo.isActive && !isExpired;

                    return (
                      <tr key={promo.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <Tag className="w-4 h-4 text-emerald-400" />
                            <span className="font-mono font-medium text-white">{promo.code}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-300">
                          {typeLabels[promo.type]}
                        </td>
                        <td className="py-4 px-6 text-white">
                          {promo.type === 'DISCOUNT_PERCENT' ? `${promo.value}%` : `$${promo.value}`}
                        </td>
                        <td className="py-4 px-6 text-slate-400">
                          {promo.usedCount} / {promo.maxUses || '∞'}
                        </td>
                        <td className="py-4 px-6 text-slate-400">
                          {new Date(promo.validUntil).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
                          }`}>
                            {isActive ? 'Active' : isExpired ? 'Expired' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openModal(promo)}
                              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(promo.id)}
                              disabled={actionLoading === promo.id}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {promos.length === 0 && (
              <div className="text-center py-12 text-slate-400">No promo codes found</div>
            )}

            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/50">
                <div className="text-sm text-slate-400">Page {meta.page} of {meta.totalPages}</div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setMeta(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={meta.page === 1}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">
                {editingPromo ? 'Edit Promo Code' : 'Create Promo Code'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-400"
                    placeholder="SUMMER2024"
                    required
                    disabled={!!editingPromo}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="DISCOUNT_PERCENT">Percentage Discount</option>
                    <option value="DISCOUNT_FIXED">Fixed Discount</option>
                    <option value="BONUS">Bonus</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Value</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={e => setFormData({ ...formData, value: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-400"
                    placeholder={formData.type === 'DISCOUNT_PERCENT' ? '10' : '50'}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Min Amount</label>
                  <input
                    type="number"
                    value={formData.minAmount}
                    onChange={e => setFormData({ ...formData, minAmount: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-400"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Valid From</label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={e => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Valid Until</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Max Uses (optional)</label>
                <input
                  type="number"
                  value={formData.maxUses}
                  onChange={e => setFormData({ ...formData, maxUses: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-400"
                  placeholder="Unlimited if empty"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-400"
                  rows={2}
                  placeholder="Promo description..."
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading === 'submit'}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {actionLoading === 'submit' ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : editingPromo ? (
                  'Update Promo'
                ) : (
                  'Create Promo'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
