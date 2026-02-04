import { Language } from '../../translations';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Shield, AlertTriangle, Search, FileText, Eye, Users, CheckCircle, XCircle } from 'lucide-react';

interface AMLPolicyProps {
  currentLang: Language;
  setCurrentLang: (lang: Language) => void;
}

export function AMLPolicy({ currentLang, setCurrentLang }: AMLPolicyProps) {
  const lastUpdated = 'January 15, 2024';

  const sections = [
    {
      icon: Shield,
      title: '1. AML Program Overview',
      content: [
        'ODIN EXCHANGE maintains a comprehensive Anti-Money Laundering (AML) program designed to detect, prevent, and report money laundering activities.',
        'Our AML program is compliant with the Financial Action Task Force (FATF) recommendations and applicable local regulations.',
        'We are committed to maintaining the highest standards of regulatory compliance and ethical business practices.'
      ]
    },
    {
      icon: Users,
      title: '2. Customer Due Diligence (CDD)',
      content: [
        'We implement robust Customer Due Diligence procedures:',
        '• Basic CDD for transactions under $1,000: Identity verification and basic information collection',
        '• Enhanced CDD for transactions $1,000-$10,000: Additional documentation and source of funds verification',
        '• Enhanced Due Diligence (EDD) for transactions over $10,000: Comprehensive background checks and ongoing monitoring',
        '• All customers must provide valid government-issued identification'
      ]
    },
    {
      icon: Search,
      title: '3. Transaction Monitoring',
      content: [
        'Our automated transaction monitoring system analyzes all exchanges for suspicious patterns:',
        '• Real-time monitoring of all transactions',
        '• Pattern recognition for unusual trading behavior',
        '• Threshold-based alerts for high-value transactions',
        '• Geographic risk assessment',
        '• Cross-border transaction monitoring',
        '• Integration with global AML databases'
      ]
    },
    {
      icon: Eye,
      title: '4. Suspicious Activity Reporting',
      content: [
        'We are committed to identifying and reporting suspicious activities:',
        '• All suspicious transactions are investigated by our compliance team',
        '• Suspicious Activity Reports (SARs) are filed with appropriate authorities',
        '• We cooperate fully with law enforcement investigations',
        '• Whistleblower protection for employees reporting suspicious activities',
        '• Regular training on recognizing suspicious patterns'
      ]
    }
  ];

  const redFlags = [
    'Transactions inconsistent with customer\'s known profile',
    'Large cash deposits followed by immediate cryptocurrency purchases',
    'Multiple small transactions structured to avoid reporting thresholds',
    'Use of multiple accounts by the same individual',
    'Transactions with no apparent business purpose',
    'Frequent transfers to high-risk jurisdictions',
    'Unusual transaction patterns or timing',
    'Reluctance to provide identification or source of funds information'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar currentLang={currentLang} setCurrentLang={setCurrentLang} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              AML/KYC Policy
            </span>
          </h1>
          <p className="text-slate-400 text-lg">
            Our commitment to preventing money laundering and ensuring regulatory compliance
          </p>
          <div className="mt-4 text-sm text-slate-500">
            Last updated: {lastUpdated}
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-400 mt-1" />
            <div>
              <h3 className="font-semibold text-red-400 mb-2">Legal Requirement</h3>
              <p className="text-slate-300 text-sm">
                Compliance with AML regulations is mandatory for all users. Failure to comply may result in account suspension, 
                transaction rejection, or reporting to appropriate authorities.
              </p>
            </div>
          </div>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50">
            <div className="text-2xl font-bold text-emerald-400 mb-1">100%</div>
            <div className="text-sm text-slate-400">Transaction Monitoring Coverage</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50">
            <div className="text-2xl font-bold text-emerald-400 mb-1">24/7</div>
            <div className="text-sm text-slate-400">AML Team Available</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50">
            <div className="text-2xl font-bold text-emerald-400 mb-1">0%</div>
            <div className="text-sm text-slate-400">Tolerance for Non-Compliance</div>
          </div>
        </div>

        {/* AML Sections */}
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

        {/* Contact Information */}
        <div className="mt-12 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
          <h2 className="text-xl font-semibold mb-4">Contact AML Compliance</h2>
          <div className="space-y-2 text-slate-300">
            <p>For AML-related inquiries or to report suspicious activity:</p>
            <p>Email: aml@odinexchange.com</p>
            <p>Hotline: +1 (555) 123-4567 ext. 888</p>
            <p>Secure reporting available 24/7</p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-slate-400 text-sm">
          <p>
            This AML policy is subject to change based on regulatory requirements. 
            Continued use of our services constitutes acceptance of these terms.
          </p>
        </div>
      </main>

      <Footer currentLang={currentLang} />
    </div>
  );
}