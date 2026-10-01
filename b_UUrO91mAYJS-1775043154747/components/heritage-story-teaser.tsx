'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useMode } from '@/context/mode-context'

export function HeritageStoryTeaser() {
  const { mode, modeDetails } = useMode()
  const [activeTab, setActiveTab] = useState<'architecture' | 'blueprint'>('architecture')

  // Dynamic manifesto & story specs per active mode
  const modeStoryData = {
    streetwear: {
      badge: 'SPECIFICATION 0.4 • BRUTALIST ANALYSIS',
      quote: '"Every seam is a structural beam. Every thread is high-density CAD geometry."',
      description: 'Our streetwear studio translates ancient Dravidian temple pillar ratios into technical vector schematics. We engineer heavyweight 300–450 GSM organic comb cotton tees, raw hems, and brutalist silhouettes built for urban permanence.',
      tab1Label: '01. DRAVIDIAN TEMPLE ARCHITECTURE',
      tab2Label: '02. TECHNICAL CAD BLUEPRINT',
      stat1: '450 GSM',
      stat1Sub: 'Heavy Loopback Fleece',
      stat2: '100% CAD',
      stat2Sub: 'Blueprint Vector Precision',
      image1: '/dravidian_temple_architecture.jpg',
      image1Title: 'Dravidian Temple Pillar Geometry (Streetwear Blueprint)',
      image2: '/technical_cad_blueprint.jpg',
      image2Title: 'High-Density CAD Vector Seam Calculations'
    },
    archive: {
      badge: 'SPECIFICATION 0.4 • HERITAGE ANALYSIS',
      quote: '"Every pleat is a column capital. Every stitch is a mortar joint."',
      description: 'Our couture atelier collaborates with master stonemasons and 7th-generation Varanasi weavers. By converting 12th-century stone temple motifs into 24kt gold zari schematics, we engineer garments with sculptural weight and tactile permanence.',
      tab1Label: '01. ANCIENT TEMPLE STONE',
      tab2Label: '02. 24KT GOLD HANDLOOM',
      stat1: '180+ HOURS',
      stat1Sub: 'Hand Loom Weave Time',
      stat2: '24KT GOLD',
      stat2Sub: 'Authentic Zari Thread Inlay',
      image1: '/dravidian_temple_architecture.jpg',
      image1Title: 'Dravidian Pillar Geometry (Varanasi Archive Vault)',
      image2: '/technical_cad_blueprint.jpg',
      image2Title: '24kt Gold Zari Structural Drafting'
    },
    traditional: {
      badge: 'SPECIFICATION 0.4 • TRADITIONAL COUTURE',
      quote: '"Poetry in Mulberry Silk. Sacred geometry woven into timeless Indian heritage."',
      description: 'Celebrating the timeless art of Kanjeevaram Mulberry silk weaving and Korvai handloom craft. Heritage Gopuram temple borders engineered with architectural flare for contemporary royal couture.',
      tab1Label: '01. KANJEEVARAM HERITAGE SILK',
      tab2Label: '02. ARCHITECTURAL SAREE BORDER',
      stat1: '6.3 METERS',
      stat1Sub: 'Pure Mulberry Silk',
      stat2: 'KORVAI WEAVE',
      stat2Sub: 'Hand-Jointed Temple Border',
      image1: '/dravidian_temple_architecture.jpg',
      image1Title: 'Kanjeevaram Temple Border & Dravidian Art',
      image2: '/technical_cad_blueprint.jpg',
      image2Title: 'Korvai Border Weaving Specification'
    }
  }

  const currentStory = modeStoryData[mode] || modeStoryData.archive

  return (
    <section 
      id="story" 
      className="py-24 text-[#F4F1EA] border-t relative overflow-hidden transition-colors duration-700 ease-in-out dark-paper-texture"
      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: modeDetails.accentColor }} />
            <span className={`text-[10px] tracking-[0.4em] uppercase font-semibold transition-colors duration-500 ${modeDetails.fontClass}`} style={{ color: modeDetails.accentColor }}>
              THE PHILOSOPHY OF FRIENDS OF 4 • {mode.toUpperCase()}
            </span>
          </div>
          <h2 className={`${modeDetails.fontClass || 'font-serif-editorial'} text-4xl sm:text-6xl tracking-[0.08em] font-light uppercase text-[#F4F1EA]`}>
            ARCHITECTURE TO APPAREL
          </h2>
          <p className="text-xs sm:text-sm text-[#D6CEBE]/80 font-light leading-relaxed">
            We do not manufacture fast fashion. We dissect centuries-old Dravidian temple pillar proportions, sacred geometry math, and handloom traditions to formulate technical streetwear and archival luxury silhouettes.
          </p>
        </div>

        {/* INTERACTIVE COMPARISON VIEWER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LEFT: TEXT MANIFESTO & INTERACTIVE TAB SWITCH */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div 
                className="inline-block px-3 py-1 text-[10px] tracking-[0.3em] font-mono uppercase border rounded"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: modeDetails.accentColor, borderColor: modeDetails.borderColor }}
              >
                {currentStory.badge}
              </div>
              <h3 className={`${modeDetails.fontClass || 'font-serif-editorial'} text-2xl sm:text-3xl text-[#F4F1EA] tracking-[0.05em] leading-tight font-bold`}>
                {currentStory.quote}
              </h3>
              <p className="text-xs text-[#D6CEBE]/80 leading-relaxed font-light">
                {currentStory.description}
              </p>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex border p-1 rounded-lg" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
              <button
                onClick={() => setActiveTab('architecture')}
                className={`flex-1 py-3 text-[10px] sm:text-xs tracking-[0.15em] uppercase transition-all rounded ${modeDetails.fontClass}`}
                style={{
                  backgroundColor: activeTab === 'architecture' ? modeDetails.accentColor : 'transparent',
                  color: activeTab === 'architecture' ? modeDetails.themeBg : '#D6CEBE',
                  fontWeight: activeTab === 'architecture' ? 700 : 400
                }}
              >
                {currentStory.tab1Label}
              </button>
              <button
                onClick={() => setActiveTab('blueprint')}
                className={`flex-1 py-3 text-[10px] sm:text-xs tracking-[0.15em] uppercase transition-all rounded ${modeDetails.fontClass}`}
                style={{
                  backgroundColor: activeTab === 'blueprint' ? modeDetails.accentColor : 'transparent',
                  color: activeTab === 'blueprint' ? modeDetails.themeBg : '#D6CEBE',
                  fontWeight: activeTab === 'blueprint' ? 700 : 400
                }}
              >
                {currentStory.tab2Label}
              </button>
            </div>

            {/* SPECS STATS GRID */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t font-mono text-xs" style={{ borderColor: modeDetails.borderColor }}>
              <div>
                <p className="font-bold text-sm" style={{ color: modeDetails.accentColor }}>{currentStory.stat1}</p>
                <p className="text-[10px] text-[#D6CEBE]/60 uppercase mt-0.5">{currentStory.stat1Sub}</p>
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: modeDetails.accentColor }}>{currentStory.stat2}</p>
                <p className="text-[10px] text-[#D6CEBE]/60 uppercase mt-0.5">{currentStory.stat2Sub}</p>
              </div>
            </div>
          </div>

          {/* RIGHT: DUAL IMAGE VISUAL DISPLAY */}
          <div className="lg:col-span-7 relative h-[520px] border overflow-hidden group rounded-lg shadow-2xl" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
            {activeTab === 'architecture' ? (
              <motion.div
                key="arch"
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative w-full h-full"
              >
                <Image
                  src={currentStory.image1}
                  alt={currentStory.image1Title}
                  fill
                  priority
                  className="object-cover filter contrast-115 brightness-95"
                />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${modeDetails.themeBg}, transparent 60%)` }} />
                <div className="absolute bottom-6 left-6 right-6 p-4 border backdrop-blur-md rounded shadow-xl" style={{ backgroundColor: 'rgba(0,0,0,0.85)', borderColor: modeDetails.borderColor }}>
                  <p className={`text-[10px] tracking-[0.2em] uppercase font-bold ${modeDetails.fontClass}`} style={{ color: modeDetails.accentColor }}>
                    SOURCE ARCHITECTURE & CRAFT
                  </p>
                  <p className={`${modeDetails.fontClass || 'font-serif-editorial'} text-base sm:text-lg text-[#F4F1EA] font-semibold mt-0.5`}>
                    {currentStory.image1Title}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="blue"
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative w-full h-full"
              >
                <Image
                  src={currentStory.image2}
                  alt={currentStory.image2Title}
                  fill
                  className="object-cover filter brightness-110 contrast-150"
                />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${modeDetails.themeBg}, transparent 60%)` }} />
                <div className="absolute bottom-6 left-6 right-6 p-4 border backdrop-blur-md rounded shadow-xl" style={{ backgroundColor: 'rgba(0,0,0,0.85)', borderColor: modeDetails.borderColor }}>
                  <p className={`text-[10px] tracking-[0.2em] uppercase font-bold ${modeDetails.fontClass}`} style={{ color: modeDetails.accentColor }}>
                    GARMENT CONSTRUCTION BLUEPRINT
                  </p>
                  <p className={`${modeDetails.fontClass || 'font-serif-editorial'} text-base sm:text-lg text-[#F4F1EA] font-semibold mt-0.5`}>
                    {currentStory.image2Title}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
