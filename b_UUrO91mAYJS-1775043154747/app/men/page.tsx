'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import { useRef } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { Newsletter } from '@/components/newsletter'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function MenPage() {
  const [menProducts, setMenProducts] = useState<any[]>([])
  
  useEffect(() => {
    async function fetchMenProducts() {
      const { data } = await supabase.from('products').select('*').eq('category', 'Men')
      if (data) setMenProducts(data)
    }
    fetchMenProducts()
  }, [])
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <main className="w-full bg-[#fdf9f2]">
      <Header />

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[95vh] w-full overflow-hidden flex items-end justify-start pb-32 pt-20">
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          <Image
            src="/men_hero_suit_1775057251070.png"
            alt="The Modern Gentleman"
            fill
            className="object-cover object-top"
            priority
          />
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>

        <motion.div 
          style={{ opacity }}
          className="relative z-10 text-left px-6 md:px-24 max-w-4xl"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="font-body uppercase tracking-[0.4em] text-[8px] md:text-[10px] text-white/80 mb-6 block font-bold">
            Seasonal Selection
          </span>
          <h1 className="font-headline text-[60px] md:text-[120px] text-white tracking-tighter leading-[0.8] mb-12">
            The Modern <br /> Gentleman
          </h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <button className="bg-white text-black px-12 py-5 font-body uppercase tracking-widest text-[10px] hover:bg-[#a3851a] hover:text-white transition-all shadow-2xl">
              Explore Collection
            </button>
          </motion.div>
        </motion.div>
      </section>

      <div className="sticky top-[70px] md:top-[80px] z-30 bg-[#fdf9f2]/80 backdrop-blur-lg border-y border-[#1c1c18]/5">
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 py-4 md:py-6 flex flex-col md:flex-row justify-between items-center text-[9px] md:text-[10px] font-body uppercase tracking-widest gap-4 md:gap-0">
          <div className="flex gap-8 md:gap-12">
            <button className="hover:text-[#a3851a] transition-colors flex items-center gap-2 font-bold">
              Filter <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </button>
            <button className="hover:text-[#a3851a] transition-colors flex items-center gap-2 font-bold">
              Size <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </button>
          </div>
          <div className="flex gap-8 md:gap-12">
            <span className="text-[#c1bdb6] hidden sm:inline">12 / 148 items</span>
            <button className="hover:text-[#a3851a] transition-colors flex items-center gap-2 font-bold">
              Sort <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <section className="max-w-[1920px] mx-auto px-12 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20">
          {menProducts.map((product, index) => (
            <ProductCard 
              key={product.id}
              id={product.id}
              title={product.title}
              price={typeof product.price === 'number' ? `₹${product.price.toLocaleString()}` : product.price}
              image={product.image}
              rating={product.rating}
              reviews={product.reviews}
              stock={product.stock}
              index={index} 
            />
          ))}
        </div>
      </section>

      {/* Editorial Advice Section */}
      <section className="bg-[#1c1c18] py-32 px-12 overflow-hidden">
        <div className="max-w-[1920px] mx-auto flex flex-col lg:flex-row items-center gap-24">
          <motion.div 
            className="w-full lg:w-1/2 aspect-[4/5] relative overflow-hidden"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <Image
              src="/men_layering_editorial_1775057354438.png"
              alt="Editorial Advice"
              fill
              className="object-cover"
            />
          </motion.div>
          
          <motion.div 
            className="w-full lg:w-1/2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <span className="font-body uppercase tracking-[0.4em] text-[10px] text-[#a3851a] mb-8 block">
              Editorial Advice
            </span>
            <h2 className="font-headline text-5xl md:text-7xl text-[#fdf9f2] mb-10 leading-tight">
              The Art of <br /> Curated Layering
            </h2>
            <div className="border-l-2 border-[#a3851a] pl-8 mb-12">
              <p className="font-body text-lg text-[#fdf9f2]/80 italic leading-relaxed">
                "A well-tailored jacket is a gentleman's armor. It should move with you, not against you. In this archive, heritage is not a costume; it is a foundation."
              </p>
            </div>
            <p className="font-body text-sm text-[#fdf9f2]/60 mb-12 leading-relaxed max-w-lg">
              Modern masculinity is defined not by the quantity of garments, but by the quiet confidence of their fit and fabrication. Discover how our artisans merge century-old weaves with contemporary silhouettes for an effortless transition from boardroom to ballroom.
            </p>
            <motion.button 
              className="border-b border-[#a3851a] text-[#a3851a] pb-2 font-body uppercase tracking-widest text-[10px] block hover:text-[#fdf9f2] hover:border-[#fdf9f2] transition-all"
              whileHover={{ x: 10 }}
            >
              Read Full Editorial Guide
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-32 px-6 text-center border-b border-[#1c1c18]/5">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="font-headline text-4xl md:text-6xl text-[#1c1c18] mb-8 tracking-tighter">
            Join The Archive
          </h2>
          <p className="font-body text-[#747878] text-sm mb-12 max-w-lg mx-auto">
            Receive early access to seasonal collections, exclusive editorial content, and invitations to private atelier events.
          </p>
          <Newsletter variant="section" />
        </motion.div>
      </section>

      <Footer />
    </main>
  )
}
