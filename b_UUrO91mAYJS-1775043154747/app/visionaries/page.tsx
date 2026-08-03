'use client'

import { Header } from '@/components/header'
import { AboutSection } from '@/components/about-section'
import { WhyChooseUs } from '@/components/why-choose-us'
import { Footer } from '@/components/footer'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function VisionariesPage() {
  return (
    <main className="w-full bg-[#FAF7F2]">
      <Header />
      
      {/* Hero Banner for Visionaries Page */}
      <section className="relative h-[65vh] min-h-[550px] flex items-center justify-center overflow-hidden bg-[#0B0C10]">
        <div className="absolute inset-0 opacity-30">
           <Image 
            src="https://images.unsplash.com/photo-1558444458-544510403dc6?q=80&w=2670&auto=format&fit=crop" 
            alt="Handmade textile craftsmanship" 
            fill
            className="object-cover filter contrast-125"
            priority
           />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-transparent to-[#0B0C10]/60" />

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 backdrop-blur-md mb-6 shadow-xl"
          >
            <span className="font-body uppercase tracking-[0.35em] text-[10px] md:text-xs text-[#F3E5AB] font-bold">
              A HERITAGE DEFINED BY CRAFT
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="font-headline text-6xl md:text-8xl text-white font-extrabold mb-6 tracking-tight"
          >
            The <span className="text-gold-gradient italic font-serif">Visionaries</span>
          </motion.h1>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
           <span className="font-body text-[9px] uppercase tracking-[0.4em] text-[#D4AF37] font-bold">Scroll to Explore</span>
           <div className="w-px h-12 bg-gradient-to-b from-[#D4AF37] to-transparent animate-pulse" />
        </div>
      </section>

      <AboutSection />
      <WhyChooseUs />
      
      {/* Editorial Quote Section */}
      <section className="py-32 bg-[#FAF7F2] border-t border-[#D4AF37]/20 flex items-center justify-center text-center px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl relative z-10">
           <span className="material-symbols-outlined text-[#D4AF37] text-5xl mb-6 block">format_quote</span>
           <h2 className="font-headline text-3xl md:text-5xl text-[#12131A] italic leading-tight mb-8 font-serif font-light">
             "Our mission is to untangle fashion from the transient and reconnect it with the permanent. Every piece is a living dialogue between the weavers of the past and the visionaries of tomorrow."
           </h2>
           <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mb-6" />
           <p className="font-body uppercase tracking-[0.35em] text-[10px] text-[#6E727A] font-extrabold">The Atelier Ethos</p>
        </div>
      </section>

      <Footer />
    </main>
  )
}

