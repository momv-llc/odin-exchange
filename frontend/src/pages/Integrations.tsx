import { Plug, Webhook, Code, BarChart3, ShieldCheck, Sparkles } from 'lucide-react';
import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';
import { Language } from '../translations';

interface IntegrationsProps {
  currentLang: Language;
  setCurrentLang: (lang: Language) => void;
}

const integrations = [
  {
    title: 'Unified API',
    description: 'REST + WebSocket endpoints with predictable schemas for faster onboarding.',
    icon: Code,
  },
  {
    title: 'Real-time Webhooks',
    description: 'Instant callbacks for payment confirmations, AML checks, and exchange status changes.',
    icon: Webhook,
  },
  {
    title: 'White-label Widgets',
    description: 'Drop-in exchange and rate widgets that match your brand colors.',
    icon: Plug,
  },
  {
    title: 'Analytics Events',
    description: 'Track conversion funnels and payout success metrics directly from the dashboard.',
    icon: BarChart3,
  },
  {
    title: 'Security Toolkit',
    description: 'Signed payloads, IP allowlists, and role-based access controls.',
    icon: ShieldCheck,
  },
  {
    title: 'Partner Sandbox',
    description: 'Simulate flows with mock liquidity, KYC, and settlement steps.',
    icon: Sparkles,
  },
];

export function Integrations({ currentLang, setCurrentLang }: IntegrationsProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar currentLang={currentLang} setCurrentLang={setCurrentLang} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="text-center mb-12">
          <p className="text-emerald-400 font-semibold uppercase tracking-wide">Integrations</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-2">Connect Odin Exchange to your product stack</h1>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
            Everything you need to embed exchange flows, automate payouts, and monitor performance with confidence.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map(({ title, description, icon: Icon }) => (
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
          <h2 className="text-2xl font-semibold mb-3">Launch checklist</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-400" />
              Generate sandbox API keys and configure callback endpoints.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-400" />
              Review compliance flows and enable risk checks for your region.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-400" />
              Embed widgets or build a custom checkout using the SDKs.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-400" />
              Go live with production credentials and monitor analytics.
            </li>
          </ul>
        </div>
      </main>
      <Footer currentLang={currentLang} />
    </div>
  );
}
