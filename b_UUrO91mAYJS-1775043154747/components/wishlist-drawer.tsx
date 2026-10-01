'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useWishlist } from '@/context/wishlist-context'
import { useCart } from '@/context/cart-context'
import { products } from '@/data/products'
import { useMode } from '@/context/mode-context'

interface WishlistDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function WishlistDrawer({ isOpen, onClose }: WishlistDrawerProps) {
  const { wishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { modeDetails } = useMode()

  // Match wishlist product IDs to full product catalog entries
  const wishlistProducts = wishlist.map(wItem => {
    const matched = products.find(p => p.id === wItem.product_id)
    if (matched) return matched
    return {
      id: wItem.product_id,
      title: wItem.title || 'Archival Garment',
      price: typeof wItem.price === 'number' ? `₹${wItem.price.toLocaleString('en-IN')}` : '₹4,800',
      rawPrice: typeof wItem.price === 'number' ? wItem.price : 4800,
      image: wItem.image || '/placeholder.jpg',
      sizes: ['S', 'M', 'L', 'XL'],
      mode: 'archive' as const
    }
  })

  const handleMoveToCart = (product: any) => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      rawPrice: product.rawPrice || 4800,
      image: product.image,
      selectedSize: product.sizes?.[0] || 'S',
      quantity: 1
    })
    removeFromWishlist(product.id)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 z-[101] h-full w-full max-w-md text-[#F4F1EA] shadow-2xl flex flex-col border-l transition-colors duration-700 dark-paper-texture"
            style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
          >
            {/* HEADER */}
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: modeDetails.borderColor }}>
              <div>
                <h2 className="font-serif-editorial text-2xl tracking-[0.2em] font-light uppercase text-[#F4F1EA]">
                  SAVED CURATIONS
                </h2>
                <p className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ color: modeDetails.accentColor }}>
                  {wishlistProducts.length} WISHLISTED PIECES
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[#D6CEBE] hover:opacity-80 transition-colors"
                aria-label="Close Wishlist"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 divide-y" style={{ borderColor: modeDetails.borderColor }}>
              {wishlistProducts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                  <span className="material-symbols-outlined text-5xl opacity-50" style={{ color: modeDetails.accentColor }}>
                    favorite_border
                  </span>
                  <p className="font-serif-editorial text-xl tracking-[0.15em] text-[#D6CEBE]">
                    YOUR WISHLIST IS EMPTY
                  </p>
                  <p className="text-xs text-[#D6CEBE]/60 max-w-xs">
                    Click the heart icon on any archival piece to save it to your personal curation.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-6 py-2.5 border text-xs tracking-[0.2em] uppercase font-bold rounded transition-all duration-300"
                    style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg, borderColor: modeDetails.accentColor }}
                  >
                    EXPLORE COLLECTION
                  </button>
                </div>
              ) : (
                wishlistProducts.map((product) => (
                  <div key={product.id} className="pt-6 first:pt-0 flex space-x-4">
                    <div className="relative w-20 h-24 border flex-shrink-0 overflow-hidden rounded" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-serif-editorial text-lg tracking-[0.05em] text-[#F4F1EA] leading-tight">
                            {product.title}
                          </h3>
                          <button
                            onClick={() => removeFromWishlist(product.id)}
                            className="text-[#D6CEBE]/50 hover:text-red-400 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                        <p className="font-mono text-xs font-bold mt-1" style={{ color: modeDetails.accentColor }}>
                          {product.price}
                        </p>
                      </div>

                      <button
                        onClick={() => handleMoveToCart(product)}
                        className="mt-3 w-full py-2 border text-xs tracking-[0.15em] uppercase font-bold transition-all rounded"
                        style={{ backgroundColor: modeDetails.themeBg, color: modeDetails.accentColor, borderColor: modeDetails.borderColor }}
                      >
                        MOVE TO BAG
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

