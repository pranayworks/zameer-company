'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
    },
  }

  return (
    <section className="relative min-h-[720px] md:min-h-[920px] lg:h-[100vh] max-h-[1080px] w-full pt-28 md:pt-36 pb-16 md:pb-24 overflow-hidden bg-[#0B0C10] flex items-center">
      {/* LUXURY AMBIENT SPOTLIGHT GLOWS */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-[#0A3C2F]/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_70%)] pointer-events-none" />

      <motion.div
        className="relative z-10 h-full flex flex-col-reverse lg:flex-row items-center justify-between px-6 md:px-12 lg:px-24 max-w-[1920px] mx-auto gap-12 lg:gap-16 w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Text Content */}
        <div className="flex-1 flex flex-col justify-center items-center lg:items-start text-center lg:text-left z-10 w-full">
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 backdrop-blur-md mb-8 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
          >
            <span className="w-2 h-2 rounded-full bg-[#E5C158] animate-pulse" />
            <span className="font-body uppercase tracking-[0.35em] text-[10px] md:text-xs text-[#F3E5AB] font-bold">
              ATELIER HERITAGE • EST. 1992
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-headline text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white mb-8 leading-[1.05] tracking-tight max-w-3xl font-extrabold"
          >
            Style For Every <span className="text-gold-gradient italic font-serif">Generation.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="font-body text-base lg:text-lg text-white/70 mb-12 max-w-xl leading-relaxed font-light"
          >
            From handcrafted royal sarees to contemporary menswear & heritage jewellery. Step into an extraordinary world where artisanal tradition meets modern haute couture.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
            <Link 
              href="#categories" 
              className="gold-satin text-[#0B0C10] px-10 py-4.5 rounded-xl font-body uppercase tracking-[0.25em] text-[11px] font-black hover:scale-105 transition-all shadow-[0_10px_35px_rgba(212,175,55,0.3)] block sm:inline-block text-center"
            >
              Discover The Archive
            </Link>
            <Link 
              href="/sarees" 
              className="px-10 py-4.5 rounded-xl font-body uppercase tracking-[0.25em] text-[11px] font-bold text-white border border-white/20 hover:border-[#D4AF37] hover:text-[#F3E5AB] bg-white/5 backdrop-blur-md transition-all block sm:inline-block text-center"
            >
              Explore Sarees
            </Link>
          </motion.div>
        </div>

        {/* 'Friends of 4' Heritage Crest */}
        <div className="flex-1 w-full flex justify-center items-center lg:justify-end relative">
          <motion.div 
            variants={itemVariants} 
            className="relative w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] md:w-[520px] md:h-[520px] lg:w-[680px] lg:h-[680px] drop-shadow-[0_20px_50px_rgba(212,175,55,0.25)]"
          >
            <Image
              src="/hero-logo.png"
              alt="Friends of 4 Heritage Crest"
              fill
              className="object-contain filter brightness-110 contrast-105"
              priority
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Floating Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 hidden lg:flex flex-col items-center gap-2 cursor-pointer"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-[9px] uppercase tracking-[0.3em] text-[#D4AF37] font-bold">Explore</span>
        <span className="material-symbols-outlined text-[#D4AF37] text-2xl">expand_more</span>
      </motion.div>
    </section>
  )
}

