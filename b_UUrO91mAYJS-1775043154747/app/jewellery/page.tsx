'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function JewelleryPage() {
  const [jewelleryProducts, setJewelleryProducts] = useState<any[]>([])
  
  useEffect(() => {
    async function fetchJewelleryProducts() {
      const { data } = await supabase.from('products').select('*').eq('category', 'Jewellery')
      if (data) setJewelleryProducts(data)
    }
    fetchJewelleryProducts()
  }, [])
  return (
    <main className="w-full bg-[#fdf9f2]">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[95vh] w-full pt-20 flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/emerald_choker.png"
            alt="The Fine Ornament"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="max-w-[1920px] mx-auto w-full px-12 md:px-24 grid items-center relative z-10">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="font-body uppercase tracking-[0.8em] text-[10px] text-[#a3851a] mb-10 block drop-shadow-lg"> Collection: Vintage & Bespoke </span>
            <h1 className="font-headline text-[100px] md:text-[180px] text-white leading-none mb-12 tracking-tighter drop-shadow-2xl">
              The Fine <br /> Ornament
            </h1>
            <div className="flex flex-col md:flex-row items-center justify-center gap-10">
                <motion.button 
                  className="bg-[#a3851a] text-white px-16 py-6 font-body uppercase tracking-widest text-[10px] shadow-2xl hover:bg-white hover:text-black transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explore Collection
                </motion.button>
                <div className="w-px h-12 bg-white/40 hidden md:block" />
                <button className="text-white font-body uppercase tracking-widest text-[9px] hover:text-[#a3851a] transition-all drop-shadow-md">Book A Presentation →</button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Curated Selections Bar */}
      <div className="border-b border-[#1c1c18]/5">
        <div className="max-w-[1920px] mx-auto px-12 py-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="md:w-1/3">
                <h2 className="font-headline text-3xl mb-4">Curated Selections</h2>
                <p className="font-body text-[#747878] text-[11px] leading-relaxed italic">Each piece is meticulously restored or handcrafted, a timeless narrative of craftsmanship. Curated for the contemporary silhouette.</p>
            </div>
            <div className="flex gap-12 font-body uppercase tracking-[0.2em] text-[9px] text-[#747878]">
                {['Necklaces', 'Earrings', 'Bracelets', 'Rings'].map((cat) => (
                    <button key={cat} className="hover:text-[#a3851a] transition-colors">{cat}</button>
                ))}
            </div>
        </div>
      </div>

      {/* Product Grid */}
      <section className="max-w-[1920px] mx-auto px-12 py-32">
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
      <section className="bg-white py-40 border-y border-[#1c1c18]/5">
         <div className="max-w-[1920px] mx-auto px-12 flex flex-col md:flex-row items-center gap-32">
             <div className="w-full md:w-1/2 aspect-[4/5] bg-gray-100 relative shadow-2xl overflow-hidden">
                 <Image
                    src="/kundan_pair.png"
                    alt="Bespoke Curation"
                    fill
                    className="object-cover grayscale"
                 />
                 <div className="absolute -bottom-10 -right-10 w-2/3 aspect-square bg-[#a3851a] flex flex-col items-center justify-center p-12 text-center text-white">
                      <span className="material-symbols-outlined text-4xl mb-6">shield</span>
                      <span className="font-body uppercase tracking-[0.2em] text-[9px] font-bold">Lifetime Authenticity Guaranteed</span>
                 </div>
             </div>
             
             <div className="w-full md:w-1/2">
                <h3 className="font-headline text-6xl text-[#1c1c18] mb-12 tracking-tight leading-tight">Personalized <br /> Curation</h3>
                <p className="font-body text-[#747878] text-sm mb-16 max-w-sm leading-relaxed">
                  Speak with our lead designers to commission a custom masterpiece or find the perfect heirloom for your family archive. Our bespoke concierge service ensures every detail is captured with precision.
                </p>
                <div className="space-y-10 border-t border-[#1c1c18]/5 pt-10">
                    <div className="flex justify-between items-center group cursor-pointer border-b border-[#1c1c18]/5 pb-6">
                        <span className="font-body uppercase tracking-widest text-[10px]">Speak with our Head Designer</span>
                        <span className="material-symbols-outlined text-sm opacity-50 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                    </div>
                    <div className="flex justify-between items-center group cursor-pointer pb-6">
                        <span className="font-body uppercase tracking-widest text-[10px]">Last Presentation Request</span>
                        <span className="material-symbols-outlined text-sm opacity-50 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                    </div>
                </div>
             </div>
         </div>
      </section>

      {/* Jewelry Care */}
      <section className="py-40 px-12 max-w-[1920px] mx-auto">
         <div className="flex flex-col md:flex-row justify-between gap-24 mb-24 items-end">
             <h2 className="font-headline text-5xl md:text-6xl text-[#1c1c18] tracking-tighter shrink-0">Jewelry Care <br /> Essentials</h2>
             <p className="font-body text-[#747878] text-xs max-w-md leading-relaxed italic">The jewelry in our archive is meant to last lifetimes. Proper maintenance ensures each piece remains as radiant as the day it was constructed.</p>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
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
