'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/cart-context'
import { slugify } from '@/lib/utils'

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
          className="relative aspect-[3/4] overflow-hidden bg-[#ebdcb9]/15 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-shadow duration-700 mb-6"
          style={{ position: 'relative' }}
        >
          <Image
            src={displayImage}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
            priority={index < 4}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          
          {/* URGENCE & EXCLUSIVITY RIBBONS */}
          {stock !== undefined && stock > 0 && stock <= 5 && stock !== 1 && (
            <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-[#a3851a] shadow-lg">
               <span className="text-white text-[8px] uppercase tracking-[0.2em] font-black italic">Selling Fast</span>
            </div>
          )}
          {stock === 1 && (
             <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-[#1c1c18] shadow-lg">
                <span className="text-white text-[8px] uppercase tracking-[0.2em] font-black italic">Last Archive Piece</span>
             </div>
          )}
          {stock === 0 && (
             <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                <span className="bg-[#1c1c18] text-white px-6 py-2 text-[9px] uppercase tracking-[0.3em] font-bold">In Restoration</span>
             </div>
          )}

          <motion.div
            onClick={stock === 0 ? (e) => e.preventDefault() : handleAddToCart}
            className={`absolute bottom-4 left-4 right-4 py-4 font-body uppercase tracking-widest text-[10px] font-semibold opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl text-center z-10 ${stock === 0 ? 'bg-[#1c1c18]/40 text-white cursor-not-allowed hidden md:block' : 'gold-satin text-white cursor-pointer'}`}
          >
            {stock === 0 ? 'Depleted' : 'Add to Bag'}
          </motion.div>
        </div>

        <div className="flex justify-between items-start mb-1 gap-4">
          <h4 className="font-headline text-lg text-[#1c1b1b] hover:text-[#a3851a] transition-colors">{title}</h4>
          <div className="text-right shrink-0">
             <span className="font-body text-sm font-semibold text-[#1c1b1b] block">
               {price}
             </span>
             {stock !== undefined && (
               <span className={`font-body text-[9px] uppercase tracking-tighter ${stock === 0 ? 'text-red-500 font-bold' : stock < 5 ? 'text-amber-500 animate-pulse' : 'text-[#747878]'}`}>
                 {stock === 0 ? 'Out of Stock' : `${stock} pieces left`}
               </span>
             )}
          </div>
        </div>

        <div className="flex items-center gap-1 mb-2">
          <span className="material-symbols-outlined text-[14px] text-[#735c00]" style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
          <span className="font-body text-[10px] text-[#747878] uppercase tracking-tighter">
            {rating != null ? Number(rating).toFixed(1) : '5.0'} ({reviews || 0} {(reviews || 0) === 1 ? 'Review' : 'Reviews'})
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
