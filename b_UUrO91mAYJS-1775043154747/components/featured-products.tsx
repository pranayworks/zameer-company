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
    <section ref={ref} className="py-16 md:py-24 px-6 md:px-12 max-w-[1920px] mx-auto bg-[#fdf9f2]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="flex justify-between items-end mb-12 md:mb-16"
      >
        <div>
          <span className="font-body uppercase tracking-widest text-xs text-[#735c00] mb-2 block">
            New Arrivals
          </span>
          <h2 className="font-headline text-4xl text-[#1c1b1b]">
            The Seasonal Edit
          </h2>
        </div>
        <div className="flex items-center gap-6">
          <motion.a
            href="/sarees"
            className="font-body uppercase tracking-widest text-xs text-[#1c1b1b] border-b border-[#1c1b1b]/20 hover:border-[#1c1b1b] transition-all pb-1 hidden sm:block"
            whileHover={{ x: 5 }}
          >
            View Collection
          </motion.a>
          
          <div className="flex gap-2">
            <button 
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border border-[#1c1b1b]/20 flex items-center justify-center hover:bg-[#1c1b1b] hover:text-white transition-all text-[#1c1b1b]"
              aria-label="Previous products"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border border-[#1c1b1b]/20 flex items-center justify-center hover:bg-[#1c1b1b] hover:text-white transition-all text-[#1c1b1b]"
              aria-label="Next products"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
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
            <div key={product.id} className="snap-start shrink-0 w-[76vw] sm:w-[45vw] md:w-[35vw] lg:w-[28vw] xl:w-[22vw]">
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
