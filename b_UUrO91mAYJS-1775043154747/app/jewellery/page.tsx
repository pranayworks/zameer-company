'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { useRef, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function JewelleryPage() {
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
    <main className="w-full bg-[#fdf9f2]">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[80vh] md:h-[95vh] w-full pt-20 flex flex-col justify-center overflow-hidden">
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
            <span className="font-body uppercase tracking-[0.5em] md:tracking-[0.8em] text-[8px] md:text-[10px] text-[#e2bb53] mb-6 md:mb-10 block drop-shadow-lg font-bold"> Collection: Vintage & Bespoke </span>
            <h1 className="font-headline text-[50px] sm:text-[70px] md:text-[120px] lg:text-[180px] text-white leading-[0.9] mb-8 md:mb-12 tracking-tighter drop-shadow-2xl">
              The Fine <br /> Ornament
            </h1>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
              <motion.button
                onClick={scrollToProducts}
                className="bg-[#a3851a] text-white px-10 md:px-16 py-4 md:py-6 font-body uppercase tracking-widest text-[9px] md:text-[10px] shadow-2xl hover:bg-white hover:text-black transition-all font-bold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Collection
              </motion.button>
              <div className="w-px h-12 bg-white/40 hidden md:block" />

            </div>
          </motion.div>
        </div>
      </section>

      <div className="border-b border-[#1c1c18]/5">
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 py-10 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="w-full lg:w-1/3 text-center lg:text-left">
            <h2 className="font-headline text-3xl mb-4">Curated Selections</h2>
            <p className="font-body text-[#747878] text-[11px] leading-relaxed italic">Each piece is meticulously restored or handcrafted, a timeless narrative of craftsmanship. Curated for the contemporary silhouette.</p>
          </div>
          <div className="flex items-center gap-10">
              <div className="flex items-center gap-4">
                 <span className="font-body text-[10px] uppercase tracking-widest text-[#747878]">{jewelleryProducts.length} Pieces Found</span>
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
      </div>

      {/* Product Grid */}
      <section ref={productsRef} className="max-w-[1920px] mx-auto px-6 md:px-12 py-16 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-24">
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

      {/* Personalized Curation Section */}
      <section className="bg-white py-24 md:py-40 border-y border-[#1c1c18]/5">
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
          <div className="w-full md:w-1/2 aspect-[4/5] bg-[#f1ede6] relative shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden">
            <Image
              src="/jewelry_story.png"
              alt="A Jewelry Story"
              fill
              className="object-cover transition-transform duration-[3s] hover:scale-110"
            />
          </div>

          <div className="w-full md:w-1/2">
            <h3 className="font-headline text-6xl text-[#1c1c18] mb-12 tracking-tight leading-tight">A Timeless <br /> Narrative</h3>
            <p className="font-body text-[#747878] text-sm mb-16 max-w-sm leading-[1.8] italic">
              &quot;Every piece of jewellery tells a story. It is the language of heritage, a whisper of the past, and a promise for the future. We curate not just ornaments, but legacies meant to be worn across eras.&quot;
            </p>

          </div>
        </div>
      </section>

      {/* Jewelry Care */}
      <section className="py-24 md:py-40 px-6 md:px-12 max-w-[1920px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-24 mb-16 md:mb-24 items-start md:items-end">
          <h2 className="font-headline text-4xl md:text-5xl lg:text-6xl text-[#1c1c18] tracking-tighter shrink-0">Jewelry Care <br /> Essentials</h2>
          <p className="font-body text-[#747878] text-xs max-w-md leading-relaxed italic">The jewelry in our archive is meant to last lifetimes. Proper maintenance ensures each piece remains as radiant as the day it was constructed.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-12">
          {careSteps.map((step, i) => (
            <div key={i} className="group border-l border-[#1c1c18]/5 pl-8 hover:border-[#a3851a] transition-all">
              <span className="font-headline text-2xl text-[#a3851a] mb-6 block leading-none">{step.id}</span>
              <h4 className="font-body uppercase tracking-widest text-[10px] font-bold mb-6">{step.title}</h4>
              <p className="font-body text-[#747878] text-[11px] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}

const careSteps = [
  { id: '01', title: 'The Storage Ritual', desc: 'Each piece is delivered in silk velvet pouches or handcrafted boxes of solid teak. Store individually to prevent surface scratches from metal contact.' },
  { id: '02', title: 'Cleaning & Polishing', desc: 'Use a lint-free soft cloth after each wear. For deep cleaning, use lukewarm water and a soft-bristled brush, specifically for light metal grain wash.' },
  { id: '03', title: 'Annual Inspection', desc: 'We recommend an annual professional check of stone settings and clasps to ensure the physical integrity of your heirloom.' }
]
