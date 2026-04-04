'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function SareesPage() {
  const [sareeProducts, setSareeProducts] = useState<any[]>([])
  
  useEffect(() => {
    async function fetchSareeProducts() {
      const { data } = await supabase.from('products').select('*').eq('category', 'Sarees')
      if (data) setSareeProducts(data)
    }
    fetchSareeProducts()
  }, [])
  return (
    <main className="w-full bg-[#fdf9f2]">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[85vh] w-full pt-20 flex flex-col justify-center overflow-hidden">
        <div className="max-w-[1920px] mx-auto w-full px-12 md:px-24 grid lg:grid-cols-2 items-center gap-16 relative">
          <motion.div 
            className="z-10"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2 }}
          >
            <span className="font-body uppercase tracking-[0.4em] text-[10px] text-[#1c1c18]/40 mb-6 block">
              Legacy Collection
            </span>
            <h1 className="font-headline text-8xl md:text-9xl text-[#1c1c18] leading-none mb-10 tracking-tighter">
              The Drape <br /> of <br /> Heritage
            </h1>
            <p className="font-body text-[#1c1c18]/70 text-sm mb-12 max-w-sm leading-relaxed">
              In this archive, the saree is a story of 5,000 years, curated for the modern connoisseur of fine handloom and artisanal weave.
            </p>
            <motion.button 
              className="gold-satin text-white px-12 py-5 font-body uppercase tracking-widest text-[10px] hover:scale-105 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore The Archive
            </motion.button>
          </motion.div>

          {/* Saree Hero Image */}
          <div className="relative aspect-[4/5] w-full max-w-2xl mx-auto flex items-center justify-center">
             <motion.div 
              className="w-full h-full relative z-0 overflow-hidden shadow-2xl rounded-sm"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5 }}
             >
                <Image
                  src="/saree_1.png"
                  alt="Drape of Heritage"
                  fill
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/10" />
             </motion.div>
             <motion.div 
               className="w-1/3 aspect-[3/4] absolute -bottom-12 -left-12 z-10 overflow-hidden shadow-2xl border-white border-8"
               initial={{ y: 50, opacity: 0 }}
               whileInView={{ y: 0, opacity: 1 }}
               transition={{ duration: 1.2, delay: 0.4 }}
             >
                <Image
                  src="/saree_2.png"
                  alt="Saree Detail"
                  fill
                  className="object-cover"
                />
             </motion.div>
          </div>
        </div>
      </section>

      {/* Masterpiece Series */}
      <section className="max-w-[1920px] mx-auto px-12 py-32">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24">
            <div>
              <span className="font-body uppercase tracking-[0.4em] text-[10px] text-[#a3851a] mb-6 block"> Masterpiece Series </span>
              <h2 className="font-headline text-5xl text-[#1c1c18] tracking-tighter">Showcasing Curated Weaves</h2>
            </div>
            <button className="font-body uppercase tracking-widest text-[9px] text-[#747878] hover:text-[#a3851a] border-b border-[#1c1c18]/10 pb-1 transition-all">View All Masterpieces →</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
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

      {/* Mastering The Nivi Section */}
      <section className="bg-white py-32 overflow-hidden border-y border-[#1c1c18]/5">
         <div className="max-w-[1920px] mx-auto px-12 flex flex-col-reverse lg:flex-row items-center gap-24">
            <motion.div 
              className="w-full lg:w-1/2 aspect-video bg-black relative flex items-center justify-center group"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
               <span className="material-symbols-outlined text-white text-6xl opacity-30 group-hover:opacity-100 transition-opacity cursor-pointer">play_circle</span>
            </motion.div>
            
            <div className="w-full lg:w-1/2">
                <span className="font-body uppercase tracking-[0.4em] text-[10px] text-[#a3851a] mb-8 block"> The Atelier Series </span>
                <h3 className="font-headline text-6xl text-[#1c1c18] mb-10 leading-tight">Mastering the Art of <br /> The Nivi Drape</h3>
                <p className="font-body text-[#747878] text-sm leading-relaxed mb-12 max-w-lg">
                  Draping a saree is more than just wearing a garment; it is a ritual. Join our master stylist as she guides you through the nuances of the classic Nivi drape, ensuring every pleat is in place and your pallu breathes elegance.
                </p>
                <div className="space-y-6">
                    {['1. THE PERFECT FOUNDATION TUCK', '2. PRECISION PLEATING TECHNIQUE', '3. THE PALLU: FLOW & STRENGTH'].map((step, i) => (
                         <div key={i} className="flex items-center gap-6 group cursor-pointer">
                            <span className="font-headline text-xl text-[#a3851a]">{String(i+1).padStart(2, '0')}.</span>
                            <span className="font-body uppercase tracking-widest text-[9px] group-hover:text-[#a3851a] transition-all">{step}</span>
                         </div>
                    ))}
                </div>
            </div>
         </div>
      </section>

      {/* The Soul of The Weaver */}
      <section className="py-40 bg-[#1c1c18] text-center px-12 relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="relative z-10"
          >
             <h2 className="font-headline text-7xl text-[#fdf9f2] mb-12 tracking-tighter">The Soul of <br /> The Weaver</h2>
             <p className="font-body text-[#fdf9f2]/60 text-sm mb-16 max-w-xl mx-auto leading-relaxed italic">
               Every thread in our Banarasi collection is hand-twisted and dip-dyed in small batches. It takes six months and two master weavers to complete a single six-yard archive masterpiece.
             </p>
             <div className="flex flex-col items-center gap-4">
                <span className="font-headline text-5xl text-[#a3851a]">12,000+</span>
                <span className="font-body uppercase tracking-[0.5em] text-[9px] text-[#fdf9f2]/40">Atisan Hours Per Collection</span>
             </div>
          </motion.div>
          {/* Subtle bg texture/image placeholder */}
          <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_0.5px,_transparent_1px)] bg-[size:24px_24px]" />
      </section>

      <Footer />
    </main>
  )
}
