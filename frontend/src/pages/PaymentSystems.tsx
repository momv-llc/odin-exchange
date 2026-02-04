import { Banknote, CreditCard, Globe, Landmark, ShieldCheck, Smartphone } from 'lucide-react';
import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';
import { Language } from '../translations';

interface PaymentSystemsProps {
  currentLang: Language;
  setCurrentLang: (lang: Language) => void;
}

const paymentSystems = [
  {
    title: 'Card Networks',
    description: 'Visa, Mastercard, and regional cards with smart routing for higher approval rates.',
    icon: CreditCard,
  },
  {
    title: 'Bank Transfers',
    description: 'SEPA, SWIFT, and local rails with automated reference tracking.',
    icon: Landmark,
  },
  {
    title: 'Instant Payouts',
    description: 'Near real-time disbursements to wallets and external payment providers.',
    icon: Smartphone,
  },
  {
    title: 'Stablecoin Settlement',
    description: 'USDT, USDC, and other stablecoins with flexible treasury controls.',
    icon: Banknote,
  },
  {
    title: 'Global Coverage',
    description: 'Multi-currency settlement with transparent FX spreads.',
    icon: Globe,
  },
  {
    title: 'Risk Controls',
    description: '3DS, velocity rules, and compliance monitoring baked in.',
    icon: ShieldCheck,
  },
];

export function PaymentSystems({ currentLang, setCurrentLang }: PaymentSystemsProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar currentLang={currentLang} setCurrentLang={setCurrentLang} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="text-center mb-12">
          <p className="text-emerald-400 font-semibold uppercase tracking-wide">Payment Systems</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-2">Flexible rails for every payout scenario</h1>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
            Combine fiat, crypto, and local payment methods to deliver the fastest settlements for your users.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paymentSystems.map(({ title, description, icon: Icon }) => (
            <div key={title} className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-slate-400">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-8">
          <h2 className="text-2xl font-semibold mb-3">Settlement workflow</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-300">
            <div>
              <p className="text-emerald-400 font-semibold">01. Configure</p>
              <p className="mt-2">Select rails, assign limits, and define fallback routes.</p>
            </div>
            <div>
              <p className="text-emerald-400 font-semibold">02. Orchestrate</p>
              <p className="mt-2">Route each transfer via the fastest compliant option.</p>
            </div>
            <div>
              <p className="text-emerald-400 font-semibold">03. Reconcile</p>
              <p className="mt-2">Sync ledger data with automated confirmations and alerts.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer currentLang={currentLang} />
    </div>
  );
}
