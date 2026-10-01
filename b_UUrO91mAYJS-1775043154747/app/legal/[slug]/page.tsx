'use client'

import React, { use } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useMode } from '@/context/mode-context'

interface PolicyDetail {
  title: string
  subtitle: string
  lastUpdated: string
  content: { heading?: string; text: string }[]
}

const policies: Record<string, PolicyDetail> = {
  'terms-of-service': {
    title: 'Terms of Service & Conditions',
    subtitle: 'FRIENDS OF 4 FASHION HOUSE LLP • LEGAL PROTOCOL',
    lastUpdated: 'April 6, 2026',
    content: [
      {
        heading: '1. Registered Entity & Corporate Identity',
        text: 'This website is owned, operated, and maintained by FRIENDS OF 4 FASHION HOUSE LLP (LLPIN: AAF-8444), a registered Limited Liability Partnership incorporated under the Limited Liability Partnership Act, 2008 in Bengaluru, Karnataka, India. All transactions, acquisitions, tax filings, and legal notices are bound to FRIENDS OF 4 FASHION HOUSE LLP.'
      },
      {
        heading: '2. Goods & Services Tax (GST) Compliance',
        text: 'FRIENDS OF 4 FASHION HOUSE LLP is fully registered under the Goods and Services Tax Act with GSTIN: 29AAAF48444M1Z5. All product valuations and checkout amounts displayed on our digital boutique are inclusive of applicable GST (CGST/SGST/IGST). Electronic Tax Invoices detailing itemized HSN codes and tax breakdowns are automatically generated and dispatched via email upon order confirmation.'
      },
      {
        heading: '3. Intellectual Property & Brand Assets',
        text: 'All designs, Dravidian CAD blueprints, 3D renders, video reels, imagery, and typography on this boutique are the exclusive intellectual property of FRIENDS OF 4 FASHION HOUSE LLP. Unauthorized reproduction or commercial use is strictly prohibited.'
      },
      {
        heading: '4. Order Confirmation & Fulfillment',
        text: 'Upon placing an acquisition request, you will receive an instant order confirmation and order ID via email and Telegram. FRIENDS OF 4 FASHION HOUSE LLP reserves the right to cancel orders in the event of stock unavailability or technical pricing errors, whereupon a 100% full refund will be processed.'
      },
      {
        heading: '5. Governing Law & Jurisdiction',
        text: 'These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any legal dispute or proceeding arising out of or related to this website shall be subject to the exclusive jurisdiction of the courts located in Bengaluru, Karnataka.'
      }
    ]
  },
  'privacy-policy': {
    title: 'Privacy & Data Protection Policy',
    subtitle: 'PATRON DATA & ENCRYPTION PROTOCOL',
    lastUpdated: 'April 6, 2026',
    content: [
      {
        heading: '1. Personal Information Collection',
        text: 'FRIENDS OF 4 FASHION HOUSE LLP collects essential personal details including patron name, email address, contact phone number, shipping address, and GSTIN (for business clients) solely for order fulfillment, logistics tracking, and legal tax compliance.'
      },
      {
        heading: '2. Payment Processing Security',
        text: 'Financial data (Credit Cards, UPI, Netbanking) is handled exclusively by PCI-DSS compliant payment gateways (Razorpay). FRIENDS OF 4 FASHION HOUSE LLP never stores or processes raw credit card or bank account credentials on its own servers.'
      },
      {
        heading: '3. Data Sharing & Third Parties',
        text: 'Your shipping address and contact number are securely shared with authorized courier partners (e.g. Delhivery, BlueDart, DHL) strictly for dispatching your shipment and sending SMS tracking updates.'
      },
      {
        heading: '4. Patron Data Rights',
        text: 'Patrons have the right to request access to, correction of, or deletion of their account profile and order history by contacting concierge@friendsof4.in.'
      }
    ]
  },
  'refund-policy': {
    title: 'Refund & Return Policy',
    subtitle: '24-HOUR UNBOXING & 5-DAY ATELIER RETURN GUARANTEE',
    lastUpdated: 'April 6, 2026',
    content: [
      {
        heading: '1. 24-Hour Unboxing Damage Guarantee',
        text: 'Every masterpiece dispatched by FRIENDS OF 4 FASHION HOUSE LLP is inspected under strict quality control. If your parcel arrives compromised, please document an unboxing video and notify concierge@friendsof4.in within 24 hours of delivery for an immediate 100% replacement.'
      },
      {
        heading: '2. 5-Day Return Window',
        text: 'Patrons may request a return or exchange within 5 days of delivery. Returned items must be unworn, unwashed, with all original tags, silk muslin packaging, and authenticity cards intact.'
      },
      {
        heading: '3. Refund Processing Timeline',
        text: 'Once the returned item is inspected at our Bengaluru facility, approved refunds will be credited back to the original payment source (Razorpay) within 5–7 business days. A GST credit note will be issued accordingly.'
      },
      {
        heading: '4. Non-Returnable Items',
        text: 'Bespoke custom-tailored sarees, altered garments, and limited drop pieces marked as Final Sale are non-returnable unless defective.'
      }
    ]
  },
  'shipping-policy': {
    title: 'Shipping & Delivery Policy',
    subtitle: 'INSURED WORLDWIDE & DOMESTIC DISPATCH',
    lastUpdated: 'April 6, 2026',
    content: [
      {
        heading: '1. Complimentary Express Domestic Shipping',
        text: 'FRIENDS OF 4 FASHION HOUSE LLP provides complimentary insured shipping on all orders within India.'
      },
      {
        heading: '2. Dispatch Timelines',
        text: 'Standard streetwear and archive ready-to-wear garments are dispatched from our Bengaluru vault within 24 to 48 hours. Handloom Kanjeevaram sarees and hand-embroidered Bandhgalas require 3-5 business days for final finishing.'
      },
      {
        heading: '3. Real-Time Tracking',
        text: 'A unique Delhivery/DHL tracking code is emailed to patrons upon dispatch. Live status can also be viewed inside your account dashboard.'
      },
      {
        heading: '4. Delivery Estimates',
        text: 'Metropolitan cities: 2–4 business days. Rest of India: 4–7 business days. International express: 5–10 business days.'
      }
    ]
  },
  'cookie-policy': {
    title: 'Cookie Protocol & Preference Policy',
    subtitle: 'ENHANCING YOUR DIGITAL JOURNEY',
    lastUpdated: 'April 6, 2026',
    content: [
      {
        heading: '1. Essential Session Cookies',
        text: 'Used to maintain your active shopping cart state, brand mode preferences (Streetwear, Archive, Traditional), and authenticated session across pages.'
      },
      {
        heading: '2. Performance Analytics',
        text: 'Anonymized analytics cookies help us measure collection views and optimize server loading speeds.'
      },
      {
        heading: '3. Managing Cookie Preferences',
        text: 'Patrons can manage or clear cookies at any time via their web browser settings.'
      }
    ]
  },
  'faq': {
    title: 'Frequently Asked Questions (FAQ)',
    subtitle: 'ATELIER CLIENT SUPPORT & CONCIERGE HELP',
    lastUpdated: 'April 6, 2026',
    content: [
      {
        heading: 'How do I track my acquisition order?',
        text: 'You will receive an instant email and SMS containing your tracking code upon dispatch. You can also view live tracking updates on our website.'
      },
      {
        heading: 'Is GST tax included in the prices?',
        text: 'Yes! All prices listed on Friends of 4 are inclusive of GST. A valid e-tax invoice detailing GSTIN: 29AAAF48444M1Z5 is emailed upon purchase.'
      },
      {
        heading: 'What payment methods do you accept?',
        text: 'We accept Credit/Debit Cards (Visa, Mastercard, Amex), UPI (Google Pay, PhonePe, Paytm), Netbanking, and Razorpay online payments.'
      },
      {
        heading: 'How do I contact customer support?',
        text: 'You can email our concierge team at concierge@friendsof4.in or connect directly via our 24/7 WhatsApp concierge button.'
      }
    ]
  }
}

export default function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  
  // Normalize slug mapping to support short and long forms
  const normalizedSlug = slug === 'privacy' ? 'privacy-policy' :
    slug === 'terms' ? 'terms-of-service' :
    slug === 'returns' ? 'refund-policy' :
    slug === 'shipping' ? 'shipping-policy' :
    slug === 'cookies' ? 'cookie-policy' : slug

  const policy = policies[normalizedSlug] || policies['terms-of-service']
  const { modeDetails } = useMode()

  return (
    <div 
      className="min-h-screen text-[#F4F1EA] paper-texture flex flex-col justify-between transition-colors duration-700 ease-in-out"
      style={{ backgroundColor: modeDetails.themeBg }}
    >
      <Header />
      
      <main className="pt-36 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        
        {/* BREADCRUMB */}
        <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#D6CEBE]/70 mb-8 flex items-center space-x-2">
          <Link href="/" className="hover:opacity-80">HOME</Link>
          <span>/</span>
          <span className="font-bold" style={{ color: modeDetails.accentColor }}>LEGAL</span>
          <span>/</span>
          <span className="uppercase">{policy.title}</span>
        </div>

        {/* POLICY HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border-b pb-8 mb-12"
          style={{ borderColor: modeDetails.borderColor }}
        >
          <span className={`text-xs tracking-[0.3em] uppercase font-bold ${modeDetails.fontClass}`} style={{ color: modeDetails.accentColor }}>
            {policy.subtitle}
          </span>
          <h1 className={`${modeDetails.fontClass || 'font-serif-editorial'} text-4xl sm:text-6xl tracking-[0.05em] uppercase text-[#F4F1EA] mt-2 font-bold`}>
            {policy.title}
          </h1>
          <p className="text-xs font-mono text-[#D6CEBE]/60 mt-3">
            REGISTERED ENTITY: FRIENDS OF 4 FASHION HOUSE LLP • GSTIN: 29AAAF48444M1Z5 • LAST REVISED: {policy.lastUpdated}
          </p>
        </motion.div>

        {/* POLICY CONTENT SECTIONS */}
        <div 
          className="p-8 sm:p-12 border rounded-lg space-y-10 shadow-2xl backdrop-blur-md"
          style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}
        >
          {policy.content.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="space-y-3 border-b pb-8 last:border-b-0 last:pb-0"
              style={{ borderColor: modeDetails.borderColor }}
            >
              {item.heading && (
                <h3 className={`${modeDetails.fontClass || 'font-serif-editorial'} text-xl sm:text-2xl text-[#F4F1EA] font-bold tracking-wide`}>
                  {item.heading}
                </h3>
              )}
              <p className="text-xs sm:text-sm text-[#D6CEBE]/90 font-light leading-relaxed">
                {item.text}
              </p>
            </motion.div>
          ))}

          {/* LLP & GST SUMMARY FOOTNOTE */}
          <div 
            className="p-6 border rounded font-mono text-xs space-y-2 mt-8"
            style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
          >
            <p className="font-bold uppercase" style={{ color: modeDetails.accentColor }}>
              CORPORATE REGISTRATION & TAXATION DISCLOSURE:
            </p>
            <p className="text-[#D6CEBE]/80 text-[11px] leading-relaxed">
              FRIENDS OF 4 FASHION HOUSE LLP is registered under LLPIN: AAF-8444 in Bengaluru, Karnataka, India. All client billing and invoices are generated in compliance with GSTIN: 29AAAF48444M1Z5. For legal correspondence or corporate inquiries, contact concierge@friendsof4.in.
            </p>
          </div>
        </div>

        {/* HELP DESK BUTTON */}
        <div className="mt-12 text-center">
          <Link
            href="/contact"
            className={`inline-block px-8 py-4 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 rounded shadow hover:brightness-110 ${modeDetails.fontClass}`}
            style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
          >
            REACH CLIENT CONCIERGE & SUPPORT
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
