import { useState } from 'react';
import { Banknote, CreditCard, Wallet, ChevronRight, Shield, Zap, CheckCircle } from 'lucide-react';

interface PaymentMethodsSectionProps {
  lang: 'en' | 'de' | 'ru' | 'ua';
}

const translations = {
  en: {
    title: 'Payment Methods',
    subtitle: 'Multiple convenient ways to exchange your funds',
    cashTitle: 'Cash Exchange',
    cashDesc: 'Exchange cash in our offices across Europe. Fast, secure, and anonymous.',
    cardTitle: 'Card Payment',
    cardDesc: 'Pay with Visa, Mastercard, or bank transfer. Instant processing.',
    cryptoTitle: 'Crypto Wallets',
    cryptoDesc: 'Direct transfers to your crypto wallet. BTC, ETH, USDT and more.',
    available: 'Available',
    popular: 'Popular',
    learnMore: 'Learn more',
    securePayments: 'Secure Payments',
    instantProcessing: 'Instant Processing',
    noHiddenFees: 'No Hidden Fees',
  },
  de: {
    title: 'Zahlungsmethoden',
    subtitle: 'Mehrere bequeme Möglichkeiten zum Austausch Ihrer Mittel',
    cashTitle: 'Bargeldwechsel',
    cashDesc: 'Tauschen Sie Bargeld in unseren Büros in ganz Europa. Schnell, sicher und anonym.',
    cardTitle: 'Kartenzahlung',
    cardDesc: 'Bezahlen Sie mit Visa, Mastercard oder Banküberweisung. Sofortige Verarbeitung.',
    cryptoTitle: 'Krypto-Wallets',
    cryptoDesc: 'Direkte Überweisungen auf Ihr Krypto-Wallet. BTC, ETH, USDT und mehr.',
    available: 'Verfügbar',
    popular: 'Beliebt',
    learnMore: 'Mehr erfahren',
    securePayments: 'Sichere Zahlungen',
    instantProcessing: 'Sofortige Verarbeitung',
    noHiddenFees: 'Keine versteckten Gebühren',
  },
  ru: {
    title: 'Способы оплаты',
    subtitle: 'Несколько удобных способов обмена ваших средств',
    cashTitle: 'Обмен наличных',
    cashDesc: 'Обменивайте наличные в наших офисах по всей Европе. Быстро, безопасно и анонимно.',
    cardTitle: 'Оплата картой',
    cardDesc: 'Оплачивайте Visa, Mastercard или банковским переводом. Мгновенная обработка.',
    cryptoTitle: 'Крипто кошельки',
    cryptoDesc: 'Прямые переводы на ваш криптокошелек. BTC, ETH, USDT и другие.',
    available: 'Доступно',
    popular: 'Популярно',
    learnMore: 'Подробнее',
    securePayments: 'Безопасные платежи',
    instantProcessing: 'Мгновенная обработка',
    noHiddenFees: 'Без скрытых комиссий',
  },
  ua: {
    title: 'Способи оплати',
    subtitle: 'Декілька зручних способів обміну ваших коштів',
    cashTitle: 'Обмін готівки',
    cashDesc: 'Обмінюйте готівку в наших офісах по всій Європі. Швидко, безпечно та анонімно.',
    cardTitle: 'Оплата карткою',
    cardDesc: 'Оплачуйте Visa, Mastercard або банківським переказом. Миттєва обробка.',
    cryptoTitle: 'Крипто гаманці',
    cryptoDesc: 'Прямі перекази на ваш криптогаманець. BTC, ETH, USDT та інші.',
    available: 'Доступно',
    popular: 'Популярно',
    learnMore: 'Детальніше',
    securePayments: 'Безпечні платежі',
    instantProcessing: 'Миттєва обробка',
    noHiddenFees: 'Без прихованих комісій',
  },
};

// SVG Icons for payment methods
const VisaIcon = () => (
  <svg viewBox="0 0 48 48" className="w-10 h-10">
    <rect fill="#1A1F71" width="48" height="48" rx="6"/>
    <path fill="#fff" d="M19.5 31h-3.8l2.4-14.5h3.8L19.5 31zm8.3-14.1c-.8-.3-2-.6-3.5-.6-3.8 0-6.5 2-6.5 4.9 0 2.1 1.9 3.3 3.4 4 1.5.7 2 1.2 2 1.8 0 1-.8 1.5-2.3 1.5-1.5 0-3.1-.4-4.1-.9l-.6-.3-.6 3.6c1.2.5 3.4.9 5.6.9 4.1 0 6.7-2 6.7-5 0-1.7-1-3-3.2-4-1.3-.7-2.1-1.1-2.1-1.8 0-.6.7-1.3 2.2-1.3 1.2 0 2.1.3 2.8.6l.3.2.6-3.6zm9.9-.4h-3c-.9 0-1.6.3-2 1.2l-5.6 13.3h4l.8-2.2h4.8c.1.5.5 2.2.5 2.2h3.5l-3-14.5zm-4.6 9.4c.3-.8 1.5-4 1.5-4l.5-1.3.3 1.2s.7 3.5.9 4.1h-3.2zM14.4 16.5l-3.7 9.9-.4-2c-.7-2.4-2.9-5-5.4-6.3l3.4 12.9h4.1l6.1-14.5h-4.1z"/>
    <path fill="#F9A51A" d="M8.3 16.5H2.1l-.1.4c4.8 1.2 8 4.2 9.3 7.7l-1.3-6.8c-.2-.9-.9-1.2-1.7-1.3z"/>
  </svg>
);

const MastercardIcon = () => (
  <svg viewBox="0 0 48 48" className="w-10 h-10">
    <rect fill="#000" width="48" height="48" rx="6"/>
    <circle fill="#EB001B" cx="18" cy="24" r="10"/>
    <circle fill="#F79E1B" cx="30" cy="24" r="10"/>
    <path fill="#FF5F00" d="M24 16.8c2.5 2 4 5 4 8.2s-1.5 6.2-4 8.2c-2.5-2-4-5-4-8.2s1.5-6.2 4-8.2z"/>
  </svg>
);

const SepaIcon = () => (
  <svg viewBox="0 0 48 48" className="w-10 h-10">
    <rect fill="#004A93" width="48" height="48" rx="6"/>
    <path fill="#FFD700" d="M8 24c0-8.8 7.2-16 16-16s16 7.2 16 16-7.2 16-16 16S8 32.8 8 24z"/>
    <path fill="#004A93" d="M24 12c-6.6 0-12 5.4-12 12s5.4 12 12 12 12-5.4 12-12-5.4-12-12-12zm0 2c5.5 0 10 4.5 10 10s-4.5 10-10 10-10-4.5-10-10 4.5-10 10-10z"/>
    <text x="24" y="27" textAnchor="middle" fill="#004A93" fontSize="8" fontWeight="bold">€</text>
  </svg>
);

const SwiftIcon = () => (
  <svg viewBox="0 0 48 48" className="w-10 h-10">
    <rect fill="#FF6600" width="48" height="48" rx="6"/>
    <path fill="#fff" d="M10 18h28v2H10zm0 5h28v2H10zm0 5h28v2H10z"/>
    <circle fill="#fff" cx="14" cy="24" r="3"/>
  </svg>
);

const BitcoinIcon = () => (
  <svg viewBox="0 0 48 48" className="w-10 h-10">
    <rect fill="#F7931A" width="48" height="48" rx="6"/>
    <path fill="#fff" d="M32.5 21.3c.5-3.2-2-5-5.3-6.1l1.1-4.4-2.6-.7-1.1 4.3c-.7-.2-1.4-.3-2.1-.5l1.1-4.3-2.6-.7-1.1 4.4c-.6-.1-1.1-.3-1.7-.4l-3.6-.9-.7 2.8s2 .5 1.9.5c1.1.3 1.3 1 1.2 1.5l-1.3 5.1c.1 0 .2 0 .3.1h-.3l-1.8 7.1c-.1.4-.5.9-1.2.7 0 0-1.9-.5-1.9-.5L10 32l3.4.8c.6.2 1.3.3 1.9.5l-1.1 4.5 2.6.6 1.1-4.4c.7.2 1.4.4 2.1.5l-1.1 4.4 2.6.6 1.1-4.5c4.6.9 8.1.5 9.5-3.6 1.2-3.3-.1-5.2-2.4-6.5 1.7-.4 3-1.5 3.4-3.9zm-6.1 8.5c-.8 3.4-6.5 1.6-8.4 1.1l1.5-6c1.8.5 7.8 1.4 6.9 4.9zm.9-8.6c-.8 3.1-5.5 1.5-7 1.1l1.4-5.4c1.5.4 6.5 1.1 5.6 4.3z"/>
  </svg>
);

const EthereumIcon = () => (
  <svg viewBox="0 0 48 48" className="w-10 h-10">
    <rect fill="#627EEA" width="48" height="48" rx="6"/>
    <path fill="#fff" fillOpacity=".6" d="M24 6l-10 16.5L24 28l10-5.5z"/>
    <path fill="#fff" d="M24 6v22l10-5.5z"/>
    <path fill="#fff" fillOpacity=".6" d="M24 30.5l-10-6L24 42l10-17.5z"/>
    <path fill="#fff" d="M24 30.5V42l10-17.5z"/>
  </svg>
);

const TetherIcon = () => (
  <svg viewBox="0 0 48 48" className="w-10 h-10">
    <rect fill="#50AF95" width="48" height="48" rx="6"/>
    <path fill="#fff" d="M27.2 24.3v-.1c-.1 0-1.5-.1-4.2-.1-2.1 0-3.8.1-4.2.1v.1c-5.3.3-9.3 1.3-9.3 2.4 0 1.2 4 2.1 9.3 2.4v7.6h8.4v-7.6c5.3-.3 9.3-1.3 9.3-2.4 0-1.1-4-2.1-9.3-2.4zm-4.2 3.7c-5.4 0-9.8-.7-9.8-1.5s4.4-1.5 9.8-1.5 9.8.7 9.8 1.5-4.4 1.5-9.8 1.5z"/>
    <path fill="#fff" d="M27.2 19.6v-4.9h6v-3.4H14.8v3.4h6v4.9c-6.2.3-10.8 1.6-10.8 3.1 0 .2 0 .3.1.5h.1c.8 1.2 5 2.1 10.6 2.4v-1c-4.8-.2-8.5-1-9.3-1.9h0c.8-.9 4.5-1.7 9.3-1.9v1.2c.8 0 1.5.1 2.2.1s1.4 0 2.2-.1v-1.2c4.8.2 8.5 1 9.3 1.9-.8.9-4.5 1.7-9.3 1.9v1c5.6-.3 9.8-1.2 10.6-2.4h.1c0-.2.1-.3.1-.5 0-1.5-4.6-2.8-10.8-3.1z"/>
  </svg>
);

const UsdcIcon = () => (
  <svg viewBox="0 0 48 48" className="w-10 h-10">
    <rect fill="#2775CA" width="48" height="48" rx="6"/>
    <path fill="#fff" d="M24 42c-9.9 0-18-8.1-18-18S14.1 6 24 6s18 8.1 18 18-8.1 18-18 18zm0-33c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15z"/>
    <path fill="#fff" d="M26.3 27.9c0-2.1-1.3-2.8-3.8-3.1-1.8-.3-2.2-.6-2.2-1.3s.6-1.1 1.7-1.1c1 0 1.6.4 1.8 1.2h2.3c-.3-1.8-1.5-2.8-3.3-3.1v-1.8h-2v1.8c-1.9.3-3.1 1.5-3.1 3.1 0 2 1.2 2.7 3.7 3 1.9.3 2.3.7 2.3 1.4 0 .8-.7 1.3-1.9 1.3-1.3 0-1.9-.5-2.1-1.4h-2.3c.2 1.9 1.5 3 3.4 3.3v1.8h2v-1.8c2-.3 3.3-1.5 3.3-3.3z"/>
  </svg>
);

const LitecoinIcon = () => (
  <svg viewBox="0 0 48 48" className="w-10 h-10">
    <rect fill="#345D9D" width="48" height="48" rx="6"/>
    <path fill="#fff" d="M24 8c-8.8 0-16 7.2-16 16s7.2 16 16 16 16-7.2 16-16S32.8 8 24 8zm2 25h-9l1-4-3 1 .7-3 3-1 3-12h4l-2 9 3-1-.7 3-3 1-1.5 6h7l-.5 1z"/>
  </svg>
);

const EurIcon = () => (
  <svg viewBox="0 0 48 48" className="w-10 h-10">
    <rect fill="#003399" width="48" height="48" rx="6"/>
    <text x="24" y="32" textAnchor="middle" fill="#FFCC00" fontSize="24" fontWeight="bold">€</text>
  </svg>
);

const UsdIcon = () => (
  <svg viewBox="0 0 48 48" className="w-10 h-10">
    <rect fill="#2E7D32" width="48" height="48" rx="6"/>
    <text x="24" y="32" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="bold">$</text>
  </svg>
);

const ChfIcon = () => (
  <svg viewBox="0 0 48 48" className="w-10 h-10">
    <rect fill="#D52B1E" width="48" height="48" rx="6"/>
    <path fill="#fff" d="M20 14h8v20h-8z"/>
    <path fill="#fff" d="M14 20h20v8H14z"/>
  </svg>
);

const GbpIcon = () => (
  <svg viewBox="0 0 48 48" className="w-10 h-10">
    <rect fill="#012169" width="48" height="48" rx="6"/>
    <text x="24" y="32" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="bold">£</text>
  </svg>
);

const paymentIcons: Record<string, React.FC> = {
  'Visa': VisaIcon,
  'Mastercard': MastercardIcon,
  'SEPA Transfer': SepaIcon,
  'SWIFT Transfer': SwiftIcon,
  'Bitcoin (BTC)': BitcoinIcon,
  'Ethereum (ETH)': EthereumIcon,
  'USDT (TRC20)': TetherIcon,
  'USDT (ERC20)': TetherIcon,
  'USDC': UsdcIcon,
  'Litecoin (LTC)': LitecoinIcon,
  'EUR Cash': EurIcon,
  'USD Cash': UsdIcon,
  'CHF Cash': ChfIcon,
  'GBP Cash': GbpIcon,
};

const cashMethods = [
  { name: 'EUR Cash', available: true, popular: true },
  { name: 'USD Cash', available: true, popular: true },
  { name: 'CHF Cash', available: true, popular: false },
  { name: 'GBP Cash', available: true, popular: false },
];

const cardMethods = [
  { name: 'Visa', available: true, popular: true },
  { name: 'Mastercard', available: true, popular: true },
  { name: 'SEPA Transfer', available: true, popular: true },
  { name: 'SWIFT Transfer', available: true, popular: false },
];

const cryptoMethods = [
  { name: 'Bitcoin (BTC)', available: true, popular: true },
  { name: 'Ethereum (ETH)', available: true, popular: true },
  { name: 'USDT (TRC20)', available: true, popular: true },
  { name: 'USDT (ERC20)', available: true, popular: false },
  { name: 'USDC', available: true, popular: false },
  { name: 'Litecoin (LTC)', available: true, popular: false },
];

interface PaymentCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  methods: Array<{ name: string; available: boolean; popular: boolean }>;
  gradientFrom: string;
  gradientTo: string;
  hoverBorder: string;
  t: typeof translations['en'];
}

function PaymentCard({ title, description, icon, methods, gradientFrom, gradientTo, hoverBorder, t }: PaymentCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 transition-all duration-500 card-hover ${hoverBorder}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`w-14 h-14 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 text-sm mb-6">{description}</p>
      <div className="space-y-3">
        {methods.map((method, index) => {
          const IconComponent = paymentIcons[method.name];
          return (
            <div
              key={method.name}
              className={`flex items-center justify-between p-3 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-all duration-300 cursor-pointer group ${isHovered ? 'animate-slideInFromRight' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center space-x-3">
                {IconComponent && <IconComponent />}
                <span className="text-white font-medium">{method.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                {method.popular && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full font-medium">
                    {t.popular}
                  </span>
                )}
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PaymentMethodsSection({ lang }: PaymentMethodsSectionProps) {
  const t = translations[lang];

  return (
    <section className="py-16" id="payment-methods">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {t.title}
          </span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">{t.subtitle}</p>
      </div>

      {/* Features banner */}
      <div className="flex flex-wrap justify-center gap-6 mb-12">
        <div className="flex items-center space-x-2 text-slate-300">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span>{t.securePayments}</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-300">
          <Zap className="w-5 h-5 text-cyan-400" />
          <span>{t.instantProcessing}</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-300">
          <CheckCircle className="w-5 h-5 text-blue-400" />
          <span>{t.noHiddenFees}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <PaymentCard
          title={t.cashTitle}
          description={t.cashDesc}
          icon={<Banknote className="w-7 h-7 text-emerald-400" />}
          methods={cashMethods}
          gradientFrom="from-emerald-500/20"
          gradientTo="to-emerald-600/20"
          hoverBorder="hover:border-emerald-500/50"
          t={t}
        />
        <PaymentCard
          title={t.cardTitle}
          description={t.cardDesc}
          icon={<CreditCard className="w-7 h-7 text-cyan-400" />}
          methods={cardMethods}
          gradientFrom="from-cyan-500/20"
          gradientTo="to-cyan-600/20"
          hoverBorder="hover:border-cyan-500/50"
          t={t}
        />
        <PaymentCard
          title={t.cryptoTitle}
          description={t.cryptoDesc}
          icon={<Wallet className="w-7 h-7 text-blue-400" />}
          methods={cryptoMethods}
          gradientFrom="from-blue-500/20"
          gradientTo="to-blue-600/20"
          hoverBorder="hover:border-blue-500/50"
          t={t}
        />
      </div>
    </section>
  );
}

export default PaymentMethodsSection;
