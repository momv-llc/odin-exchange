import { Activity, BarChart3, Gauge, LineChart, ShieldCheck, Users } from 'lucide-react';
import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';
import { Language } from '../translations';

interface AnalyticsInfoProps {
  currentLang: Language;
  setCurrentLang: (lang: Language) => void;
}

const insights = [
  {
    title: 'Conversion Analytics',
    description: 'Measure quote-to-completion ratios across regions and traffic sources.',
    icon: LineChart,
  },
  {
    title: 'Liquidity Health',
    description: 'Monitor slippage, spread movement, and provider reliability in real time.',
    icon: Activity,
  },
  {
    title: 'User Segments',
    description: 'Understand VIP activity, repeat exchanges, and partner performance.',
    icon: Users,
  },
  {
    title: 'Operational KPIs',
    description: 'Track payout times, compliance checks, and exception handling.',
    icon: Gauge,
  },
  {
    title: 'Risk Insights',
    description: 'Review flagged transactions and audit trails in one view.',
    icon: ShieldCheck,
  },
  {
    title: 'Custom Dashboards',
    description: 'Build tailored views and export reports for stakeholders.',
    icon: BarChart3,
  },
];

export function AnalyticsInfo({ currentLang, setCurrentLang }: AnalyticsInfoProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar currentLang={currentLang} setCurrentLang={setCurrentLang} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="text-center mb-12">
          <p className="text-emerald-400 font-semibold uppercase tracking-wide">Analytics</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-2">Clarity across every exchange flow</h1>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
            Unified reporting keeps product, finance, and compliance teams aligned with actionable insights.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insights.map(({ title, description, icon: Icon }) => (
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
          <h2 className="text-2xl font-semibold mb-3">Daily analytics brief</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-300">
            <div>
              <p className="text-emerald-400 font-semibold">Morning pulse</p>
              <p className="mt-2">Get a snapshot of liquidity, volume, and risk anomalies delivered to Slack.</p>
            </div>
            <div>
              <p className="text-emerald-400 font-semibold">Weekly insights</p>
              <p className="mt-2">Review retention, growth, and partner performance with exportable reports.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer currentLang={currentLang} />
    </div>
  );
}
