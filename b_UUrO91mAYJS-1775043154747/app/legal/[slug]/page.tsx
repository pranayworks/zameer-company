'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { use } from 'react'

const policies: Record<string, { title: string, subtitle: string, lastUpdated: string, content: string[] }> = {
  'refund-policy': {
    title: 'Refund & Cancellation Policy',
    subtitle: '5-Day Atelier Grace Period',
    lastUpdated: 'April 6, 2026',
    content: [
      "At Friends of 4, we cherish the craftsmanship of our hand-loomed heritage. As every piece is a unique creation, our refund policy is designed to protect both the artisan and the patron.",
      "5-Day Return Window: You may initiate a return or cancellation within 5 days of delivery. For cancellations before dispatch, refunds are processed immediately.",
      "Refund Processing: Once a cancellation is approved (or a returned item is received at our vault), the refund will be initiated via your original payment method (Razorpay) within 5-7 business days.",
      "Condition of Return: Items must be in their original atelier condition, unworn, and with all heritage tags intact. Items showing signs of wear or damage will not be eligible for a refund.",
      "Manual Archive Orders: For offline/manual orders, please contact our support desk directly via the Voice Channel or Electronic Post for bespoke refund processing."
    ]
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    subtitle: 'Your Data, Secured in Our Vault',
    lastUpdated: 'April 4, 2026',
    content: [
      "Friends of 4 is committed to maintaining the confidentiality of its patrons. We collect and process your data solely to fulfill your orders and enhance your journey through our collection.",
      "Personal Information: We collect your name, email, billing/shipping address, and phone number for fulfillment and secure login purposes.",
      "Payment Security: Your financial data (Credit Cards, UPI, Netbanking) is handled exclusively by Razorpay and never enters our own servers. We have no access to your banking details.",
      "Third-Party Sharing: Your data is shared only with our fulfillment and shipping partners to ensure your masterpiece reaches you safely.",
      "Atelier Analytics: We use anonymized browsing data to improve our boutique's digital experience and curation."
    ]
  },
  'terms-of-service': {
    title: 'Terms of Service',
    subtitle: 'The Atelier Membership Protocol',
    lastUpdated: 'April 4, 2026',
    content: [
      "By accessing the Friends of 4 digital boutique, you agree to respect our heritage and digital property. All imagery, designs, and cinematic reels are protected by intellectual property laws.",
      "Order Confirmation: We reserve the right to cancel any order should there be a discrepancy in inventory or pricing. Full refunds will be issued in such cases.",
      "Client Conduct: We expect our patrons to interact with our platform and staff with the same elegance and respect reflected in our artisanal works.",
      "Customization Liability: For custom loom requests, measurements provided by the client are final. Friends of 4 is not responsible for fit issues resulting from incorrect client-provided measurements.",
      "Governance: These terms are governed by the laws of India and all disputes are subject to the courts of Mumbai."
    ]
  },
  'shipping-policy': {
    title: 'Shipping & Delivery Policy',
    subtitle: 'Global Dispatch of Tradition',
    lastUpdated: 'April 4, 2026',
    content: [
      "Friends of 4 offers complimentary express delivery for all domestic orders within India.",
      "Dispatch Timeline: Standard pieces are dispatched from our Mumbai vault within 48-72 hours. Hand-loomed or custom pieces may take 3-5 weeks depending on the warp and weft complexity.",
      "Estimated Delivery: Once dispatched, domestic orders typically reach our patrons within 5-7 business days. International shipping times vary based on the destination.",
      "Tracking the Journey: A unique Archive Tracking Number will be emailed to you and available in your Account Dashboard (Live Tracking tab) once your piece is dispatched.",
      "Damaged Shipments: If your atelier package arrives compromised, please document the damage with photographs and notify our Electronic Post within 24 hours of receipt."
    ]
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    subtitle: 'Enhancing Your Digital Journey',
    lastUpdated: 'April 6, 2026',
    content: [
      "Friends of 4 uses digital cookies to ensure your experience in our atelier is seamless and personalized.",
      "Session Cookies: These are essential for maintaining your login and cart state as you navigate between different collections.",
      "Performance Analytics: We use cookies to understand which pieces are most admired by our patrons, allowing us to curate better collections.",
      "Preference Storage: We remember your choice of currency, tone preferences, and shipping details to expedite your future acquisitions.",
      "Managing Cookies: You can manage or disable cookies through your browser settings, though some features of our boutique may be limited as a result."
    ]
  }
}

export default function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const policy = policies[slug] || policies['terms-of-service']

  return (
    <div className="min-h-screen bg-[#fdf9f2]">
      <Header />
      
      <main className="pt-48 pb-32 px-8 md:px-24 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-16">
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#a3851a] mb-4">{policy.subtitle}</p>
            <h1 className="font-headline text-5xl md:text-7xl tracking-tighter mb-4 text-[#1c1c18]">{policy.title}</h1>
            <p className="font-body text-[10px] uppercase tracking-widest text-[#747878] font-bold">Last Revised: <span className="text-[#1c1c18]">{policy.lastUpdated}</span></p>
          </div>

          <div className="space-y-12">
            {policy.content.map((para, i) => (
              <div key={i} className="flex gap-8 group">
                 <div className="hidden md:flex w-12 h-12 rounded-full border border-[#1c1c18]/10 items-center justify-center shrink-0 text-[#1c1c18]/30 font-headline text-xl group-hover:bg-[#1c1c18] group-hover:text-white transition-all">
                    {(i + 1).toString().padStart(2, '0')}
                 </div>
                 <p className="font-body text-md text-[#545454] leading-relaxed py-3">
                   {para}
                 </p>
              </div>
            ))}
          </div>

          <div className="mt-24 pt-12 border-t border-[#1c1c18]/10 text-center">
             <p className="font-body text-[10px] uppercase tracking-widest text-[#747878] mb-8">Questions regarding our policies?</p>
             <a href="/contact" className="inline-block gold-satin text-white px-12 py-5 text-[10px] uppercase tracking-widest font-bold shadow-xl hover:scale-105 transition-all">Reach the Support Herald</a>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
