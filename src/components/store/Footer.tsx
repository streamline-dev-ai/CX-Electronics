import { Link } from 'react-router-dom'
import { Zap, MapPin, Phone, Mail } from 'lucide-react'
import { useLang } from '../../context/LangContext'

export function Footer() {
  const { lang, setLang, t } = useLang()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-cxx-navy text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-cxx-blue rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">C&X Electronics</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Wholesale & retail electronics importer. Chargers, cables, CCTV, routers and more.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-sm mb-3 text-white/80">Quick Links</h3>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link to="/" className="hover:text-white transition-colors">{t('home')}</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">{t('shop')}</Link></li>
              <li><Link to="/bulk" className="hover:text-white transition-colors">{t('bulk')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm mb-3 text-white/80">{t('contactUs')}</h3>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-cxx-blue" />
                {t('address_store')}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0 text-cxx-blue" />
                <span>+27 XXX XXX XXXX</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0 text-cxx-blue" />
                <span>info@cxxelectronics.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © {year} C&X Electronics. {t('allRightsReserved')}
          </p>

          {/* Language toggle */}
          <div className="flex items-center gap-1 bg-white/10 rounded-lg overflow-hidden text-xs">
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 transition-colors ${lang === 'en' ? 'bg-cxx-blue text-white' : 'text-white/60 hover:text-white'}`}
            >
              English
            </button>
            <button
              onClick={() => setLang('zh')}
              className={`px-3 py-1.5 transition-colors ${lang === 'zh' ? 'bg-cxx-blue text-white' : 'text-white/60 hover:text-white'}`}
            >
              中文
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
