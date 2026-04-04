'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const features = [
  {
    icon: 'verified',
    title: 'Premium Quality',
    description: 'Sourced from the finest weavers and artisans across the subcontinent.',
  },
  {
    icon: 'stylus_note',
    title: 'Trendy & Traditional',
    description: 'Where centuries-old techniques meet contemporary silhouettes.',
  },
  {
    icon: 'published_with_changes',
    title: 'Easy Returns',
    description: 'Concierge-led return service within 15 days of your purchase.',
  },
  {
    icon: 'local_shipping',
    title: 'Fast Delivery',
    description: 'Express worldwide shipping with real-time tracking.',
  },
]

export function WhyChooseUs() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section ref={ref} className="py-24 px-12 bg-stone-100/50">
      <motion.div
        className="max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            className="text-center md:text-left"
            variants={itemVariants}
            whileHover={{ y: -5 }}
          >
            <motion.span
              className="material-symbols-outlined text-4xl mb-6 text-[#735c00] block"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              {feature.icon}
            </motion.span>
            <h3 className="font-headline text-xl mb-3 text-[#1c1b1b]">
              {feature.title}
            </h3>
            <p className="text-[#747878] text-sm leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
