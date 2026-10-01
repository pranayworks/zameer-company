'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { products } from '@/data/products'
import { useMode } from '@/context/mode-context'

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
}

const STORE_FILTERS = [
  'Tees & Tops',
  'Hoodies & Outerwear',
  'Oversized Fits',
  'Long Sleeve',
  'Collar & Shirts',
  'Statement Archive',
  'Kurtas & Chudidhars',
  'Architectural Sarees'
]

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const { modeDetails } = useMode()
  const [query, setQuery] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const [allProds, setAllProds] = useState<any[]>(products)

  useEffect(() => {
    const loadProds = async () => {
      try {
        const { fetchAllProducts } = await import('@/lib/admin-helpers')
        const data = await fetchAllProducts()
        if (data && data.length > 0) {
          const map = new Map<string, any>()
          products.forEach(p => map.set(p.id, p))
          data.forEach((p: any) => map.set(p.id, {
            ...p,
            price: typeof p.price === 'number' ? `₹${p.price.toLocaleString('en-IN')}` : String(p.price)
          }))
          setAllProds(Array.from(map.values()))
        }
      } catch (e) {}
    }
    if (isOpen) loadProds()
  }, [isOpen])

  const getCleanImage = (raw?: string) => {
    if (!raw || !raw.trim() || raw === 'null' || raw === 'undefined') return '/placeholder.jpg'
    const trimmed = raw.trim()
    if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed
    return trimmed.split(',')[0].trim() || '/placeholder.jpg'
  }

  const results = query.trim() === '' ? [] : allProds.filter(p =>
    (p.title || '').toLowerCase().includes(query.toLowerCase()) ||
    (p.mode || '').toLowerCase().includes(query.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(query.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(query.toLowerCase())
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center pt-24 px-4">
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* SLEEK FLOATING SEARCH BOX */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            className="relative w-full max-w-xl text-[#F4F1EA] border shadow-2xl overflow-hidden rounded-lg dark-paper-texture z-10 transition-colors duration-700"
            style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.accentColor }}
          >
            {/* SEARCH INPUT STRIP */}
            <div className="flex items-center px-4 py-3.5 border-b" style={{ borderColor: modeDetails.borderColor }}>
              <span className="material-symbols-outlined text-xl mr-3" style={{ color: modeDetails.accentColor }}>
                search
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                placeholder="Search tees, hoodies, sarees, oversized fits..."
                className="w-full bg-transparent text-sm text-[#F4F1EA] placeholder-[#D6CEBE]/50 focus:outline-none font-mono"
              />
              <button
                onClick={onClose}
                className="p-1 text-[#D6CEBE] hover:opacity-80 transition-colors ml-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* STORE FILTER TAGS & RESULTS LIST */}
            <div className="max-h-96 overflow-y-auto p-4 space-y-4" style={{ borderColor: modeDetails.borderColor }}>
              {query.trim() === '' ? (
                <div className="space-y-4 text-xs font-mono">
                  <div>
                    <p className="uppercase tracking-widest font-bold mb-2 text-[10px]" style={{ color: modeDetails.accentColor }}>
                      FEATURED CATEGORY FILTERS
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {STORE_FILTERS.map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setQuery(filter)}
                          className="px-3 py-1.5 border text-[10px] text-[#F4F1EA] rounded-full transition-all hover:border-amber-400 cursor-pointer"
                          style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t" style={{ borderColor: `${modeDetails.borderColor}40` }}>
                    <p className="uppercase tracking-widest font-bold mb-2 text-[10px] text-[#D6CEBE]">
                      ALL ATELIER PRODUCTS ({allProds.length})
                    </p>
                    <div className="space-y-2">
                      {allProds.slice(0, 5).map((p) => (
                        <Link
                          key={p.id}
                          href={`/product/${p.id}`}
                          onClick={onClose}
                          className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors border"
                          style={{ borderColor: modeDetails.borderColor }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative w-8 h-8 rounded border overflow-hidden shrink-0" style={{ borderColor: modeDetails.borderColor }}>
                              <img src={getCleanImage(p.image)} alt={p.title} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-white font-bold">{p.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-amber-400">{p.price}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#D6CEBE]/60 font-mono">
                  No matching pieces found for "{query}".
                </div>
              ) : (
                <div className="space-y-2 font-mono">
                  <p className="text-[9px] uppercase font-bold text-[#D6CEBE]/70 mb-2">
                    {results.length} MATCHING PIECES FOUND
                  </p>
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      onClick={onClose}
                      className="flex items-center space-x-4 group p-2.5 transition-all rounded hover:brightness-110 border"
                      style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}
                    >
                      <div className="relative w-12 h-14 border overflow-hidden flex-shrink-0 rounded" style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}>
                        <img src={getCleanImage(product.image)} alt={product.title} className="w-full h-full object-cover p-0.5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-serif-editorial text-base text-[#F4F1EA] transition-colors group-hover:text-amber-400">
                          {product.title}
                        </h4>
                        <p className="text-[10px] uppercase font-semibold" style={{ color: modeDetails.accentColor }}>
                          {product.category} • {product.mode} • {product.price}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
