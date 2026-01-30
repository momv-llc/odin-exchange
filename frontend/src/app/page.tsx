import { ExchangeForm } from '@/components/exchange/exchange-form';
import { RatesDisplay } from '@/components/exchange/rates-display';
import { Header } from '@/components/layout/header';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Exchange Crypto Instantly
            </h1>
            <p className="text-gray-400 text-lg">
              Fast, secure, and reliable cryptocurrency exchange
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
            <RatesDisplay />
            <ExchangeForm />
          </div>
        </div>
      </main>
    </div>
  );
}
