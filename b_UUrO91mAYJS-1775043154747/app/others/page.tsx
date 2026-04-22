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

export default function OthersPage() {
  const [otherProducts, setOtherProducts] = useState<any[]>([])
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    async function fetchOtherProducts() {
      // Logic from admin-helpers to get everything NOT in the main categories
      let query = supabase.from('products').select('*')
      
      if (sortBy === 'price-low') query = query.order('price', { ascending: true })
      else if (sortBy === 'price-high') query = query.order('price', { ascending: false })
      else query = query.order('created_at', { ascending: false })

      const { data } = await query
      if (data) {
        const filtered = (data as any[]).filter(p => !['Men', 'Women', 'Sarees', 'Jewellery', 'Gift Hampers'].includes(p.category))
        setOtherProducts(filtered)
      }
    }
    fetchOtherProducts()
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
            src="https://images.unsplash.com/photo-1590736910113-f92301905477?q=80&w=2670&auto=format&fit=crop"
            alt="The Curated Archive"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>

        <motion.div
          style={{ opacity }}
          className="relative z-10 text-left px-6 md:px-24 max-w-4xl"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="font-body uppercase tracking-[0.4em] text-[8px] md:text-[10px] text-white/80 mb-6 block font-bold">
            Eclectic Essentials
          </span>
          <h1 className="font-headline text-[60px] md:text-[120px] text-white tracking-tighter leading-[0.8] mb-12">
            The Curated <br /> Collection
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
              Explore Archive
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Product Grid */}
      <section ref={productsRef} className="max-w-[1920px] mx-auto px-12 py-24">
        {/* Filter/Sort Header */}
        <div className="flex justify-between items-center mb-16 border-b border-[#1c1c18]/10 pb-8">
           <span className="font-body text-[10px] uppercase tracking-widest text-[#747878]">{otherProducts.length} Pieces Found</span>
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

        {otherProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20">
            {otherProducts.map((product, index) => (
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
            <h3 className="font-headline text-3xl text-[#1c1c18] mb-4">The archive is currently empty.</h3>
            <p className="font-body text-[#747878] text-sm">Our curators are searching for special pieces to include here soon.</p>
          </div>
        )}
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
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2670&auto=format&fit=crop"
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
              The Charm of <br /> The Unconventional
            </h2>
            <div className="border-l-2 border-[#a3851a] pl-8 mb-12">
              <p className="font-body text-lg text-[#fdf9f2]/80 italic leading-relaxed">
                "Style is a deeply personal language. It flourishes in the spaces between categories, where heritage meets the unexpected."
              </p>
            </div>
            <p className="font-body text-sm text-[#fdf9f2]/60 mb-12 leading-relaxed max-w-lg">
              Our 'Others' collection is a tribute to the pieces that defy easy definition. From artisanal accessories to unique lifestyle items, each selection is made with the same commitment to tradition and quality that defines the Friends of 4 atelier.
            </p>
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
