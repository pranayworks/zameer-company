'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Boutique Order Support',
    message: ''
  })


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
          subject: `${formData.subject} - Friends of 4 Atelier`,
          message: formData.message,
          from_name: "Friends of 4 Notifications",
          replyto: formData.email
        })
      });

      const result = await response.json()

      if (result.success) {
        setSent(true)
        setFormData({ name: '', email: '', subject: 'Boutique Order Support', message: '' })
      } else {
        alert("The atelier archives failed to receive your message. Please try again.")
      }
    } catch (error) {
      alert("Network Error. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fdf9f2]">
      <Header />

      <main className="pt-32 pb-24 px-8 md:px-24 max-w-[1920px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-24 items-start">
          {/* Left: Contact Info */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#a3851a] mb-6">Connect with the Atelier</p>
              <h1 className="font-headline text-5xl md:text-8xl tracking-tighter mb-8 leading-tight">
                Tradition, <br />Only a <span className="italic">Message</span> Away
              </h1>

              <div className="space-y-12 mt-20">
                <div className="flex gap-8 group">
                  <div className="w-12 h-12 bg-white flex items-center justify-center border border-[#1c1c18]/10 group-hover:bg-[#1c1c18] group-hover:text-white transition-all">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                  </div>
                  <div>
                    <h4 className="font-headline text-2xl mb-2">Our Presence</h4>
                    <p className="font-body text-sm text-[#747878] leading-relaxed max-w-xs">
                      Financial district Hyderabad
                    </p>
                  </div>
                </div>

                <div className="flex gap-8 group">
                  <div className="w-12 h-12 bg-white flex items-center justify-center border border-[#1c1c18]/10 group-hover:bg-[#1c1c18] group-hover:text-white transition-all">
                    <span className="material-symbols-outlined text-sm">mail</span>
                  </div>
                  <div>
                    <h4 className="font-headline text-2xl mb-2">Email Us At</h4>
                    <p className="font-body text-sm text-[#747878]">friendsof4.support@gmail.com</p>
                    <p className="font-body text-sm text-[10px] uppercase tracking-widest text-[#a3851a] mt-2 font-bold">24hr Response Time</p>
                  </div>
                </div>

                <div className="flex gap-8 group">
                  <div className="w-12 h-12 bg-white flex items-center justify-center border border-[#1c1c18]/10 group-hover:bg-[#1c1c18] group-hover:text-white transition-all">
                    <span className="material-symbols-outlined text-sm">call</span>
                  </div>
                  <div>
                    <h4 className="font-headline text-2xl mb-2">Voice Assistance</h4>
                    <p className="font-body text-sm text-[#747878]">No.: +919550447883</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:w-1/2 w-full mt-12 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-12 md:p-20 shadow-2xl border border-[#1c1c18]/5 relative"
            >
              {sent ? (
                <div className="text-center py-20">
                  <span className="material-symbols-outlined text-[#a3851a] text-6xl mb-8 animate-bounce">check_circle</span>
                  <h3 className="font-headline text-4xl mb-4">Message Handed to Server</h3>
                  <p className="font-body text-sm text-[#747878] mb-12">Our atelier curators will respond to your inquiry shortly.</p>
                  <button onClick={() => setSent(false)} className="gold-satin text-white px-12 py-5 text-[10px] uppercase tracking-widest font-bold">Send Another Inquiry</button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="relative">
                      <label className="text-[10px] uppercase tracking-widest text-[#747878] mb-2 block">Name of the Patron</label>
                      <input required name="name" type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border-b border-[#1c1c18]/20 bg-transparent py-4 text-sm focus:border-[#a3851a] outline-none" placeholder="e.g Miraya Seth" />
                    </div>
                    <div className="relative">
                      <label className="text-[10px] uppercase tracking-widest text-[#747878] mb-2 block">Email Channel</label>
                      <input required name="email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full border-b border-[#1c1c18]/20 bg-transparent py-4 text-sm focus:border-[#a3851a] outline-none" placeholder="curated@atelier.com" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#747878] mb-2 block">Subject of Inquiry</label>
                    <select value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} className="w-full border-b border-[#1c1c18]/20 bg-transparent py-4 text-sm focus:border-[#a3851a] outline-none">
                      <option>Boutique Order Support</option>
                      <option>Custom Hand-Loom Request</option>
                      <option>Wholesale Partnerships</option>
                      <option>Sustainability & Heritage</option>
                      <option>Others</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#747878] mb-2 block">Your Narrative / Message</label>
                    <textarea required value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} rows={5} className="w-full border-b border-[#1c1c18]/20 bg-transparent py-4 text-sm focus:border-[#a3851a] outline-none resize-none" placeholder="We would love to hear from you..." />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full gold-satin text-white py-6 font-body uppercase tracking-[0.4em] text-[10px] font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4"
                  >
                    {loading ? (
                      <>In Transit...</>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">send</span>
                        Transmit Signal
                      </>
                    )}
                  </button>

                  <p className="text-[9px] uppercase tracking-widest text-[#747878] text-center mt-6">
                    🔒 Your data is secured within the Friends of 4 Vault
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
