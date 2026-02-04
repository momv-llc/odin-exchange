import { Language } from '../../translations';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { ArrowLeftRight, Clock, Shield, AlertTriangle, CreditCard, Wallet, FileText, CheckCircle } from 'lucide-react';

interface ExchangeRulesProps {
  currentLang: Language;
  setCurrentLang: (lang: Language) => void;
}

export function ExchangeRules({ currentLang, setCurrentLang }: ExchangeRulesProps) {
  const lastUpdated = 'February 1, 2026';

  const sections = [
    {
      icon: ArrowLeftRight,
      title: '1. General Exchange Rules',
      content: [
        'ODIN EXCHANGE provides cryptocurrency and fiat currency exchange services. By using our services, you agree to the following rules:',
        '• All exchange operations are final and cannot be reversed once confirmed',
        '• Exchange rates are fixed at the moment of order creation and valid for 15 minutes',
        '• Minimum exchange amount: 50 EUR / 50 USD equivalent',
        '• Maximum exchange amount: 50,000 EUR / 50,000 USD equivalent per transaction',
        '• Daily limit: 100,000 EUR / 100,000 USD equivalent (may be increased after verification)',
        '• We reserve the right to adjust limits based on verification level and transaction history'
      ]
    },
    {
      icon: Clock,
      title: '2. Exchange Process and Timing',
      content: [
        'Our standard exchange process:',
        '• Order creation and rate lock: Instant',
        '• Identity verification (if required): 5-30 minutes',
        '• Payment confirmation: Upon receipt of funds',
        '• Cryptocurrency transfer: 10-60 minutes after payment confirmation',
        '• Fiat transfer: 1-3 business days (SEPA) / 3-5 business days (SWIFT)',
        '• Cash exchanges: Immediate upon meeting at our office locations',
        'Note: Blockchain network congestion may affect cryptocurrency transfer times'
      ]
    },
    {
      icon: CreditCard,
      title: '3. Payment Methods',
      content: [
        'We accept the following payment methods:',
        '• Bank Transfer (SEPA, SWIFT)',
        '• Credit/Debit Cards (Visa, Mastercard)',
        '• Cash (at our office locations)',
        '• Cryptocurrency (BTC, ETH, USDT, and other supported coins)',
        'Payment requirements:',
        '• All payments must originate from accounts in your name',
        '• Third-party payments are not accepted',
        '• Card payments may require 3D Secure verification',
        '• Cash payments over 1,000 EUR require identity verification'
      ]
    },
    {
      icon: Wallet,
      title: '4. Cryptocurrency Wallet Requirements',
      content: [
        'When exchanging to cryptocurrency:',
        '• You must provide a valid wallet address for the selected cryptocurrency',
        '• We are not responsible for funds sent to incorrect addresses',
        '• Double-check your wallet address before confirming the exchange',
        '• We do not support exchanges to exchange wallets or custodial services',
        '• Wallet addresses must match the selected network (e.g., ERC20 for ETH)',
        'Important: Sending cryptocurrency to an incorrect address may result in permanent loss of funds'
      ]
    },
    {
      icon: Shield,
      title: '5. Verification Requirements',
      content: [
        'Verification levels and limits:',
        '• Level 1 (Email verification): Up to 500 EUR per transaction',
        '• Level 2 (ID verification): Up to 5,000 EUR per transaction',
        '• Level 3 (Full verification): Up to 50,000 EUR per transaction',
        'Required documents for verification:',
        '• Valid government-issued ID (passport, national ID, or driver\'s license)',
        '• Proof of address (utility bill, bank statement - not older than 3 months)',
        '• Selfie with ID document',
        '• Source of funds declaration (for amounts over 10,000 EUR)'
      ]
    },
    {
      icon: AlertTriangle,
      title: '6. Prohibited Activities',
      content: [
        'The following activities are strictly prohibited:',
        '• Using our services for money laundering or terrorist financing',
        '• Providing false or misleading information',
        '• Using stolen payment methods or funds',
        '• Attempting to manipulate exchange rates or exploit system errors',
        '• Creating multiple accounts to circumvent limits',
        '• Using VPN or other tools to mask your location for fraudulent purposes',
        '• Engaging in arbitrage trading that violates our terms',
        'Violation of these rules may result in account termination and reporting to authorities'
      ]
    },
    {
      icon: FileText,
      title: '7. Order Cancellation and Refunds',
      content: [
        'Order cancellation policy:',
        '• Orders can be cancelled before payment is received',
        '• After payment, cancellation is only possible if we cannot complete the exchange',
        '• Refund processing time: 3-5 business days for bank transfers',
        '• Refund fees may apply depending on the payment method used',
        'Refund conditions:',
        '• Full refund if order cannot be processed due to technical issues',
        '• Partial refund (minus fees) for orders cancelled by the customer',
        '• No refund for completed exchanges'
      ]
    },
    {
      icon: CheckCircle,
      title: '8. Fees and Commissions',
      content: [
        'Our fee structure:',
        '• Exchange spread: 1-3% (included in displayed rate)',
        '• Network fees: Covered by customer for cryptocurrency transfers',
        '• Bank transfer fees: Free for SEPA / 15-30 EUR for SWIFT',
        '• Card payment fees: 2.5% of transaction amount',
        '• Cash exchange fees: Included in rate',
        'Note: Fees may vary based on currency pair, amount, and market conditions'
      ]
    }
  ];

  const faqs = [
    {
      question: 'How long does an exchange take?',
      answer: 'Most cryptocurrency exchanges are completed within 30-60 minutes after payment confirmation. Fiat transfers typically take 1-3 business days for SEPA and 3-5 days for SWIFT.'
    },
    {
      question: 'What happens if I send payment to the wrong account?',
      answer: 'Contact our support immediately. We will try to recover the funds, but we cannot guarantee success and additional fees may apply.'
    },
    {
      question: 'Can I change my wallet address after creating an order?',
      answer: 'Yes, but only before the exchange is processed. Contact support immediately if you need to change your wallet address.'
    },
    {
      question: 'Why was my order cancelled?',
      answer: 'Orders may be cancelled due to payment not received within 15 minutes, verification issues, or suspected fraudulent activity. Contact support for details.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar currentLang={currentLang} setCurrentLang={setCurrentLang} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Exchange Rules
            </span>
          </h1>
          <p className="text-slate-400 text-lg">
            Please read and understand our exchange rules before using ODIN EXCHANGE services
          </p>
          <div className="mt-4 text-sm text-slate-500">
            Last updated: {lastUpdated}
          </div>
        </div>

        {/* Quick Summary */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-emerald-400 mt-1" />
            <div>
              <h3 className="font-semibold text-emerald-400 mb-2">Quick Summary</h3>
              <ul className="text-slate-300 text-sm space-y-1">
                <li>• Minimum exchange: 50 EUR | Maximum: 50,000 EUR</li>
                <li>• Exchange rates locked for 15 minutes</li>
                <li>• Processing time: 30-60 minutes (crypto) | 1-5 days (fiat)</li>
                <li>• Verification required for amounts over 500 EUR</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Exchange Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50 text-center">
            <div className="text-2xl font-bold text-emerald-400 mb-1">50+</div>
            <div className="text-xs text-slate-400">Currency Pairs</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50 text-center">
            <div className="text-2xl font-bold text-emerald-400 mb-1">15 min</div>
            <div className="text-xs text-slate-400">Rate Lock</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50 text-center">
            <div className="text-2xl font-bold text-emerald-400 mb-1">24/7</div>
            <div className="text-xs text-slate-400">Support</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50 text-center">
            <div className="text-2xl font-bold text-emerald-400 mb-1">1-3%</div>
            <div className="text-xs text-slate-400">Spread</div>
          </div>
        </div>

        {/* Rules Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                <div className="p-6 border-b border-slate-700/50 bg-slate-700/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                      <Icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {section.content.map((paragraph, pIndex) => (
                      <p key={pIndex} className="text-slate-300 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQs */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
                <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
                <p className="text-slate-400 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-12 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
          <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
          <div className="space-y-2 text-slate-300">
            <p>If you have questions about our exchange rules or need assistance:</p>
            <p>Email: support@odinexchange.com</p>
            <p>Live Chat: Available 24/7 on our website</p>
            <p>Telegram: @odin_exchange_support</p>
          </div>
        </div>

        {/* Agreement */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            By creating an exchange order, you confirm that you have read and agree to these exchange rules.
          </p>
        </div>
      </main>

      <Footer currentLang={currentLang} />
    </div>
  );
}
