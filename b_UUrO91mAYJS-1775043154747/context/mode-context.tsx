'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type BrandMode = 'streetwear' | 'archive' | 'traditional'

export interface ModeDetails {
  title: string
  tagline: string
  subtitle: string
  accentColor: string
  secondaryAccent: string
  bgBadge: string
  themeBg: string
  cardBg: string
  headerBg: string
  borderColor: string
  glowColor: string
  fontClass: string
  modeHeroVideo: string
}

const modeInfo: Record<BrandMode, ModeDetails> = {
  streetwear: {
    title: 'STREETWEAR',
    tagline: 'TACTILE ARMY OLIVE & RAW GOLD ARCHIVE',
    subtitle: 'Heavyweight 300–450 GSM tees, French Terry hoodies, raw hems & blueprint graphics',
    accentColor: '#B8892D', // Raw Gold Ochre (User Swatch #B8892D)
    secondaryAccent: '#4F5B2A', // Tactile Army Olive Green (User Swatch #4F5B2A)
    bgBadge: 'bg-[#B8892D]/20 text-[#B8892D] border-[#B8892D]/50',
    themeBg: '#11160F', // Dark Tactical Olive Obsidian
    cardBg: '#1A2217', // Deep Tactile Olive Card
    headerBg: 'rgba(17, 22, 15, 0.95)',
    borderColor: 'rgba(184, 137, 45, 0.4)',
    glowColor: 'rgba(184, 137, 45, 0.25)',
    fontClass: 'font-streetwear',
    modeHeroVideo: 'https://cdn.coverr.co/videos/coverr-fashion-model-walking-in-streetwear-outfit-5182/1080p.mp4'
  },
  archive: {
    title: 'LUXURY ARCHIVE',
    tagline: 'DUSTY ROSE GOLD & SAGE SILK VAULT',
    subtitle: 'Statement limited drops & hand-embroidered haute couture masterpieces',
    accentColor: '#D09494', // Dusty Rose Gold Mauve (User Swatch #1)
    secondaryAccent: '#89A272', // Refined Sage Green (User Swatch #4)
    bgBadge: 'bg-[#D09494]/20 text-[#D09494] border-[#D09494]/50',
    themeBg: '#140E10', // Deep Obsidian Rose Noir
    cardBg: '#1E1517', // Deep Dusty Rose Velvet Card
    headerBg: 'rgba(20, 14, 16, 0.95)',
    borderColor: 'rgba(208, 148, 148, 0.4)',
    glowColor: 'rgba(208, 148, 148, 0.25)',
    fontClass: 'font-luxury',
    modeHeroVideo: 'https://cdn.coverr.co/videos/coverr-model-in-haute-couture-fashion-runway-8193/1080p.mp4'
  },
  traditional: {
    title: 'TRADITIONAL',
    tagline: 'POETRY IN SILK: HAUTE TRADITIONAL COUTURE',
    subtitle: 'Contemporary ethnic wear, Chanderi kurtas, chudidhars & architectural Kanjeevaram sarees',
    accentColor: '#FF9F1C', // Radiant Imperial Rajputana Saffron Gold
    secondaryAccent: '#E63946', // Royal Ruby Red
    bgBadge: 'bg-[#FF9F1C]/20 text-[#FF9F1C] border-[#FF9F1C]/50',
    themeBg: '#1A0C05', // Deep Sandalwood Noir
    cardBg: '#2B170B', // Deep Royal Amber Card
    headerBg: 'rgba(26, 12, 5, 0.95)',
    borderColor: 'rgba(255, 159, 28, 0.4)',
    glowColor: 'rgba(255, 159, 28, 0.3)',
    fontClass: 'font-serif-editorial',
    modeHeroVideo: 'https://cdn.coverr.co/videos/coverr-woman-wearing-traditional-silk-fabric-7492/1080p.mp4'
  }
}

interface ModeContextType {
  mode: BrandMode
  setMode: (mode: BrandMode) => void
  modeDetails: ModeDetails
}

const ModeContext = createContext<ModeContextType | undefined>(undefined)

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<BrandMode>('archive')

  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('fof_mode') as BrandMode
      if (savedMode && ['streetwear', 'archive', 'traditional'].includes(savedMode)) {
        setModeState(savedMode)
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      const details = modeInfo[mode]
      root.style.setProperty('--accent-color', details.accentColor)
      root.style.setProperty('--accent-secondary', details.secondaryAccent)
      root.style.setProperty('--theme-bg', details.themeBg)
      root.style.setProperty('--card-bg', details.cardBg)
      root.style.setProperty('--header-bg', details.headerBg)
      root.style.setProperty('--border-color', details.borderColor)
      root.style.setProperty('--glow-color', details.glowColor)
      
      if (mode === 'streetwear') {
        root.style.setProperty('--font-display', "'Orbitron', 'Chakra Petch', sans-serif")
        root.style.setProperty('--font-body', "var(--font-inter), Inter, sans-serif")
      } else if (mode === 'archive') {
        root.style.setProperty('--font-display', "'Italiana', serif")
        root.style.setProperty('--font-body', "var(--font-inter), Inter, sans-serif")
      } else {
        root.style.setProperty('--font-display', "'Rozha One', 'Cormorant Garamond', serif")
        root.style.setProperty('--font-body', "var(--font-inter), Inter, sans-serif")
      }

      document.body.setAttribute('data-mode', mode)
      document.documentElement.setAttribute('data-mode', mode)
    }
  }, [mode])

  const setMode = (newMode: BrandMode) => {
    setModeState(newMode)
    try {
      localStorage.setItem('fof_mode', newMode)
    } catch {}
  }

  return (
    <ModeContext.Provider value={{ mode, setMode, modeDetails: modeInfo[mode] }}>
      <div 
        className="transition-colors duration-700 ease-in-out min-h-screen text-[#F4F1EA]"
        style={{ 
          backgroundColor: modeInfo[mode].themeBg,
          color: '#F4F1EA'
        }}
      >
        {children}
      </div>
    </ModeContext.Provider>
  )
}

export function useMode() {
  const context = useContext(ModeContext)
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider')
  }
  return context
}

