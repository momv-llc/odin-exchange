import { cn } from '../utils/cn';

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
  },
};

const cashMethods = [
  { name: 'EUR Cash', icon: '💶', available: true, popular: true },
  { name: 'USD Cash', icon: '💵', available: true, popular: true },
  { name: 'CHF Cash', icon: '🇨🇭', available: true, popular: false },
  { name: 'GBP Cash', icon: '💷', available: true, popular: false },
];

const cardMethods = [
  { name: 'Visa', icon: '💳', available: true, popular: true },
  { name: 'Mastercard', icon: '💳', available: true, popular: true },
  { name: 'SEPA Transfer', icon: '🏦', available: true, popular: true },
  { name: 'SWIFT Transfer', icon: '🌐', available: true, popular: false },
];

const cryptoMethods = [
  { name: 'Bitcoin (BTC)', icon: '₿', available: true, popular: true },
  { name: 'Ethereum (ETH)', icon: 'Ξ', available: true, popular: true },
  { name: 'USDT (TRC20)', icon: '₮', available: true, popular: true },
  { name: 'USDT (ERC20)', icon: '₮', available: true, popular: false },
  { name: 'USDC', icon: '$', available: true, popular: false },
  { name: 'Litecoin (LTC)', icon: 'Ł', available: true, popular: false },
];

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cash Exchange */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 hover:border-emerald-500/30 transition-all">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-3xl">💵</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">{t.cashTitle}</h3>
          <p className="text-slate-400 text-sm mb-6">{t.cashDesc}</p>
          <div className="space-y-3">
            {cashMethods.map((method) => (
              <div
                key={method.name}
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{method.icon}</span>
                  <span className="text-white">{method.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {method.popular && (
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                      {t.popular}
                    </span>
                  )}
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card Payment */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 hover:border-cyan-500/30 transition-all">
          <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-3xl">💳</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">{t.cardTitle}</h3>
          <p className="text-slate-400 text-sm mb-6">{t.cardDesc}</p>
          <div className="space-y-3">
            {cardMethods.map((method) => (
              <div
                key={method.name}
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{method.icon}</span>
                  <span className="text-white">{method.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {method.popular && (
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                      {t.popular}
                    </span>
                  )}
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Crypto Wallets */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 hover:border-blue-500/30 transition-all">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-3xl">₿</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">{t.cryptoTitle}</h3>
          <p className="text-slate-400 text-sm mb-6">{t.cryptoDesc}</p>
          <div className="space-y-3">
            {cryptoMethods.map((method) => (
              <div
                key={method.name}
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{method.icon}</span>
                  <span className="text-white">{method.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {method.popular && (
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                      {t.popular}
                    </span>
                  )}
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default PaymentMethodsSection;
