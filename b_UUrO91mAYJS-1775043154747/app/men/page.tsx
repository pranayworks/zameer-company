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

  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    async function fetchMenProducts() {
      let query = supabase.from('products').select('*').eq('category', 'Men')
      
      if (sortBy === 'price-low') query = query.order('price', { ascending: true })
      else if (sortBy === 'price-high') query = query.order('price', { ascending: false })
      else query = query.order('created_at', { ascending: false })

      const { data } = await query
      if (data) setMenProducts(data)
    }
    fetchMenProducts()
  }, [sortBy])
  const heroRef = useRef(null)
  const productsRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <main className="w-full bg-[#fdf9f2]">
      <Header />

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[95vh] w-full overflow-hidden flex items-end justify-start pb-32 pt-20">
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          <Image
            src="https://res.cloudinary.com/dqgqdszk2/image/upload/q_auto/f_auto/v1775435764/WhatsApp_Image_2026-04-05_at_11.59.05_PM_do85la.jpg"
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
            <button
              onClick={scrollToProducts}
              className="bg-white text-black px-12 py-5 font-body uppercase tracking-widest text-[10px] hover:bg-[#a3851a] hover:text-white transition-all shadow-2xl"
            >
              Explore Collection
            </button>
          </motion.div>
        </motion.div>
      </section>



      {/* Product Grid */}
      <section ref={productsRef} className="max-w-[1920px] mx-auto px-12 py-24">
        {/* Filter/Sort Header */}
        <div className="flex justify-between items-center mb-16 border-b border-[#1c1c18]/10 pb-8">
           <span className="font-body text-[10px] uppercase tracking-widest text-[#747878]">{menProducts.length} Masterpieces Found</span>
           <div className="flex items-center gap-6">
              <span className="font-body text-[10px] uppercase tracking-widest text-[#1c1c18] font-bold">Curate By:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none font-body text-[10px] uppercase tracking-widest text-[#a3851a] focus:ring-0 cursor-pointer outline-none font-black"
              >
                <option value="newest" className="text-[#1c1c18]">New Arrivals</option>
                <option value="price-low" className="text-[#1c1c18]">Price: Low to High</option>
                <option value="price-high" className="text-[#1c1c18]">Price: High to Low</option>
              </select>
           </div>
        </div>

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
              className="text-[#a3851a] font-body uppercase tracking-widest text-[10px] block hover:text-[#fdf9f2] transition-all"
              whileHover={{ x: 10 }}
            >

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
