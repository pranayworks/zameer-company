'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { supabase } from '@/lib/supabase'
import { useMode } from '@/context/mode-context'

export default function WomenPage() {
  const router = useRouter()
  const { modeDetails } = useMode()
  const [womenProducts, setWomenProducts] = useState<any[]>([])
  const [sortBy, setSortBy] = useState('newest')
  
  useEffect(() => {
    async function fetchWomenProducts() {
      let query = supabase.from('products').select('*').or('category.eq.Women,category.eq.Architectural Sarees,category.eq.Kurtas & Chudidhars')
      if (sortBy === 'price-low') query = query.order('price', { ascending: true })
      else if (sortBy === 'price-high') query = query.order('price', { ascending: false })
      else query = query.order('created_at', { ascending: false })

      const { data } = await query
      if (data) setWomenProducts(data)
    }
    fetchWomenProducts()
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

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <main className="w-full transition-colors duration-700" style={{ backgroundColor: modeDetails.themeBg, color: '#F4F1EA' }}>
      <Header />

      {/* BACK BUTTON STRIP */}
      <div className="pt-28 max-w-[1920px] mx-auto px-6 md:px-12 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest transition-opacity hover:opacity-80 cursor-pointer"
          style={{ color: modeDetails.accentColor }}
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back
        </button>

        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D6CEBE]/70 flex items-center space-x-2">
          <Link href="/" className="hover:opacity-80">HOME</Link>
          <span>/</span>
          <span className="font-bold text-white">WOMEN&apos;S ATELIER</span>
        </div>
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[85vh] w-full overflow-hidden flex flex-col justify-center pt-12">
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          <Image
            src="/women_hero_silk_1775057460998.png"
            alt="Timeless Femininity"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>

        <div className="relative z-10 max-w-[1920px] mx-auto w-full px-6 md:px-24 flex justify-end">
          <motion.div 
            style={{ opacity }}
            className="bg-black/60 backdrop-blur-md p-8 md:p-12 border border-white/20 shadow-2xl w-full md:w-1/2 lg:w-2/5 rounded-xl text-white"
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="font-body uppercase tracking-[0.6em] text-[8px] md:text-[10px] text-amber-400 mb-4 block font-bold">
              Autumn / Winter &apos;24
            </span>
            <h1 className="font-headline text-[40px] sm:text-[60px] md:text-7xl text-white leading-[0.85] mb-6 tracking-tighter">
              Timeless <br /> Femininity
            </h1>
            <p className="font-body text-white/80 text-xs mb-8 max-w-sm leading-relaxed font-normal">
              A curated selection of luxury womenswear where heritage craft meets minimalist silhouettes for the modern woman.
            </p>
            <motion.button 
              onClick={scrollToProducts}
              className="bg-[#a3851a] text-white px-10 py-4 font-body uppercase tracking-[0.3em] text-[10px] font-bold rounded cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Collection
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Product Grid */}
      <section ref={productsRef} className="max-w-[1920px] mx-auto px-6 md:px-12 py-20">
        {/* Filter/Sort Header */}
        <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
           <span className="font-body text-[10px] uppercase tracking-widest text-[#D6CEBE]">{womenProducts.length} Masterpieces Found</span>
           <div className="flex items-center gap-4">
              <span className="font-body text-[10px] uppercase tracking-widest text-white font-bold">Curate By:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-black/60 border border-white/20 px-3 py-1.5 rounded font-body text-[10px] uppercase tracking-widest text-[#a3851a] focus:ring-0 cursor-pointer outline-none font-bold"
              >
                <option value="newest" className="bg-black text-white">New Arrivals</option>
                <option value="price-low" className="bg-black text-white">Price: Low to High</option>
                <option value="price-high" className="bg-black text-white">Price: High to Low</option>
              </select>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
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

      <Footer />
    </main>
  )
}
