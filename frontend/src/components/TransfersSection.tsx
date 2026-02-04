import { useState } from 'react';
import { Send, Search, Zap, Shield, Percent, Globe, Clock, CheckCircle, ArrowRight, Users, CreditCard } from 'lucide-react';

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
    selectCountry: 'Select country',
    selectCity: 'Select city',
    features: {
      fast: 'Fast Delivery',
      fastDesc: 'Money delivered within 24 hours',
      secure: 'Secure',
      secureDesc: 'Bank-level encryption',
      lowFee: 'Low Fees',
      lowFeeDesc: 'Only 1.5% commission',
    },
    whyChoose: 'Why Choose Our Transfers',
    howItWorks: 'How It Works',
    step1: 'Fill in transfer details',
    step2: 'Verify your identity',
    step3: 'Send payment',
    step4: 'Recipient gets money',
    stats: {
      transfers: 'Transfers',
      countries: 'Countries',
      avgTime: 'Avg. Time',
      satisfaction: 'Satisfaction',
    },
    trusted: 'Trusted by thousands',
    support247: '24/7 Support',
    guarantee: 'Money-back guarantee',
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
    selectCountry: 'Land auswählen',
    selectCity: 'Stadt auswählen',
    features: {
      fast: 'Schnelle Lieferung',
      fastDesc: 'Geld innerhalb von 24 Stunden geliefert',
      secure: 'Sicher',
      secureDesc: 'Verschlüsselung auf Bankniveau',
      lowFee: 'Niedrige Gebühren',
      lowFeeDesc: 'Nur 1,5% Provision',
    },
    whyChoose: 'Warum uns wählen',
    howItWorks: 'So funktioniert es',
    step1: 'Transferdetails eingeben',
    step2: 'Identität bestätigen',
    step3: 'Zahlung senden',
    step4: 'Empfänger erhält Geld',
    stats: {
      transfers: 'Transfers',
      countries: 'Länder',
      avgTime: 'Durchschn. Zeit',
      satisfaction: 'Zufriedenheit',
    },
    trusted: 'Vertrauen von Tausenden',
    support247: '24/7 Support',
    guarantee: 'Geld-zurück-Garantie',
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
    selectCountry: 'Выберите страну',
    selectCity: 'Выберите город',
    features: {
      fast: 'Быстрая доставка',
      fastDesc: 'Деньги доставляются в течение 24 часов',
      secure: 'Безопасно',
      secureDesc: 'Шифрование банковского уровня',
      lowFee: 'Низкие комиссии',
      lowFeeDesc: 'Всего 1.5% комиссия',
    },
    whyChoose: 'Почему выбирают нас',
    howItWorks: 'Как это работает',
    step1: 'Заполните данные перевода',
    step2: 'Подтвердите личность',
    step3: 'Отправьте платеж',
    step4: 'Получатель получает деньги',
    stats: {
      transfers: 'Переводов',
      countries: 'Стран',
      avgTime: 'Среднее время',
      satisfaction: 'Довольных',
    },
    trusted: 'Нам доверяют тысячи',
    support247: 'Поддержка 24/7',
    guarantee: 'Гарантия возврата',
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
    selectCountry: 'Виберіть країну',
    selectCity: 'Виберіть місто',
    features: {
      fast: 'Швидка доставка',
      fastDesc: 'Гроші доставляються протягом 24 годин',
      secure: 'Безпечно',
      secureDesc: 'Шифрування банківського рівня',
      lowFee: 'Низькі комісії',
      lowFeeDesc: 'Лише 1.5% комісія',
    },
    whyChoose: 'Чому обирають нас',
    howItWorks: 'Як це працює',
    step1: 'Заповніть дані переказу',
    step2: 'Підтвердіть особу',
    step3: 'Відправте платіж',
    step4: 'Отримувач отримує гроші',
    stats: {
      transfers: 'Переказів',
      countries: 'Країн',
      avgTime: 'Середній час',
      satisfaction: 'Задоволених',
    },
    trusted: 'Нам довіряють тисячі',
    support247: 'Підтримка 24/7',
    guarantee: 'Гарантія повернення',
  },
};

const countries = [
  { code: 'DE', name: 'Germany', nameRu: 'Германия', flag: '🇩🇪' },
  { code: 'AT', name: 'Austria', nameRu: 'Австрия', flag: '🇦🇹' },
  { code: 'CH', name: 'Switzerland', nameRu: 'Швейцария', flag: '🇨🇭' },
  { code: 'CZ', name: 'Czech Republic', nameRu: 'Чехия', flag: '🇨🇿' },
  { code: 'PL', name: 'Poland', nameRu: 'Польша', flag: '🇵🇱' },
  { code: 'NL', name: 'Netherlands', nameRu: 'Нидерланды', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', nameRu: 'Бельгия', flag: '🇧🇪' },
  { code: 'FR', name: 'France', nameRu: 'Франция', flag: '🇫🇷' },
];

const citiesByCountry: Record<string, { id: string; name: string; nameRu: string }[]> = {
  DE: [
    { id: '1', name: 'Berlin', nameRu: 'Берлин' },
    { id: '2', name: 'Munich', nameRu: 'Мюнхен' },
    { id: '3', name: 'Frankfurt', nameRu: 'Франкфурт' },
    { id: '4', name: 'Hamburg', nameRu: 'Гамбург' },
    { id: '5', name: 'Cologne', nameRu: 'Кёльн' },
  ],
  AT: [
    { id: '6', name: 'Vienna', nameRu: 'Вена' },
    { id: '7', name: 'Salzburg', nameRu: 'Зальцбург' },
    { id: '8', name: 'Innsbruck', nameRu: 'Инсбрук' },
  ],
  CH: [
    { id: '9', name: 'Zurich', nameRu: 'Цюрих' },
    { id: '10', name: 'Geneva', nameRu: 'Женева' },
    { id: '11', name: 'Basel', nameRu: 'Базель' },
  ],
  CZ: [
    { id: '12', name: 'Prague', nameRu: 'Прага' },
    { id: '13', name: 'Brno', nameRu: 'Брно' },
  ],
  PL: [
    { id: '14', name: 'Warsaw', nameRu: 'Варшава' },
    { id: '15', name: 'Krakow', nameRu: 'Краков' },
    { id: '16', name: 'Wroclaw', nameRu: 'Вроцлав' },
  ],
  NL: [
    { id: '17', name: 'Amsterdam', nameRu: 'Амстердам' },
    { id: '18', name: 'Rotterdam', nameRu: 'Роттердам' },
  ],
  BE: [
    { id: '19', name: 'Brussels', nameRu: 'Брюссель' },
    { id: '20', name: 'Antwerp', nameRu: 'Антверпен' },
  ],
  FR: [
    { id: '21', name: 'Paris', nameRu: 'Париж' },
    { id: '22', name: 'Lyon', nameRu: 'Лион' },
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    const transferCode = 'TR' + Math.random().toString(36).substr(2, 9).toUpperCase();
    alert(`Transfer request submitted!\nYour transfer code: ${transferCode}\nYou will receive confirmation shortly.`);

    setIsSubmitting(false);
    setFormData({
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
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Tracking transfer ${trackCode}...\nStatus: Processing\nEstimated delivery: 24 hours`);
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Form */}
        <div>
          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('send')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === 'send'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{t.send}</span>
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === 'track'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>{t.track}</span>
            </button>
          </div>

          {activeTab === 'send' ? (
            <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 space-y-6">
              {/* Sender Info */}
              <div>
                <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2"></span>
                  {t.senderInfo}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={formData.senderName}
                    onChange={(e) => handleInputChange('senderName', e.target.value)}
                    placeholder={t.name}
                    className="input-base"
                    required
                  />
                  <input
                    type="tel"
                    value={formData.senderPhone}
                    onChange={(e) => handleInputChange('senderPhone', e.target.value)}
                    placeholder={t.phone}
                    className="input-base"
                    required
                  />
                  <input
                    type="email"
                    value={formData.senderEmail}
                    onChange={(e) => handleInputChange('senderEmail', e.target.value)}
                    placeholder={t.email}
                    className="input-base sm:col-span-2"
                  />
                </div>
              </div>

              {/* Recipient Info */}
              <div>
                <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2"></span>
                  {t.recipientInfo}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={formData.recipientName}
                    onChange={(e) => handleInputChange('recipientName', e.target.value)}
                    placeholder={t.name}
                    className="input-base"
                    required
                  />
                  <input
                    type="tel"
                    value={formData.recipientPhone}
                    onChange={(e) => handleInputChange('recipientPhone', e.target.value)}
                    placeholder={t.phone}
                    className="input-base"
                    required
                  />
                  <select
                    value={formData.recipientCountry}
                    onChange={(e) => handleInputChange('recipientCountry', e.target.value)}
                    className="input-base"
                    required
                  >
                    <option value="">{t.selectCountry}</option>
                    {countries.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {lang === 'ru' || lang === 'ua' ? c.nameRu : c.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={formData.recipientCity}
                    onChange={(e) => handleInputChange('recipientCity', e.target.value)}
                    className="input-base"
                    required
                    disabled={!formData.recipientCountry}
                  >
                    <option value="">{t.selectCity}</option>
                    {cities.map(c => (
                      <option key={c.id} value={c.id}>
                        {lang === 'ru' || lang === 'ua' ? c.nameRu : c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Transfer Details */}
              <div>
                <h3 className="text-sm font-semibold text-blue-400 mb-3 flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                  {t.transferDetails}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min="1"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder={t.amount}
                    className="input-base"
                    required
                  />
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="input-base"
                  >
                    <option value="EUR">EUR €</option>
                    <option value="USD">USD $</option>
                    <option value="CHF">CHF ₣</option>
                    <option value="GBP">GBP £</option>
                  </select>
                </div>

                {formData.amount && parseFloat(formData.amount) > 0 && (
                  <div className="mt-4 p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">{t.amount}:</span>
                      <span className="text-white">{parseFloat(formData.amount).toFixed(2)} {formData.currency}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">{t.fee} (1.5%):</span>
                      <span className="text-yellow-400">{calculateFee().toFixed(2)} {formData.currency}</span>
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
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>{t.send}</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleTrack} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">{t.trackCode}</label>
                <input
                  type="text"
                  value={trackCode}
                  onChange={(e) => setTrackCode(e.target.value.toUpperCase())}
                  placeholder="TRXXXXXXXX"
                  className="input-base font-mono"
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
                  className="input-base"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-semibold text-white hover:opacity-90 transition-all flex items-center justify-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>{t.trackBtn}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Side - Information */}
        <div className="space-y-6">
          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">{t.whyChoose}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 hover:border-emerald-500/50 transition-colors">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5 text-emerald-400" />
                </div>
                <h4 className="font-medium text-white mb-1">{t.features.fast}</h4>
                <p className="text-xs text-slate-400">{t.features.fastDesc}</p>
              </div>
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 hover:border-cyan-500/50 transition-colors">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-3">
                  <Shield className="w-5 h-5 text-cyan-400" />
                </div>
                <h4 className="font-medium text-white mb-1">{t.features.secure}</h4>
                <p className="text-xs text-slate-400">{t.features.secureDesc}</p>
              </div>
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 hover:border-blue-500/50 transition-colors">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3">
                  <Percent className="w-5 h-5 text-blue-400" />
                </div>
                <h4 className="font-medium text-white mb-1">{t.features.lowFee}</h4>
                <p className="text-xs text-slate-400">{t.features.lowFeeDesc}</p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-slate-800/30 rounded-2xl p-5 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">{t.howItWorks}</h3>
            <div className="space-y-3">
              {[t.step1, t.step2, t.step3, t.step4].map((step, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-slate-300 text-sm">{step}</span>
                  {index < 3 && <ArrowRight className="w-4 h-4 text-slate-500 flex-shrink-0 hidden sm:block" />}
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/50 text-center">
              <div className="text-xl font-bold text-emerald-400">50K+</div>
              <div className="text-xs text-slate-400">{t.stats.transfers}</div>
            </div>
            <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/50 text-center">
              <div className="text-xl font-bold text-cyan-400">8</div>
              <div className="text-xs text-slate-400">{t.stats.countries}</div>
            </div>
            <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/50 text-center">
              <div className="text-xl font-bold text-blue-400">&lt;24h</div>
              <div className="text-xs text-slate-400">{t.stats.avgTime}</div>
            </div>
            <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/50 text-center">
              <div className="text-xl font-bold text-purple-400">98%</div>
              <div className="text-xs text-slate-400">{t.stats.satisfaction}</div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2 px-3 py-2 bg-slate-800/30 rounded-lg border border-slate-700/50">
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-slate-300">{t.trusted}</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-2 bg-slate-800/30 rounded-lg border border-slate-700/50">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-slate-300">{t.support247}</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-2 bg-slate-800/30 rounded-lg border border-slate-700/50">
              <CheckCircle className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-slate-300">{t.guarantee}</span>
            </div>
          </div>

          {/* Supported Payment Methods */}
          <div className="flex items-center justify-center space-x-4 pt-4">
            <span className="text-xs text-slate-500">Supported:</span>
            <div className="flex items-center space-x-2">
              <CreditCard className="w-6 h-6 text-slate-400" />
              <Globe className="w-6 h-6 text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TransfersSection;
