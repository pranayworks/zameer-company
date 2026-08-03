'use client'

import { motion } from 'framer-motion'
import { ProductCard } from './product-card'
import { useInView } from 'react-intersection-observer'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([])
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchFeatured() {
      const { data } = await supabase.from('products').select('*').limit(12)
      if (data) setProducts(data)
    }
    fetchFeatured()
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef
      const scrollAmount = current.clientWidth * 0.75
      current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <section ref={ref} className="py-20 md:py-28 px-6 md:px-12 max-w-[1920px] mx-auto bg-[#FAF7F2] relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 mb-3">
            <span className="text-gold-gradient font-body uppercase tracking-[0.3em] text-[10px] md:text-xs font-bold">
              ATELIER ARRIVALS
            </span>
          </div>
          <h2 className="font-headline text-4xl md:text-5xl lg:text-6xl text-[#12131A] font-extrabold tracking-tight">
            The Seasonal <span className="text-gold-gradient italic font-serif">Edit</span>
          </h2>
        </div>

        <div className="flex items-center gap-6 self-end md:self-auto">
          <motion.a
            href="/sarees"
            className="font-body uppercase tracking-[0.2em] text-xs font-bold text-[#12131A] border-b-2 border-[#D4AF37] hover:text-[#D4AF37] transition-all pb-1 hidden sm:block"
            whileHover={{ x: 4 }}
          >
            View Full Archive →
          </motion.a>
          
          <div className="flex gap-3">
            <button 
              onClick={() => scroll('left')}
              className="w-11 h-11 rounded-full border border-[#D4AF37]/30 bg-white shadow-md flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#0B0C10] transition-all text-[#12131A] active:scale-95"
              aria-label="Previous products"
            >
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-11 h-11 rounded-full border border-[#D4AF37]/30 bg-white shadow-md flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#0B0C10] transition-all text-[#12131A] active:scale-95"
              aria-label="Next products"
            >
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>
        </div>
      </motion.div>

      <div className="relative group/carousel -mx-4 px-4">
        <div 
          ref={scrollRef} 
          className="flex overflow-x-auto snap-x snap-mandatory gap-8 pb-12 scrollbar-none" 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product, index) => (
            <div key={product.id} className="snap-start shrink-0 w-[78vw] sm:w-[45vw] md:w-[35vw] lg:w-[28vw] xl:w-[22vw]">
              <ProductCard
                id={product.id}
                title={product.title}
                price={typeof product.price === 'number' ? `₹${product.price.toLocaleString()}` : product.price}
                image={product.image}
                rating={product.rating}
                reviews={product.reviews}
                stock={product.stock}
                index={index}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

