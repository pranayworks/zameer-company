'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { useRef, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useMode } from '@/context/mode-context'

export default function JewelleryPage() {
  const router = useRouter()
  const { modeDetails } = useMode()
  const [jewelleryProducts, setJewelleryProducts] = useState<any[]>([])
  const [sortBy, setSortBy] = useState('newest')
  const productsRef = useRef<HTMLDivElement>(null)

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    async function fetchJewelleryProducts() {
      let query = supabase.from('products').select('*').eq('category', 'Jewellery')
      if (sortBy === 'price-low') query = query.order('price', { ascending: true })
      else if (sortBy === 'price-high') query = query.order('price', { ascending: false })
      else query = query.order('created_at', { ascending: false })

      const { data } = await query
      if (data) setJewelleryProducts(data)
    }
    fetchJewelleryProducts()
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
          <span className="font-bold text-white">BESPOKE JEWELLERY</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-[80vh] w-full pt-12 flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://res.cloudinary.com/dqgqdszk2/image/upload/q_auto/f_auto/v1775435771/WhatsApp_Image_2026-04-05_at_9.50.14_PM_dg9fjw.jpg"
            alt="The Fine Ornament"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="max-w-[1920px] mx-auto w-full px-6 md:px-24 grid items-center relative z-10">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="font-body uppercase tracking-[0.5em] text-[8px] md:text-[10px] text-amber-400 mb-4 block font-bold"> 
              Collection: Vintage & Bespoke 
            </span>
            <h1 className="font-headline text-[45px] sm:text-[65px] md:text-[100px] text-white leading-[0.9] mb-8 tracking-tighter">
              The Fine <br /> Ornament
            </h1>
            <button
              onClick={scrollToProducts}
              className="bg-amber-400 text-black px-10 py-4 font-body uppercase tracking-widest text-[9px] font-bold rounded shadow-2xl hover:bg-white transition-all cursor-pointer"
            >
              Explore Collection
            </button>
          </motion.div>
        </div>
      </section>

      {/* Product Grid */}
      <section ref={productsRef} className="max-w-[1920px] mx-auto px-6 md:px-12 py-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 border-b border-white/10 pb-6">
          <span className="font-body text-[10px] uppercase tracking-widest text-[#D6CEBE]">{jewelleryProducts.length} Pieces Found</span>
          <div className="flex items-center gap-4">
            <span className="font-body text-[10px] uppercase tracking-widest text-white font-bold">Sort:</span>
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
          {jewelleryProducts.map((product, index) => (
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
