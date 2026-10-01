'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { Newsletter } from '@/components/newsletter'
import { supabase } from '@/lib/supabase'
import { useMode } from '@/context/mode-context'

export default function MenPage() {
  const router = useRouter()
  const { modeDetails } = useMode()
  const [menProducts, setMenProducts] = useState<any[]>([])
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    async function fetchMenProducts() {
      let query = supabase.from('products').select('*').or('category.eq.Men,category.eq.Tees & Tops,category.eq.Hoodies & Outerwear,category.eq.Bottomwear')
      
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
          <span className="font-bold text-white">MEN&apos;S ARCHIVE</span>
        </div>
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[85vh] w-full overflow-hidden flex items-end justify-start pb-24 pt-12">
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          <Image
            src="https://res.cloudinary.com/dqgqdszk2/image/upload/q_auto/f_auto/v1775435764/WhatsApp_Image_2026-04-05_at_11.59.05_PM_do85la.jpg"
            alt="The Modern Gentleman"
            fill
            className="object-cover object-top"
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
            Seasonal Selection
          </span>
          <h1 className="font-headline text-[50px] md:text-[110px] text-white tracking-tighter leading-[0.85] mb-10">
            The Modern <br /> Gentleman
          </h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <button
              onClick={scrollToProducts}
              className="bg-white text-black px-10 py-4 font-body uppercase tracking-widest text-[10px] hover:bg-[#a3851a] hover:text-white transition-all shadow-2xl font-bold cursor-pointer"
            >
              Explore Collection
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Product Grid */}
      <section ref={productsRef} className="max-w-[1920px] mx-auto px-6 md:px-12 py-20">
        {/* Filter/Sort Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 border-b border-white/10 pb-6">
           <span className="font-body text-[10px] uppercase tracking-widest text-[#D6CEBE]">{menProducts.length} Masterpieces Found</span>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
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
      <section className="bg-[#1c1c18] py-24 px-6 md:px-12 overflow-hidden">
        <div className="max-w-[1920px] mx-auto flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            className="w-full lg:w-1/2 aspect-[4/5] relative overflow-hidden rounded-xl border border-white/10"
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
            <span className="font-body uppercase tracking-[0.4em] text-[10px] text-[#a3851a] mb-6 block font-bold">
              Editorial Advice
            </span>
            <h2 className="font-headline text-4xl md:text-6xl text-[#fdf9f2] mb-8 leading-tight">
              The Art of <br /> Curated Layering
            </h2>
            <div className="border-l-2 border-[#a3851a] pl-6 mb-8">
              <p className="font-body text-base text-[#fdf9f2]/80 italic leading-relaxed">
                "A well-tailored jacket is a gentleman's armor. It should move with you, not against you. In this archive, heritage is not a costume; it is a foundation."
              </p>
            </div>
            <p className="font-body text-xs text-[#fdf9f2]/60 mb-8 leading-relaxed max-w-lg">
              Modern masculinity is defined not by the quantity of garments, but by the quiet confidence of their fit and fabrication. Discover how our artisans merge century-old weaves with contemporary silhouettes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-24 px-6 text-center border-b border-white/10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="font-headline text-3xl md:text-5xl text-[#F4F1EA] mb-6 tracking-tighter">
            Join The Archive
          </h2>
          <p className="font-body text-[#D6CEBE]/70 text-xs mb-10 max-w-lg mx-auto">
            Receive early access to seasonal collections, exclusive editorial content, and invitations to private atelier events.
          </p>
          <Newsletter variant="section" />
        </motion.div>
      </section>

      <Footer />
    </main>
  )
}
