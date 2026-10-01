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

  return (
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
          {/* WISHLIST HEART BUTTON */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md border"
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

          <motion.div
            onClick={stock === 0 ? (e) => e.preventDefault() : handleAddToCart}
            className="absolute bottom-4 left-4 right-4 py-3 font-body uppercase tracking-widest text-[10px] font-bold opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl text-center z-10 rounded"
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
  )
}

