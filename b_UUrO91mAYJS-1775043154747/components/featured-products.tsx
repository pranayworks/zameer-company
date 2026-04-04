'use client'

import { motion } from 'framer-motion'
import { ProductCard } from './product-card'
import { useInView } from 'react-intersection-observer'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([])
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })

  useEffect(() => {
    async function fetchFeatured() {
      const { data } = await supabase.from('products').select('*').limit(4)
      if (data) setProducts(data)
    }
    fetchFeatured()
  }, [])

  return (
    <section ref={ref} className="py-24 px-12 max-w-[1920px] mx-auto bg-[#fdf9f2]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="flex justify-between items-end mb-16"
      >
        <div>
          <span className="font-body uppercase tracking-widest text-xs text-[#735c00] mb-2 block">
            New Arrivals
          </span>
          <h2 className="font-headline text-4xl text-[#1c1b1b]">
            The Seasonal Edit
          </h2>
        </div>
        <motion.a
          href="#"
          className="font-body uppercase tracking-widest text-xs text-[#1c1b1b] border-b border-[#1c1b1b]/20 hover:border-[#1c1b1b] transition-all pb-1"
          whileHover={{ x: 5 }}
        >
          View Collection
        </motion.a>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            id={product.id}
            title={product.title}
            price={typeof product.price === 'number' ? `₹${product.price.toLocaleString()}` : product.price}
            image={product.image}
            rating={product.rating}
            reviews={product.reviews}
            index={index}
          />
        ))}
      </div>
    </section>
  )
}
