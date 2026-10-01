'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import { useMode } from '@/context/mode-context'

export function ScrollTriggeredCards() {
  const { mode, modeDetails } = useMode()

  const cardData = {
    streetwear: [
      { id: 1, title: 'Gopuram Blueprint Tee', gsm: '300 GSM', price: '₹4,800', image: '/men_layering_editorial_1775057354438.png', hueA: 40, hueB: 15 },
      { id: 2, title: 'Nandi Monolith Hoodie', gsm: '450 GSM', price: '₹8,900', image: '/men_hero_new.png', hueA: 30, hueB: 50 },
      { id: 3, title: 'Raw Sand Cargo Pants', gsm: '12oz Canvas', price: '₹7,200', image: '/men_trousers_grey_1775057332529.png', hueA: 50, hueB: 20 },
    ],
    archive: [
      { id: 1, title: 'Varanasi Zari Bomber', gsm: '24kt Zari', price: '₹48,000', image: '/media__1775044228708.png', hueA: 45, hueB: 10 },
      { id: 2, title: 'Deep Olive Bandhgala', gsm: 'Raw Silk', price: '₹36,500', image: '/velvet_bandhgala.png', hueA: 60, hueB: 30 },
      { id: 3, title: 'Kalamkari Heritage Duster', gsm: 'Mulberry Silk', price: '₹42,000', image: '/chanderi_tunic.png', hueA: 35, hueB: 15 },
    ],
    traditional: [
      { id: 1, title: 'Kanjeevaram Saree', gsm: 'Gold Zari', price: '₹54,000', image: '/saree_1.png', hueA: 40, hueB: 20 },
      { id: 2, title: 'Chanderi Short Kurta', gsm: 'Silk Blend', price: '₹16,500', image: '/men_kurta_silk_1775057290350.png', hueA: 50, hueB: 35 },
      { id: 3, title: '16-Kali Flared Lehenga', gsm: 'Raw Silk', price: '₹62,000', image: '/miraya_lehenga.png', hueA: 25, hueB: 55 },
    ]
  }

  const items = cardData[mode]

  const cardVariants: Variants = {
    offscreen: {
      y: 180,
      rotate: 8,
      opacity: 0.2
    },
    onscreen: {
      y: 0,
      rotate: 0,
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0.35,
        duration: 0.9,
      },
    },
  }

  return (
    <section 
      className="py-24 text-[#F4F1EA] border-t overflow-hidden transition-colors duration-700 ease-in-out dark-paper-texture"
      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
    >
      <div className="max-w-7xl mx-auto px-6 text-center mb-12">
        <span 
          className="text-[10px] tracking-[0.4em] uppercase font-mono font-bold transition-colors duration-500"
          style={{ color: modeDetails.accentColor }}
        >
          SPRING MOTION REVEALS • {mode.toUpperCase()}
        </span>
        <h2 className="font-serif-editorial text-3xl sm:text-5xl uppercase tracking-[0.08em] text-[#F4F1EA] mt-1">
          SPRING-BOUNCE ARCHIVE REVEAL
        </h2>
      </div>

      {/* CARDS SPRING CONTAINER */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ amount: 0.5, once: true }}
            className="flex justify-center"
          >
            <motion.div
              variants={cardVariants}
              className="w-full max-w-[340px] h-[460px] p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl group transition-all rounded-lg"
              style={{
                backgroundColor: modeDetails.cardBg,
                border: `1px solid ${modeDetails.borderColor}`
              }}
            >
              {/* IMAGE BACKGROUND */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover object-top opacity-60 group-hover:scale-105 transition-transform duration-700"
                />
                <div 
                  className="absolute inset-0" 
                  style={{ background: `linear-gradient(to top, ${modeDetails.themeBg}, transparent 60%)` }}
                />
              </div>

              {/* TOP BADGE */}
              <div className="relative z-10 flex justify-between items-start">
                <span 
                  className="text-[9px] font-bold px-2.5 py-1 uppercase font-mono rounded"
                  style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
                >
                  {item.gsm}
                </span>
                <span className="text-xs font-mono text-[#D6CEBE]/60">
                  0{i + 1}
                </span>
              </div>

              {/* BOTTOM DETAILS */}
              <div className="relative z-10 space-y-2">
                <h3 className="font-serif-editorial text-2xl text-[#F4F1EA] tracking-[0.05em]">
                  {item.title}
                </h3>
                <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: modeDetails.borderColor }}>
                  <span className="font-mono text-sm font-bold" style={{ color: modeDetails.accentColor }}>
                    {item.price}
                  </span>
                  <Link
                    href="/shop"
                    className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#F4F1EA] hover:opacity-80"
                  >
                    EXPLORE →
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
