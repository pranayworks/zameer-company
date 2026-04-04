'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

export function CareersSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  }

  const handleJoinPool = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
      setEmail('')
    }
  }

  const values = [
    { title: 'Timelessness', desc: 'We design for the decades, not the seasons. Our work transcends trends to create a lasting legacy of aesthetic excellence.' },
    { title: 'Craftsmanship', desc: 'Every pleat and stitch is an act of devotion. We celebrate the meticulous, the intentional, and the handmade.' },
    { title: 'Innovation', desc: 'Heritage is our foundation, but technology is our vessel. We redefine how luxury is experienced in a digital-first world.' }
  ]

  const benefits = [
    { icon: 'architecture', title: 'Creative Autonomy', desc: 'We empower our specialists to lead with their intuition and define their own creative processes.' },
    { icon: 'history_edu', title: 'Heritage Focus', desc: 'Work at the intersection of traditional Indian artistry and global high-fashion standards.' },
    { icon: 'diversity_3', title: 'Collaborative Spirit', desc: 'An environment where hierarchies vanish in favor of collective brilliance and shared growth.' },
    { icon: 'spa', title: 'Holistic Well-being', desc: 'Flexible arrangements that respect your rhythm, ensuring you remain inspired and balanced.' }
  ]

  const roles = [
    { name: 'Senior Textile Designer', loc: 'New Delhi / Remote', dept: 'ATELIER' },
    { name: 'Logistics Coordinator', loc: 'Mumbai', dept: 'OPERATIONS' },
    { name: 'Social Media Strategist', loc: 'London / Remote', dept: 'DIGITAL' }
  ]

  return (
    <section className="bg-[#f0ebe1] py-32 border-t border-[#1c1c18]/10 overflow-hidden">
      <div className="max-w-[1920px] mx-auto px-8 md:px-12 lg:px-24">
        
        {/* Intro */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-32 items-center">
          <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             variants={fadeUpVariant}
          >
            <span className="font-body uppercase tracking-[0.3em] text-[10px] text-[#a3851a] mb-6 block">Careers</span>
            <h2 className="font-headline text-6xl md:text-8xl text-[#1c1c18] mb-8 leading-[1.05]">Join the <br/><span className="italic font-display text-7xl md:text-9xl">Atelier</span></h2>
            <p className="font-body text-[#747878] text-base md:text-lg leading-relaxed max-w-lg mb-12">
              We are a collective of dreamers, artisans, and visionaries dedicated to preserving the soul of craftsmanship through a modern digital lens. Your journey into the extraordinary starts here.
            </p>
          </motion.div>
          <motion.div 
             className="relative aspect-square w-full max-w-md mx-auto bg-[#e6e2db] flex items-center justify-center p-12 text-center border border-[#1c1c18]/5 shadow-xl"
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 1 }}
          >
            <span className="font-headline text-3xl md:text-4xl italic text-[#1c1c18]/40">&quot;Crafting the future of heritage.&quot;</span>
          </motion.div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-[#1c1c18]/10 pb-32 mb-32">
           {values.map((v, i) => (
             <motion.div 
               key={v.title}
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true }}
               variants={fadeUpVariant}
               transition={{ delay: i * 0.1 }}
               className="border-l border-[#1c1c18]/10 pl-6"
             >
               <h4 className="font-headline text-2xl text-[#1c1c18] mb-4">{v.title}</h4>
               <p className="font-body text-[#747878] text-sm leading-relaxed">{v.desc}</p>
             </motion.div>
           ))}
        </div>

        {/* Why Join Us */}
        <div className="mb-32">
          <motion.div 
             className="mb-16"
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             variants={fadeUpVariant}
          >
             <h3 className="font-headline text-5xl text-[#1c1c18]">Why Join Us</h3>
             <div className="h-[1px] w-full max-w-md bg-[#1c1c18]/10 mt-6" />
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {benefits.map((b, i) => (
              <motion.div 
                key={b.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUpVariant}
                transition={{ delay: i * 0.1 }}
              >
                <span className="material-symbols-outlined text-[#a3851a] text-3xl mb-6 block">{b.icon}</span>
                <h4 className="font-headline text-xl text-[#1c1c18] mb-3">{b.title}</h4>
                <p className="font-body text-[#747878] text-xs leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Opportunities */}
        <div className="bg-white/50 backdrop-blur-sm p-8 md:p-16 shadow-xl mb-32 border border-[#1c1c18]/5">
           <motion.div 
             className="mb-12"
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             variants={fadeUpVariant}
           >
              <h3 className="font-headline text-4xl text-[#1c1c18] mb-4">Opportunities</h3>
              <p className="font-body text-[#747878] text-sm">Current openings across our global design and operation hubs.</p>
           </motion.div>

           <div className="hidden md:grid grid-cols-12 gap-4 border-b border-[#1c1c18]/10 pb-4 mb-6 font-body uppercase tracking-[0.2em] text-[10px] text-[#747878]">
             <div className="col-span-5">Role</div>
             <div className="col-span-3">Location</div>
             <div className="col-span-2">Department</div>
             <div className="col-span-2 text-right">Action</div>
           </div>

           <div className="space-y-6 md:space-y-0">
             {roles.map((r, i) => (
               <motion.div 
                 key={r.name}
                 className="grid grid-cols-1 md:grid-cols-12 gap-4 md:items-center py-6 md:border-b border-[#1c1c18]/5 last:border-0 group hover:bg-white/40 transition-colors"
                 initial="hidden"
                 whileInView="visible"
                 viewport={{ once: true }}
                 variants={fadeUpVariant}
                 transition={{ delay: i * 0.1 }}
               >
                 <div className="col-span-5">
                   <h4 className="font-body font-semibold text-lg text-[#1c1c18]">{r.name}</h4>
                 </div>
                 <div className="col-span-3 font-body text-sm text-[#747878]">{r.loc}</div>
                 <div className="col-span-2">
                   <span className="bg-[#1c1c18] text-white px-2 py-1 text-[8px] uppercase tracking-widest font-bold">
                     {r.dept}
                   </span>
                 </div>
                 <div className="col-span-2 md:text-right mt-4 md:mt-0">
                   <button className="bg-[#a3851a] text-white px-6 py-3 font-body uppercase tracking-widest text-[9px] font-bold hover:bg-[#1c1c18] transition-colors w-full md:w-auto">
                     Apply Now
                   </button>
                 </div>
               </motion.div>
             ))}
           </div>
        </div>

        {/* Talent Pool */}
        <motion.div 
           className="max-w-xl mx-auto text-center"
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
           variants={fadeUpVariant}
        >
          <h3 className="font-headline text-4xl italic text-[#1c1c18] mb-4">Don&apos;t see a fit?</h3>
          <p className="font-body text-[#747878] text-sm mb-8 leading-relaxed">
            Join our talent community to be the first to hear about future opportunities that match your expertise.
          </p>
          <form onSubmit={handleJoinPool} className="flex flex-col sm:flex-row gap-4 justify-center">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="YOUR EMAIL ADDRESS" 
              required
              className="bg-white border border-[#1c1c18]/20 px-6 py-4 font-body text-xs min-w-[280px] focus:outline-none focus:border-[#a3851a] transition-colors"
            />
            <button 
              type="submit" 
              className="bg-[#1c1c18] text-white font-body uppercase tracking-widest text-[10px] font-bold px-8 py-4 hover:bg-[#a3851a] transition-colors"
            >
              {submitted ? 'Joined!' : 'Join Pool'}
            </button>
          </form>
        </motion.div>

      </div>
    </section>
  )
}
