'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useMode } from '@/context/mode-context'

export default function ContactPage() {
  const router = useRouter()
  const { modeDetails, mode } = useMode()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Boutique Order Support',
    message: ''
  })

  const handleWhatsAppClick = () => {
    const phoneNumber = '9550447883'
    const message = encodeURIComponent(`Hi friends of 4 . i need your help regarding: ${formData.subject}`)
    window.open(`https://wa.me/91${phoneNumber}?text=${message}`, '_blank')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          access_key: "7c2303b3-df56-4710-9bfb-278873f15560",
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: `[${mode.toUpperCase()}] ${formData.subject} - Friends of 4 Atelier`,
          message: formData.message,
          from_name: "Friends of 4 Atelier Contact",
          replyto: formData.email
        })
      });

      const result = await response.json()

      if (result.success) {
        setSent(true)
        setFormData({ name: '', email: '', phone: '', subject: 'Boutique Order Support', message: '' })
      } else {
        alert("The atelier archives failed to receive your message. Please try again or reach out on WhatsApp.")
      }
    } catch (error) {
      alert("Network Connection issue. Please connect with our concierge on WhatsApp +91 9550447883.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen text-[#F4F1EA] paper-texture flex flex-col justify-between transition-colors duration-700 ease-in-out font-body"
      style={{ backgroundColor: modeDetails.themeBg }}
    >
      <Header />

      <main className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        
        {/* BACK BUTTON & HEADER BREADCRUMB */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono font-bold transition-all hover:opacity-80 cursor-pointer"
            style={{ color: modeDetails.accentColor }}
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back
          </button>

          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#D6CEBE]/70">
            ATELIER PATRON SUPPORT • {mode.toUpperCase()} MODE
          </span>
        </div>

        {/* HERO TITLE */}
        <div className="border-b pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between" style={{ borderColor: `${modeDetails.borderColor}50` }}>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.4em] block mb-2 font-bold" style={{ color: modeDetails.accentColor }}>
              DIRECT ATELIER COMMUNICATION
            </span>
            <h1 className={`${modeDetails.fontClass || 'font-serif-editorial'} text-4xl sm:text-6xl uppercase tracking-[0.05em] text-white font-bold`}>
              CONNECT WITH OUR CONCIERGE
            </h1>
          </div>
          <p className="text-xs font-mono text-[#D6CEBE]/70 mt-3 md:mt-0">
            24/7 PATRON SUPPORT & HAUTE COUTURE INQUIRIES
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT COLUMN: CONTACT CHANNELS & PRESENCE */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="p-6 border rounded-2xl space-y-3 shadow-xl" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
                <span className="text-[10px] font-mono uppercase tracking-widest block font-bold" style={{ color: modeDetails.accentColor }}>
                  GLOBAL ATELIER HEADQUARTERS
                </span>
                <h3 className={`${modeDetails.fontClass || 'font-serif-editorial'} text-2xl font-bold text-white uppercase`}>
                  FINANCIAL DISTRICT, HYDERABAD
                </h3>
                <p className="text-xs font-mono text-[#D6CEBE]/80 leading-relaxed">
                  Friends of 4 Fashion House LLP, Financial District, Nanakramguda, Hyderabad, Telangana - 500032.
                </p>
              </div>

              {/* CONTACT CHANNELS CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 font-mono text-xs">
                {/* WHATSAPP CONCIERGE */}
                <div 
                  onClick={handleWhatsAppClick}
                  className="p-5 border rounded-xl flex items-center justify-between cursor-pointer transition-all hover:scale-[1.02] shadow-lg group"
                  style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined">chat</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">24/7 WhatsApp Concierge</h4>
                      <p className="text-[10px] text-[#D6CEBE]/70">+91 9550447883</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform" style={{ color: modeDetails.accentColor }}>arrow_forward</span>
                </div>

                {/* EMAIL */}
                <div className="p-5 border rounded-xl flex items-center gap-4 shadow-lg" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: `${modeDetails.accentColor}20`, color: modeDetails.accentColor }}>
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Official Email Channel</h4>
                    <p className="text-[10px] text-[#D6CEBE]/70">friendsof4.support@gmail.com</p>
                  </div>
                </div>

                {/* PHONE */}
                <div className="p-5 border rounded-xl flex items-center gap-4 shadow-lg" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: `${modeDetails.accentColor}20`, color: modeDetails.accentColor }}>
                    <span className="material-symbols-outlined">call</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Voice Helpline</h4>
                    <p className="text-[10px] text-[#D6CEBE]/70">+91 9550447883 (10 AM - 8 PM IST)</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: HIGH END CONTACT FORM */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 sm:p-12 border rounded-2xl shadow-2xl relative"
              style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}
            >
              {sent ? (
                <div className="text-center py-16 space-y-6">
                  <span className="material-symbols-outlined text-6xl animate-bounce" style={{ color: modeDetails.accentColor }}>check_circle</span>
                  <h3 className={`${modeDetails.fontClass || 'font-serif-editorial'} text-3xl font-bold uppercase text-white`}>
                    INQUIRY TRANSMITTED TO ATELIER
                  </h3>
                  <p className="text-xs font-mono text-[#D6CEBE]/80 max-w-md mx-auto leading-relaxed">
                    Our atelier curators will respond to your email within 24 hours. You can also message our team directly on WhatsApp for instant assistance.
                  </p>
                  <button 
                    onClick={() => setSent(false)} 
                    className="px-8 py-3.5 font-bold font-mono text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg cursor-pointer"
                    style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 font-mono text-xs">
                  <div className="border-b pb-4 mb-2" style={{ borderColor: `${modeDetails.borderColor}40` }}>
                    <h3 className={`${modeDetails.fontClass || 'font-serif-editorial'} text-2xl font-bold text-white uppercase`}>
                      TRANSMIT A DIRECT INQUIRY
                    </h3>
                    <p className="text-[10px] text-[#D6CEBE]/70 mt-1">Fill in details for order tracking, size advice, or custom commission inquiries.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-[10px] uppercase font-bold text-[#D6CEBE]">PATRON NAME *</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.name} 
                        onChange={e => setFormData({ ...formData, name: e.target.value })} 
                        className="w-full border p-3 text-white placeholder-white/30 focus:outline-none rounded-xl"
                        style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }} 
                        placeholder="e.g. Rahul Sharma" 
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[10px] uppercase font-bold text-[#D6CEBE]">EMAIL CHANNEL *</label>
                      <input 
                        required 
                        type="email" 
                        value={formData.email} 
                        onChange={e => setFormData({ ...formData, email: e.target.value })} 
                        className="w-full border p-3 text-white placeholder-white/30 focus:outline-none rounded-xl"
                        style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }} 
                        placeholder="client@domain.com" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-[10px] uppercase font-bold text-[#D6CEBE]">PHONE NUMBER</label>
                      <input 
                        type="tel" 
                        value={formData.phone} 
                        onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                        className="w-full border p-3 text-white placeholder-white/30 focus:outline-none rounded-xl"
                        style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }} 
                        placeholder="+91 9876543210" 
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[10px] uppercase font-bold text-[#D6CEBE]">SUBJECT OF INQUIRY</label>
                      <select 
                        value={formData.subject} 
                        onChange={e => setFormData({ ...formData, subject: e.target.value })} 
                        className="w-full border p-3 text-white focus:outline-none rounded-xl cursor-pointer"
                        style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                      >
                        <option value="Boutique Order Support">Boutique Order Support</option>
                        <option value="Custom Hand-Loom Request">Custom Hand-Loom Request</option>
                        <option value="Wholesale Partnerships">Wholesale Partnerships</option>
                        <option value="Size & Fit Advisory">Size & Fit Advisory</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-[10px] uppercase font-bold text-[#D6CEBE]">YOUR INQUIRY MESSAGE *</label>
                    <textarea 
                      required 
                      value={formData.message} 
                      onChange={e => setFormData({ ...formData, message: e.target.value })} 
                      rows={4} 
                      className="w-full border p-3 text-white placeholder-white/30 focus:outline-none rounded-xl resize-none" 
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                      placeholder="Share your inquiry details..." 
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 font-mono uppercase tracking-[0.25em] text-xs font-bold shadow-xl rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                    style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
                  >
                    {loading ? (
                      <>TRANSMITTING INQUIRY...</>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">send</span>
                        TRANSMIT MESSAGE TO ATELIER
                      </>
                    )}
                  </button>

                  <p className="text-[9px] uppercase tracking-widest text-[#D6CEBE]/60 text-center mt-3 font-mono">
                    🔒 DATA SECURED & DISPATCHED TO FRIENDS OF 4 VAULT
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
