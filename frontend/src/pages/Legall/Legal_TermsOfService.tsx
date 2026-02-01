import { Language } from '../../translations';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Shield, AlertTriangle, Scale, FileText } from 'lucide-react';

interface TermsOfServiceProps {
  currentLang: Language;
  setCurrentLang: (lang: Language) => void;
}

export function TermsOfService({ currentLang, setCurrentLang }: TermsOfServiceProps) {
  const lastUpdated = 'January 15, 2024';

  const sections = [
    {
      icon: FileText,
      title: '1. Acceptance of Terms',
      content: [
        'By accessing and using ODIN EXCHANGE, you agree to be bound by these Terms of Service and all applicable laws and regulations.',
        'If you do not agree with any of these terms, you are prohibited from using or accessing this site.',
        'The materials contained in this website are protected by applicable copyright and trademark law.'
      ]
    },
    {
      icon: Shield,
      title: '2. Use License',
      content: [
        'Permission is granted to temporarily download one copy of the materials on ODIN EXCHANGE for personal, non-commercial transitory viewing only.',
        'This is the grant of a license, not a transfer of title, and under this license you may not:',
        '• modify or copy the materials',
        '• use the materials for any commercial purpose or for any public display',
        '• attempt to reverse engineer any software contained on the website',
        '• remove any copyright or other proprietary notations from the materials'
      ]
    },
    {
      icon: AlertTriangle,
      title: '3. Disclaimer',
      content: [
        'The materials on ODIN EXCHANGE are provided on an "as is" basis. ODIN EXCHANGE makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.',
        'Further, ODIN EXCHANGE does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.'
      ]
    },
    {
      icon: Scale,
      title: '4. Limitations',
      content: [
        'In no event shall ODIN EXCHANGE or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ODIN EXCHANGE, even if ODIN EXCHANGE or an authorized representative has been notified orally or in writing of the possibility of such damage.',
        'Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.'
      ]
    },
    {
      icon: FileText,
      title: '5. Accuracy of Materials',
      content: [
        'The materials appearing on ODIN EXCHANGE could include technical, typographical, or photographic errors. ODIN EXCHANGE does not warrant that any of the materials on its website are accurate, complete, or current.',
        'ODIN EXCHANGE may make changes to the materials contained on its website at any time without notice. However ODIN EXCHANGE does not make any commitment to update the materials.'
      ]
    },
    {
      icon: Shield,
      title: '6. Cryptocurrency Exchange Terms',
      content: [
        'By using our cryptocurrency exchange services, you acknowledge and agree that:',
        '• Cryptocurrency trading involves substantial risk of loss and is not suitable for all investors',
        '• You are solely responsible for the security of your wallet addresses and private keys',
        '• All transactions are irreversible once confirmed on the blockchain',
        '• You must comply with all applicable laws and regulations in your jurisdiction',
        '• We reserve the right to refuse or cancel any exchange at our discretion',
        '• Exchange rates and fees are subject to change without notice'
      ]
    },
    {
      icon: AlertTriangle,
      title: '7. Anti-Money Laundering (AML)',
      content: [
        'ODIN EXCHANGE is committed to preventing money laundering and terrorist financing. As such, we:',
        '• Require identity verification for transactions exceeding certain thresholds',
        '• Monitor transactions for suspicious activity',
        '• Report suspicious transactions to relevant authorities',
        '• Reserve the right to freeze accounts and transactions under investigation',
        '• Comply with all applicable AML/CTF regulations'
      ]
    },
    {
      icon: Scale,
      title: '8. Privacy Policy',
      content: [
        'Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our services.',
        'By using ODIN EXCHANGE, you consent to the collection and use of information as described in our Privacy Policy.'
      ]
    },
    {
      icon: FileText,
      title: '9. Termination',
      content: [
        'We may terminate or suspend your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.',
        'Upon termination, your right to use the service will cease immediately.'
      ]
    },
    {
      icon: Shield,
      title: '10. Governing Law',
      content: [
        'These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which ODIN EXCHANGE operates, without regard to its conflict of law provisions.',
        'Any disputes arising from these terms will be resolved through arbitration in accordance with the rules of the relevant arbitration association.'
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
              Terms of Service
            </span>
          </h1>
          <p className="text-slate-400 text-lg">
            Please read these terms carefully before using ODIN EXCHANGE
          </p>
          <div className="mt-4 text-sm text-slate-500">
            Last updated: {lastUpdated}
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-emerald-400 mt-1" />
            <div>
              <h3 className="font-semibold text-emerald-400 mb-2">Important Notice</h3>
              <p className="text-slate-300 text-sm">
                By using ODIN EXCHANGE services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our services.
              </p>
            </div>
          </div>
        </div>

        {/* Terms Sections */}
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
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="space-y-2 text-slate-300">
            <p>If you have any questions about these Terms of Service, please contact us:</p>
            <p>Email: legal@odinexchange.com</p>
            <p>Phone: +1 (555) 123-4567</p>
            <p>Address: 123 Crypto Street, Blockchain City, BC 12345</p>
          </div>
        </div>

        {/* Agreement Confirmation */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            By continuing to use our services, you confirm that you have read and agreed to these terms.
          </p>
        </div>
      </main>

      <Footer currentLang={currentLang} />
    </div>
  );
}