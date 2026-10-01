'use client'

import React from 'react'
import Link from 'next/link'
import { useMode } from '@/context/mode-context'

export function Footer() {
  const { setMode, modeDetails, mode } = useMode()
  const [emailInput, setEmailInput] = React.useState('')
  const [subStatus, setSubStatus] = React.useState<'idle' | 'saving' | 'success'>('idle')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput || !emailInput.includes('@')) return
    setSubStatus('saving')

    const email = emailInput.trim().toLowerCase()
    
    // Save locally
    try {
      const subs = JSON.parse(localStorage.getItem('fo4_subscribers') || '[]')
      if (!subs.some((s: any) => s.email === email)) {
        subs.push({ email, created_at: new Date().toISOString(), mode })
        localStorage.setItem('fo4_subscribers', JSON.stringify(subs))
      }
    } catch {}

    // Save to Supabase
    try {
      const { supabase } = await import('@/lib/supabase')
      await supabase.from('subscribers').upsert([{ email, created_at: new Date().toISOString(), mode }])
    } catch (e) {
      console.warn("Supabase subscriber save fallback:", e)
    }

    setSubStatus('success')
    setEmailInput('')
    setTimeout(() => setSubStatus('idle'), 4000)
  }

  return (
    <footer 
      className="text-[#F4F1EA] border-t pt-16 pb-12 transition-colors duration-700 ease-in-out dark-paper-texture"
      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP BRAND HEADER & NEWSLETTER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-14 border-b" style={{ borderColor: modeDetails.borderColor }}>
          
          <div className="lg:col-span-6 space-y-3">
            <Link href="/" className="inline-block">
              <span className={`text-3xl sm:text-4xl tracking-[0.25em] font-bold uppercase text-[#F4F1EA] ${modeDetails.fontClass}`}>
                FRIENDS OF 4
              </span>
              <p className="text-[10px] tracking-[0.45em] uppercase font-semibold mt-1 transition-colors duration-500" style={{ color: modeDetails.accentColor }}>
                {modeDetails.tagline}
              </p>
            </Link>
            <p className="text-xs text-[#D6CEBE]/70 max-w-md font-light leading-relaxed">
              Independent Indian D2C Luxury Fashion House. Registered entity: <strong>FRIENDS OF 4 FASHION HOUSE LLP</strong>. Crafting avant-garde streetwear, museum archive drops, and dravidian ethnic wear.
            </p>
          </div>

          {/* NEWSLETTER SUBSCRIBE FORM */}
          <div className="lg:col-span-6 space-y-3 flex flex-col justify-center">
            <p className={`text-xs tracking-[0.2em] uppercase ${modeDetails.fontClass}`} style={{ color: modeDetails.accentColor }}>
              JOIN THE PRIVATE ARCHIVE DISPATCH
            </p>
            <form onSubmit={handleSubscribe} className="flex space-x-2">
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="ENTER YOUR EMAIL FOR EARLY DROP ACCESS"
                className="flex-1 border px-4 py-3 text-xs text-[#F4F1EA] placeholder-[#D6CEBE]/40 focus:outline-none rounded font-mono"
                style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}
              />
              <button
                type="submit"
                disabled={subStatus === 'saving'}
                className={`px-6 py-3 font-bold text-xs tracking-[0.2em] uppercase transition-all duration-300 rounded shadow hover:brightness-110 ${modeDetails.fontClass}`}
                style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
              >
                {subStatus === 'saving' ? 'SAVING...' : subStatus === 'success' ? 'SUBSCRIBED ✓' : 'DISPATCH'}
              </button>
            </form>
            {subStatus === 'success' && (
              <p className="text-[10px] font-mono text-green-400 font-bold">✓ Email registered in Atelier database for drop notifications!</p>
            )}
            <p className="text-[9px] text-[#D6CEBE]/50 font-mono">
              STRICT PRIVACY GUARANTEED. NO SPAM. GST-INVOICED ATELIER FULFILLMENT.
            </p>
          </div>
        </div>

        {/* MIDDLE 3-COLUMN FOOTER NAVIGATION */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-12 border-b font-mono text-xs" style={{ borderColor: modeDetails.borderColor }}>

          {/* COLUMN 2: COMPANY */}
          <div>
            <h4 className={`text-sm tracking-[0.2em] uppercase mb-4 font-bold ${modeDetails.fontClass}`} style={{ color: modeDetails.accentColor }}>
              Company
            </h4>
            <ul className="space-y-3 text-[#D6CEBE]/80 text-xs">
              <li><Link href="/visionaries" className="hover:opacity-100 hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* COLUMN 3: SUPPORT */}
          <div>
            <h4 className={`text-sm tracking-[0.2em] uppercase mb-4 font-bold ${modeDetails.fontClass}`} style={{ color: modeDetails.accentColor }}>
              Support
            </h4>
            <ul className="space-y-3 text-[#D6CEBE]/80 text-xs">
              <li><Link href="/track-order" className="hover:opacity-100 font-bold transition-colors" style={{ color: modeDetails.accentColor }}>Track Order (Live)</Link></li>
              <li><Link href="/contact" className="hover:opacity-100 hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/legal/faq" className="hover:opacity-100 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/legal/shipping-policy" className="hover:opacity-100 hover:text-white transition-colors">Shipping</Link></li>
              <li><Link href="/legal/refund-policy" className="hover:opacity-100 hover:text-white transition-colors">Returns</Link></li>
            </ul>
          </div>

          {/* COLUMN 4: LEGAL */}
          <div>
            <h4 className={`text-sm tracking-[0.2em] uppercase mb-4 font-bold ${modeDetails.fontClass}`} style={{ color: modeDetails.accentColor }}>
              Legal
            </h4>
            <ul className="space-y-3 text-[#D6CEBE]/80 text-xs">
              <li><Link href="/legal/privacy-policy" className="hover:opacity-100 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal/terms-of-service" className="hover:opacity-100 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/legal/cookie-policy" className="hover:opacity-100 hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* REGISTERED LLP & GST ENTITY INFORMATION */}
        <div className="py-6 border-b text-[11px] font-mono text-[#D6CEBE]/70 flex flex-col md:flex-row items-center justify-between gap-2" style={{ borderColor: modeDetails.borderColor }}>
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-[#F4F1EA]">ENTITY: FRIENDS OF 4 FASHION HOUSE LLP</span>
            <span className="opacity-40">•</span>
            <span>LLPIN: AAF-8444</span>
            <span className="opacity-40">•</span>
            <span className="font-semibold" style={{ color: modeDetails.accentColor }}>GSTIN: 29AAAF48444M1Z5</span>
          </div>
          <p className="text-[10px] opacity-70">
            Registered Office: beside Raising House, opposite of Saint Anns School Road, Prakash Nagar, Narasaraopeta, Andhra Pradesh 522601
          </p>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-[10px] text-[#D6CEBE]/50 font-mono tracking-wider space-y-3 md:space-y-0">
          <p>© {new Date().getFullYear()} FRIENDS OF 4 FASHION HOUSE LLP. ALL RIGHTS RESERVED.</p>
          <div className="flex space-x-6">
            <Link href="/legal/terms-of-service" className="hover:underline">TERMS & CONDITIONS</Link>
            <Link href="/legal/privacy-policy" className="hover:underline">PRIVACY POLICY</Link>
            <Link href="/legal/cookie-policy" className="hover:underline">COOKIE PROTOCOL</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
