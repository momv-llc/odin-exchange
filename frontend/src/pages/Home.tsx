import { useState, useEffect } from 'react';
import { Language } from '../translations';
import { ExchangeWidget } from '../components/ExchangeWidget';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { TrendingUp, Shield, Zap, Users, ArrowRight, Star, ChevronRight, Globe, Clock, Award } from 'lucide-react';

interface Currency {
  symbol: string;
  name: string;
  price: number;
  change: number;
  icon: string;
  volume: string;
}

interface HomeProps {
  currentLang: Language;
  setCurrentLang: (lang: Language) => void;
}

export function Home({ currentLang, setCurrentLang }: HomeProps) {
  const [currencies, setCurrencies] = useState<Currency[]>([
    { symbol: 'BTC', name: 'Bitcoin', price: 43250.50, change: 2.34, icon: '₿', volume: '$28.5B' },
    { symbol: 'ETH', name: 'Ethereum', price: 2280.75, change: -1.23, icon: 'Ξ', volume: '$15.2B' },
    { symbol: 'USDT', name: 'Tether', price: 1.00, change: 0.01, icon: '₮', volume: '$45.8B' },
    { symbol: 'BNB', name: 'BNB', price: 312.45, change: 0.87, icon: '⬡', volume: '$1.2B' },
    { symbol: 'SOL', name: 'Solana', price: 98.65, change: 5.43, icon: '◎', volume: '$2.8B' },
    { symbol: 'XRP', name: 'XRP', price: 0.62, change: -0.54, icon: '✕', volume: '$1.5B' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrencies((prev) =>
        prev.map((currency) => ({
          ...currency,
          price: currency.price * (1 + (Math.random() - 0.5) * 0.002),
          change: currency.change + (Math.random() - 0.5) * 0.1,
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleExchangeComplete = (transaction: any) => {
    console.log('Transaction completed:', transaction);
    // Handle transaction completion
  };

  const stats = [
    { label: '24h Volume', value: '$125.8M', change: '+12.5%' },
    { label: 'Active Users', value: '45.2K', change: '+8.3%' },
    { label: 'Exchanges Today', value: '8,234', change: '+15.7%' },
    { label: 'Countries', value: '180+', change: '+2' },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your funds are protected with multi-signature wallets and cold storage',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Most exchanges complete in under 5 minutes with our optimized infrastructure',
    },
    {
      icon: TrendingUp,
      title: 'Best Rates',
      description: 'We aggregate rates from multiple exchanges to give you the best deal',
    },
    {
      icon: Users,
      title: '24/7 Support',
      description: 'Our expert team is always here to help you with any questions',
    },
  ];

  const howItWorks = [
    { step: 1, title: 'Select Currencies', description: 'Choose the cryptocurrencies you want to exchange' },
    { step: 2, title: 'Enter Amount', description: 'Specify how much you want to exchange' },
    { step: 3, title: 'Provide Wallet', description: 'Enter your receiving wallet address' },
    { step: 4, title: 'Complete Exchange', description: 'Confirm and receive your crypto instantly' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar currentLang={currentLang} setCurrentLang={setCurrentLang} />
      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  ODIN EXCHANGE
                </span>
              </h1>
              <p className="text-xl text-slate-400 mb-8 max-w-3xl mx-auto">
                The most trusted cryptocurrency exchange platform. Instant, secure, and reliable exchanges with the best rates.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/25">
                  Start Exchanging
                </button>
                <button className="px-8 py-4 bg-slate-700/50 rounded-xl font-semibold text-lg hover:bg-slate-600/50 transition-colors border border-slate-600/50">
                  Learn More
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {stats.map((stat, index) => (
                <div key={index} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-400 mb-2">{stat.label}</div>
                  <div className="text-sm text-emerald-400">{stat.change}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Exchange Widget */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Instant Exchange</h2>
              <p className="text-slate-400 text-lg">Exchange cryptocurrencies in seconds with our intuitive interface</p>
            </div>
            <ExchangeWidget currentLang={currentLang} onExchangeComplete={handleExchangeComplete} />
          </div>
        </section>

        {/* Live Markets */}
        <section className="py-16 bg-slate-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-2">Live Markets</h2>
                <p className="text-slate-400">Real-time prices and market data</p>
              </div>
              <button className="flex items-center space-x-2 px-6 py-3 bg-slate-700/50 rounded-xl hover:bg-slate-600/50 transition-colors">
                <span>View All Markets</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/30">
                    <tr>
                      <th className="text-left py-4 px-6 text-slate-400 font-medium">Asset</th>
                      <th className="text-right py-4 px-6 text-slate-400 font-medium">Price</th>
                      <th className="text-right py-4 px-6 text-slate-400 font-medium">24h Change</th>
                      <th className="text-right py-4 px-6 text-slate-400 font-medium">Volume</th>
                      <th className="text-right py-4 px-6 text-slate-400 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {currencies.map((currency) => (
                      <tr key={currency.symbol} className="hover:bg-slate-700/30 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-lg">
                              {currency.icon}
                            </div>
                            <div>
                              <div className="font-semibold">{currency.symbol}</div>
                              <div className="text-sm text-slate-400">{currency.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right font-mono">
                          ${currency.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              currency.change >= 0
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-red-500/10 text-red-400'
                            }`}
                          >
                            {currency.change >= 0 ? '+' : ''}
                            {currency.change.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right text-slate-400">
                          {currency.volume}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition-colors opacity-0 group-hover:opacity-100">
                            Trade
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose ODIN EXCHANGE</h2>
              <p className="text-slate-400 text-lg">Experience the difference with our industry-leading features</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/50 transition-colors">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-slate-400 text-sm">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-slate-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-slate-400 text-lg">Get started in just 4 simple steps</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {howItWorks.map((step) => (
                <div key={step.step} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Millions</h2>
              <p className="text-slate-400 text-lg">Join our growing community of satisfied users</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-2">10M+</div>
                <div className="text-slate-400 text-sm">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-2">$50B+</div>
                <div className="text-slate-400 text-sm">Total Volume</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-2">99.9%</div>
                <div className="text-slate-400 text-sm">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-2">24/7</div>
                <div className="text-slate-400 text-sm">Support</div>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-8">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-slate-400">4.9/5 Rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span className="text-slate-400">Fully Licensed</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <span className="text-slate-400">Award Winning</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer currentLang={currentLang} />
    </div>
  );
}