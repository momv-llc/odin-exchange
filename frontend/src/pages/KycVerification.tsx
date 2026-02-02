import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

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
      const res = await axios.get('/api/kyc/status');
      setKycData(res.data);
      if (res.data.firstName) {
        setFormData({
          firstName: res.data.firstName || '', lastName: res.data.lastName || '',
          middleName: res.data.middleName || '',
          dateOfBirth: res.data.dateOfBirth?.split('T')[0] || '',
          nationality: res.data.nationality || '',
          countryOfResidence: res.data.countryOfResidence || '',
          address: res.data.address || '', city: res.data.city || '',
          postalCode: res.data.postalCode || '',
        });
      }
      if (res.data.status === 'NOT_STARTED') setStep(1);
      else if (res.data.documents.length < 2) setStep(2);
      else setStep(3);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleSubmitPersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/kyc/submit', formData);
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
      await axios.post('/api/kyc/document', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      fetchKycStatus();
    } catch (error: any) { alert(error.response?.data?.message || 'Error'); }
    finally { setSubmitting(false); }
  };

  const handleSubmitForReview = async () => {
    setSubmitting(true);
    try {
      await axios.post('/api/kyc/submit-for-review');
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

      {(status === 'NOT_STARTED' || status === 'PENDING' || status === 'REJECTED') && (
        <>
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= s ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'}`}>{s}</div>
                {s < 3 && <div className={`w-24 h-1 mx-2 ${step > s ? 'bg-emerald-600' : 'bg-slate-700'}`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <form onSubmit={handleSubmitPersonalInfo} className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold mb-6 text-white">Личные данные</h2>
              <div className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input type="text" required placeholder="Имя" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="p-3 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                  <input type="text" required placeholder="Фамилия" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="p-3 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                </div>
                <input type="date" required value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className="p-3 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                <div className="grid md:grid-cols-2 gap-4">
                  <input type="text" required placeholder="Гражданство (RU)" maxLength={3} value={formData.nationality} onChange={(e) => setFormData({ ...formData, nationality: e.target.value.toUpperCase() })} className="p-3 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                  <input type="text" required placeholder="Страна проживания" maxLength={3} value={formData.countryOfResidence} onChange={(e) => setFormData({ ...formData, countryOfResidence: e.target.value.toUpperCase() })} className="p-3 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                </div>
                <input type="text" required placeholder="Адрес" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="p-3 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                <div className="grid md:grid-cols-2 gap-4">
                  <input type="text" required placeholder="Город" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="p-3 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                  <input type="text" required placeholder="Индекс" value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} className="p-3 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                </div>
              </div>
              <button type="submit" disabled={submitting} className="mt-6 w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">{submitting ? 'Сохранение...' : 'Продолжить'}</button>
            </form>
          )}

          {step === 2 && (
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold mb-6 text-white">Загрузка документов</h2>
              <select value={selectedDocType} onChange={(e) => setSelectedDocType(e.target.value)} className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white mb-4">
                <option value="PASSPORT">Паспорт</option>
                <option value="ID_CARD">ID карта</option>
                <option value="SELFIE">Селфи с документом</option>
              </select>
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-500 transition">
                <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
                <div className="text-slate-400">Нажмите для загрузки (PNG, JPG, PDF до 10MB)</div>
              </div>
              <div className="mt-4 space-y-2">
                {kycData?.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <span className="text-white">{doc.type}</span>
                    <span className="text-sm text-slate-400">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-6">
                <button onClick={() => setStep(1)} className="flex-1 py-3 border border-slate-600 text-white rounded-lg hover:bg-slate-700">Назад</button>
                <button onClick={() => setStep(3)} disabled={(kycData?.documents?.length || 0) < 2} className="flex-1 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">Продолжить</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold mb-6 text-white">Проверка и отправка</h2>
              <div className="p-4 bg-slate-700 rounded-lg mb-4">
                <div className="text-white">{formData.firstName} {formData.lastName}</div>
                <div className="text-slate-400">{formData.city}, {formData.countryOfResidence}</div>
              </div>
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-6 text-yellow-400 text-sm">
                Нажимая "Отправить", вы подтверждаете достоверность данных.
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 py-3 border border-slate-600 text-white rounded-lg">Назад</button>
                <button onClick={handleSubmitForReview} disabled={submitting} className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">{submitting ? 'Отправка...' : 'Отправить на проверку'}</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
