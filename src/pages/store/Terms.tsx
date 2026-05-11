import { Link } from 'react-router-dom'
import { ArrowLeft, Scale, CreditCard, Truck, RefreshCcw, Package, ShieldCheck, Phone } from 'lucide-react'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import SEO from '../../components/SEO'

const LAST_UPDATED = '1 May 2025'
const EMAIL = 'info@cw-electronics.co.za'
const WA_NUMBER = '27000000000'
const WA_LINK = `https://wa.me/${WA_NUMBER}`

interface Section {
  id: string
  number: string
  title: string
  icon: React.ElementType
}

const SECTIONS: Section[] = [
  { id: 'introduction',   number: '1', title: 'Introduction',             icon: Scale       },
  { id: 'payment',        number: '2', title: 'Pricing & Payment',        icon: CreditCard  },
  { id: 'shipping',       number: '3', title: 'Shipping & Delivery',      icon: Truck       },
  { id: 'returns',        number: '4', title: '7-Day Return Policy',      icon: RefreshCcw  },
  { id: 'wholesale',      number: '5', title: 'Wholesale Terms',          icon: Package     },
  { id: 'privacy',        number: '6', title: 'Privacy & POPIA',          icon: ShieldCheck },
  { id: 'contact',        number: '7', title: 'Contact Us',               icon: Phone       },
]

function SectionHeading({ id, number, title, icon: Icon }: Section) {
  return (
    <div id={id} className="flex items-center gap-3 mb-5 pt-2">
      <div className="w-10 h-10 rounded-xl bg-[#E63939]/10 border border-[#E63939]/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-[#E63939]" />
      </div>
      <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
        <span className="text-[#E63939] mr-1">{number}.</span> {title}
      </h2>
    </div>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-white/70 text-sm leading-relaxed">
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#E63939] flex-shrink-0" />
      <span>{children}</span>
    </li>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-xl border border-[#E63939]/25 bg-[#E63939]/5 px-5 py-4 text-sm text-white/70 leading-relaxed">
      {children}
    </div>
  )
}

export function Terms() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <SEO
        title="Terms & Returns Policy | CW Electronics"
        description="Our terms of service, payment options, 7-day return policy, wholesale terms, and POPIA privacy compliance. CW Electronics, Johannesburg."
        url="https://cw-electronics.co.za/terms"
      />
      <Navbar />

      {/* Page hero */}
      <section className="relative bg-[#0B1120] border-b border-white/5 overflow-hidden">
        {/* Subtle dot pattern */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #E63939 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Red glow */}
        <div aria-hidden className="absolute -top-24 -right-24 w-72 h-72 bg-[#E63939]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <p className="text-[#E63939] text-xs font-bold uppercase tracking-widest mb-3">
            Legal
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 text-balance leading-tight">
            Terms &amp; Conditions
          </h1>
          <p className="text-white/55 text-sm sm:text-base max-w-xl text-pretty">
            Please read these terms carefully before purchasing from CW Electronics. By placing an order
            you agree to the policies outlined below.
          </p>
          <p className="text-white/30 text-xs mt-5 font-medium">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      {/* Table of contents — visible on larger screens as sticky sidebar, inline on mobile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-14 xl:gap-20">

          {/* Sticky sidebar TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">
                Contents
              </p>
              <nav className="space-y-1">
                {SECTIONS.map(({ id, number, title }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/55 hover:text-white hover:bg-white/5 transition-colors group"
                  >
                    <span className="w-5 h-5 rounded-md bg-[#E63939]/10 flex items-center justify-center text-[10px] font-bold text-[#E63939] group-hover:bg-[#E63939] group-hover:text-white transition-colors flex-shrink-0">
                      {number}
                    </span>
                    {title}
                  </a>
                ))}
              </nav>

              <div className="mt-8 p-4 rounded-xl bg-white/3 border border-white/8">
                <p className="text-xs text-white/50 leading-relaxed">
                  Questions about our policies? Chat with us on WhatsApp for a quick response.
                </p>
                <a
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#E63939] hover:text-red-400 transition-colors"
                >
                  Open WhatsApp &rarr;
                </a>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="space-y-14">

            {/* 1. Introduction */}
            <section>
              <SectionHeading {...SECTIONS[0]} />
              <div className="space-y-3 text-sm text-white/70 leading-relaxed">
                <p>
                  Welcome to CW Electronics, a wholesale and retail importer of consumer electronics
                  based at China Mart, Shop C15, 3 Press Avenue, Crown Mines, Johannesburg, 2092.
                </p>
                <p>
                  These Terms &amp; Conditions govern all purchases made through our website
                  (cw-electronics.co.za) and in-store. By completing a purchase you confirm that you
                  have read, understood and agree to these terms in full.
                </p>
                <p>
                  We reserve the right to update these terms at any time. The date of the most recent
                  revision is shown at the top of this page. Continued use of our website after changes
                  are posted constitutes acceptance of the updated terms.
                </p>
              </div>
            </section>

            <hr className="border-white/8" />

            {/* 2. Pricing & Payment */}
            <section>
              <SectionHeading {...SECTIONS[1]} />
              <div className="space-y-3 text-sm text-white/70 leading-relaxed mb-4">
                <p>
                  All prices are displayed in South African Rand (ZAR) and are inclusive of VAT where
                  applicable. Prices are subject to change without prior notice. The price displayed at
                  the time of checkout is the final price charged.
                </p>
              </div>
              <ul className="space-y-3 mb-4">
                <Bullet>
                  We accept payment via <strong className="text-white">PayFast</strong> — South Africa&apos;s leading
                  payment gateway. This includes Visa, Mastercard, Instant EFT, Capitec Pay, SnapScan, and
                  Mobicred.
                </Bullet>
                <Bullet>
                  <strong className="text-white">PayFlex</strong> buy-now-pay-later is available at checkout for
                  qualifying orders, subject to PayFlex&apos;s own approval terms.
                </Bullet>
                <Bullet>
                  Manual EFT is available for wholesale orders. Goods are dispatched only after payment
                  reflects in full.
                </Bullet>
                <Bullet>
                  Orders placed online are only confirmed once payment is successfully processed. You will
                  receive an email confirmation with your order number.
                </Bullet>
                <Bullet>
                  We do not store any card details on our servers. All payment processing is handled
                  securely by PayFast and PayFlex.
                </Bullet>
              </ul>
              <Note>
                <strong className="text-white">Note:</strong> CW Electronics is not responsible for
                any fees charged by your bank or payment provider. Failed payments due to insufficient
                funds, expired cards, or bank declines must be resolved before your order can be
                confirmed.
              </Note>
            </section>

            <hr className="border-white/8" />

            {/* 3. Shipping & Delivery */}
            <section>
              <SectionHeading {...SECTIONS[2]} />
              <div className="space-y-3 text-sm text-white/70 leading-relaxed mb-4">
                <p>
                  We ship nationwide across South Africa using <strong className="text-white">The Courier Guy</strong>,
                  a reliable and trackable door-to-door courier service.
                </p>
              </div>
              <ul className="space-y-3 mb-4">
                <Bullet>
                  <strong className="text-white">Free delivery within Gauteng</strong> on all orders
                  over R2,000.
                </Bullet>
                <Bullet>
                  For orders below R2,000, or deliveries outside Gauteng, a courier fee applies. The
                  shipping cost will be calculated and displayed at checkout before payment.
                </Bullet>
                <Bullet>
                  <strong className="text-white">Shipping costs are the responsibility of the customer</strong> unless
                  the free delivery threshold is met.
                </Bullet>
                <Bullet>
                  Orders placed and paid before 12:00 PM on business days are generally dispatched the
                  same day. Orders placed after 12:00 PM will be dispatched the following business day.
                </Bullet>
                <Bullet>
                  Estimated delivery times: Gauteng 1&ndash;2 business days, other major cities
                  2&ndash;3 business days, remote areas 3&ndash;5 business days.
                </Bullet>
                <Bullet>
                  A tracking number will be provided via email or WhatsApp once your order is
                  dispatched.
                </Bullet>
                <Bullet>
                  CW Electronics is not liable for courier delays caused by third-party logistics
                  providers, adverse weather, public holidays, or events outside our control.
                </Bullet>
              </ul>
              <Note>
                Please ensure your delivery address and contact number are correct at checkout. Failed
                deliveries due to incorrect address information may incur a re-delivery fee charged by
                the courier.
              </Note>
            </section>

            <hr className="border-white/8" />

            {/* 4. Returns */}
            <section>
              <SectionHeading {...SECTIONS[3]} />
              <div className="space-y-3 text-sm text-white/70 leading-relaxed mb-4">
                <p>
                  We want you to be satisfied with every purchase. We offer a <strong className="text-white">7-day
                  return window</strong> from the date of delivery for items that are faulty, damaged in
                  transit, or not as described.
                </p>
              </div>

              <p className="text-white font-semibold text-sm mb-3">To qualify for a return:</p>
              <ul className="space-y-3 mb-6">
                <Bullet>
                  The return request must be submitted within <strong className="text-white">7 calendar days</strong> of
                  receiving your order.
                </Bullet>
                <Bullet>
                  You must send a <strong className="text-white">clear photo of the item and its original
                  packaging</strong> to our WhatsApp or email before returning anything. Returns without prior
                  approval will not be accepted.
                </Bullet>
                <Bullet>
                  Items must be unused, in their original condition, and returned in original packaging.
                </Bullet>
                <Bullet>
                  <strong className="text-white">Return shipping costs are the responsibility of the
                  customer.</strong> We recommend using a trackable courier service, as we cannot be
                  held responsible for items lost in transit on return.
                </Bullet>
                <Bullet>
                  Once we receive and inspect the returned item, we will process a refund or exchange
                  within 3&ndash;5 business days.
                </Bullet>
              </ul>

              <p className="text-white font-semibold text-sm mb-3">Items not eligible for return:</p>
              <ul className="space-y-3 mb-4">
                <Bullet>Items returned after the 7-day window.</Bullet>
                <Bullet>Items showing signs of use, physical damage caused by the customer, or missing original packaging.</Bullet>
                <Bullet>Bulk/wholesale orders — please inspect all stock before accepting delivery.</Bullet>
              </ul>

              <Note>
                <strong className="text-white">How to initiate a return:</strong> Send a WhatsApp
                message to{' '}
                <a href={WA_LINK} className="text-[#E63939] underline underline-offset-2">our trade
                desk</a>{' '}
                or email{' '}
                <a href={`mailto:${EMAIL}`} className="text-[#E63939] underline underline-offset-2">{EMAIL}</a>{' '}
                with your order number, a photo of the item, and a brief description of the issue.
              </Note>
            </section>

            <hr className="border-white/8" />

            {/* 5. Wholesale Terms */}
            <section>
              <SectionHeading {...SECTIONS[4]} />
              <div className="space-y-3 text-sm text-white/70 leading-relaxed mb-4">
                <p>
                  CW Electronics offers trade and wholesale pricing to registered resellers, installers,
                  and businesses purchasing in volume.
                </p>
              </div>
              <ul className="space-y-3 mb-4">
                <Bullet>
                  A <strong className="text-white">minimum order of 6 units per product line</strong> is
                  required to qualify for bulk/wholesale pricing.
                </Bullet>
                <Bullet>
                  Wholesale prices are not displayed publicly. Contact us via WhatsApp or email to
                  request a quote for your required quantities.
                </Bullet>
                <Bullet>
                  Wholesale orders require payment in full (EFT or PayFast) before dispatch. No
                  credit terms are available unless agreed in writing.
                </Bullet>
                <Bullet>
                  We reserve the right to limit quantities or decline wholesale orders at our
                  discretion.
                </Bullet>
                <Bullet>
                  All wholesale orders are final. Returns and exchanges are not available on bulk
                  purchases unless items are found to be materially defective upon receipt.
                </Bullet>
                <Bullet>
                  Bulk pricing and availability are subject to stock. Prices may change between quote
                  and order confirmation.
                </Bullet>
              </ul>
              <Note>
                Interested in becoming a trade customer? WhatsApp us at{' '}
                <a href={WA_LINK} className="text-[#E63939] underline underline-offset-2">
                  our trade desk
                </a>{' '}
                or visit us in-store at China Mart, Crown Mines.
              </Note>
            </section>

            <hr className="border-white/8" />

            {/* 6. Privacy & POPIA */}
            <section>
              <SectionHeading {...SECTIONS[5]} />
              <div className="space-y-3 text-sm text-white/70 leading-relaxed mb-4">
                <p>
                  CW Electronics is committed to protecting your personal information in accordance with
                  the <strong className="text-white">Protection of Personal Information Act (POPIA),
                  No. 4 of 2013</strong> of South Africa.
                </p>
              </div>
              <ul className="space-y-3 mb-4">
                <Bullet>
                  We collect personal information (name, email, phone, delivery address) only for the
                  purpose of processing and fulfilling your order.
                </Bullet>
                <Bullet>
                  Your information will never be sold, rented, or shared with third parties for
                  marketing purposes without your explicit consent.
                </Bullet>
                <Bullet>
                  We share your delivery address and contact number with The Courier Guy solely for the
                  purpose of fulfilling your delivery.
                </Bullet>
                <Bullet>
                  We may send you transactional communications (order confirmation, tracking updates)
                  related to your purchase via email or WhatsApp.
                </Bullet>
                <Bullet>
                  You have the right to request access to, correction of, or deletion of your personal
                  information held by us at any time.
                </Bullet>
                <Bullet>
                  Our website may use cookies to improve your browsing experience. You can disable
                  cookies in your browser settings; however, this may affect site functionality.
                </Bullet>
                <Bullet>
                  For any POPIA-related requests or concerns, contact our Information Officer at{' '}
                  <a href={`mailto:${EMAIL}`} className="text-[#E63939] underline underline-offset-2">{EMAIL}</a>.
                </Bullet>
              </ul>
            </section>

            <hr className="border-white/8" />

            {/* 7. Contact Us */}
            <section id="contact">
              <SectionHeading {...SECTIONS[6]} />
              <p className="text-sm text-white/70 leading-relaxed mb-5">
                If you have any questions about these terms, your order, or our policies, please reach
                out through any of the channels below. We aim to respond within one business day.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <a
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 bg-white/3 hover:bg-[#E63939]/10 border border-white/8 hover:border-[#E63939]/30 rounded-2xl p-5 transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#E63939]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#E63939]/20 transition-colors">
                    <Phone className="w-5 h-5 text-[#E63939]" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">WhatsApp</p>
                    <p className="text-white/55 text-xs mt-0.5">Quick replies during business hours</p>
                  </div>
                </a>

                <a
                  href={`mailto:${EMAIL}`}
                  className="group flex items-center gap-4 bg-white/3 hover:bg-[#E63939]/10 border border-white/8 hover:border-[#E63939]/30 rounded-2xl p-5 transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#E63939]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#E63939]/20 transition-colors">
                    <svg className="w-5 h-5 text-[#E63939]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Email</p>
                    <p className="text-white/55 text-xs mt-0.5">{EMAIL}</p>
                  </div>
                </a>

                <div className="sm:col-span-2 flex items-start gap-4 bg-white/3 border border-white/8 rounded-2xl p-5">
                  <div className="w-11 h-11 rounded-xl bg-[#E63939]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#E63939]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Visit Us In-Store</p>
                    <p className="text-white/55 text-xs mt-1 leading-relaxed">
                      China Mart, Shop C15, 3 Press Avenue, Crown Mines, Johannesburg, 2092<br />
                      Mon&ndash;Sat: 09:00&ndash;15:00 &nbsp;&bull;&nbsp; Sun: Closed
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Back to home */}
            <div className="pt-4 pb-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </Link>
            </div>

          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}
