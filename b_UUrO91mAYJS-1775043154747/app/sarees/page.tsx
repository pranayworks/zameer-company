'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { useRef, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function SareesPage() {
  const [sareeProducts, setSareeProducts] = useState<any[]>([])
  const [sortBy, setSortBy] = useState('newest')
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const productsRef = useRef<HTMLDivElement>(null)

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    async function fetchSareeProducts() {
      let query = supabase.from('products').select('*').eq('category', 'Sarees')
      if (sortBy === 'price-low') query = query.order('price', { ascending: true })
      else if (sortBy === 'price-high') query = query.order('price', { ascending: false })
      else query = query.order('created_at', { ascending: false })

      const { data } = await query
      if (data) setSareeProducts(data)
    }
    fetchSareeProducts()
  }, [sortBy])

  return (
    <main className="w-full bg-[#fdf9f2]">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[85vh] w-full pt-20 flex flex-col justify-center overflow-hidden">
        <div className="max-w-[1920px] mx-auto w-full px-6 md:px-24 grid lg:grid-cols-2 items-center gap-12 lg:gap-16 relative">
          <motion.div
            className="z-10 text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2 }}
          >
            <span className="font-body uppercase tracking-[0.4em] text-[8px] md:text-[10px] text-[#1c1c18]/40 mb-6 block font-bold">
              Legacy Collection
            </span>
            <h1 className="font-headline text-[50px] sm:text-[70px] md:text-8xl lg:text-9xl text-[#1c1c18] leading-[0.9] mb-10 tracking-tighter">
              The Drape <br className="hidden md:block" /> of <br className="hidden md:block" /> Heritage
            </h1>
            <p className="font-body text-[#1c1c18]/70 text-sm mb-12 max-w-sm mx-auto lg:mx-0 leading-relaxed font-medium">
              In this archive, the saree is a story of 5,000 years, curated for the modern connoisseur of fine handloom and artisanal weave.
            </p>
            <motion.button
              onClick={scrollToProducts}
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
                src="https://res.cloudinary.com/dqgqdszk2/image/upload/q_auto/f_auto/v1775435769/WhatsApp_Image_2026-04-06_at_5.29.54_AM_zwgfzd.jpg"
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
      <section ref={productsRef} className="max-w-[1920px] mx-auto px-12 py-16 md:py-32">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div>
            <span className="font-body uppercase tracking-[0.4em] text-[10px] text-[#a3851a] mb-6 block"> Masterpiece Series </span>
            <h2 className="font-headline text-5xl text-[#1c1c18] tracking-tighter">Showcasing Curated Weaves</h2>
          </div>
          <div className="flex items-center gap-10 border-b border-[#1c1c18]/10 pb-2">
              <div className="flex items-center gap-4">
                 <span className="font-body text-[10px] uppercase tracking-widest text-[#747878]">{sareeProducts.length} Pieces Found</span>
              </div>
              <div className="flex items-center gap-4">
                 <span className="font-body text-[10px] uppercase tracking-widest text-[#1c1c18] font-bold">Sort:</span>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-black">
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
      <section className="bg-white py-24 md:py-40 overflow-hidden border-y border-[#1c1c18]/5">
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 flex flex-col-reverse lg:flex-row items-center gap-16 lg:gap-24">
          <motion.div
            className="w-full lg:w-1/2 aspect-video bg-black relative shadow-2xl overflow-hidden group cursor-pointer"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            onClick={() => setIsVideoModalOpen(true)}
          >
            <div className="absolute inset-0 z-0">
               <Image 
                 src="https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=2600&auto=format&fit=crop" 
                 alt="Saree Masterclass Placeholder" 
                 fill 
                 className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-[3s]"
               />
               <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
            </div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
               <motion.div 
                 className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 mb-6 group-hover:bg-[#a3851a] group-hover:scale-110 transition-all duration-500"
                 whileHover={{ scale: 1.1 }}
               >
                 <span className="material-symbols-outlined text-white text-4xl">play_arrow</span>
               </motion.div>
               <h4 className="font-body text-[10px] uppercase tracking-[0.4em] text-white font-bold opacity-80 group-hover:opacity-100 transition-opacity">Watch Masterclass</h4>
            </div>
            
            <div className="absolute bottom-6 right-6 z-10 px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/10 flex items-center gap-3">
               <span className="material-symbols-outlined text-white text-xs">zoom_in</span>
               <span className="font-body text-[8px] uppercase tracking-widest text-white">Full Screen Insight</span>
            </div>
          </motion.div>

          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <span className="font-body uppercase tracking-[0.4em] text-[10px] text-[#a3851a] mb-8 block font-bold"> The Atelier Series </span>
            <h3 className="font-headline text-4xl md:text-6xl text-[#1c1c18] mb-10 leading-tight">Mastering the Art of <br /> The Nivi Drape</h3>
            <p className="font-body text-[#747878] text-sm leading-relaxed mb-12 max-w-lg mx-auto lg:mx-0 font-medium">
              Draping a saree is more than just wearing a garment; it is a ritual. Join our master stylist as she guides you through the nuances of the classic Nivi drape, ensuring every pleat is in place and your pallu breathes elegance.
            </p>
            <div className="space-y-6 flex flex-col items-center lg:items-start">
              {['1. THE PERFECT FOUNDATION TUCK', '2. PRECISION PLEATING TECHNIQUE', '3. THE PALLU: FLOW & STRENGTH'].map((step, i) => (
                <div key={i} className="flex items-center gap-6 group cursor-pointer" onClick={() => setIsVideoModalOpen(true)}>
                  <span className="font-headline text-xl text-[#a3851a]">{String(i + 1).padStart(2, '0')}.</span>
                  <span className="font-body uppercase tracking-widest text-[9px] group-hover:text-[#a3851a] transition-all font-bold">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal / Zoom Experience */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-12"
          >
            <button 
              onClick={() => setIsVideoModalOpen(false)}
               className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors"
            >
               <span className="material-symbols-outlined text-4xl">close</span>
            </button>
            
            <motion.div 
              className="w-full max-w-[1400px] aspect-video bg-black shadow-2xl relative"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
               <iframe 
                src="https://www.youtube.com/embed/9jNSaRCvK2I?autoplay=1&modestbranding=1&rel=0" 
                title="Saree Masterclass"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
              />
              <div className="absolute -bottom-16 left-0 right-0 flex justify-between items-center px-4">
                 <p className="text-white font-headline text-2xl tracking-widest">Mastering the Nivi Drape | 01</p>
                 <span className="text-[#a3851a] font-body text-[10px] uppercase tracking-widest font-black">Atelier Archive: Step-by-Step Excellence</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Soul of The Weaver */}
      <section className="py-40 bg-[#1c1c18] text-center px-12 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="relative z-10"
        >
          <h2 className="font-headline text-5xl md:text-7xl text-[#fdf9f2] mb-12 tracking-tighter">The Soul of <br /> The Weaver</h2>
          <p className="font-body text-[#fdf9f2]/60 text-sm mb-16 max-w-xl mx-auto leading-relaxed italic">
            Every thread in our Banarasi collection is hand-twisted and dip-dyed in small batches. It takes six months and two master weavers to complete a single six-yard archive masterpiece.
          </p>
          <div className="flex flex-col items-center gap-4">
            <span className="font-headline text-5xl text-[#a3851a]">12,000+</span>
            <span className="font-body uppercase tracking-[0.5em] text-[9px] text-[#fdf9f2]/40">Atisan Hours Per Collection</span>
          </div>
        </motion.div>
        <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_0.5px,_transparent_1px)] bg-[size:24px_24px]" />
      </section>

      <Footer />
    </main>
  )
}
