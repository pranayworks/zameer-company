'use client'

import React, { useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMode } from '@/context/mode-context'

export default function VisionariesPage() {
  const router = useRouter()
  const { modeDetails, mode } = useMode()
  const [activeTab, setActiveTab] = useState<'ethos' | 'craft' | 'future'>('ethos')

  const visionaries = [
    {
      name: 'M. PRANAY KUMAR',
      role: 'CHIEF EXECUTIVE & BRAND ARCHITECT',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
      bio: 'Pioneering modern Indian luxury through structural minimalism and global D2C direct-to-artisan supply chains.',
      quote: '"We build garments not for seasons, but for generations as physical monuments of culture."'
    },
    {
      name: 'ZAMEER PATTAN',
      role: 'FOUNDER & CREATIVE DIRECTOR',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
      bio: 'Fusing traditional South Indian handloom weaves with heavyweight 400 GSM architectural streetwear silhouettes.',
      quote: '"Our tradition is not a museum artifact — it is a living, breathing design language."'
    },
    {
      name: 'VARANASI MASTER WEAVERS',
      role: 'HERITAGE COUTURE ARTISANS',
      image: 'https://images.unsplash.com/photo-1558444458-544510403dc6?q=80&w=800&auto=format&fit=crop',
      bio: '5th generation master weavers crafting pure metallic Zari and architectural Kanjeevaram Silk drapes.',
      quote: '"Each thread carries hundreds of years of secrets passed quietly from father to son."'
    }
  ]

  return (
    <main className="min-h-screen text-[#F4F1EA] paper-texture flex flex-col justify-between transition-colors duration-700 ease-in-out" style={{ backgroundColor: modeDetails.themeBg }}>
      <Header />
      
      <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        
        {/* BACK BUTTON */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono font-bold transition-all hover:opacity-80"
            style={{ color: modeDetails.accentColor }}
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back
          </button>

          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#D6CEBE]/70">
            FRIENDS OF 4 • {mode.toUpperCase()} MANIFESTO
          </div>
        </div>

        {/* HERO BANNER SECTION */}
        <section className="relative h-[65vh] flex items-center justify-center overflow-hidden border rounded-2xl shadow-2xl mb-16" style={{ borderColor: modeDetails.borderColor, backgroundColor: modeDetails.cardBg }}>
          <div className="absolute inset-0 opacity-40">
            <Image 
              src="https://images.unsplash.com/photo-1558444458-544510403dc6?q=80&w=2670&auto=format&fit=crop" 
              alt="Handmade textile craftsmanship" 
              fill
              className="object-cover filter brightness-75 contrast-125"
              priority
            />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${modeDetails.themeBg}, transparent 70%)` }} />
          </div>

          <div className="relative z-10 text-center px-6 max-w-4xl">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="font-mono uppercase tracking-[0.45em] text-xs font-bold mb-4"
              style={{ color: modeDetails.accentColor }}
            >
              A HERITAGE REIMAGINED FOR TOMORROW
            </motion.p>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className={`${modeDetails.fontClass || 'font-serif-editorial'} text-5xl md:text-8xl text-white uppercase tracking-[0.05em] font-bold leading-none mb-6`}
            >
              THE VISIONARIES
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-sm md:text-base font-light text-[#D6CEBE]/90 max-w-2xl mx-auto leading-relaxed font-mono"
            >
              The minds, hands, and architectural philosophy driving independent Indian D2C luxury fashion.
            </motion.p>
          </div>
        </section>

        {/* VISIONARIES CARDS GRID */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <span className="text-[10px] font-mono uppercase tracking-[0.4em] block mb-2" style={{ color: modeDetails.accentColor }}>
              ATELIER LEADERSHIP & ARTISAN MASTERS
            </span>
            <h2 className={`${modeDetails.fontClass || 'font-serif-editorial'} text-3xl sm:text-5xl uppercase font-bold text-white`}>
              CRAFTING THE PERMANENT
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {visionaries.map((v, idx) => (
              <motion.div
                key={v.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className="border p-6 rounded-xl space-y-5 shadow-xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.02]"
                style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}
              >
                <div className="space-y-4">
                  <div className="relative w-full h-72 rounded-lg overflow-hidden border" style={{ borderColor: modeDetails.borderColor }}>
                    <Image src={v.image} alt={v.name} fill className="object-cover filter contrast-110" />
                    <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${modeDetails.cardBg}, transparent 60%)` }} />
                  </div>

                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase block font-bold" style={{ color: modeDetails.accentColor }}>
                      {v.role}
                    </span>
                    <h3 className={`${modeDetails.fontClass || 'font-serif-editorial'} text-2xl font-bold text-white uppercase mt-1`}>
                      {v.name}
                    </h3>
                  </div>

                  <p className="text-xs text-[#D6CEBE]/80 font-light leading-relaxed">
                    {v.bio}
                  </p>
                </div>

                <div className="pt-4 border-t italic text-xs text-white/90 font-serif-editorial" style={{ borderColor: modeDetails.borderColor }}>
                  {v.quote}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* PHILOSOPHY & MANIFESTO TABS */}
        <section className="p-10 border rounded-2xl shadow-2xl mb-16" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
          <div className="flex border-b mb-8 overflow-x-auto" style={{ borderColor: modeDetails.borderColor }}>
            {[
              { id: 'ethos', label: '01. THE ATELIER ETHOS' },
              { id: 'craft', label: '02. TACTILE CRAFTSMANSHIP' },
              { id: 'future', label: '03. THE FUTURE ARCHIVE' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 text-xs font-mono tracking-[0.2em] uppercase transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id ? 'font-bold' : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  color: activeTab === tab.id ? modeDetails.accentColor : '#D6CEBE',
                  borderColor: activeTab === tab.id ? modeDetails.accentColor : 'transparent'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'ethos' && (
              <motion.div key="ethos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 max-w-3xl">
                <span className="text-xs font-mono uppercase tracking-[0.3em] font-bold" style={{ color: modeDetails.accentColor }}>
                  OUR CORE MISSION
                </span>
                <h3 className={`${modeDetails.fontClass || 'font-serif-editorial'} text-3xl font-bold text-white uppercase`}>
                  UNTANGLING FASHION FROM THE TRANSIENT
                </h3>
                <p className="text-xs text-[#D6CEBE]/90 font-light leading-relaxed font-mono">
                  Fast fashion discards heritage in favor of speed. FRIENDS OF 4 exists as a permanent counter-narrative. Every garment drop is limited, numbered, and constructed with heavy organic yarns, raw un-dyed handloom threads, and architectural seams designed to withstand decades.
                </p>
              </motion.div>
            )}

            {activeTab === 'craft' && (
              <motion.div key="craft" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 max-w-3xl">
                <span className="text-xs font-mono uppercase tracking-[0.3em] font-bold" style={{ color: modeDetails.accentColor }}>
                  HANDLOOMS & BLUEPRINTS
                </span>
                <h3 className={`${modeDetails.fontClass || 'font-serif-editorial'} text-3xl font-bold text-white uppercase`}>
                  SYNTHESIS OF HERITAGE & MODERN BLUEPRINTS
                </h3>
                <p className="text-xs text-[#D6CEBE]/90 font-light leading-relaxed font-mono">
                  We bridge the ancient looms of Varanasi and Kanchipuram with modern CAD blueprints. From 400 GSM French Terry streetwear hoodies to 24-karat silver zari handloom sarees, our creations respect the hands that build them.
                </p>
              </motion.div>
            )}

            {activeTab === 'future' && (
              <motion.div key="future" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 max-w-3xl">
                <span className="text-xs font-mono uppercase tracking-[0.3em] font-bold" style={{ color: modeDetails.accentColor }}>
                  GLOBAL D2C LUXURY
                </span>
                <h3 className={`${modeDetails.fontClass || 'font-serif-editorial'} text-3xl font-bold text-white uppercase`}>
                  BUILDING INDIA'S PREMIER INDEPENDENT FASHION HOUSE
                </h3>
                <p className="text-xs text-[#D6CEBE]/90 font-light leading-relaxed font-mono">
                  No middlemen. No inflated retail markups. Direct from artisan workshops to fashion connoisseurs across India and worldwide, complete with 24-hour unboxing guarantees and GST compliance.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

      </div>

      <Footer />
    </main>
  )
}
