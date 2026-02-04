import { ArrowDownUp, Clock, ShieldCheck, TrendingUp, WalletCards, Zap } from 'lucide-react';
import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';
import { Language } from '../translations';

interface ExchangeRatesInfoProps {
  currentLang: Language;
  setCurrentLang: (lang: Language) => void;
}

const rateHighlights = [
  {
    title: 'Live Aggregation',
    description: 'Quotes pulled from vetted liquidity providers every few seconds.',
    icon: Zap,
  },
  {
    title: 'Transparent Spreads',
    description: 'See margins clearly with no hidden markups or last-minute changes.',
    icon: ArrowDownUp,
  },
  {
    title: 'Predictable Holds',
    description: 'Rates remain locked for the duration of the payment window.',
    icon: Clock,
  },
  {
    title: 'Treasury Controls',
    description: 'Configure buffers and guardrails to balance risk and competitiveness.',
    icon: ShieldCheck,
  },
  {
    title: 'Market Insights',
    description: 'Monitor volatility and react with automated rate alerts.',
    icon: TrendingUp,
  },
  {
    title: 'Multi-asset Coverage',
    description: 'Support fiat, stablecoin, and crypto pairings from one dashboard.',
    icon: WalletCards,
  },
];

export function ExchangeRatesInfo({ currentLang, setCurrentLang }: ExchangeRatesInfoProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar currentLang={currentLang} setCurrentLang={setCurrentLang} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="text-center mb-12">
          <p className="text-emerald-400 font-semibold uppercase tracking-wide">Exchange Rates</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-2">Confident pricing for every transaction</h1>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
            Explore how Odin Exchange sources, protects, and reports rates for your customers and operations teams.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rateHighlights.map(({ title, description, icon: Icon }) => (
            <div key={title} className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-slate-400">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-8">
          <h2 className="text-2xl font-semibold mb-3">Rate lifecycle</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-300">
            <div>
              <p className="text-emerald-400 font-semibold">Quote</p>
              <p className="mt-2">Generate quotes with smart routing and volatility buffers.</p>
            </div>
            <div>
              <p className="text-emerald-400 font-semibold">Lock</p>
              <p className="mt-2">Hold the rate during the payment window to protect users.</p>
            </div>
            <div>
              <p className="text-emerald-400 font-semibold">Settle</p>
              <p className="mt-2">Finalize rates and store audit-ready pricing details.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer currentLang={currentLang} />
    </div>
  );
}
