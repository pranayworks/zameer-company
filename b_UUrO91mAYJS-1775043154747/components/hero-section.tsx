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
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  }

  return (
    <section className="relative min-h-[900px] lg:h-[1024px] w-full pt-32 pb-24 overflow-hidden bg-[#0a0a0a]">
      <motion.div
        className="relative z-10 h-full flex flex-col-reverse lg:flex-row items-center justify-between px-8 md:px-12 lg:px-24 max-w-[1920px] mx-auto gap-16 lg:gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Text Content */}
        <div className="flex-1 flex flex-col justify-center items-center lg:items-start text-center lg:text-left z-10 w-full">
          <motion.span
            variants={itemVariants}
            className="font-body uppercase tracking-[0.4em] text-[10px] md:text-xs mb-6 text-[#a3851a] font-bold"
          >
            Friends of 4 Collection
          </motion.span>

          <motion.h1
            variants={itemVariants}
            className="font-headline text-6xl md:text-7xl lg:text-8xl text-[#fdf9f2] mb-8 leading-[1.05] max-w-3xl"
          >
            Style for Every Generation.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="font-body text-base lg:text-lg text-white/50 mb-12 max-w-xl leading-relaxed"
          >
            From traditional elegance to modern trends, curated for the artisanal home. Step into a world where premium craftsmanship meets timeless tradition.
          </motion.p>

          <Link 
            href="/men" 
            className="bg-[#e2bb53] text-[#1c1c18] px-12 py-5 font-body uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-white transition-all shadow-[0_0_30px_rgba(226,187,83,0.15)] hover:shadow-[0_0_40px_rgba(226,187,83,0.3)] hover:-translate-y-1 block md:inline-block"
          >
            <motion.span variants={itemVariants}>
              Discover The Collection
            </motion.span>
          </Link>
        </div>

        {/* New 'Friends of 4' Heritage Crest */}
        <div className="flex-1 w-full flex justify-center items-center lg:justify-end relative">
          <motion.div 
            variants={itemVariants} 
            className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px] lg:w-[700px] lg:h-[700px]"
          >
            <Image
              src="/hero-logo.png"
              alt="Friends of 4 Heritage Crest"
              fill
              className="object-contain opacity-100 scale-100 lg:scale-[1.1]"
              priority
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Floating animation */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 hidden lg:block"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <span className="material-symbols-outlined text-white/30 text-3xl">expand_more</span>
      </motion.div>
    </section>
  )
}
