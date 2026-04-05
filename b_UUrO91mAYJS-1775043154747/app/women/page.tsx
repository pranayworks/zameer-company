'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import { useRef } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function WomenPage() {
  const [womenProducts, setWomenProducts] = useState<any[]>([])
  
  useEffect(() => {
    async function fetchWomenProducts() {
      const { data } = await supabase.from('products').select('*').eq('category', 'Women')
      if (data) setWomenProducts(data)
    }
    fetchWomenProducts()
  }, [])
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <main className="w-full bg-[#fdf9f2]">
      <Header />

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[100vh] w-full overflow-hidden flex flex-col justify-center pt-24">
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          <Image
            src="/women_hero_silk_1775057460998.png"
            alt="Timeless Femininity"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-white/5" />
        </motion.div>

        <div className="relative z-10 max-w-[1920px] mx-auto w-full px-6 md:px-24 flex justify-end">
          <motion.div 
            style={{ opacity }}
            className="bg-white/40 backdrop-blur-md p-8 md:p-16 border border-white/50 shadow-2xl w-full md:w-1/2 lg:w-2/5"
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="font-body uppercase tracking-[0.6em] text-[8px] md:text-[10px] text-[#1c1c18] mb-6 block font-bold">
              Autumn / Winter &apos;24
            </span>
            <h1 className="font-headline text-[50px] sm:text-[70px] md:text-8xl lg:text-9xl text-[#1c1c18] leading-[0.85] mb-10 tracking-tighter">
              Timeless <br /> Femininity
            </h1>
            <p className="font-body text-[#1c1c18] text-sm mb-12 max-w-sm leading-relaxed font-semibold">
              A curated selection of luxury womenswear where heritage craft meets minimalist silhouettes for the modern woman.
            </p>
            <motion.button 
              className="bg-[#735c00] text-white px-14 py-6 font-body uppercase tracking-[0.3em] text-[10px]"
              whileHover={{ scale: 1.05, backgroundColor: '#1c1c18' }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Collection
            </motion.button>
          </motion.div>
        </div>
      </section>



      {/* Product Grid */}
      <section className="max-w-[1920px] mx-auto px-12 py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-24">
          {womenProducts.map((product, index) => (
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

      {/* The Lookbook Section */}
      <section className="py-40 bg-[#1c1c18]">
        <div className="max-w-[1920px] mx-auto px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12">
            <div>
              <span className="font-body uppercase tracking-[0.6em] text-[10px] text-[#a3851a] mb-6 block">
                Visual Stories
              </span>
              <h2 className="font-headline text-6xl text-[#fdf9f2] tracking-tighter">
                The Lookbook: <br /> Modern Heritage
              </h2>
            </div>
            <motion.button 
              className="border-b border-[#a3851a] text-[#a3851a] pb-2 font-body uppercase tracking-widest text-[10px] hover:text-[#fdf9f2] hover:border-[#fdf9f2] transition-colors"
              whileHover={{ x: 10 }}
            >
              View Full Lookbook
            </motion.button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <motion.div 
              className="lg:col-span-2 aspect-[16/9] relative overflow-hidden group"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2 }}
              viewport={{ once: true }}
            >
              <Image
                src="/women_lookbook_editorial_1775057578055.png"
                alt="Modern Heritage Editorial"
                fill
                className="object-cover transition-transform duration-[2s] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute bottom-12 left-12">
                <span className="text-white/60 text-[9px] uppercase tracking-[0.3em] mb-3 block">Autumn &apos;24 / Look 01</span>
                <h3 className="text-white font-headline text-3xl">Architectural Drape</h3>
              </div>
            </motion.div>

            <motion.div 
              className="aspect-[4/5] relative overflow-hidden group"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Image
                src="/women_floral_wrap_1775057559234.png"
                alt="Detail Editorial"
                fill
                className="object-cover transition-transform duration-[2s] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute bottom-12 left-12">
                <span className="text-white/60 text-[9px] uppercase tracking-[0.3em] mb-3 block">Autumn &apos;24 / Detail</span>
                <h3 className="text-white font-headline text-3xl">Handcrafted Textures</h3>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Inner Circle Section */}
      <section className="py-40 bg-[#fdf9f2] text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="w-12 h-12 border border-[#a3851a] mx-auto mb-10 flex items-center justify-center">
             <span className="material-symbols-outlined text-[#a3851a] text-xl">mail</span>
          </div>
          <h2 className="font-headline text-5xl text-[#1c1c18] mb-8">Join the Inner Circle</h2>
          <p className="font-body text-[#747878] text-sm mb-12 max-w-sm mx-auto leading-relaxed">
            Subscribe for early access to collection drops, exclusive editorial content, and invitations to private atelier events.
          </p>
          <div className="max-w-md mx-auto relative group">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="w-full bg-transparent border-b border-[#1c1c18]/20 py-4 px-2 font-body text-sm outline-none focus:border-[#a3851a] transition-all"
            />
            <button 
              type="submit" 
              className="absolute right-0 top-1/2 -translate-y-1/2 font-body uppercase tracking-[0.2em] text-[9px] font-bold text-[#1c1c18]"
            >
              Submit
            </button>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  )
}
