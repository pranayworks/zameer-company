'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { useRef, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useMode } from '@/context/mode-context'

export default function SareesPage() {
  const router = useRouter()
  const { modeDetails } = useMode()
  const [sareeProducts, setSareeProducts] = useState<any[]>([])
  const [sortBy, setSortBy] = useState('newest')
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const productsRef = useRef<HTMLDivElement>(null)

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    async function fetchSareeProducts() {
      let query = supabase.from('products').select('*').or('category.eq.Sarees,category.eq.Architectural Sarees')
      if (sortBy === 'price-low') query = query.order('price', { ascending: true })
      else if (sortBy === 'price-high') query = query.order('price', { ascending: false })
      else query = query.order('created_at', { ascending: false })

      const { data } = await query
      if (data) setSareeProducts(data)
    }
    fetchSareeProducts()
  }, [sortBy])

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
          <span className="font-bold text-white">ARCHITECTURAL SAREES</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-[80vh] w-full pt-12 flex flex-col justify-center overflow-hidden">
        <div className="max-w-[1920px] mx-auto w-full px-6 md:px-24 grid lg:grid-cols-2 items-center gap-12 relative">
          <motion.div
            className="z-10 text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2 }}
          >
            <span className="font-body uppercase tracking-[0.4em] text-[8px] md:text-[10px] text-amber-400 mb-4 block font-bold">
              Legacy Collection
            </span>
            <h1 className="font-headline text-[45px] sm:text-[65px] md:text-8xl text-white leading-[0.9] mb-8 tracking-tighter">
              The Drape <br className="hidden md:block" /> of <br className="hidden md:block" /> Heritage
            </h1>
            <p className="font-body text-[#D6CEBE]/80 text-xs mb-8 max-w-sm mx-auto lg:mx-0 leading-relaxed font-light">
              In this archive, the saree is a story of 5,000 years, curated for the modern connoisseur of fine handloom and artisanal weave.
            </p>
            <motion.button
              onClick={scrollToProducts}
              className="bg-amber-400 text-black font-bold px-10 py-4 font-body uppercase tracking-widest text-[10px] rounded hover:scale-105 transition-all cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore The Archive
            </motion.button>
          </motion.div>

          {/* Saree Hero Image */}
          <div className="relative aspect-[4/5] w-full max-w-lg mx-auto flex items-center justify-center">
            <motion.div
              className="w-full h-full relative z-0 overflow-hidden shadow-2xl rounded-lg border border-white/20"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5 }}
            >
              <Image
                src="https://res.cloudinary.com/dqgqdszk2/image/upload/q_auto/f_auto/v1775435769/WhatsApp_Image_2026-04-06_at_5.29.54_AM_zwgfzd.jpg"
                alt="Drape of Heritage"
                fill
                className="object-cover object-center"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Masterpiece Series */}
      <section ref={productsRef} className="max-w-[1920px] mx-auto px-6 md:px-12 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="font-body uppercase tracking-[0.4em] text-[10px] text-amber-400 mb-2 block font-bold"> Masterpiece Series </span>
            <h2 className="font-headline text-3xl md:text-5xl text-white tracking-tighter">Showcasing Curated Weaves</h2>
          </div>
          <div className="flex items-center gap-6">
            <span className="font-body text-[10px] uppercase tracking-widest text-[#D6CEBE]">{sareeProducts.length} Pieces Found</span>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {sareeProducts.map((product, index) => (
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
