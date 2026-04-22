'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { Newsletter } from '@/components/newsletter'
import { Product } from '@/lib/admin-helpers'
import { supabase } from '@/lib/supabase'

export default function GiftHampersPage() {
  const [hampers, setHampers] = useState<any[]>([])
  const [sortBy, setSortBy] = useState('newest')
  const [loading, setLoading] = useState(true)

  const heroRef = useRef(null)
  const productsRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  useEffect(() => {
    async function fetchHampers() {
      setLoading(true)
      let query = supabase.from('products').select('*').eq('category', 'Gift Hampers')
      
      if (sortBy === 'price-low') query = query.order('price', { ascending: true })
      else if (sortBy === 'price-high') query = query.order('price', { ascending: false })
      else query = query.order('created_at', { ascending: false })

      const { data } = await query
      if (data) setHampers(data)
      setLoading(false)
    }
    fetchHampers()
  }, [sortBy])

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <main className="w-full bg-[#fdf9f2]">
      <Header />

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[95vh] w-full overflow-hidden flex items-center justify-center pt-20 px-6 md:px-12 text-center">
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgmcnnAtTwbIAykGvL9b7AFLhI0yTKdR01mNicm-noVnAYkEmRvJ0VhZ6LaZBsON7nbSE6hTEuuoDiO3SccJbc3xjsdTuT8SgejFMpRoa2dMX6NMqkNL4Y-eFYJ4H_PVQpPP_6wzmGsK-B5ozkjDKtiplA89WW1cMYXOSIiQqcfGM7k_MBhsWkCmbcMAhWhKJWhs5LAkkabXoQlwlhYSZT4YOaOZAEnCRNNGXp0KqQL4SiyOLqFmcL-3fPmf0bK2-gxo6_NPCb70M1"
            alt="Gift Hampers Collection"
            fill
            className="object-cover opacity-90 scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#fdf9f2]/20 via-transparent to-[#fdf9f2]/40" />
          <div className="absolute inset-0 bg-black/30" />
        </motion.div>

        <motion.div
          style={{ opacity }}
          className="relative z-10 max-w-4xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="font-label text-xs uppercase tracking-[0.4em] text-white/80 mb-6 block font-bold">
            The Atelier Series
          </span>
          <h1 className="font-display text-[60px] md:text-[100px] text-white tracking-tighter leading-[0.9] mb-8">
            The Art of <br/><span className="italic font-serif">Giving</span>
          </h1>
          <p className="font-body text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
            Curated heritage collections for life's most meaningful moments. Hand-picked objects of beauty, delivered with soul.
          </p>
          <button
            onClick={scrollToProducts}
            className="bg-white text-black px-12 py-5 font-body uppercase tracking-[0.3em] text-[10px] font-black hover:bg-[#a3851a] hover:text-white transition-all shadow-2xl"
          >
            Explore Collections
          </button>
        </motion.div>
      </section>

      {/* Product Grid */}
      <section ref={productsRef} className="max-w-[1920px] mx-auto px-6 md:px-12 py-24">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 border-b border-[#1c1c18]/10 pb-8 gap-6">
           <div className="text-left">
              <h2 className="font-display text-3xl text-primary mb-2">Curated Favourites</h2>
              <p className="font-body text-[10px] uppercase tracking-widest text-[#747878]">{hampers.length} Pieces in Archive</p>
           </div>
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

        {loading ? (
          <div className="py-40 text-center opacity-40 font-headline text-2xl">
            Unveiling the archive...
          </div>
        ) : hampers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-20">
            {hampers.map((product, index) => (
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
        ) : (
          <div className="py-40 text-center">
            <span className="material-symbols-outlined text-6xl opacity-10 mb-6 block">inventory_2</span>
            <h3 className="font-headline text-3xl text-[#1c1c18] mb-4 italic">The archive is currently being curated.</h3>
            <p className="font-body text-[#747878] text-sm max-w-md mx-auto leading-relaxed">Our artisans are hand-picking exceptional items for this collection. Please return soon to discover our new beginnings.</p>
          </div>
        )}
      </section>

      {/* Bespoke Section */}
      <section className="py-24 md:py-48 bg-black text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-20 pointer-events-none">
          <Image 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrYG_6-LxjxNbpuJf_QgnY_1mpNYk3AND3OXMBa323biX2VZLRlBYaSiIRa8WkOKqegq8-pp-pgt-MFN_useRNYpeshIW69Ut3f_xuJdK-fkeV5phyGqTrwiHnrRt_mSbaMWGogz_yDX_5yRthIaaEePpj-Nr6II3diCL2YsocAXIkCWQnXy_dU9xIh5XAUj_ee9paOYTs88pJQgW4FQbgEm0Z5l2zuqTEuihMwvQxNlkLVwnPmscWMlEhSegK1THtB5bY6qCxBWbS"
            alt="Silk Detail"
            fill
            className="object-cover"
          />
        </div>
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <div>
            <span className="font-label text-[10px] uppercase tracking-[0.4em] text-[#a3851a] mb-8 block font-bold">Personalized Perfection</span>
            <h2 className="font-display text-5xl md:text-8xl mb-12 leading-[0.9]">Bespoke <br/><span className="italic font-serif">Curations</span></h2>
            <p className="font-body text-lg md:text-xl text-white/60 leading-relaxed mb-12 max-w-lg">
                Design a story uniquely yours. Select every element from our archive—from the choice of textile lining to the handwritten calligraphy on the card.
            </p>
            <ul className="space-y-8 mb-16">
              {[
                { icon: 'inventory_2', label: 'Select Your Vessel' },
                { icon: 'auto_awesome', label: 'Curate the Contents' },
                { icon: 'edit_note', label: 'Personalize the Story' }
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-6 group">
                  <div className="w-12 h-12 bg-white/10 flex items-center justify-center group-hover:bg-[#a3851a] transition-all">
                    <span className="material-symbols-outlined text-white text-xl" data-icon={item.icon}>{item.icon}</span>
                  </div>
                  <span className="font-label text-[10px] uppercase tracking-[0.3em] font-bold text-white/80">{item.label}</span>
                </li>
              ))}
            </ul>
            <Link 
              href="/contact" 
              className="inline-block bg-[#a3851a] text-white px-12 py-5 text-[10px] uppercase tracking-[0.3em] font-black hover:bg-white hover:text-black transition-all shadow-2xl"
            >
              Start Building
            </Link>
          </div>
          <div className="relative h-[400px] md:h-[700px]">
             <div className="absolute inset-0 border border-[#a3851a]/30 -m-4 translate-x-8 translate-y-8 z-0"></div>
             <Image 
               src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlF18s-kDZpRQSdej3PweqO0sjaxqrQ6EM173gAFWaSS18rQr5u8TaqgeF7jFxaKHI2QalxH-z1p52Ameq12RdG9EJ8GJEBWNXtJPLdKQRpssz3EzLjiP3-IVHoBu0r3bdxf_1NltHkZxTJIMYtDl26xr2Jk1xnje1wy4e3PBH0YsohLwW2Ey7PKIDP0LBanDp7eZLIP1q9nayjjrY_1rUdmjgENYBP-IydqhozMP1L4x2pVSGI3bpNBgNgwHFA4xYCR5prKO3Z4i1"
               alt="Artisan"
               fill
               className="object-cover relative z-10"
             />
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <Newsletter />

      <Footer />
    </main>
  )
}
