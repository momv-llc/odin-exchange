import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api/client';

type KycStatus = 'NOT_STARTED' | 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';

interface KycData {
  status: KycStatus;
  level: string;
  firstName?: string;
  lastName?: string;
  documents: Array<{
    id: string;
    type: string;
    isVerified: boolean;
    uploadedAt: string;
  }>;
  rejectionReason?: string;
}

export function KycVerification() {
  const [step, setStep] = useState(1);
  const [kycData, setKycData] = useState<KycData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocType, setSelectedDocType] = useState('PASSPORT');

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', middleName: '', dateOfBirth: '',
    nationality: '', countryOfResidence: '', address: '', city: '', postalCode: '',
  });

  useEffect(() => { fetchKycStatus(); }, []);

  const fetchKycStatus = async () => {
    try {
      const res = await api.get('/kyc/status');
      const data = res.data?.data ?? res.data;
      setKycData(data);
      if (data.firstName) {
        setFormData({
          firstName: data.firstName || '', lastName: data.lastName || '',
          middleName: data.middleName || '',
          dateOfBirth: data.dateOfBirth?.split('T')[0] || '',
          nationality: data.nationality || '',
          countryOfResidence: data.countryOfResidence || '',
          address: data.address || '', city: data.city || '',
          postalCode: data.postalCode || '',
        });
      }
      if (data.status === 'NOT_STARTED') setStep(1);
      else if (data.documents.length < 2) setStep(2);
      else setStep(3);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleSubmitPersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/kyc/submit', formData);
      setStep(2);
      fetchKycStatus();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error');
    } finally { setSubmitting(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', selectedDocType);
    setSubmitting(true);
    try {
      await api.post('/kyc/document', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      fetchKycStatus();
    } catch (error: any) { alert(error.response?.data?.message || 'Error'); }
    finally { setSubmitting(false); }
  };

  const handleSubmitForReview = async () => {
    setSubmitting(true);
    try {
      await api.post('/kyc/submit-for-review');
      fetchKycStatus();
    } catch (error: any) { alert(error.response?.data?.message || 'Error'); }
    finally { setSubmitting(false); }
  };

  const badges: Record<KycStatus, { color: string; text: string }> = {
    NOT_STARTED: { color: 'bg-gray-500/20 text-gray-400', text: 'Не начато' },
    PENDING: { color: 'bg-yellow-500/20 text-yellow-400', text: 'На рассмотрении' },
    IN_REVIEW: { color: 'bg-blue-500/20 text-blue-400', text: 'Проверяется' },
    APPROVED: { color: 'bg-green-500/20 text-green-400', text: 'Подтверждено' },
    REJECTED: { color: 'bg-red-500/20 text-red-400', text: 'Отклонено' },
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;

  const status = kycData?.status || 'NOT_STARTED';
  const badge = badges[status];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Верификация KYC</h1>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${badge.color}`}>{badge.text}</span>
      </div>

      {status === 'APPROVED' && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-8">
          <div className="font-semibold text-green-400">Верификация пройдена! Уровень: {kycData?.level}</div>
        </div>
      )}

      {status === 'REJECTED' && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 mb-8">
          <div className="font-semibold text-red-400">Отклонено: {kycData?.rejectionReason}</div>
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleSubmitPersonalInfo} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Имя"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="bg-slate-800 text-white rounded-lg p-3 border border-slate-700"
              required
            />
            <input
              type="text"
              placeholder="Фамилия"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="bg-slate-800 text-white rounded-lg p-3 border border-slate-700"
              required
            />
          </div>
          <input
            type="text"
            placeholder="Отчество"
            value={formData.middleName}
            onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
            className="w-full bg-slate-800 text-white rounded-lg p-3 border border-slate-700"
          />
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            className="w-full bg-slate-800 text-white rounded-lg p-3 border border-slate-700"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Гражданство"
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              className="bg-slate-800 text-white rounded-lg p-3 border border-slate-700"
              required
            />
            <input
              type="text"
              placeholder="Страна проживания"
              value={formData.countryOfResidence}
              onChange={(e) => setFormData({ ...formData, countryOfResidence: e.target.value })}
              className="bg-slate-800 text-white rounded-lg p-3 border border-slate-700"
              required
            />
          </div>
          <input
            type="text"
            placeholder="Адрес"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full bg-slate-800 text-white rounded-lg p-3 border border-slate-700"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Город"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="bg-slate-800 text-white rounded-lg p-3 border border-slate-700"
              required
            />
            <input
              type="text"
              placeholder="Почтовый индекс"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              className="bg-slate-800 text-white rounded-lg p-3 border border-slate-700"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {submitting ? 'Отправка...' : 'Сохранить и продолжить'}
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="text-slate-400">Загрузите документы (минимум 2 файла)</div>
          <div className="flex items-center gap-4">
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              className="bg-slate-800 text-white rounded-lg p-3 border border-slate-700"
            >
              <option value="PASSPORT">Паспорт</option>
              <option value="ID_CARD">ID карта</option>
              <option value="DRIVERS_LICENSE">Водительские права</option>
            </select>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={submitting}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {submitting ? 'Загрузка...' : 'Выбрать файл'}
            </button>
          </div>
          {kycData?.documents.length ? (
            <div className="space-y-2">
              {kycData.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
                  <div className="text-white">{doc.type}</div>
                  <div className={doc.isVerified ? 'text-green-400' : 'text-yellow-400'}>
                    {doc.isVerified ? 'Подтверждено' : 'На проверке'}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          <button
            onClick={handleSubmitForReview}
            disabled={submitting || (kycData?.documents.length ?? 0) < 2}
            className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
          >
            Отправить на проверку
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="text-center text-slate-300">Ваши документы отправлены на проверку.</div>
      )}
    </div>
  );
}
