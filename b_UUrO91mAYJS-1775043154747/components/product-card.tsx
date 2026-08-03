'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/cart-context'
import { slugify } from '@/lib/utils'
import { useState, useEffect } from 'react'

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
  const router = useRouter()
  const productPath = `/product/${id || slugify(title)}`
  const displayImage = image ? image.split(',')[0].trim() || '/placeholder.jpg' : '/placeholder.jpg'
  const [imgSrc, setImgSrc] = useState(displayImage)

  useEffect(() => {
    setImgSrc(displayImage)
  }, [displayImage])

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
      transition={{ duration: 0.6, delay: index * 0.08 }}
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
    >
      <Link href={productPath} className="block">
        <div 
          className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[#FAF7F2] border border-[#D4AF37]/20 group-hover:border-[#D4AF37]/60 shadow-[0_10px_30px_rgba(0,0,0,0.04)] group-hover:shadow-[0_20px_45px_rgba(212,175,55,0.18)] transition-all duration-700 mb-5"
          style={{ position: 'relative' }}
        >
          <Image
            src={imgSrc}
            alt={title}
            fill
            className="object-cover group-hover:scale-108 transition-transform duration-1000 ease-out"
            priority={index < 4}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onError={() => setImgSrc('/placeholder.jpg')}
          />

          {/* Subtly dark gradient shadow overlay at bottom for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10]/60 via-transparent to-transparent opacity-30 group-hover:opacity-60 transition-opacity duration-500" />
          
          {/* URGENCE & EXCLUSIVITY RIBBONS */}
          {stock !== undefined && stock > 0 && stock <= 5 && stock !== 1 && (
            <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-gradient-to-r from-[#D4AF37] to-[#AA771C] text-black shadow-lg rounded-full border border-amber-200/50">
               <span className="text-[8px] uppercase tracking-[0.2em] font-black italic">Selling Fast</span>
            </div>
          )}
          {stock === 1 && (
             <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-[#0B0C10] text-[#E5C158] border border-[#D4AF37]/40 shadow-xl rounded-full">
                <span className="text-[8px] uppercase tracking-[0.2em] font-black italic">Last Archive Piece</span>
             </div>
          )}
          {stock === 0 && (
             <div className="absolute inset-0 bg-[#0B0C10]/60 backdrop-blur-[3px] flex items-center justify-center z-10">
                <span className="bg-[#0B0C10] text-[#E5C158] border border-[#D4AF37]/50 px-6 py-2 text-[9px] uppercase tracking-[0.3em] font-bold rounded-md shadow-2xl">In Restoration</span>
             </div>
          )}

          {/* QUICK ADD BUTTON */}
          <motion.div
            onClick={stock === 0 ? (e) => e.preventDefault() : handleAddToCart}
            className={`absolute bottom-4 left-4 right-4 py-3.5 rounded-lg font-body uppercase tracking-[0.2em] text-[10px] font-bold opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300 shadow-2xl text-center z-10 ${stock === 0 ? 'bg-[#0B0C10]/60 text-white/50 cursor-not-allowed hidden md:block' : 'gold-satin text-[#0B0C10] cursor-pointer'}`}
          >
            {stock === 0 ? 'Depleted' : 'Add to Bag'}
          </motion.div>
        </div>

        <div className="flex justify-between items-start mb-1.5 gap-4">
          <h4 className="font-headline text-lg text-[#12131A] group-hover:text-[#D4AF37] transition-colors line-clamp-1">{title}</h4>
          <div className="text-right shrink-0">
             <span className="font-body text-sm font-bold text-[#12131A] block">
               {price}
             </span>
             {stock !== undefined && (
               <span className={`font-body text-[9px] uppercase tracking-tighter ${stock === 0 ? 'text-red-500 font-bold' : stock < 5 ? 'text-amber-600 font-semibold animate-pulse' : 'text-[#6E727A]'}`}>
                 {stock === 0 ? 'Out of Stock' : `${stock} left`}
               </span>
             )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-2">
          <span className="material-symbols-outlined text-[14px] text-[#D4AF37]" style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
          <span className="font-body text-[10px] text-[#6E727A] uppercase tracking-tighter">
            {rating != null ? Number(rating).toFixed(1) : '5.0'} ({reviews || 0} {(reviews || 0) === 1 ? 'Review' : 'Reviews'})
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
