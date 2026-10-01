'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { products, Product } from '@/data/products'
import { useWishlist } from '@/context/wishlist-context'
import { useMode } from '@/context/mode-context'
import { ArcAddToBasket } from '@/components/arc-add-to-basket'

export function FeaturedArchiveDrop() {
  const { mode, modeDetails } = useMode()
  const { toggleWishlist, isInWishlist } = useWishlist()

  // Filter products by active mode or fallback to featured list
  const filteredProducts = products.filter(p => p.mode === mode)
  const displayProducts = filteredProducts.length > 0 ? filteredProducts : products

  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({})

  const handleSizeSelect = (productId: string, size: string) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }))
  }

  return (
    <section 
      className="py-24 text-[#F4F1EA] paper-texture overflow-hidden border-t transition-colors duration-700 ease-in-out"
      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SECTION HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: modeDetails.accentColor }} />
              <span className="text-[10px] tracking-[0.35em] uppercase font-medium font-sans transition-colors duration-500" style={{ color: modeDetails.accentColor }}>
                CURATED FOR {mode.toUpperCase()} MODE
              </span>
            </div>
            <h2 className="font-serif-editorial text-3xl sm:text-5xl tracking-[0.08em] font-light uppercase text-[#F4F1EA] mt-2">
              FEATURED ARCHIVE DROPS
            </h2>
          </div>
          <Link
            href="/shop"
            className="mt-4 md:mt-0 text-xs tracking-[0.2em] uppercase font-semibold text-[#F4F1EA] hover:opacity-80 border-b pb-1 transition-all"
            style={{ borderColor: modeDetails.borderColor }}
          >
            VIEW FULL COLLECTION →
          </Link>
        </div>

        {/* CAROUSEL GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayProducts.map((product) => {
            const activeSize = selectedSizes[product.id] || product.sizes[0]
            const isWishlisted = isInWishlist(product.id)

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="group relative p-4 flex flex-col justify-between hover:shadow-2xl transition-all duration-300 rounded-lg overflow-hidden"
                style={{
                  backgroundColor: modeDetails.cardBg,
                  border: `1px solid ${modeDetails.borderColor}`
                }}
              >
                {/* IMAGE CONTAINER WITH GALLERY HOVER */}
                <div className="relative w-full h-[380px] bg-black/40 overflow-hidden rounded">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* MODE & BADGE STAMPS */}
                  <div className="absolute top-3 left-3 flex flex-col space-y-1">
                    <span 
                      className="text-[9px] tracking-[0.2em] font-mono px-2.5 py-1 uppercase font-bold"
                      style={{ backgroundColor: modeDetails.themeBg, color: modeDetails.accentColor }}
                    >
                      {product.mode}
                    </span>
                    {product.gsm && (
                      <span 
                        className="text-[9px] font-bold px-2 py-0.5 tracking-wider uppercase"
                        style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
                      >
                        {product.gsm}
                      </span>
                    )}
                  </div>

                  {/* WISHLIST BUTTON */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full text-[#F4F1EA] flex items-center justify-center transition-colors"
                    style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
                  >
                    <span className="material-symbols-outlined text-[16px]" style={{ color: isWishlisted ? modeDetails.accentColor : '#F4F1EA' }}>
                      {isWishlisted ? 'favorite' : 'favorite_border'}
                    </span>
                  </button>
                </div>

                {/* PRODUCT INFO */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif-editorial text-xl tracking-[0.05em] font-medium text-[#F4F1EA] transition-colors">
                        <Link href={`/product/${product.id}`}>
                          {product.title}
                        </Link>
                      </h3>
                      {product.subtitle && (
                        <p className="text-[10px] text-[#D6CEBE]/60 font-mono uppercase tracking-wider mt-0.5">
                          {product.subtitle}
                        </p>
                      )}
                    </div>
                    <span className="font-mono text-sm font-semibold" style={{ color: modeDetails.accentColor }}>
                      {product.price}
                    </span>
                  </div>

                  {/* INSTANT SIZE SWATCHES */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono text-[#D6CEBE]/60">SELECT SIZE:</span>
                    <div className="flex space-x-1">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => handleSizeSelect(product.id, size)}
                          className="px-2 py-1 text-[10px] font-mono border transition-all rounded"
                          style={{
                            backgroundColor: activeSize === size ? modeDetails.accentColor : 'transparent',
                            color: activeSize === size ? modeDetails.themeBg : '#F4F1EA',
                            borderColor: activeSize === size ? modeDetails.accentColor : modeDetails.borderColor,
                            fontWeight: activeSize === size ? 700 : 400
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ARC FLY ADD TO BAG BUTTON */}
                  <div className="pt-3">
                    <ArcAddToBasket product={product} selectedSize={activeSize} />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
