'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface ShareButtonProps {
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  title?: string
  text?: string
  url?: string
  children?: React.ReactNode
  className?: string
}

export function ShareButton({
  size = 'md',
  icon,
  title = 'Friends of 4 — Luxury Fashion',
  text = 'Explore independent Indian D2C luxury fashion at Friends of 4.',
  url,
  children = 'Share',
  className = '',
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== 'undefined' ? url || window.location.href : url || 'https://friendsof4.com'

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-[10px]',
    md: 'px-4 py-2 text-xs',
    lg: 'px-6 py-3 text-sm',
  }

  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${shareUrl}`)}`
    window.open(waUrl, '_blank', 'noopener,noreferrer')
    setIsOpen(false)
  }

  const handleInstagramShare = () => {
    // Copy link for Instagram sharing
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }).catch(() => {})
    }
    // Open Instagram app or web
    window.open('https://instagram.com', '_blank', 'noopener,noreferrer')
    setIsOpen(false)
  }

  const handleCopyLink = () => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }).catch(() => {})
    }
    setIsOpen(false)
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl })
        setIsOpen(false)
      } catch {
        // Fallback to menu if user cancels native share
      }
    } else {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div className="relative inline-block text-left z-30">
      {/* MAIN SHARE TRIGGER BUTTON */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className={`inline-flex items-center space-x-2 font-mono uppercase tracking-[0.2em] font-semibold bg-[#0F0F0F] text-[#F4F1EA] border border-[#A88434]/50 hover:bg-[#A88434] hover:text-[#0F0F0F] hover:border-[#A88434] transition-all duration-300 rounded-full shadow-md ${sizeClasses[size]} ${className}`}
      >
        {icon !== undefined ? (
          icon
        ) : (
          <span className="material-symbols-outlined text-[16px]">share</span>
        )}
        <span>{children}</span>
      </motion.button>

      {/* POPUP SHARE MENU (WHATSAPP & INSTAGRAM) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* BACKDROP CLOSER */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0F0F0F] border border-[#A88434]/40 shadow-2xl p-2 z-50 text-[#F4F1EA] space-y-1 font-sans"
            >
              <div className="px-3 py-1.5 border-b border-[#A88434]/20 mb-1">
                <p className="text-[9px] font-mono tracking-[0.25em] uppercase text-[#A88434]">
                  SHARE ITEM VIA
                </p>
              </div>

              {/* WHATSAPP OPTION */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium hover:bg-[#25D366]/20 hover:text-[#25D366] transition-colors group text-left"
              >
                <div className="w-7 h-7 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 2c-5.514 0-9.999 4.486-9.999 10 0 1.954.563 3.777 1.535 5.323L2 22l4.821-1.53c1.472.84 3.167 1.32 4.96 1.32 5.514 0 9.999-4.486 9.999-10 0-5.514-4.485-10-9.999-10zm0 18.232c-1.639 0-3.18-.456-4.522-1.251l-.324-.192-2.859.908.919-2.793-.211-.336a8.17 8.17 0 0 1-1.303-4.368c0-4.542 3.696-8.232 8.3-8.232s8.3 3.69 8.3 8.232c0 4.542-3.696 8.232-8.3 8.232zm4.551-6.17c-.25-.125-1.478-.73-1.707-.813-.229-.083-.396-.125-.562.125-.167.25-.646.813-.792.979-.146.167-.292.188-.542.063-.25-.125-1.055-.389-2.01-1.24-.743-.663-1.245-1.482-1.391-1.732-.146-.25-.016-.385.109-.509.113-.112.25-.292.375-.438.125-.146.167-.25.25-.417.083-.167.042-.313-.021-.438-.063-.125-.562-1.354-.771-1.854-.204-.488-.411-.422-.562-.43-.146-.008-.313-.01-.479-.01s-.438.063-.667.313c-.229.25-.875.854-.875 2.083s.896 2.417 1.021 2.583c.125.167 1.763 2.693 4.271 3.777.597.258 1.063.412 1.427.528.6.19 1.146.163 1.577.099.481-.072 1.478-.604 1.687-1.188.208-.583.208-1.083.146-1.188-.063-.104-.229-.167-.479-.292z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold leading-none">WhatsApp</p>
                  <p className="text-[10px] text-[#D6CEBE]/60 mt-0.5">Share with chat contacts</p>
                </div>
              </button>

              {/* INSTAGRAM OPTION */}
              <button
                type="button"
                onClick={handleInstagramShare}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium hover:bg-[#E1306C]/20 hover:text-[#E1306C] transition-colors group text-left"
              >
                <div className="w-7 h-7 rounded-full bg-[#E1306C]/20 text-[#E1306C] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold leading-none">Instagram</p>
                  <p className="text-[10px] text-[#D6CEBE]/60 mt-0.5">Copy link for IG Story & DM</p>
                </div>
              </button>

              {/* COPY LINK OPTION */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium hover:bg-[#A88434]/20 hover:text-[#A88434] transition-colors group text-left"
              >
                <div className="w-7 h-7 rounded-full bg-[#A88434]/20 text-[#A88434] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[16px]">link</span>
                </div>
                <div>
                  <p className="font-semibold leading-none">Copy Page Link</p>
                  <p className="text-[10px] text-[#D6CEBE]/60 mt-0.5">Copy direct URL to clipboard</p>
                </div>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* COPIED TOAST FLOATER */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-[#A88434] text-[#0F0F0F] text-[10px] font-mono font-bold tracking-widest uppercase rounded shadow-lg whitespace-nowrap z-50 flex items-center space-x-1"
          >
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            <span>LINK COPIED TO CLIPBOARD!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export type ShareButtonDemoProps = {
  size?: ShareButtonProps['size']
  icon?: ShareButtonProps['icon']
}

export const ShareButtonDemo = ({ size, icon }: ShareButtonDemoProps) => {
  return (
    <ShareButton size={size} icon={icon}>
      Share
    </ShareButton>
  )
}
