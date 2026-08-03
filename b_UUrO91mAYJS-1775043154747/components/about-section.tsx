'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export function AboutSection() {
  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  }

  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const visionaries = [
    // ... rest of the component
    { name: 'Pattan Zameer', role: 'FOUNDER', desc: 'Pattan Zameer is the Founder of the company and the driving force behind its creation. He defines the vision, business model, and long-term goals. With strong knowledge of business and Indian stock markets, he focuses on strategic planning, investment decisions, and identifying profitable opportunities. He guides the leadership team and ensures the company grows in the right direction.', img: 'https://res.cloudinary.com/dqgqdszk2/image/upload/v1783888348/zameer_pic_rk1a3m.jpg' },
    { name: 'M. Pranay Kumar', role: 'CEO', desc: 'M. Pranay Kumar is responsible for executing the vision set by the founder. As CEO, he manages the overall business activities, leads the team, and ensures daily operations align with company goals. He focuses on growth, sales performance, and building the brand in the e-commerce market.', img: 'https://res.cloudinary.com/dqgqdszk2/image/upload/q_auto/f_auto/v1775438058/WhatsApp_Image_2026-04-06_at_6.38.31_AM_sxtmuk.jpg' },
    { name: 'Kusanapudi Reshwanth', role: 'COO', desc: 'Kusanapudi Reshwanth leads the core operations of the company. As COO, he manages inventory, supplier relationships, order processing, and delivery logistics. A passionate student at NIT Pondicherry, he brings a fresh, data-driven approach to ensuring smooth and efficient day-to-day functioning of the business.', img: '/reshwanth_cmo.jpg' },
    { name: 'Sai Kumar', role: 'CFO', desc: 'Sai Kumar oversees the financial side of the business. He manages budgeting, tracks expenses and profits, sets pricing strategies, and ensures financial stability. His role is key to maintaining profitability and sustainable growth.', img: '/placeholder-user.jpg' }
  ]

  return (
    <section className="bg-[#FAF7F2] py-24 md:py-36 overflow-hidden relative">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">
        {/* Header */}
        <motion.div
          className="text-center mb-24 md:mb-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariant}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 mb-4">
            <span className="text-gold-gradient font-body uppercase tracking-[0.3em] text-[10px] md:text-xs font-bold">
              ATELIER PHILOSOPHY
            </span>
          </div>
          <h2 className="font-headline text-5xl md:text-7xl lg:text-8xl text-[#12131A] font-extrabold mb-6 tracking-tight">The Story of <span className="text-gold-gradient italic font-serif">Tradition</span></h2>
          <p className="font-body uppercase tracking-[0.35em] text-[10px] md:text-xs text-[#6E727A] font-bold">Preserving Royal Heritage Through Modern Architectural Design</p>
        </motion.div>

        {/* Bridging Eras Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center mb-36">
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="relative aspect-[4/5] md:aspect-[3/4] w-full max-w-lg mx-auto lg:mr-auto lg:ml-0 overflow-hidden rounded-2xl border border-[#D4AF37]/30 shadow-[0_25px_60px_rgba(0,0,0,0.12)]">
              <Image src="/about_1.png" alt="Excellence" fill className="object-cover" />
            </div>
            <div className="absolute -bottom-10 -right-6 md:-right-10 w-48 md:w-60 aspect-square border-4 border-[#FAF7F2] rounded-xl shadow-2xl overflow-hidden z-10 hidden md:block">
              <Image src="/about_2.png" alt="Tailoring" fill className="object-cover" />
            </div>
          </motion.div>

          <motion.div
            className="max-w-xl mx-auto lg:mx-0"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariant}
          >
            <span className="text-gold-gradient font-body uppercase tracking-[0.3em] text-[10px] font-bold mb-4 block">Our Belief</span>
            <h3 className="font-headline text-4xl md:text-6xl text-[#12131A] mb-8 font-bold leading-tight">Bridging eras of <span className="text-gold-gradient italic font-serif">excellence.</span></h3>
            <p className="font-body text-[#6E727A] text-sm md:text-base leading-relaxed mb-6 font-light">
              Our atelier is the intersection of meticulous artistry and innovation. Tradition is not a static museum, but a living gallery of garments crafted to transcend decades. We believe true luxury lies in the continuity of craft—a silent dialogue between historic master weavers and tomorrow's visionaries.
            </p>
            <p className="font-body text-[#6E727A] text-sm md:text-base leading-relaxed font-light">
              Our mission is to untangle fashion from transient fast trends and reconnect it with permanent heritage. Each piece in our curation is celebrated for the story woven into its silk and gold threads.
            </p>
          </motion.div>
        </div>

        {/* Visionaries (Luxury Dark Section) */}
        <div className="my-24 md:my-36 -mx-6 md:-mx-12 lg:-mx-24 px-6 md:px-12 lg:px-24 py-24 md:py-32 bg-[#0B0C10] relative rounded-3xl border border-[#D4AF37]/20 shadow-2xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#D4AF37]/5 rounded-full blur-[160px] pointer-events-none" />

          <motion.div
            className="text-center mb-20 relative z-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariant}
          >
            <span className="text-gold-gradient font-body uppercase tracking-[0.35em] text-[10px] font-bold block mb-3">LEADERSHIP & CREATIVE DIRECTION</span>
            <h3 className="font-headline text-5xl md:text-6xl text-white font-extrabold mb-4 tracking-tight">The <span className="text-gold-gradient italic font-serif">Visionaries</span></h3>
            <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-4" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 max-w-7xl mx-auto relative z-10">
            {visionaries.map((person, idx) => (
              <motion.div
                key={person.name}
                className="group luxury-card bg-[#13141C] border border-[#D4AF37]/25 rounded-2xl p-6 flex flex-col justify-between transition-all duration-500"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: idx * 0.12 }}
              >
                <div>
                  <div className="relative aspect-[3/4] mb-6 overflow-hidden rounded-xl bg-[#0B0C10] border border-[#D4AF37]/20">
                    <Image
                      src={person.img}
                      alt={person.name}
                      fill
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-108"
                    />
                  </div>
                  <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-3">
                    <h4 className="font-headline text-xl text-white font-bold">{person.name}</h4>
                    <span className="font-body uppercase tracking-[0.2em] text-[9px] gold-satin text-[#0B0C10] font-black px-2.5 py-1 rounded-full shadow-md">{person.role}</span>
                  </div>
                  <p className="font-body text-white/70 text-xs leading-relaxed font-light">{person.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Patience of Craft */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center mt-32">
          <motion.div
            className="order-2 lg:order-1 max-w-xl mx-auto lg:mx-0"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariant}
          >
            <span className="text-gold-gradient font-body uppercase tracking-[0.3em] text-[10px] font-bold mb-4 block">Our Process</span>
            <h3 className="font-headline text-4xl md:text-6xl text-[#12131A] font-bold mb-8 leading-tight">The Patience of <span className="text-gold-gradient italic font-serif">Craft</span></h3>
            <p className="font-body text-[#6E727A] text-sm md:text-base leading-relaxed mb-6 font-light">
              In our atelier, time is the primary material. Before any item enters our archival collection, it undergoes a meticulous 48-point quality check by master artisans.
            </p>
            <p className="font-body text-[#6E727A] text-sm md:text-base leading-relaxed mb-10 font-light">
              From restoring century-old weaving techniques to hand-finishing bespoke tailored seams, every touch is deliberate—an uncompromising commitment to perfection.
            </p>
            <Link href="/men" className="gold-satin text-[#0B0C10] px-10 py-4.5 rounded-xl font-body uppercase tracking-[0.25em] text-[10px] font-black hover:scale-105 transition-all inline-block shadow-lg">
              Explore The Atelier
            </Link>
          </motion.div>

          <motion.div
            className="order-1 lg:order-2 relative aspect-[4/3] w-full max-w-2xl mx-auto shadow-2xl overflow-hidden rounded-2xl border border-[#D4AF37]/30"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <Image src="/about_3.png" alt="Patience of Craft" fill className="object-cover" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
