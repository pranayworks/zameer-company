'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useMode, BrandMode } from '@/context/mode-context'

export function ThreeWorldEntry() {
  const { setMode, modeDetails } = useMode()

  const worlds: {
    id: BrandMode
    title: string
    subtitle: string
    tag: string
    image: string
    specs: string
  }[] = [
    {
      id: 'streetwear',
      title: 'STREETWEAR',
      subtitle: 'Brutalist cuts, heavyweight 300-450 GSM boxy tees, French Terry hoodies & blueprint CAD prints.',
      tag: 'WORLD 01 // MODERN',
      image: '/men_layering_editorial_1775057354438.png',
      specs: '300-450 GSM • DROPPED SHOULDERS • RAW HEMS'
    },
    {
      id: 'archive',
      title: 'LUXURY ARCHIVE',
      subtitle: 'Statement limited drops, 24kt gold zari embroideries, raw silk monolith coats & museum prints.',
      tag: 'WORLD 02 // SCULPTURAL',
      image: '/media__1775044228708.png',
      specs: 'VARANASI MULBERRY SILK • 24KT GOLD ZARI • LIMITED 50'
    },
    {
      id: 'traditional',
      title: 'TRADITIONAL',
      subtitle: 'Contemporary ethnic wear, Dravidian temple border sarees, short kurtas & flared lehengas.',
      tag: 'WORLD 03 // HERITAGE',
      image: '/saree_1.png',
      specs: 'PURE KANJEEVARAM SILK • TEMPLE GOPURAM BORDERS'
    }
  ]

  return (
    <section 
      className="py-24 text-[#F4F1EA] border-t transition-colors duration-700 ease-in-out dark-paper-texture"
      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SECTION HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b pb-8" style={{ borderColor: modeDetails.borderColor }}>
          <div>
            <span className="text-[10px] tracking-[0.4em] uppercase font-medium transition-colors duration-500" style={{ color: modeDetails.accentColor }}>
              EXPLORE THE ECOSYSTEM
            </span>
            <h2 className="font-serif-editorial text-3xl sm:text-5xl tracking-[0.1em] font-light uppercase text-[#F4F1EA] mt-2">
              THREE CURATED WORLDS
            </h2>
          </div>
          <p className="text-xs text-[#D6CEBE]/70 max-w-md mt-4 md:mt-0 font-light leading-relaxed">
            Shift your shopping universe between brutalist streetwear, statement museum archive pieces, and contemporary Dravidian traditional wear.
          </p>
        </div>

        {/* 3 VERTICAL CARDS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {worlds.map((world, idx) => (
            <motion.div
              key={world.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: idx * 0.15 }}
              className="group relative overflow-hidden flex flex-col justify-between h-[580px] transition-all duration-500 rounded-lg shadow-xl"
              style={{
                backgroundColor: modeDetails.cardBg,
                border: `1px solid ${modeDetails.borderColor}`
              }}
            >
              {/* CARD IMAGE WITH HOVER ZOOM */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={world.image}
                  alt={world.title}
                  fill
                  className="object-cover object-top opacity-50 group-hover:opacity-75 group-hover:scale-105 transition-all duration-700 filter brightness-90"
                />
                <div 
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to top, ${modeDetails.themeBg}, transparent 60%)`
                  }} 
                />
              </div>

              {/* TOP CARD STAMP */}
              <div className="relative z-10 p-6 flex justify-between items-start">
                <span 
                  className="text-[9px] tracking-[0.3em] font-mono px-3 py-1 border backdrop-blur-md rounded"
                  style={{ 
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: modeDetails.accentColor,
                    borderColor: modeDetails.borderColor
                  }}
                >
                  {world.tag}
                </span>
                <span className="text-xs text-[#D6CEBE]/60 font-mono">
                  0{idx + 1} / 03
                </span>
              </div>

              {/* BOTTOM CARD CONTENT */}
              <div 
                className="relative z-10 p-8 space-y-4"
                style={{
                  background: `linear-gradient(to top, ${modeDetails.themeBg} 90%, transparent)`
                }}
              >
                <p className="text-[9px] tracking-[0.25em] font-mono text-[#D6CEBE]/60 uppercase">
                  {world.specs}
                </p>
                <h3 className="font-serif-editorial text-3xl sm:text-4xl tracking-[0.1em] font-light text-[#F4F1EA]">
                  {world.title}
                </h3>
                <p className="text-xs text-[#D6CEBE]/80 leading-relaxed font-light">
                  {world.subtitle}
                </p>

                <div className="pt-2 flex items-center space-x-4">
                  <Link
                    href="/shop"
                    onClick={() => setMode(world.id)}
                    className="flex-1 text-center py-3 font-semibold text-xs tracking-[0.2em] uppercase transition-all duration-300 rounded shadow"
                    style={{
                      backgroundColor: modeDetails.accentColor,
                      color: modeDetails.themeBg
                    }}
                  >
                    ENTER {world.title}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
