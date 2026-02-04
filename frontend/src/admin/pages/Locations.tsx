import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';

interface Country {
  id: string;
  code: string;
  nameEn: string;
  nameRu?: string;
  flagEmoji?: string;
  phoneCode?: string;
  currency?: string;
  sortOrder: number;
  isActive: boolean;
  _count?: { cities: number };
}

interface City {
  id: string;
  countryId: string;
  nameEn: string;
  nameRu?: string;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  country?: {
    nameEn: string;
    flagEmoji?: string;
  };
}

export function Locations() {
  const [activeTab, setActiveTab] = useState<'countries' | 'cities'>('countries');
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Country | City | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    nameEn: '',
    nameRu: '',
    flagEmoji: '',
    phoneCode: '',
    currency: '',
    sortOrder: 0,
    isActive: true,
    countryId: '',
    isFeatured: false,
  });

  useEffect(() => {
    loadData();
  }, [activeTab, selectedCountryId]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'countries') {
        const data = await adminApi.get('/admin/locations/countries');
        setCountries(data);
      } else {
        const params = selectedCountryId ? `?countryId=${selectedCountryId}` : '';
        const data = await adminApi.get(`/admin/locations/cities${params}`);
        setCities(data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === 'countries') {
        const payload = {
          code: formData.code,
          nameEn: formData.nameEn,
          nameRu: formData.nameRu || undefined,
          flagEmoji: formData.flagEmoji || undefined,
          phoneCode: formData.phoneCode || undefined,
          currency: formData.currency || undefined,
          sortOrder: formData.sortOrder,
          isActive: formData.isActive,
        };

        if (editItem) {
          await adminApi.put(`/admin/locations/countries/${editItem.id}`, payload);
        } else {
          await adminApi.post('/admin/locations/countries', payload);
        }
      } else {
        const payload = {
          countryId: formData.countryId,
          nameEn: formData.nameEn,
          nameRu: formData.nameRu || undefined,
          sortOrder: formData.sortOrder,
          isActive: formData.isActive,
          isFeatured: formData.isFeatured,
        };

        if (editItem) {
          await adminApi.put(`/admin/locations/cities/${editItem.id}`, payload);
        } else {
          await adminApi.post('/admin/locations/cities', payload);
        }
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
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const endpoint = activeTab === 'countries' ? 'countries' : 'cities';
      await adminApi.delete(`/admin/locations/${endpoint}/${id}`);
      loadData();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete. Please try again.');
    }
  };

  const handleEdit = (item: Country | City) => {
    setEditItem(item);
    if (activeTab === 'countries') {
      const country = item as Country;
      setFormData({
        code: country.code,
        nameEn: country.nameEn,
        nameRu: country.nameRu || '',
        flagEmoji: country.flagEmoji || '',
        phoneCode: country.phoneCode || '',
        currency: country.currency || '',
        sortOrder: country.sortOrder,
        isActive: country.isActive,
        countryId: '',
        isFeatured: false,
      });
    } else {
      const city = item as City;
      setFormData({
        code: '',
        nameEn: city.nameEn,
        nameRu: city.nameRu || '',
        flagEmoji: '',
        phoneCode: '',
        currency: '',
        sortOrder: city.sortOrder,
        isActive: city.isActive,
        countryId: city.countryId,
        isFeatured: city.isFeatured,
      });
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setEditItem(null);
    setFormData({
      code: '',
      nameEn: '',
      nameRu: '',
      flagEmoji: '',
      phoneCode: '',
      currency: '',
      sortOrder: 0,
      isActive: true,
      countryId: '',
      isFeatured: false,
    });
  };

  const openCreateModal = () => {
    resetForm();
    if (activeTab === 'cities' && selectedCountryId) {
      setFormData(prev => ({ ...prev, countryId: selectedCountryId }));
    }
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Locations</h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
        >
          Add {activeTab === 'countries' ? 'Country' : 'City'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('countries')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'countries'
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-700 text-slate-300'
          }`}
        >
          Countries
        </button>
        <button
          onClick={() => setActiveTab('cities')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'cities'
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-700 text-slate-300'
          }`}
        >
          Cities
        </button>
      </div>

      {/* Country filter for cities */}
      {activeTab === 'cities' && (
        <div className="mb-4">
          <select
            value={selectedCountryId}
            onChange={(e) => setSelectedCountryId(e.target.value)}
            className="bg-slate-700 text-white px-4 py-2 rounded-lg"
          >
            <option value="">All Countries</option>
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.flagEmoji} {country.nameEn}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-8 text-slate-400">Loading...</div>
      ) : activeTab === 'countries' ? (
        <div className="bg-slate-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="text-left py-3 px-4 text-slate-300">Flag</th>
                <th className="text-left py-3 px-4 text-slate-300">Code</th>
                <th className="text-left py-3 px-4 text-slate-300">Name (EN)</th>
                <th className="text-left py-3 px-4 text-slate-300">Name (RU)</th>
                <th className="text-left py-3 px-4 text-slate-300">Cities</th>
                <th className="text-left py-3 px-4 text-slate-300">Status</th>
                <th className="text-left py-3 px-4 text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((country) => (
                <tr key={country.id} className="border-t border-slate-700">
                  <td className="py-3 px-4 text-2xl">{country.flagEmoji || '🏳️'}</td>
                  <td className="py-3 px-4 text-white">{country.code}</td>
                  <td className="py-3 px-4 text-white">{country.nameEn}</td>
                  <td className="py-3 px-4 text-slate-400">{country.nameRu || '-'}</td>
                  <td className="py-3 px-4 text-slate-400">{country._count?.cities || 0}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      country.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {country.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleEdit(country)}
                      className="text-blue-400 hover:text-blue-300 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(country.id)}
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
      ) : (
        <div className="bg-slate-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="text-left py-3 px-4 text-slate-300">Country</th>
                <th className="text-left py-3 px-4 text-slate-300">Name (EN)</th>
                <th className="text-left py-3 px-4 text-slate-300">Name (RU)</th>
                <th className="text-left py-3 px-4 text-slate-300">Featured</th>
                <th className="text-left py-3 px-4 text-slate-300">Status</th>
                <th className="text-left py-3 px-4 text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cities.map((city) => (
                <tr key={city.id} className="border-t border-slate-700">
                  <td className="py-3 px-4 text-white">
                    {city.country?.flagEmoji} {city.country?.nameEn}
                  </td>
                  <td className="py-3 px-4 text-white">{city.nameEn}</td>
                  <td className="py-3 px-4 text-slate-400">{city.nameRu || '-'}</td>
                  <td className="py-3 px-4">
                    {city.isFeatured && (
                      <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      city.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {city.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleEdit(city)}
                      className="text-blue-400 hover:text-blue-300 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(city.id)}
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
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">
              {editItem ? 'Edit' : 'Add'} {activeTab === 'countries' ? 'Country' : 'City'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'countries' ? (
                <>
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">Code *</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg"
                      required
                      maxLength={3}
                    />
                  </div>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-sm mb-1">Flag Emoji</label>
                      <input
                        type="text"
                        value={formData.flagEmoji}
                        onChange={(e) => setFormData({ ...formData, flagEmoji: e.target.value })}
                        className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg"
                        placeholder="🇩🇪"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-1">Phone Code</label>
                      <input
                        type="text"
                        value={formData.phoneCode}
                        onChange={(e) => setFormData({ ...formData, phoneCode: e.target.value })}
                        className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg"
                        placeholder="+49"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-sm mb-1">Currency</label>
                      <input
                        type="text"
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg"
                        placeholder="EUR"
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
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">Country *</label>
                    <select
                      value={formData.countryId}
                      onChange={(e) => setFormData({ ...formData, countryId: e.target.value })}
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg"
                      required
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.flagEmoji} {country.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
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
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">Sort Order</label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="isFeatured" className="text-slate-300">Featured City</label>
                  </div>
                </>
              )}

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

export default Locations;
