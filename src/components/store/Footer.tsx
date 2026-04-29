import { Link } from 'react-router-dom'
import {
  Zap, MapPin, Phone, Mail, MessageCircle, Clock,
  Facebook, Instagram, CreditCard,
} from 'lucide-react'
import { useLang } from '../../context/LangContext'

export function Footer() {
  const { lang, setLang, t } = useLang()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#111827] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#E63939] rounded-lg flex items-center justify-center shadow-md shadow-[#E63939]/30">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="leading-tight">
                <span className="font-extrabold text-white text-xl tracking-tight">CXX</span>
                <span className="block text-[10px] text-white/50 font-bold uppercase tracking-[0.18em] -mt-0.5">
                  Electronics
                </span>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-5">
              Wholesale &amp; retail electronics importer based in Dragon City, Fordsburg JHB.
              Powering South Africa since 2022.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://wa.me/27000000000"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 bg-white/5 hover:bg-[#E63939] rounded-lg flex items-center justify-center transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 bg-white/5 hover:bg-[#E63939] rounded-lg flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-9 h-9 bg-white/5 hover:bg-[#E63939] rounded-lg flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-white uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><Link to="/" className="hover:text-[#E63939] transition-colors">{t('home')}</Link></li>
              <li><Link to="/shop" className="hover:text-[#E63939] transition-colors">{t('shop')}</Link></li>
              <li><Link to="/bulk" className="hover:text-[#E63939] transition-colors">{t('bulk')}</Link></li>
              <li><Link to="/about" className="hover:text-[#E63939] transition-colors">About &amp; Contact</Link></li>
              <li><Link to="/shop?category=chargers" className="hover:text-[#E63939] transition-colors">Chargers &amp; Cables</Link></li>
              <li><Link to="/shop?category=cctv" className="hover:text-[#E63939] transition-colors">CCTV &amp; Security</Link></li>
              <li><Link to="/shop?category=solar" className="hover:text-[#E63939] transition-colors">Solar Lighting</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-white uppercase tracking-wider">
              {t('contactUs')}
            </h3>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#E63939]" />
                <span>{t('address_store')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 flex-shrink-0 text-[#E63939]" />
                <a href="tel:+27000000000" className="hover:text-white transition-colors">
                  +27 00 000 0000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 flex-shrink-0 text-[#E63939]" />
                <a
                  href="https://wa.me/27000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp Chat
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 flex-shrink-0 text-[#E63939]" />
                <a href="mailto:info@cxxelectronics.co.za" className="hover:text-white transition-colors">
                  info@cxxelectronics.co.za
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#E63939]" />
                <span>Mon–Sat: 09:00 – 17:00<br />Sun: Closed</span>
              </li>
            </ul>
          </div>

          {/* Newsletter / Quote CTA */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-white uppercase tracking-wider">
              Wholesale Inquiry
            </h3>
            <p className="text-sm text-white/60 mb-4 leading-relaxed">
              Looking for bulk pricing? Get a custom quote from our trade desk.
            </p>
            <Link
              to="/bulk"
              className="inline-flex items-center justify-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold px-5 py-2.5 rounded-lg transition-colors text-sm w-full"
            >
              <Zap className="w-4 h-4 fill-white" />
              Request a Quote
            </Link>

            <div className="mt-6">
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">
                We Accept
              </p>
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-md text-[10px] font-bold text-white/70 tracking-wider">
                  VISA
                </div>
                <div className="px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-md text-[10px] font-bold text-white/70 tracking-wider">
                  MASTERCARD
                </div>
                <div className="px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-md text-[10px] font-bold text-white/70 tracking-wider">
                  EFT
                </div>
                <div className="w-7 h-7 bg-white/5 border border-white/10 rounded-md flex items-center justify-center">
                  <CreditCard className="w-3.5 h-3.5 text-white/70" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © {year} CXX Electronics. {t('allRightsReserved')}
          </p>

          <div className="flex items-center gap-1 border border-white/10 rounded-lg overflow-hidden text-xs">
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 transition-colors ${lang === 'en' ? 'bg-[#E63939] text-white font-semibold' : 'text-white/60 hover:text-white'}`}
            >
              English
            </button>
            <button
              onClick={() => setLang('zh')}
              className={`px-3 py-1.5 transition-colors ${lang === 'zh' ? 'bg-[#E63939] text-white font-semibold' : 'text-white/60 hover:text-white'}`}
            >
              中文
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
