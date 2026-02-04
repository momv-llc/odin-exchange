import { Language } from '../../translations';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Shield, Eye, Database, Lock, UserCheck, FileText } from 'lucide-react';

interface PrivacyPolicyProps {
  currentLang: Language;
  setCurrentLang: (lang: Language) => void;
}

export function PrivacyPolicy({ currentLang, setCurrentLang }: PrivacyPolicyProps) {
  const lastUpdated = 'January 15, 2024';

  const sections = [
    {
      icon: Shield,
      title: '1. Information We Collect',
      content: [
        'We collect several types of information for various purposes to provide and improve our service to you:',
        '• Personal Data: Name, email address, phone number, and other identifying information',
        '• Financial Information: Bank account details, credit/debit card information, cryptocurrency wallet addresses',
        '• Transaction Data: Exchange history, trading patterns, and related financial information',
        '• Technical Data: IP address, browser type, device information, and browsing behavior',
        '• Communication Data: Emails, chat messages, and support communications'
      ]
    },
    {
      icon: Database,
      title: '2. How We Use Your Information',
      content: [
        'ODIN EXCHANGE uses the collected data for various purposes:',
        '• To provide and maintain our cryptocurrency exchange services',
        '• To process and complete your exchange transactions',
        '• To verify your identity and comply with regulatory requirements',
        '• To communicate with you about your account and transactions',
        '• To provide customer support and respond to your inquiries',
        '• To detect and prevent fraudulent activities',
        '• To improve our services and develop new features'
      ]
    },
    {
      icon: Lock,
      title: '3. Data Security',
      content: [
        'We prioritize the security of your personal and financial information:',
        '• All data is encrypted using industry-standard AES-256 encryption',
        '• Sensitive information is stored in secure, offline cold storage',
        '• We implement multi-factor authentication for all internal systems',
        '• Regular security audits and penetration testing',
        '• Compliance with PCI DSS and ISO 27001 standards',
        '• Limited employee access to sensitive data on a need-to-know basis'
      ]
    },
    {
      icon: UserCheck,
      title: '4. KYC and AML Compliance',
      content: [
        'As a regulated cryptocurrency exchange, we are required to implement Know Your Customer (KYC) and Anti-Money Laundering (AML) procedures:',
        '• Identity verification for all users',
        '• Address verification and proof of residence',
        '• Source of funds documentation for large transactions',
        '• Enhanced due diligence for high-risk transactions',
        '• Transaction monitoring and suspicious activity reporting',
        '• Cooperation with law enforcement and regulatory authorities'
      ]
    },
    {
      icon: Eye,
      title: '5. Data Sharing and Disclosure',
      content: [
        'We do not sell, trade, or otherwise transfer your personal information to third parties, except:',
        '• With your explicit consent',
        '• To trusted service providers who assist us in operating our service',
        '• To comply with legal obligations and regulatory requirements',
        '• To protect our rights, property, or safety',
        '• In connection with a business transfer or merger',
        '• To law enforcement agencies as required by law'
      ]
    },
    {
      icon: Database,
      title: '6. Data Retention',
      content: [
        'We retain personal information for as long as necessary to fulfill the purposes outlined in this policy:',
        '• Transaction records are retained for minimum 5 years as required by law',
        '• KYC documents are stored securely for the duration of your account relationship',
        '• Communication logs are retained for 2 years',
        '• Technical data is anonymized after 90 days',
        '• You may request deletion of your data subject to legal and regulatory requirements'
      ]
    },
    {
      icon: Shield,
      title: '7. Your Rights and Choices',
      content: [
        'You have the following rights regarding your personal information:',
        '• Access: Request a copy of your personal data',
        '• Correction: Update or correct inaccurate information',
        '• Deletion: Request removal of your personal data (where permitted)',
        '• Portability: Request transfer of your data to another service',
        '• Restriction: Limit how we use your information',
        '• Objection: Object to processing of your information',
        '• Withdraw consent: Remove consent for data processing'
      ]
    },
    {
      icon: FileText,
      title: '8. Cookies and Tracking',
      content: [
        'We use cookies and similar technologies to enhance your experience:',
        '• Essential cookies for website functionality',
        '• Analytics cookies to understand user behavior',
        '• Security cookies to prevent fraud and abuse',
        '• Preference cookies to remember your settings',
        '• You can control cookie settings through your browser',
        '• Disabling cookies may affect some website features'
      ]
    },
    {
      icon: Shield,
      title: '9. International Data Transfers',
      content: [
        'Your information may be transferred to and processed in countries other than your own:',
        '• We ensure adequate protection for international data transfers',
        '• We use standard contractual clauses and other legal mechanisms',
        '• We comply with applicable data transfer regulations',
        '• Your data is protected regardless of where it is processed'
      ]
    },
    {
      icon: FileText,
      title: '10. Children\'s Privacy',
      content: [
        'Our services are not intended for individuals under the age of 18:',
        '• We do not knowingly collect personal information from children',
        '• If we become aware of collecting data from children, we will delete it',
        '• Parents can contact us regarding their child\'s privacy',
        '• We implement age verification measures where required'
      ]
    },
    {
      icon: Shield,
      title: '11. Changes to This Policy',
      content: [
        'We may update our privacy policy from time to time:',
        '• We will notify you of any changes by email or prominent notice',
        '• Significant changes will require your consent',
        '• Continued use of our services constitutes acceptance of changes',
        '• You can review the history of policy changes in our documentation'
      ]
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
              Privacy Policy
            </span>
          </h1>
          <p className="text-slate-400 text-lg">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
          <div className="mt-4 text-sm text-slate-500">
            Last updated: {lastUpdated}
          </div>
        </div>

        {/* Privacy Commitment */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <Shield className="w-6 h-6 text-emerald-400 mt-1" />
            <div>
              <h3 className="font-semibold text-emerald-400 mb-2">Our Privacy Commitment</h3>
              <p className="text-slate-300 text-sm">
                At ODIN EXCHANGE, we are committed to protecting your privacy and ensuring the security of your personal and financial information. 
                This privacy policy outlines how we collect, use, and safeguard your data.
              </p>
            </div>
          </div>
        </div>

        {/* Key Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-2">
              <Lock className="w-5 h-5 text-emerald-400" />
              <h4 className="font-semibold">Secure Storage</h4>
            </div>
            <p className="text-sm text-slate-400">Your data is protected with military-grade encryption</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="font-semibold">Compliance First</h4>
            </div>
            <p className="text-sm text-slate-400">We comply with all applicable privacy laws and regulations</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-2">
              <Eye className="w-5 h-5 text-emerald-400" />
              <h4 className="font-semibold">Transparency</h4>
            </div>
            <p className="text-sm text-slate-400">Clear information about how we use your data</p>
          </div>
        </div>

        {/* Privacy Sections */}
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
          <h2 className="text-xl font-semibold mb-4">Contact Our Data Protection Officer</h2>
          <div className="space-y-2 text-slate-300">
            <p>If you have questions about this privacy policy or your data rights, please contact our Data Protection Officer:</p>
            <p>Email: privacy@odinexchange.com</p>
            <p>Phone: +1 (555) 123-4567 ext. 999</p>
            <p>Mail: ODIN EXCHANGE, Attn: Data Protection Officer, 123 Crypto Street, Blockchain City, BC 12345</p>
          </div>
        </div>

        {/* Rights Exercise */}
        <div className="mt-8 bg-slate-800/30 rounded-xl p-4">
          <p className="text-slate-400 text-sm text-center">
            To exercise your privacy rights, please email privacy@odinexchange.com with "Privacy Request" in the subject line.
            We will respond to your request within 30 days as required by applicable law.
          </p>
        </div>
      </main>

      <Footer currentLang={currentLang} />
    </div>
  );
}