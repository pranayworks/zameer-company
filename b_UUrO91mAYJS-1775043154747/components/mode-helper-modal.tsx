'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMode, BrandMode } from '@/context/mode-context'

interface ModeHelperModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ModeHelperModal({ isOpen, onClose }: ModeHelperModalProps) {
  const { mode, setMode, modeDetails } = useMode()

  const modesInfo: { id: BrandMode; title: string; subtitle: string; description: string; tag: string; icon: string }[] = [
    {
      id: 'streetwear',
      title: '01. STREETWEAR',
      subtitle: 'Heavyweight Tees, Hoodies & Technical Blueprint Prints',
      description: 'Engineered from custom 300–450 GSM organic comb cotton. Features drop-shoulder brutalist cuts, raw edge seams, and high-density CAD vector schematics derived from Dravidian temple geometry.',
      tag: '300-450 GSM • DROPPED SHOULDERS • RAW HEMS',
      icon: 'checkroom'
    },
    {
      id: 'archive',
      title: '02. LUXURY ARCHIVE',
      subtitle: 'Limited Statement Drops & Temple Pillar Silk Art',
      description: 'Museum-grade statement garments handcrafted with Varanasi Mulberry silk, 24kt gold zari hand embroidery, and sculptural Bandhgala coats. Strictly limited to 50 serial-numbered pieces worldwide.',
      tag: '24KT GOLD ZARI • MULBERRY SILK • LIMITED DROPS',
      icon: 'auto_awesome'
    },
    {
      id: 'traditional',
      title: '03. TRADITIONAL',
      subtitle: 'Contemporary Ethnic Wear & Architectural Border Sarees',
      description: 'Contemporary ethnic wear bridging ancient temple borders and modern comfort. Includes Kanjeevaram silk sarees with Gopuram borders, Chanderi short kurtas, and 16-kali flared step-well lehengas.',
      tag: 'PURE KANJEEVARAM • CHANDERI KURTAS • LEHENGAS',
      icon: 'temple_hindu'
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="border p-8 max-w-2xl w-full relative shadow-2xl space-y-6 overflow-y-auto max-h-[90vh] rounded-2xl transition-all duration-500"
            style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.accentColor, color: '#F4F1EA' }}
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>

            {/* HEADER */}
            <div className="space-y-1">
              <span className="text-[10px] tracking-[0.4em] uppercase font-mono font-bold" style={{ color: modeDetails.accentColor }}>
                SHOPPING ECOSYSTEM GUIDE
              </span>
              <h2 className="font-serif-editorial text-3xl tracking-[0.1em] uppercase text-white">
                HOW THE 3-MODE SYSTEM WORKS
              </h2>
              <p className="text-xs font-light leading-relaxed opacity-70" style={{ color: '#D6CEBE' }}>
                Click any mode in the header toggle to transform the website's entire collection catalog, visual mood, and fabric specifications.
              </p>
            </div>

            {/* MODES LIST */}
            <div className="space-y-4">
              {modesInfo.map((m) => (
                <div
                  key={m.id}
                  onClick={() => { setMode(m.id); onClose(); }}
                  className="p-5 border transition-all cursor-pointer flex flex-col justify-between rounded-xl"
                  style={{
                    backgroundColor: mode === m.id ? modeDetails.themeBg : `${modeDetails.themeBg}80`,
                    borderColor: mode === m.id ? modeDetails.accentColor : `${modeDetails.borderColor}40`,
                    boxShadow: mode === m.id ? `0 0 20px ${modeDetails.glowColor}` : 'none'
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <span className="material-symbols-outlined text-xl" style={{ color: modeDetails.accentColor }}>
                        {m.icon}
                      </span>
                      <h3 className="font-serif-editorial text-xl tracking-[0.05em] uppercase text-white">
                        {m.title}
                      </h3>
                    </div>
                    {mode === m.id && (
                      <span className="text-[9px] font-bold px-2.5 py-0.5 uppercase font-mono rounded" style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg === '#0B0E17' ? '#FFFFFF' : '#0F0F0F' }}>
                        ACTIVE MODE
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] font-mono uppercase tracking-wider mt-1 font-bold" style={{ color: modeDetails.accentColor }}>
                    {m.subtitle}
                  </p>
                  <p className="text-xs font-light mt-2 leading-relaxed opacity-80" style={{ color: '#D6CEBE' }}>
                    {m.description}
                  </p>
                  <p className="text-[9px] font-mono tracking-widest mt-3 pt-2 border-t opacity-60" style={{ color: '#D6CEBE', borderColor: `${modeDetails.borderColor}30` }}>
                    {m.tag}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 font-bold text-xs tracking-[0.25em] uppercase transition-all rounded-lg shadow-lg"
              style={{
                backgroundColor: modeDetails.accentColor,
                color: modeDetails.themeBg === '#0B0E17' ? '#FFFFFF' : '#0F0F0F'
              }}
            >
              GOT IT — START SHOPPING
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

