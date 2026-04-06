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
    { name: 'Pattan Zameer', role: 'FOUNDER', desc: 'Pattan Zameer is the Founder of the company and the driving force behind its creation. He defines the vision, business model, and long-term goals. With strong knowledge of business and Indian stock markets, he focuses on strategic planning, investment decisions, and identifying profitable opportunities. He guides the leadership team and ensures the company grows in the right direction.', img: 'https://res.cloudinary.com/dqgqdszk2/image/upload/q_auto/f_auto/v1775091849/WhatsApp_Image_2026-04-02_at_6.32.32_AM_zommec.jpg' },
    { name: 'M. Pranay Kumar', role: 'CEO', desc: 'M. Pranay Kumar is responsible for executing the vision set by the founder. As CEO, he manages the overall business activities, leads the team, and ensures daily operations align with company goals. He focuses on growth, sales performance, and building the brand in the e-commerce market.', img: 'https://res.cloudinary.com/dqgqdszk2/image/upload/q_auto/f_auto/v1775438058/WhatsApp_Image_2026-04-06_at_6.38.31_AM_sxtmuk.jpg' },
    { name: 'R. Sarvajeeth Singh', role: 'COO', desc: 'R. Sarvajeeth Singh handles the core operations of the business. He manages inventory, supplier relationships, order processing, packaging, and delivery. His role ensures smooth and efficient day-to-day functioning of the company.', img: 'https://res.cloudinary.com/dqgqdszk2/image/upload/q_auto/f_auto/v1775438066/WhatsApp_Image_2026-04-06_at_4.23.13_AM_azztsh.jpg' },
    { name: 'R. Dhanush Rao', role: 'CFO', desc: 'R. Dhanush Rao oversees the financial side of the business. He manages budgeting, tracks expenses and profits, sets pricing strategies, and ensures financial stability. His role is key to maintaining profitability and sustainable growth.', img: 'https://res.cloudinary.com/dqgqdszk2/image/upload/q_auto/f_auto/v1775438054/WhatsApp_Image_2026-04-06_at_4.23.15_AM_jnjndw.jpg' }
  ]

  return (
    <section className="bg-[#fdf9f2] py-32 overflow-hidden">
      <div className="max-w-[1920px] mx-auto px-8 md:px-12 lg:px-24">
        {/* Header */}
        <motion.div
          className="text-center mb-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariant}
        >
          <h2 className="font-headline text-6xl md:text-8xl text-[#1c1c18] mb-6">The Story of Tradition</h2>
          <p className="font-body uppercase tracking-[0.4em] text-[10px] md:text-xs text-[#a3851a] font-bold">Preserving Heritage Through Modern Design</p>
        </motion.div>

        {/* Bridging Eras Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center mb-40">
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="relative aspect-[4/5] md:aspect-[3/4] w-full max-w-lg mx-auto lg:mr-auto lg:ml-0 overflow-hidden shadow-2xl">
              <Image src="/about_1.png" alt="Excellence" fill className="object-cover" />
            </div>
            <div className="absolute -bottom-12 -right-8 md:-right-12 w-48 md:w-64 aspect-square border-8 border-[#fdf9f2] shadow-xl overflow-hidden z-10 hidden md:block">
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
            <span className="font-body uppercase tracking-[0.3em] text-[10px] text-[#a3851a] mb-6 block">Our Belief</span>
            <h3 className="font-headline text-5xl md:text-6xl text-[#1c1c18] mb-8 leading-tight">Bridging eras of excellence.</h3>
            <p className="font-body text-[#747878] text-sm md:text-base leading-relaxed mb-6">
              Our atelier is the intersection of meticulous artistry and innovation. The tradition is not a museum, but a living gallery of garments that refuse to be forgotten. We believe that true luxury lies in the continuity of craft—the silent dialogue between the weavers of the past and the visionaries of tomorrow.
            </p>
            <p className="font-body text-[#747878] text-sm md:text-base leading-relaxed">
              Our mission is to untangle fashion from the transient and reconnect it with the permanent. Each piece in our curation is celebrated not just for its aesthetic, but for the story etched into its fibers.
            </p>
          </motion.div>
        </div>

        {/* Visionaries */}
        <div className="mb-40">
          <motion.div
            className="text-center mb-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariant}
          >
            <h3 className="font-headline text-5xl md:text-6xl text-[#1c1c18] mb-4">The Visionaries</h3>
            <div className="h-[1px] w-24 bg-[#a3851a] mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {visionaries.map((person, idx) => (
              <motion.div
                key={person.name}
                className="group cursor-cell"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover="hoverState"
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
              >
                <div className="relative aspect-[2/3] mb-6 overflow-hidden bg-[#1c1c18]/5">
                  <motion.div
                    className="w-full h-full"
                    variants={{
                      hoverState: { filter: "grayscale(0)", scale: 1.05 }
                    }}
                    initial={{ filter: isMobile ? "grayscale(0)" : "grayscale(1)", scale: 1 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Image
                      src={person.img}
                      alt={person.name}
                      fill
                      className="object-cover object-top"
                    />
                  </motion.div>
                </div>
                <div className="flex justify-between items-end mb-3 border-b border-[#1c1c18]/10 pb-2">
                  <h4 className="font-headline text-2xl text-[#1c1c18]">{person.name}</h4>
                  <span className="font-body uppercase tracking-[0.2em] text-[10px] text-[#a3851a] font-black">{person.role}</span>
                </div>
                <p className="font-body text-[#747878] text-xs leading-relaxed">{person.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Patience of Craft */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
          <motion.div
            className="order-2 lg:order-1 max-w-xl mx-auto lg:mx-0"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariant}
          >
            <span className="font-body uppercase tracking-[0.3em] text-[10px] text-[#a3851a] mb-6 block">Our Process</span>
            <h3 className="font-headline text-5xl md:text-6xl text-[#1c1c18] mb-8 leading-tight">The Patience of Craft</h3>
            <p className="font-body text-[#747878] text-sm md:text-base leading-relaxed mb-6">
              In our atelier, time is the primary material. Before any item joins the collection, it undergoes a rigorous 48-point assessment by our master craftsmen. We do not rush; we preserve.
            </p>
            <p className="font-body text-[#747878] text-sm md:text-base leading-relaxed mb-12">
              From the gentle restoration of heritage silks to the hand-finished seams of our modern capsules, every action is deliberate. This is the antithesis of mass production—it is a devotion to the singular.
            </p>
            <Link href="/men" className="bg-[#1c1c18] text-white px-10 py-4 font-body uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-[#a3851a] transition-colors inline-block">
              Explore The Atelier
            </Link>
          </motion.div>

          <motion.div
            className="order-1 lg:order-2 relative aspect-[4/3] w-full max-w-2xl mx-auto shadow-2xl overflow-hidden"
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
