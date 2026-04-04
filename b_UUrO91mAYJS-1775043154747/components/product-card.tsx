'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/cart-context'

interface ProductCardProps {
  id?: string | number
  title: string
  price: string
  image: string
  rating: number
  reviews: number
  index: number
}

export function ProductCard({
  id,
  title,
  price,
  image,
  rating,
  reviews,
  index,
}: ProductCardProps) {
  const { addToCart } = useCart()
  const productPath = `/product/${id || title.toLowerCase().replace(/ /g, '-')}`

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      id: id || title,
      name: title,
      price: price,
      image: image,
      quantity: 1
    })
  }

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true, margin: '0px 0px -100px 0px' }}
    >
      <Link href={productPath} className="block relative">
        <div className="aspect-[3/4] overflow-hidden bg-[#f1ede6] relative mb-6">
          <Image
            src={image}
            alt={title}
            fill
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <motion.div
            onClick={handleAddToCart}
            className="absolute bottom-4 left-4 right-4 gold-satin text-white py-4 font-body uppercase tracking-widest text-[10px] font-semibold opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl text-center z-10 cursor-pointer"
          >
            Add to Bag
          </motion.div>
        </div>

        <div className="flex justify-between items-start mb-1">
          <h4 className="font-headline text-lg text-[#1c1b1b] hover:text-[#a3851a] transition-colors">{title}</h4>
          <span className="font-body text-sm font-semibold text-[#1c1b1b]">
            {price}
          </span>
        </div>

        <div className="flex items-center gap-1 mb-2">
          <span className="material-symbols-outlined text-[14px] text-[#735c00]" style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
          <span className="font-body text-[10px] text-[#747878] uppercase tracking-tighter">
            {rating.toFixed(1)} ({reviews} {reviews === 1 ? 'Review' : 'Reviews'})
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
