import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';

interface PaymentMethod {
  id: string;
  type: string;
  nameEn: string;
  nameRu?: string;
  icon?: string;
  countryId?: string;
  cityId?: string;
  minAmount?: number;
  maxAmount?: number;
  feePercent: number;
  feeFixed: number;
  processingTime?: string;
  sortOrder: number;
  isActive: boolean;
  country?: { nameEn: string; flagEmoji?: string };
  city?: { nameEn: string };
}

const paymentTypes = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CRYPTO_WALLET', label: 'Crypto Wallet' },
  { value: 'MOBILE_PAYMENT', label: 'Mobile Payment' },
];

export function PaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<PaymentMethod | null>(null);
  const [filterType, setFilterType] = useState<string>('');

  const [formData, setFormData] = useState({
    type: 'CASH',
    nameEn: '',
    nameRu: '',
    icon: '',
    countryId: '',
    cityId: '',
    minAmount: '',
    maxAmount: '',
    feePercent: '0',
    feeFixed: '0',
    processingTime: '',
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    loadData();
    loadCountries();
  }, [filterType]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = filterType ? `?type=${filterType}` : '';
      const data = await adminApi.get(`/admin/payment-methods${params}`);
      setMethods(data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCountries = async () => {
    try {
      const data = await adminApi.get('/admin/locations/countries');
      setCountries(data);
    } catch (error) {
      console.error('Failed to load countries:', error);
    }
  };

  const loadCities = async (countryId: string) => {
    try {
      const data = await adminApi.get(`/admin/locations/cities?countryId=${countryId}`);
      setCities(data);
    } catch (error) {
      console.error('Failed to load cities:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        type: formData.type,
        nameEn: formData.nameEn,
        nameRu: formData.nameRu || undefined,
        icon: formData.icon || undefined,
        countryId: formData.countryId || undefined,
        cityId: formData.cityId || undefined,
        minAmount: formData.minAmount ? parseFloat(formData.minAmount) : undefined,
        maxAmount: formData.maxAmount ? parseFloat(formData.maxAmount) : undefined,
        feePercent: parseFloat(formData.feePercent) || 0,
        feeFixed: parseFloat(formData.feeFixed) || 0,
        processingTime: formData.processingTime || undefined,
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
      };

      if (editItem) {
        await adminApi.put(`/admin/payment-methods/${editItem.id}`, payload);
      } else {
        await adminApi.post('/admin/payment-methods', payload);
      }

      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;

    try {
      await adminApi.delete(`/admin/payment-methods/${id}`);
      loadData();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete. Please try again.');
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditItem(method);
    if (method.countryId) {
      loadCities(method.countryId);
    }
    setFormData({
      type: method.type,
      nameEn: method.nameEn,
      nameRu: method.nameRu || '',
      icon: method.icon || '',
      countryId: method.countryId || '',
      cityId: method.cityId || '',
      minAmount: method.minAmount?.toString() || '',
      maxAmount: method.maxAmount?.toString() || '',
      feePercent: method.feePercent.toString(),
      feeFixed: method.feeFixed.toString(),
      processingTime: method.processingTime || '',
      sortOrder: method.sortOrder,
      isActive: method.isActive,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditItem(null);
    setCities([]);
    setFormData({
      type: 'CASH',
      nameEn: '',
      nameRu: '',
      icon: '',
      countryId: '',
      cityId: '',
      minAmount: '',
      maxAmount: '',
      feePercent: '0',
      feeFixed: '0',
      processingTime: '',
      sortOrder: 0,
      isActive: true,
    });
  };

  const getTypeLabel = (type: string) => {
    return paymentTypes.find(t => t.value === type)?.label || type;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CASH': return 'bg-emerald-500/20 text-emerald-400';
      case 'CARD': return 'bg-blue-500/20 text-blue-400';
      case 'BANK_TRANSFER': return 'bg-purple-500/20 text-purple-400';
      case 'CRYPTO_WALLET': return 'bg-amber-500/20 text-amber-400';
      case 'MOBILE_PAYMENT': return 'bg-cyan-500/20 text-cyan-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Payment Methods</h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
        >
          Add Payment Method
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-700 text-white px-4 py-2 rounded-lg"
        >
          <option value="">All Types</option>
          {paymentTypes.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-8 text-slate-400">Loading...</div>
      ) : (
        <div className="bg-slate-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="text-left py-3 px-4 text-slate-300">Type</th>
                <th className="text-left py-3 px-4 text-slate-300">Name</th>
                <th className="text-left py-3 px-4 text-slate-300">Location</th>
                <th className="text-left py-3 px-4 text-slate-300">Fee</th>
                <th className="text-left py-3 px-4 text-slate-300">Status</th>
                <th className="text-left py-3 px-4 text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {methods.map((method) => (
                <tr key={method.id} className="border-t border-slate-700">
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${getTypeColor(method.type)}`}>
                      {getTypeLabel(method.type)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-white">{method.nameEn}</div>
                    {method.nameRu && (
                      <div className="text-sm text-slate-400">{method.nameRu}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {method.country ? (
                      <>
                        {method.country.flagEmoji} {method.country.nameEn}
                        {method.city && <span className="text-slate-500"> / {method.city.nameEn}</span>}
                      </>
                    ) : (
                      'Global'
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {method.feePercent > 0 && `${method.feePercent}%`}
                    {method.feePercent > 0 && method.feeFixed > 0 && ' + '}
                    {method.feeFixed > 0 && `$${method.feeFixed}`}
                    {method.feePercent === 0 && method.feeFixed === 0 && 'Free'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      method.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {method.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleEdit(method)}
                      className="text-blue-400 hover:text-blue-300 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(method.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              {editItem ? 'Edit' : 'Add'} Payment Method
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg"
                  required
                >
                  {paymentTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Name (EN) *</label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Name (RU)</label>
                  <input
                    type="text"
                    value={formData.nameRu}
                    onChange={(e) => setFormData({ ...formData, nameRu: e.target.value })}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-1">Icon (emoji or URL)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg"
                  placeholder="💳 or https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Country</label>
                  <select
                    value={formData.countryId}
                    onChange={(e) => {
                      setFormData({ ...formData, countryId: e.target.value, cityId: '' });
                      if (e.target.value) loadCities(e.target.value);
                      else setCities([]);
                    }}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg"
                  >
                    <option value="">Global</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.flagEmoji} {country.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">City</label>
                  <select
                    value={formData.cityId}
                    onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg"
                    disabled={!formData.countryId}
                  >
                    <option value="">All Cities</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>{city.nameEn}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Min Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minAmount}
                    onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Max Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.maxAmount}
                    onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Fee %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.feePercent}
                    onChange={(e) => setFormData({ ...formData, feePercent: e.target.value })}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Fee Fixed ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.feeFixed}
                    onChange={(e) => setFormData({ ...formData, feeFixed: e.target.value })}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Processing Time</label>
                  <input
                    type="text"
                    value={formData.processingTime}
                    onChange={(e) => setFormData({ ...formData, processingTime: e.target.value })}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg"
                    placeholder="Instant / 1-2 hours"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-slate-300">Active</label>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentMethods;
