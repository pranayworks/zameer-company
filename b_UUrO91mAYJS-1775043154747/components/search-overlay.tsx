'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
}

const suggestedSearches = [
  'Handloom Sarees',
  'Signature Jewellery',
  'Bridal Collection',
  'Bespoke Tailoring'
]

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('')
  const [liveProducts, setLiveProducts] = useState<any[]>([])
  const [placeholderIndex, setPlaceholderIndex] = useState(0)

  const placeholders = [
    'Search for Sarees...',
    'Search for Men...',
    'Search for Jewellery...',

    'Search for Women..'
  ]

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [isOpen])

  useEffect(() => {
    async function fetchAll() {
      const { data } = await supabase.from('products').select('*')
      if (data) setLiveProducts(data)
    }
    if (isOpen) fetchAll()
  }, [isOpen])

  const filteredResults = query.length > 2
    ? liveProducts.filter(p =>
      p.title?.toLowerCase().includes(query.toLowerCase()) ||
      p.category?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5)
    : []

  // Handle ESC and Scroll Lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[110] bg-[#0b0c10]/80 backdrop-blur-md cursor-pointer"
          />

          {/* Sliding Search Panel */}
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 right-0 z-[120] bg-[#fdf9f2] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-12 max-w-[1920px] mx-auto w-full">
              <span className="font-headline text-lg italic opacity-40">Friends of 4 / Search</span>
              <button
                onClick={onClose}
                className="material-symbols-outlined text-4xl hover:text-[#a3851a] transition-colors"
              >
                close
              </button>
            </div>

            {/* Search Body */}
            <div className="flex flex-col items-center justify-center px-12 py-12 md:py-20 relative">
              <motion.div
                className="w-full max-w-4xl relative"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={placeholders[placeholderIndex]}
                  className="w-full bg-transparent border-b-2 border-[#1c1c18] pb-8 text-5xl md:text-8xl font-headline outline-none placeholder:opacity-20 focus:border-[#a3851a] transition-all"
                />
                <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-5xl md:text-6xl text-[#1c1c18]/20">
                  search
                </span>

                {/* Live Results Dropdown */}
                <AnimatePresence>
                  {query.length > 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 bg-white shadow-2xl mt-4 p-8 z-50 border border-[#1c1c18]/5"
                    >
                      {filteredResults.length > 0 ? (
                        <div className="space-y-6">
                          {filteredResults.map((product) => (
                            <Link
                              key={product.id}
                              href={`/product/${product.id}`}
                              onClick={onClose}
                              className="flex items-center gap-6 group p-4 hover:bg-[#fdf9f2] transition-colors"
                            >
                              <div className="w-20 h-24 relative overflow-hidden flex-shrink-0 bg-[#f1ede6]">
                                <Image
                                  src={product.image}
                                  alt={product.title}
                                  fill
                                  className="object-cover transition-transform group-hover:scale-110"
                                />
                              </div>
                              <div className="flex-1">
                                <span className="font-body text-[10px] uppercase tracking-widest text-[#a3851a] mb-1 block">{product.category}</span>
                                <h4 className="font-headline text-2xl text-[#1c1c18] group-hover:text-[#a3851a] transition-colors">{product.title}</h4>
                                <span className="font-body text-xs text-[#747878]">₹{product.price?.toLocaleString()}</span>
                              </div>
                              <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center">
                          <p className="font-body text-sm text-[#747878]">No masterpieces found for &quot;{query}&quot;</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Suggestions */}
              <motion.div
                className="mt-16 text-center max-w-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h4 className="font-body uppercase tracking-[0.4em] text-[10px] text-[#747878] mb-8">Suggested Search</h4>
                <div className="flex flex-wrap justify-center gap-6">
                  {suggestedSearches.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-6 py-2 border border-[#1c1c18]/10 rounded-full font-body text-xs hover:bg-[#1c1c18] hover:text-white transition-all"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Aesthetic Background Detail */}
            <div className="absolute inset-0 -z-10 bg-[url('/chanderi_tunic.png')] opacity-[0.03] mix-blend-multiply pointer-events-none" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
