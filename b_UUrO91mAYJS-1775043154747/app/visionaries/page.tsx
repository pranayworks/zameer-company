'use client'

import { Header } from '@/components/header'
import { AboutSection } from '@/components/about-section'
import { WhyChooseUs } from '@/components/why-choose-us'
import { Footer } from '@/components/footer'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function VisionariesPage() {
  return (
    <main className="w-full bg-[#fdf9f2]">
      <Header />
      
      {/* Hero Banner for Visionaries Page */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-[#1c1b1b]">
        <div className="absolute inset-0 opacity-40">
           <Image 
            src="https://images.unsplash.com/photo-1558444458-544510403dc6?q=80&w=2670&auto=format&fit=crop" 
            alt="Handmade textile craftsmanship" 
            fill
            className="object-cover"
            priority
           />
        </div>
        <div className="relative z-10 text-center px-6">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-body uppercase tracking-[0.4em] text-[10px] md:text-xs text-[#a3851a] font-bold mb-6"
          >
            A Heritage Defined
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="font-headline text-6xl md:text-8xl text-white mb-8"
          >
            The Visionaries
          </motion.h1>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
           <span className="font-body text-[8px] uppercase tracking-[0.5em] text-white/40">Scroll to Explore</span>
           <div className="w-px h-12 bg-gradient-to-b from-[#a3851a] to-transparent animate-pulse" />
        </div>
      </section>

      <AboutSection />
      <WhyChooseUs />
      
      {/* Editorial Quote Section */}
      <section className="py-32 bg-white flex items-center justify-center text-center px-12">
        <div className="max-w-3xl">
           <span className="material-symbols-outlined text-[#a3851a] text-4xl mb-8">format_quote</span>
           <h2 className="font-headline text-4xl md:text-5xl text-[#1c1c18] italic leading-tight mb-8">
             "Our mission is to untangle fashion from the transient and reconnect it with the permanent. Every piece is a dialogue between the weavers of the past and the visionaries of tomorrow."
           </h2>
           <div className="w-16 h-px bg-[#a3851a] mx-auto mb-6" />
           <p className="font-body uppercase tracking-[0.3em] text-[10px] text-[#747878] font-bold">The Atelier Ethos</p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
