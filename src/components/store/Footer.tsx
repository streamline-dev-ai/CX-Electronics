import { Link } from 'react-router-dom'
import {
  Zap, MapPin, Phone, Mail, MessageCircle, Clock,
  CreditCard,
} from 'lucide-react'
import { useLang } from '../../context/LangContext'

export function Footer() {
  const { t } = useLang()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#0a0a0a] text-white border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#DC2626] rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="leading-tight">
                <span className="font-bold text-white text-xl tracking-tight">CXX</span>
                <span className="block text-[10px] text-neutral-500 font-semibold uppercase tracking-[0.18em] -mt-0.5">
                  Electronics
                </span>
              </div>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed mb-5">
              Wholesale &amp; retail electronics importer based at China Mart, Crown Mines, Johannesburg.
              Powering South Africa with quality CCTV, solar, networking &amp; mobile electronics.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://wa.me/27000000000"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 bg-neutral-800 hover:bg-[#DC2626] rounded-lg flex items-center justify-center transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-white uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li><Link to="/" className="hover:text-[#DC2626] transition-colors">{t('home')}</Link></li>
              <li><Link to="/shop" className="hover:text-[#DC2626] transition-colors">{t('shop')}</Link></li>
              <li><Link to="/bulk" className="hover:text-[#DC2626] transition-colors">{t('bulk')}</Link></li>
              <li><Link to="/about" className="hover:text-[#DC2626] transition-colors">About &amp; Contact</Link></li>
              <li><Link to="/terms" className="hover:text-[#DC2626] transition-colors">Terms &amp; Returns Policy</Link></li>
              <li><Link to="/shop?category=chargers" className="hover:text-[#DC2626] transition-colors">Chargers &amp; Cables</Link></li>
              <li><Link to="/shop?category=cctv" className="hover:text-[#DC2626] transition-colors">CCTV &amp; Security</Link></li>
              <li><Link to="/shop?category=solar" className="hover:text-[#DC2626] transition-colors">Solar Lighting</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-white uppercase tracking-wider">
              {t('contactUs')}
            </h3>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#DC2626]" />
                <span>{t('address_store')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 flex-shrink-0 text-[#DC2626]" />
                <a href="tel:+27000000000" className="hover:text-white transition-colors">
                  +27 00 000 0000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 flex-shrink-0 text-[#DC2626]" />
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
                <Mail className="w-4 h-4 flex-shrink-0 text-[#DC2626]" />
                <a href="mailto:info@cxx-electronics.co.za" className="hover:text-white transition-colors">
                  info@cxx-electronics.co.za
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#DC2626]" />
                <span>Mon–Sat: 09:00 – 17:00<br />Sun: Closed</span>
              </li>
            </ul>
          </div>

          {/* Newsletter / Quote CTA */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-white uppercase tracking-wider">
              Wholesale Inquiry
            </h3>
            <p className="text-sm text-neutral-400 mb-4 leading-relaxed">
              Looking for bulk pricing? Get a custom quote from our trade desk.
            </p>
            <Link
              to="/bulk"
              className="inline-flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm w-full"
            >
              <Zap className="w-4 h-4 fill-white" />
              Request a Quote
            </Link>

            <div className="mt-6">
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-2">
                We Accept
              </p>
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-md text-[10px] font-semibold text-neutral-400 tracking-wider">
                  VISA
                </div>
                <div className="px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-md text-[10px] font-semibold text-neutral-400 tracking-wider">
                  MASTERCARD
                </div>
                <div className="px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-md text-[10px] font-semibold text-neutral-400 tracking-wider">
                  EFT
                </div>
                <div className="w-7 h-7 bg-neutral-800 border border-neutral-700 rounded-md flex items-center justify-center">
                  <CreditCard className="w-3.5 h-3.5 text-neutral-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-neutral-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-neutral-500">
            &copy; {year} CXX Electronics. {t('allRightsReserved')}
          </p>
          <p className="text-xs text-neutral-600">
            China Mart, Shop C15, Crown Mines, Johannesburg
          </p>
        </div>
      </div>
    </footer>
  )
}
