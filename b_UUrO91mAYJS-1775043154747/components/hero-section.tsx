'use client'

import React, { useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useMode } from '@/context/mode-context'
import TechText from '@/components/TechText'
import TrueFocus from '@/components/TrueFocus'
import VariableProximity from '@/components/VariableProximity'

export function HeroSection() {
  const { mode, modeDetails } = useMode()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Scroll driven transforms for texture expansion & bright door opening animation
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  // Door opening & brightness transforms on scroll
  const leftDoorX = useTransform(scrollYProgress, [0, 0.75], ["0%", "-100%"])
  const rightDoorX = useTransform(scrollYProgress, [0, 0.75], ["0%", "100%"])
  const centerLightScale = useTransform(scrollYProgress, [0, 0.7], [0.6, 1.8])
  const centerLightOpacity = useTransform(scrollYProgress, [0, 0.4, 0.8], [0.4, 1, 0.8])
  const centerF4Scale = useTransform(scrollYProgress, [0, 0.75], [0.85, 1.4])
  const centerF4Opacity = useTransform(scrollYProgress, [0, 0.3, 0.8], [0.6, 1, 0.9])

  // Dedicated video animation clips for each mode
  const modeHeroData = {
    streetwear: {
      video: 'https://cdn.coverr.co/videos/coverr-fashion-model-walking-in-streetwear-outfit-5182/1080p.mp4',
      videoAlt: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-streetwear-outfit-41549-large.mp4',
      tagline: 'BRUTALIST STREETWEAR & HEAVYWEIGHT CUTS',
      heading: 'BRUTALIST HERITAGE IN HIGH-DENSITY WEAVE',
      subheading: 'Heavyweight organic cotton tees, raw hems, and Dravidian CAD schematics.',
      badge: '300-450 GSM COTTON'
    },
    archive: {
      video: 'https://cdn.coverr.co/videos/coverr-model-in-haute-couture-fashion-runway-8193/1080p.mp4',
      videoAlt: 'https://assets.mixkit.co/videos/preview/mixkit-model-posing-in-a-futuristic-fashion-outfit-39881-large.mp4',
      tagline: 'STATEMENT LIMITED DROPS & 24KT GOLD ART',
      heading: 'ROYAL VAULT ARTISANSHIP BEYOND TIME',
      subheading: 'Avant-garde Indian luxury fashion merging ancient temple architecture with 24kt gold zari tailoring.',
      badge: '24KT GOLD ZARI'
    },
    traditional: {
      video: 'https://cdn.coverr.co/videos/coverr-woman-wearing-traditional-silk-fabric-7492/1080p.mp4',
      videoAlt: 'https://assets.mixkit.co/videos/preview/mixkit-woman-in-a-traditional-dress-walking-in-a-park-41315-large.mp4',
      tagline: 'CONTEMPORARY ETHNIC WEAR & ARCHITECTURAL SAREES',
      heading: 'POETRY IN SILK: HAUTE TRADITIONAL COUTURE',
      subheading: 'Pure Kanjeevaram Mulberry silk, solid gold zari inlays, and step-well flared lehengas.',
      badge: 'KANJEEVARAM SILK'
    }
  }

  const currentHero = modeHeroData[mode]

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load()
      videoRef.current.play().catch(() => {})
    }
  }, [mode])

  return (
    <section 
      ref={containerRef}
      className="relative w-full min-h-screen text-[#F4F1EA] overflow-hidden flex flex-col justify-start pt-44 sm:pt-48 lg:pt-40 transition-colors duration-700 ease-in-out dark-paper-texture"
      style={{ backgroundColor: modeDetails.themeBg }}
    >
      {/* 60FPS ANIMATED BLUEPRINT GRID BACKDROP */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke={modeDetails.accentColor} strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* VIDEO ANIMATION BACKGROUND WITH MODE SWITCH ANIMATION */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`hero-video-${mode}`}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.6, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0 overflow-hidden"
        >
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover object-center filter brightness-95 contrast-110"
          >
            <source src={currentHero.video} type="video/mp4" />
            <source src={currentHero.videoAlt} type="video/mp4" />
          </video>

          {/* VIGNETTE GRADIENTS FOR HIGH-CONTRAST READABILITY */}
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${modeDetails.themeBg}, transparent 70%, ${modeDetails.themeBg})`
            }} 
          />
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, ${modeDetails.themeBg} 85%, transparent, ${modeDetails.themeBg} 85%)`
            }} 
          />
        </motion.div>
      </AnimatePresence>

      {/* SUBTLE CENTRAL LIGHT AURA */}
      <motion.div
        className="absolute z-1 pointer-events-none w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full filter blur-2xl opacity-40"
        style={{
          scale: centerLightScale,
          opacity: centerLightOpacity,
          background: `radial-gradient(circle at center, ${modeDetails.glowColor} 0%, transparent 70%)`
        }}
      />

      {/* MATTE OBSIDIAN LEFT DOOR PANEL */}
      <motion.div 
        className="absolute top-0 bottom-0 left-0 w-1/2 z-10 pointer-events-none shadow-[5px_0_20px_rgba(0,0,0,0.8)]"
        style={{
          x: leftDoorX,
          background: `linear-gradient(to right, ${modeDetails.themeBg}, rgba(0,0,0,0.8), transparent)`,
          borderRight: `1px solid ${modeDetails.borderColor}`
        }}
      />

      {/* MATTE OBSIDIAN RIGHT DOOR PANEL */}
      <motion.div 
        className="absolute top-0 bottom-0 right-0 w-1/2 z-10 pointer-events-none shadow-[-5px_0_20px_rgba(0,0,0,0.8)]"
        style={{
          x: rightDoorX,
          background: `linear-gradient(to left, ${modeDetails.themeBg}, rgba(0,0,0,0.8), transparent)`,
          borderLeft: `1px solid ${modeDetails.borderColor}`
        }}
      />

      {/* REFINED MATTE ARCHIVAL F4 EMBLEM WATERMARK */}
      <motion.div
        style={{ scale: centerF4Scale, opacity: centerF4Opacity }}
        className="absolute z-2 pointer-events-none flex flex-col items-center justify-center select-none"
      >
        <span 
          className="font-serif-editorial text-[20vw] sm:text-[16vw] font-light tracking-[0.2em] uppercase opacity-40 transition-colors duration-700"
          style={{ color: modeDetails.accentColor }}
        >
          F4
        </span>
        <span 
          className="text-[9px] sm:text-[10px] font-mono tracking-[0.5em] uppercase font-semibold -mt-6 transition-colors duration-700"
          style={{ color: modeDetails.accentColor }}
        >
          FRIENDS OF 4 • ARCHIVAL VAULT
        </span>
      </motion.div>

      {/* LAT / LON VERTICAL STAMP (LEFT) */}
      <div 
        className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 z-10 writing-vertical text-[9px] tracking-[0.4em] uppercase opacity-70 font-mono transition-colors duration-700"
        style={{ color: modeDetails.accentColor }}
      >
        LAT 12.9716° N / LON 77.5946° E • SPEC 0.4
      </div>

      {/* RELOCATED SLEEK SIDE SCROLL INDICATOR (RIGHT SIDE) */}
      <div className="hidden lg:flex fixed right-8 bottom-12 z-40 flex-col items-center space-y-3 font-mono">
        <div 
          className="writing-vertical text-[10px] tracking-[0.3em] uppercase font-bold transition-colors duration-700"
          style={{ color: modeDetails.accentColor }}
        >
          SCROLL TO EXPLORE
        </div>
        <div 
          className="w-[1.5px] h-12 animate-pulse" 
          style={{ background: `linear-gradient(to bottom, ${modeDetails.accentColor}, transparent)` }}
        />
      </div>

      {/* HERO MAIN CONTENT */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center pt-2 sm:pt-4 pb-12">
        
        {/* MODE BADGE */}
        <motion.div
          key={`badge-${mode}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2.5 px-4 py-1.5 backdrop-blur-md rounded-full mb-6 transition-all duration-700"
          style={{
            backgroundColor: 'rgba(0,0,0,0.6)',
            border: `1px solid ${modeDetails.borderColor}`
          }}
        >
          <span 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: modeDetails.accentColor }} 
          />
          <span 
            className="text-[10px] tracking-[0.3em] uppercase font-medium font-sans"
            style={{ color: modeDetails.accentColor }}
          >
            {currentHero.tagline}
          </span>
        </motion.div>

        {/* HIGH-CONTRAST EDITORIAL HEADING - DYNAMIC MODE TYPOGRAPHY */}
        <motion.div
          key={`heading-${mode}`}
          role="heading"
          aria-level={1}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-serif-editorial text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-[0.04em] leading-[1.05] text-[#F4F1EA] max-w-4xl w-full flex items-center justify-center"
        >
          {mode === 'streetwear' ? (
            <div className="w-full flex flex-col items-center justify-center -space-y-2 sm:-space-y-4 md:-space-y-6 max-w-5xl">
              <div className="w-full h-[50px] sm:h-[85px] md:h-[110px] lg:h-[130px] relative">
                <TechText
                  text="BRUTALIST"
                  fontWeight={700}
                  fontSize={180}
                  letterSpacing={-0.02}
                  color="#F4F1EA"
                  accentColor={modeDetails.accentColor}
                  reach={240}
                  softness={0.7}
                  dashLength={4}
                  dashGap={2}
                  strokeWidth={2}
                  lineStyle="dashed"
                  reveal="letter"
                  specks={20}
                  selection
                  labels
                  draggable
                  sweep={false}
                  speed={1}
                />
              </div>
              <div className="w-full h-[50px] sm:h-[85px] md:h-[110px] lg:h-[130px] relative">
                <TechText
                  text="HERITAGE IN HIGH-"
                  fontWeight={700}
                  fontSize={180}
                  letterSpacing={-0.02}
                  color="#F4F1EA"
                  accentColor={modeDetails.accentColor}
                  reach={240}
                  softness={0.7}
                  dashLength={4}
                  dashGap={2}
                  strokeWidth={2}
                  lineStyle="dashed"
                  reveal="letter"
                  specks={20}
                  selection
                  labels
                  draggable
                  sweep={false}
                  speed={1}
                />
              </div>
              <div className="w-full h-[50px] sm:h-[85px] md:h-[110px] lg:h-[130px] relative">
                <TechText
                  text="DENSITY WEAVE"
                  fontWeight={700}
                  fontSize={180}
                  letterSpacing={-0.02}
                  color="#F4F1EA"
                  accentColor={modeDetails.accentColor}
                  reach={240}
                  softness={0.7}
                  dashLength={4}
                  dashGap={2}
                  strokeWidth={2}
                  lineStyle="dashed"
                  reveal="letter"
                  specks={20}
                  selection
                  labels
                  draggable
                  sweep={false}
                  speed={1}
                />
              </div>
            </div>
          ) : mode === 'archive' ? (
            <div className="w-full py-4 flex items-center justify-center">
              <TrueFocus 
                sentence={currentHero.heading}
                manualMode={false}
                blurAmount={5}
                borderColor={modeDetails.accentColor}
                glowColor={modeDetails.glowColor}
                animationDuration={0.6}
                pauseBetweenAnimations={1}
              />
            </div>
          ) : (
            <VariableProximity
              label={currentHero.heading}
              fromFontVariationSettings="'wght' 300, 'opsz' 12"
              toFontVariationSettings="'wght' 900, 'opsz' 40"
              containerRef={containerRef}
              radius={160}
              falloff="linear"
            />
          )}
        </motion.div>

        {/* SUBHEADING STATEMENT */}
        <motion.p
          key={`subheading-${mode}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-xs sm:text-sm md:text-base text-[#D6CEBE]/80 max-w-xl font-light tracking-wide leading-relaxed"
        >
          {currentHero.subheading}
        </motion.p>

        {/* SINGLE CLEAN CTA BUTTON */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex items-center justify-center w-full max-w-xs"
        >
          <Link
            href="/shop"
            className="w-full px-8 py-4 font-bold text-xs tracking-[0.25em] uppercase transition-all duration-300 shadow-xl text-center hover:brightness-110"
            style={{
              backgroundColor: modeDetails.accentColor,
              color: modeDetails.themeBg,
              border: `1px solid ${modeDetails.accentColor}`
            }}
          >
            THE HERITAGE BLUEPRINT
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
