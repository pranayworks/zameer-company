'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/cart-context'
import { slugify } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { useWishlist } from '@/context/wishlist-context'
import { useMode } from '@/context/mode-context'

interface ProductCardProps {
  id?: string | number
  title: string
  price: string
  image: string
  rating: number
  reviews: number
  index: number
  stock?: number
}

export function ProductCard({
  id = '',
  title = 'Product Name',
  price,
  image,
  rating = 5,
  reviews = 0,
  index,
  stock,
}: ProductCardProps) {
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { modeDetails } = useMode()
  const router = useRouter()
  const productId = String(id || title)
  const isWishlisted = isInWishlist(productId)

  const productPath = `/product/${id || slugify(title)}`
  const getCleanImage = (raw?: string) => {
    if (!raw || !raw.trim() || raw === 'null' || raw === 'undefined') return '/placeholder.jpg'
    const trimmed = raw.trim()
    if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed
    return trimmed.split(',')[0].trim() || '/placeholder.jpg'
  }
  const displayImage = getCleanImage(image)
  const [imgSrc, setImgSrc] = useState(displayImage)

  useEffect(() => {
    setImgSrc(displayImage)
  }, [displayImage])

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(productId)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (stock === 0) return // Prevent adding if out of stock
    addToCart({
      id: id || title,
      name: title,
      price: price,
      image: displayImage,
      quantity: 1
    })
    // Navigate to shipping address page for address confirmation
    router.push('/profile/shipping-address')
  }

  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  const [selectedQuickSize, setSelectedQuickSize] = useState('M')

  const handleOpenQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsQuickViewOpen(true)
  }

  return (
    <>
      <motion.div
        className="group relative"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        viewport={{ once: true, margin: '0px 0px -100px 0px' }}
      >
        <Link href={productPath} className="block">
          <div 
            className="relative aspect-[3/4] overflow-hidden transition-all duration-700 mb-4 border rounded-xl"
            style={{ 
              backgroundColor: modeDetails.cardBg, 
              borderColor: `${modeDetails.borderColor}40`,
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
          >
            <Image
              src={imgSrc}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              priority={index < 4}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              onError={() => setImgSrc('/placeholder.jpg')}
            />
            
            {/* URGENCE & EXCLUSIVITY RIBBONS */}
            {stock !== undefined && stock > 0 && stock <= 5 && stock !== 1 && (
              <div className="absolute top-4 left-4 z-10 px-3 py-1.5 shadow-lg" style={{ backgroundColor: modeDetails.accentColor }}>
                 <span className="text-white text-[8px] uppercase tracking-[0.2em] font-black italic">Selling Fast</span>
              </div>
            )}
            {stock === 1 && (
               <div className="absolute top-4 left-4 z-10 px-3 py-1.5 shadow-lg" style={{ backgroundColor: modeDetails.themeBg }}>
                  <span className="text-white text-[8px] uppercase tracking-[0.2em] font-black italic" style={{ color: modeDetails.accentColor }}>Last Archive Piece</span>
               </div>
            )}

            {/* QUICK VIEW & WISHLIST BUTTONS */}
            <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleWishlistToggle}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md border hover:scale-110"
                style={{ 
                  backgroundColor: `${modeDetails.cardBg}E6`, 
                  borderColor: `${modeDetails.borderColor}50`,
                  color: isWishlisted ? '#EF4444' : modeDetails.accentColor 
                }}
                aria-label="Toggle Wishlist"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isWishlisted ? 'favorite' : 'favorite_border'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleOpenQuickView}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md border hover:scale-110"
                style={{ 
                  backgroundColor: `${modeDetails.cardBg}E6`, 
                  borderColor: `${modeDetails.borderColor}50`,
                  color: modeDetails.accentColor 
                }}
                title="Quick View Product Specs"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
              </button>
            </div>

            <motion.div
              onClick={stock === 0 ? (e) => e.preventDefault() : handleAddToCart}
              className="absolute bottom-4 left-4 right-4 py-3 font-body uppercase tracking-widest text-[10px] font-bold opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl text-center z-10 rounded cursor-pointer"
              style={{
                backgroundColor: stock === 0 ? '#1C1C18' : modeDetails.accentColor,
                color: stock === 0 ? '#999999' : (modeDetails.themeBg === '#0B0E17' ? '#FFFFFF' : '#0F0F0F')
              }}
            >
              {stock === 0 ? 'Depleted' : 'Add to Bag'}
            </motion.div>
          </div>

          <div className="flex justify-between items-start mb-1 gap-4">
            <h4 className="font-headline text-lg transition-colors line-clamp-1" style={{ color: '#F4F1EA' }}>
              {title}
            </h4>
            <div className="text-right shrink-0">
               <span className="font-body text-sm font-bold block" style={{ color: modeDetails.accentColor }}>
                 {price}
               </span>
               {stock !== undefined && (
                 <span className={`font-body text-[9px] uppercase tracking-tighter ${stock === 0 ? 'text-red-500 font-bold' : stock < 5 ? 'text-amber-500 animate-pulse' : 'text-[#A0A0A0]'}`}>
                   {stock === 0 ? 'Out of Stock' : `${stock} pieces left`}
                 </span>
               )}
            </div>
          </div>

          <div className="flex items-center gap-1 mb-2">
            <span className="material-symbols-outlined text-[14px]" style={{ color: modeDetails.accentColor, fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            <span className="font-body text-[10px] text-[#A0A0A0] uppercase tracking-tighter">
              {rating != null ? Number(rating).toFixed(1) : '5.0'} ({reviews || 0} {(reviews || 0) === 1 ? 'Review' : 'Reviews'})
            </span>
          </div>
        </Link>
      </motion.div>

      {/* QUICK VIEW MODAL */}
      {isQuickViewOpen && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div 
            className="relative border rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl overflow-hidden font-mono"
            style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.accentColor, color: '#F4F1EA' }}
          >
            <button
              onClick={() => setIsQuickViewOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="flex flex-col sm:flex-row gap-5 items-center">
              <div className="relative w-full sm:w-48 h-60 rounded-xl overflow-hidden border shrink-0" style={{ borderColor: `${modeDetails.borderColor}40` }}>
                <img src={imgSrc} alt={title} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-3 flex-1">
                <div>
                  <span className="text-[9px] uppercase tracking-widest font-bold text-amber-400">INSTANT PREVIEW</span>
                  <h3 className="font-serif-editorial text-xl text-white font-bold">{title}</h3>
                  <p className="font-bold text-base mt-0.5" style={{ color: modeDetails.accentColor }}>{price}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#D6CEBE]">SELECT SIZE:</label>
                  <div className="flex gap-2">
                    {['S', 'M', 'L', 'XL'].map(sz => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedQuickSize(sz)}
                        className={`px-3 py-1.5 text-xs border rounded-lg font-bold cursor-pointer transition-all ${
                          selectedQuickSize === sz ? 'bg-amber-400 text-black border-amber-400 font-bold' : 'bg-transparent text-white border-white/30'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      setIsQuickViewOpen(false)
                      handleAddToCart(e)
                    }}
                    className="w-full py-3 font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg cursor-pointer"
                    style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
                  >
                    ADD TO BAG ({selectedQuickSize}) & CHECKOUT 🛍️
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickViewOpen(false)
                      router.push(productPath)
                    }}
                    className="w-full py-2 border text-[10px] uppercase tracking-widest text-[#D6CEBE] rounded-xl hover:text-white cursor-pointer text-center"
                    style={{ borderColor: modeDetails.borderColor }}
                  >
                    VIEW FULL 360° SPECS & STORY →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

