import { Link } from 'react-router-dom';
import { Language, translations, TranslationKey } from '../translations';
import { Twitter, Instagram, Facebook, MessageCircle, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  currentLang: Language;
}

export function Footer({ currentLang }: FooterProps) {
  const t = (key: TranslationKey) => translations[currentLang][key];

  return (
    <footer className="border-t border-slate-700/50 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold">Ø</span>
              </div>
              <span className="text-xl font-bold">{t('siteName')}</span>
            </div>
            <p className="text-slate-400 mb-6 max-w-md">
              {t('reliablePlatform')}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3 text-slate-400">
                <Mail className="w-4 h-4" />
                <span>support@odinexchange.com</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-400">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-400">
                <MapPin className="w-4 h-4" />
                <span>123 Crypto Street, Blockchain City</span>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center hover:bg-emerald-500/20 transition-colors">
                <Twitter className="w-5 h-5 text-slate-400" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center hover:bg-emerald-500/20 transition-colors">
                <Instagram className="w-5 h-5 text-slate-400" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center hover:bg-emerald-500/20 transition-colors">
                <Facebook className="w-5 h-5 text-slate-400" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center hover:bg-emerald-500/20 transition-colors">
                <MessageCircle className="w-5 h-5 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold mb-4">{t('products')}</h4>
            <ul className="space-y-3 text-slate-400">
              <li><Link to="/exchange" className="hover:text-emerald-400 transition-colors">{t('exchange')}</Link></li>
              <li><Link to="/markets" className="hover:text-emerald-400 transition-colors">{t('markets')}</Link></li>
              <li><Link to="/wallet" className="hover:text-emerald-400 transition-colors">{t('wallet')}</Link></li>
              <li><Link to="/api" className="hover:text-emerald-400 transition-colors">{t('api')}</Link></li>
              <li><Link to="/integrations" className="hover:text-emerald-400 transition-colors">Integrations</Link></li>
              <li><Link to="/payment-systems" className="hover:text-emerald-400 transition-colors">Payment Systems</Link></li>
              <li><Link to="/analytics" className="hover:text-emerald-400 transition-colors">Analytics</Link></li>
              <li><Link to="/exchange-rates" className="hover:text-emerald-400 transition-colors">Exchange Rates</Link></li>
              <li><Link to="/business" className="hover:text-emerald-400 transition-colors">Business</Link></li>
              <li><Link to="/affiliate" className="hover:text-emerald-400 transition-colors">Affiliate</Link></li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="font-semibold mb-4">{t('support')}</h4>
            <ul className="space-y-3 text-slate-400">
              <li><Link to="/help" className="hover:text-emerald-400 transition-colors">{t('helpCenter')}</Link></li>
              <li><Link to="/fees" className="hover:text-emerald-400 transition-colors">{t('fees')}</Link></li>
              <li><Link to="/api-docs" className="hover:text-emerald-400 transition-colors">{t('apiDocumentation')}</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-400 transition-colors">{t('contactUs')}</Link></li>
              <li><Link to="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/aml" className="hover:text-emerald-400 transition-colors">AML/KYC</Link></li>
              <li><Link to="/risk" className="hover:text-emerald-400 transition-colors">Risk Disclosure</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left text-slate-500 text-sm">
              <p>{t('allRights')}</p>
              <p className="mt-1">Licensed & Regulated Exchange • Financial Security Guaranteed</p>
            </div>
            <div className="flex space-x-6 text-slate-500 text-sm">
              <Link to="/compliance" className="hover:text-emerald-400 transition-colors">Compliance</Link>
              <Link to="/licenses" className="hover:text-emerald-400 transition-colors">Licenses</Link>
              <Link to="/certificates" className="hover:text-emerald-400 transition-colors">Certificates</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
