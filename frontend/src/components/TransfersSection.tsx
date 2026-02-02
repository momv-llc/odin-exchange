import { useState } from 'react';
import { cn } from '../utils/cn';

interface TransferFormData {
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  recipientName: string;
  recipientPhone: string;
  recipientCountry: string;
  recipientCity: string;
  amount: string;
  currency: string;
}

interface TransfersSectionProps {
  lang: 'en' | 'de' | 'ru' | 'ua';
}

const translations = {
  en: {
    title: 'Money Transfers',
    subtitle: 'Fast and secure international money transfers to Europe',
    senderInfo: 'Sender Information',
    recipientInfo: 'Recipient Information',
    transferDetails: 'Transfer Details',
    name: 'Full Name',
    phone: 'Phone Number',
    email: 'Email',
    country: 'Country',
    city: 'City',
    amount: 'Amount',
    currency: 'Currency',
    fee: 'Fee',
    total: 'Total',
    send: 'Send Money',
    track: 'Track Transfer',
    trackCode: 'Transfer Code',
    trackPhone: 'Sender Phone',
    trackBtn: 'Track',
    features: {
      fast: 'Fast Delivery',
      fastDesc: 'Money delivered within 24 hours',
      secure: 'Secure',
      secureDesc: 'Bank-level encryption',
      lowFee: 'Low Fees',
      lowFeeDesc: 'Only 1.5% commission',
    },
  },
  de: {
    title: 'Geldtransfers',
    subtitle: 'Schnelle und sichere internationale Geldtransfers nach Europa',
    senderInfo: 'Absenderinformationen',
    recipientInfo: 'Empfängerinformationen',
    transferDetails: 'Transferdetails',
    name: 'Vollständiger Name',
    phone: 'Telefonnummer',
    email: 'E-Mail',
    country: 'Land',
    city: 'Stadt',
    amount: 'Betrag',
    currency: 'Währung',
    fee: 'Gebühr',
    total: 'Gesamt',
    send: 'Geld senden',
    track: 'Transfer verfolgen',
    trackCode: 'Transfercode',
    trackPhone: 'Absender-Telefon',
    trackBtn: 'Verfolgen',
    features: {
      fast: 'Schnelle Lieferung',
      fastDesc: 'Geld innerhalb von 24 Stunden geliefert',
      secure: 'Sicher',
      secureDesc: 'Verschlüsselung auf Bankniveau',
      lowFee: 'Niedrige Gebühren',
      lowFeeDesc: 'Nur 1,5% Provision',
    },
  },
  ru: {
    title: 'Денежные переводы',
    subtitle: 'Быстрые и безопасные международные денежные переводы в Европу',
    senderInfo: 'Информация об отправителе',
    recipientInfo: 'Информация о получателе',
    transferDetails: 'Детали перевода',
    name: 'ФИО',
    phone: 'Номер телефона',
    email: 'Email',
    country: 'Страна',
    city: 'Город',
    amount: 'Сумма',
    currency: 'Валюта',
    fee: 'Комиссия',
    total: 'Итого',
    send: 'Отправить деньги',
    track: 'Отследить перевод',
    trackCode: 'Код перевода',
    trackPhone: 'Телефон отправителя',
    trackBtn: 'Отследить',
    features: {
      fast: 'Быстрая доставка',
      fastDesc: 'Деньги доставляются в течение 24 часов',
      secure: 'Безопасно',
      secureDesc: 'Шифрование банковского уровня',
      lowFee: 'Низкие комиссии',
      lowFeeDesc: 'Всего 1.5% комиссия',
    },
  },
  ua: {
    title: 'Грошові перекази',
    subtitle: 'Швидкі та безпечні міжнародні грошові перекази до Європи',
    senderInfo: 'Інформація про відправника',
    recipientInfo: 'Інформація про отримувача',
    transferDetails: 'Деталі переказу',
    name: 'ПІБ',
    phone: 'Номер телефону',
    email: 'Email',
    country: 'Країна',
    city: 'Місто',
    amount: 'Сума',
    currency: 'Валюта',
    fee: 'Комісія',
    total: 'Разом',
    send: 'Надіслати гроші',
    track: 'Відстежити переказ',
    trackCode: 'Код переказу',
    trackPhone: 'Телефон відправника',
    trackBtn: 'Відстежити',
    features: {
      fast: 'Швидка доставка',
      fastDesc: 'Гроші доставляються протягом 24 годин',
      secure: 'Безпечно',
      secureDesc: 'Шифрування банківського рівня',
      lowFee: 'Низькі комісії',
      lowFeeDesc: 'Лише 1.5% комісія',
    },
  },
};

const countries = [
  { code: 'DE', name: 'Germany', nameRu: 'Германия', flag: '🇩🇪' },
  { code: 'AT', name: 'Austria', nameRu: 'Австрия', flag: '🇦🇹' },
  { code: 'CH', name: 'Switzerland', nameRu: 'Швейцария', flag: '🇨🇭' },
  { code: 'CZ', name: 'Czech Republic', nameRu: 'Чехия', flag: '🇨🇿' },
  { code: 'PL', name: 'Poland', nameRu: 'Польша', flag: '🇵🇱' },
  { code: 'NL', name: 'Netherlands', nameRu: 'Нидерланды', flag: '🇳🇱' },
];

const citiesByCountry: Record<string, { id: string; name: string; nameRu: string }[]> = {
  DE: [
    { id: '1', name: 'Berlin', nameRu: 'Берлин' },
    { id: '2', name: 'Munich', nameRu: 'Мюнхен' },
    { id: '3', name: 'Frankfurt', nameRu: 'Франкфурт' },
  ],
  AT: [
    { id: '4', name: 'Vienna', nameRu: 'Вена' },
    { id: '5', name: 'Salzburg', nameRu: 'Зальцбург' },
  ],
  CH: [
    { id: '6', name: 'Zurich', nameRu: 'Цюрих' },
    { id: '7', name: 'Geneva', nameRu: 'Женева' },
  ],
  CZ: [
    { id: '8', name: 'Prague', nameRu: 'Прага' },
  ],
  PL: [
    { id: '9', name: 'Warsaw', nameRu: 'Варшава' },
    { id: '10', name: 'Krakow', nameRu: 'Краков' },
  ],
  NL: [
    { id: '11', name: 'Amsterdam', nameRu: 'Амстердам' },
  ],
};

export function TransfersSection({ lang }: TransfersSectionProps) {
  const [activeTab, setActiveTab] = useState<'send' | 'track'>('send');
  const [formData, setFormData] = useState<TransferFormData>({
    senderName: '',
    senderPhone: '',
    senderEmail: '',
    recipientName: '',
    recipientPhone: '',
    recipientCountry: '',
    recipientCity: '',
    amount: '',
    currency: 'EUR',
  });
  const [trackCode, setTrackCode] = useState('');
  const [trackPhone, setTrackPhone] = useState('');

  const t = translations[lang];

  const handleInputChange = (field: keyof TransferFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'recipientCountry') {
      setFormData(prev => ({ ...prev, recipientCity: '' }));
    }
  };

  const calculateFee = () => {
    const amount = parseFloat(formData.amount) || 0;
    const feePercent = 0.015;
    const minFee = 5;
    return Math.max(amount * feePercent, minFee);
  };

  const calculateTotal = () => {
    const amount = parseFloat(formData.amount) || 0;
    return amount + calculateFee();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would call the API
    alert('Transfer request submitted! You will receive confirmation shortly.');
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would call the API
    alert(`Tracking transfer ${trackCode}...`);
  };

  const cities = formData.recipientCountry ? citiesByCountry[formData.recipientCountry] || [] : [];

  return (
    <section className="py-16" id="transfers">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {t.title}
          </span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">{t.subtitle}</p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 text-center">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="font-semibold text-white mb-2">{t.features.fast}</h3>
          <p className="text-sm text-slate-400">{t.features.fastDesc}</p>
        </div>
        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 text-center">
          <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="font-semibold text-white mb-2">{t.features.secure}</h3>
          <p className="text-sm text-slate-400">{t.features.secureDesc}</p>
        </div>
        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 text-center">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-white mb-2">{t.features.lowFee}</h3>
          <p className="text-sm text-slate-400">{t.features.lowFeeDesc}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-3xl mx-auto">
        <div className="flex space-x-4 mb-8 justify-center">
          <button
            onClick={() => setActiveTab('send')}
            className={cn(
              'px-6 py-3 rounded-xl font-medium transition-all',
              activeTab === 'send'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            )}
          >
            {t.send}
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={cn(
              'px-6 py-3 rounded-xl font-medium transition-all',
              activeTab === 'track'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            )}
          >
            {t.track}
          </button>
        </div>

        {activeTab === 'send' ? (
          <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50">
            {/* Sender Info */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="w-1 h-5 bg-emerald-400 rounded-full mr-3"></span>
                {t.senderInfo}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">{t.name}</label>
                  <input
                    type="text"
                    value={formData.senderName}
                    onChange={(e) => handleInputChange('senderName', e.target.value)}
                    className="w-full bg-slate-700/50 rounded-xl px-4 py-3 border border-slate-600/50 focus:outline-none focus:border-emerald-400 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">{t.phone}</label>
                  <input
                    type="tel"
                    value={formData.senderPhone}
                    onChange={(e) => handleInputChange('senderPhone', e.target.value)}
                    className="w-full bg-slate-700/50 rounded-xl px-4 py-3 border border-slate-600/50 focus:outline-none focus:border-emerald-400 text-white"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-400 text-sm mb-2">{t.email}</label>
                  <input
                    type="email"
                    value={formData.senderEmail}
                    onChange={(e) => handleInputChange('senderEmail', e.target.value)}
                    className="w-full bg-slate-700/50 rounded-xl px-4 py-3 border border-slate-600/50 focus:outline-none focus:border-emerald-400 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Recipient Info */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="w-1 h-5 bg-cyan-400 rounded-full mr-3"></span>
                {t.recipientInfo}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">{t.name}</label>
                  <input
                    type="text"
                    value={formData.recipientName}
                    onChange={(e) => handleInputChange('recipientName', e.target.value)}
                    className="w-full bg-slate-700/50 rounded-xl px-4 py-3 border border-slate-600/50 focus:outline-none focus:border-emerald-400 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">{t.phone}</label>
                  <input
                    type="tel"
                    value={formData.recipientPhone}
                    onChange={(e) => handleInputChange('recipientPhone', e.target.value)}
                    className="w-full bg-slate-700/50 rounded-xl px-4 py-3 border border-slate-600/50 focus:outline-none focus:border-emerald-400 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">{t.country}</label>
                  <select
                    value={formData.recipientCountry}
                    onChange={(e) => handleInputChange('recipientCountry', e.target.value)}
                    className="w-full bg-slate-700/50 rounded-xl px-4 py-3 border border-slate-600/50 focus:outline-none focus:border-emerald-400 text-white"
                    required
                  >
                    <option value="">Select country</option>
                    {countries.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {lang === 'ru' || lang === 'ua' ? c.nameRu : c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">{t.city}</label>
                  <select
                    value={formData.recipientCity}
                    onChange={(e) => handleInputChange('recipientCity', e.target.value)}
                    className="w-full bg-slate-700/50 rounded-xl px-4 py-3 border border-slate-600/50 focus:outline-none focus:border-emerald-400 text-white"
                    required
                    disabled={!formData.recipientCountry}
                  >
                    <option value="">Select city</option>
                    {cities.map(c => (
                      <option key={c.id} value={c.id}>
                        {lang === 'ru' || lang === 'ua' ? c.nameRu : c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Transfer Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="w-1 h-5 bg-blue-400 rounded-full mr-3"></span>
                {t.transferDetails}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">{t.amount}</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="w-full bg-slate-700/50 rounded-xl px-4 py-3 border border-slate-600/50 focus:outline-none focus:border-emerald-400 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">{t.currency}</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full bg-slate-700/50 rounded-xl px-4 py-3 border border-slate-600/50 focus:outline-none focus:border-emerald-400 text-white"
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="CHF">CHF</option>
                  </select>
                </div>
              </div>

              {formData.amount && parseFloat(formData.amount) > 0 && (
                <div className="mt-4 p-4 bg-slate-700/30 rounded-xl">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">{t.amount}:</span>
                    <span className="text-white">{parseFloat(formData.amount).toFixed(2)} {formData.currency}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">{t.fee} (1.5%):</span>
                    <span className="text-white">{calculateFee().toFixed(2)} {formData.currency}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-slate-600/50">
                    <span className="text-white">{t.total}:</span>
                    <span className="text-emerald-400">{calculateTotal().toFixed(2)} {formData.currency}</span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl font-semibold text-lg text-white hover:opacity-90 transition-opacity"
            >
              {t.send}
            </button>
          </form>
        ) : (
          <form onSubmit={handleTrack} className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50">
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">{t.trackCode}</label>
                <input
                  type="text"
                  value={trackCode}
                  onChange={(e) => setTrackCode(e.target.value.toUpperCase())}
                  placeholder="TRXXXXXXXX"
                  className="w-full bg-slate-700/50 rounded-xl px-4 py-3 border border-slate-600/50 focus:outline-none focus:border-emerald-400 text-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">{t.trackPhone}</label>
                <input
                  type="tel"
                  value={trackPhone}
                  onChange={(e) => setTrackPhone(e.target.value)}
                  placeholder="+49..."
                  className="w-full bg-slate-700/50 rounded-xl px-4 py-3 border border-slate-600/50 focus:outline-none focus:border-emerald-400 text-white"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl font-semibold text-lg text-white hover:opacity-90 transition-opacity"
              >
                {t.trackBtn}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

export default TransfersSection;
