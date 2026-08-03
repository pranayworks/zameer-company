'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const features = [
  {
    icon: 'verified',
    title: 'Master Craftsmen Quality',
    description: 'Directly sourced from legendary master weavers across heritage clusters.',
  },
  {
    icon: 'stylus_note',
    title: 'Contemporary & Traditional',
    description: 'Centuries-old artisanal weaving techniques blended with modern silhouettes.',
  },
  {
    icon: 'published_with_changes',
    title: 'White-Glove Concierge',
    description: 'Personalized concierge service and hassle-free returns within 5 days.',
  },
  {
    icon: 'local_shipping',
    title: 'Worldwide Express',
    description: 'Insured global shipping with real-time live SMS & Email dispatch tracking.',
  },
]

export function WhyChooseUs() {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  }

  return (
    <section ref={ref} className="py-24 md:py-32 px-6 md:px-12 bg-[#0B0C10] border-t border-[#D4AF37]/20 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        className="max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            className="p-8 rounded-2xl bg-[#13141C] border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.15)] transition-all duration-500 group"
            variants={itemVariants}
          >
            <div className="w-14 h-14 rounded-xl gold-satin text-[#0B0C10] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="material-symbols-outlined text-2xl font-bold">{feature.icon}</span>
            </div>
            <h3 className="font-headline text-2xl mb-3 text-white font-bold tracking-tight">
              {feature.title}
            </h3>
            <p className="text-white/70 text-xs leading-relaxed font-light">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

